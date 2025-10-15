/**
 * Spatial Query Utility
 * 
 * Queries ProRail infrastructure layers for EMC compliance analysis:
 * - Technical rooms (EV Gebouwen) for 20m clearance rule
 * - Track centerlines for 31m earthing/joint rule
 * - Earthing points for existing infrastructure
 */

import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import Query from "@arcgis/core/rest/support/Query";
import { config } from "../config.js";

/**
 * Fast calculation of minimum distance from route to features
 * Uses optimized geometryEngine.distance without expensive sampling
 * 
 * @param {Polyline} routeGeometry - The cable route geometry
 * @param {Array<Feature>} features - Array of features to check against
 * @param {number} bufferAdjustment - Amount to subtract from distance (for track width, etc.)
 * @returns {Object} Object containing minimum distance and nearest feature
 */
export function calculateMinimumDistanceToFeatures(routeGeometry, features, bufferAdjustment = 0) {
  if (!routeGeometry || !features || features.length === 0) {
    return null;
  }

  let minDistance = Infinity;
  let nearestFeature = null;

  try {
    // Use fast geometry-to-geometry distance
    for (const feature of features) {
      const distance = geometryEngine.distance(routeGeometry, feature.geometry, "meters");
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestFeature = feature;
      }
    }
    
    // Adjust distance to account for track width or other buffer
    if (minDistance !== Infinity && bufferAdjustment > 0) {
      minDistance = Math.max(0, minDistance - bufferAdjustment);
    }
    
    return {
      distance: minDistance === Infinity ? null : minDistance,
      nearestFeature: nearestFeature,
      routePoint: null,  // Not calculated for performance
      featurePoint: null  // Not calculated for performance
    };
    
  } catch (error) {
    console.error('❌ Error calculating minimum distance to features:', error);
    return null;
  }
}

/**
 * Calculate minimum distance from a route to tracks
 * 
 * @param {Polyline} routeGeometry - The cable route geometry
 * @param {Array<Feature>} trackFeatures - Array of track features to check against
 * @param {number} trackWidthAdjustment - Track width to subtract from distance (default 1.5m)
 * @returns {Object} Object containing minimum distance, nearest track, and closest points
 */
export function calculateMinimumDistanceToTracks(routeGeometry, trackFeatures, trackWidthAdjustment = 1.5) {
  // Use the generic function with track width adjustment
  const result = calculateMinimumDistanceToFeatures(routeGeometry, trackFeatures, trackWidthAdjustment);
  
  if (!result) return null;
  
  return {
    distance: result.distance,
    nearestTrack: result.nearestFeature,
    routePoint: result.routePoint,
    trackPoint: result.featurePoint
  };
}

/**
 * Query technical rooms (EV Gebouwen) near a route
 * 
 * @param {Polyline} routeGeometry - The cable route geometry
 * @param {Layer} technicalRoomsLayer - The EV Gebouwen layer
 * @param {number} bufferDistance - Search buffer distance in meters (default from config)
 * @returns {Promise<Object>} Query results with features and minimum distance
 */
export async function queryTechnicalRooms(routeGeometry, technicalRoomsLayer, bufferDistance = config.spatialQuery?.bufferDistances?.technicalRooms ?? 10000) {
  console.log(`🏢 Querying technical rooms within ${bufferDistance}m of route...`);

  if (!routeGeometry || !technicalRoomsLayer) {
    console.warn('⚠️ Missing route geometry or technical rooms layer');
    return { features: [], minDistance: null, nearestFeature: null };
  }

  try {
    // Create buffer around route for query
    const searchBuffer = geometryEngine.buffer(routeGeometry, bufferDistance, "meters");
    
    // Create query
    const query = technicalRoomsLayer.createQuery();
    query.geometry = searchBuffer;
    query.spatialRelationship = "intersects";
    query.outFields = ["*"];
    query.returnGeometry = true;

    console.log(`   🔍 Query created with ${bufferDistance}m buffer`);
    
    // Execute query
    const results = await technicalRoomsLayer.queryFeatures(query);
    
    console.log(`   ✅ Found ${results.features.length} technical rooms`);

    // Calculate minimum distance to route using improved method
    let minDistance = null;
    let nearestFeature = null;
    let nearestPoint = null;
    let nearestRoomPoint = null;

    if (results.features.length > 0) {
      minDistance = Infinity;
      
      // Calculate true minimum distance by sampling route points
      const routeDistanceResult = calculateMinimumDistanceToFeatures(routeGeometry, results.features);
      
      if (routeDistanceResult && routeDistanceResult.distance < minDistance) {
        minDistance = routeDistanceResult.distance;
        nearestFeature = routeDistanceResult.nearestFeature;
        nearestPoint = routeDistanceResult.routePoint;
        nearestRoomPoint = routeDistanceResult.featurePoint;
      }

      console.log(`   📏 Minimum distance to technical room: ${minDistance.toFixed(2)}m`);
      if (nearestPoint && nearestRoomPoint) {
        console.log(`   📍 Closest approach at route point (${nearestPoint.x.toFixed(1)}, ${nearestPoint.y.toFixed(1)})`);
      }
    } else {
      console.log(`   ℹ️ No technical rooms found within ${bufferDistance}m`);
    }

    return {
      features: results.features,
      minDistance: minDistance === Infinity ? null : minDistance,
      nearestFeature: nearestFeature,
      nearestPoint: nearestPoint,
      nearestRoomPoint: nearestRoomPoint,
      searchRadius: bufferDistance
    };

  } catch (error) {
    console.error('❌ Technical room query failed:', error);
    return { features: [], minDistance: null, nearestFeature: null, error: error };
  }
}

/**
 * Query ALL track-related layers (centerlines, sections, switches) near a route
 * FAST VERSION - Queries multiple layers without expensive buffering
 * 
 * @param {Polyline} routeGeometry - The cable route geometry
 * @param {Object} trackLayers - Object containing all track-related layers
 * @param {Layer} trackLayers.tracksLayer - Main tracks layer
 * @param {Layer} trackLayers.trackSectionsLayer - Track sections layer (optional)
 * @param {number} bufferDistance - Search buffer distance in meters
 * @param {number} trackWidthAdjustment - Track width to subtract from distance
 * @returns {Promise<Object>} Query results with features from all layers and minimum distance
 */
export async function queryAllTrackLayers(routeGeometry, trackLayers, bufferDistance = config.spatialQuery?.bufferDistances?.tracks ?? 10000, trackWidthAdjustment = 1.5) {
  console.log(`🛤️ Querying ALL track layers within ${bufferDistance}m of route...`);
  
  const allFeatures = [];
  const layerResults = {};
  
  // Query main tracks layer
  if (trackLayers.tracksLayer) {
    try {
      const result = await queryTrackCenterlines(routeGeometry, trackLayers.tracksLayer, bufferDistance, trackWidthAdjustment);
      layerResults.tracks = result;
      if (result.features) {
        allFeatures.push(...result.features);
      }
    } catch (error) {
      console.error('❌ Failed to query tracks layer:', error);
    }
  }
  
  // Query track sections layer (may have additional track segments)
  if (trackLayers.trackSectionsLayer) {
    try {
      console.log(`   🔍 Also querying track sections layer...`);
      const result = await queryTrackCenterlines(routeGeometry, trackLayers.trackSectionsLayer, bufferDistance, trackWidthAdjustment);
      layerResults.trackSections = result;
      if (result.features) {
        allFeatures.push(...result.features);
        console.log(`   ✅ Found ${result.features.length} additional track sections`);
      }
    } catch (error) {
      console.error('❌ Failed to query track sections layer:', error);
    }
  }
  
  // Calculate overall minimum distance - FAST VERSION
  let minDistance = null;
  let nearestFeature = null;
  
  if (allFeatures.length > 0) {
    console.log(`   📊 Total track features found: ${allFeatures.length}`);
    
    // Calculate minimum distance across all track features - NO BUFFERING
    const routeDistanceResult = calculateMinimumDistanceToTracks(routeGeometry, allFeatures, trackWidthAdjustment);
    
    if (routeDistanceResult) {
      minDistance = routeDistanceResult.distance;
      nearestFeature = routeDistanceResult.nearestTrack;
      
      console.log(`   📏 Overall minimum distance to ANY track (adjusted for ~${trackWidthAdjustment}m width): ${minDistance?.toFixed(2) ?? 'N/A'}m`);
    }
  } else {
    console.log(`   ℹ️ No track features found within ${bufferDistance}m`);
  }
  
  return {
    features: allFeatures,
    minDistance: minDistance,
    nearestFeature: nearestFeature,
    searchRadius: bufferDistance,
    layerResults: layerResults
  };
}

/**
 * Query track centerlines (Spoorbaanhartlijn) near a route
 * FAST VERSION - No expensive buffering or sampling
 * 
 * @param {Polyline} routeGeometry - The cable route geometry
 * @param {Layer} tracksLayer - The railway tracks layer
 * @param {number} bufferDistance - Search buffer distance in meters (default from config)
 * @param {number} trackWidthAdjustment - Track width to subtract from distance (default 1.5m)
 * @returns {Promise<Object>} Query results with features and minimum distance
 */
export async function queryTrackCenterlines(routeGeometry, tracksLayer, bufferDistance = config.spatialQuery?.bufferDistances?.tracks ?? 10000, trackWidthAdjustment = 1.5) {
  console.log(`🛤️ Querying track centerlines within ${bufferDistance}m of route...`);

  if (!routeGeometry || !tracksLayer) {
    console.warn('⚠️ Missing route geometry or tracks layer');
    return { features: [], minDistance: null, nearestFeature: null };
  }

  try {
    // Create buffer around route for query
    const searchBuffer = geometryEngine.buffer(routeGeometry, bufferDistance, "meters");
    
    // Create query
    const query = tracksLayer.createQuery();
    query.geometry = searchBuffer;
    query.spatialRelationship = "intersects";
    query.outFields = ["*"];
    query.returnGeometry = true;

    console.log(`   🔍 Query created with ${bufferDistance}m buffer`);
    
    // Execute query
    const results = await tracksLayer.queryFeatures(query);
    
    console.log(`   ✅ Found ${results.features.length} track segments`);

    // Calculate minimum distance - FAST VERSION
    let minDistance = null;
    let nearestFeature = null;

    if (results.features.length > 0) {
      const routeDistanceResult = calculateMinimumDistanceToTracks(routeGeometry, results.features, trackWidthAdjustment);
      
      if (routeDistanceResult) {
        minDistance = routeDistanceResult.distance;
        nearestFeature = routeDistanceResult.nearestTrack;
      }

      console.log(`   📏 Minimum distance to track (adjusted for ~${trackWidthAdjustment}m track width): ${minDistance?.toFixed(2) ?? 'N/A'}m`);
    } else {
      console.log(`   ℹ️ No tracks found within ${bufferDistance}m`);
    }

    return {
      features: results.features,
      minDistance: minDistance,
      nearestFeature: nearestFeature,
      searchRadius: bufferDistance
    };

  } catch (error) {
    console.error('❌ Track query failed:', error);
    return { features: [], minDistance: null, nearestFeature: null, error: error };
  }
}

/**
 * Query earthing points (Aarding) near a route
 * 
 * @param {Polyline} routeGeometry - The cable route geometry
 * @param {Layer} earthingLayer - The earthing points layer
 * @param {number} bufferDistance - Search buffer distance in meters (default from config)
 * @returns {Promise<Object>} Query results with features
 */
export async function queryEarthingPoints(routeGeometry, earthingLayer, bufferDistance = config.spatialQuery?.bufferDistances?.earthing ?? 50) {
  console.log(`⚡ Querying earthing points within ${bufferDistance}m of route...`);

  if (!routeGeometry || !earthingLayer) {
    console.warn('⚠️ Missing route geometry or earthing layer');
    return { features: [], count: 0 };
  }

  try {
    // Create buffer around route for query
    const searchBuffer = geometryEngine.buffer(routeGeometry, bufferDistance, "meters");
    
    // Create query
    const query = earthingLayer.createQuery();
    query.geometry = searchBuffer;
    query.spatialRelationship = "intersects";
    query.outFields = ["*"];
    query.returnGeometry = true;

    console.log(`   🔍 Query created with ${bufferDistance}m buffer`);
    
    // Execute query
    const results = await earthingLayer.queryFeatures(query);
    
    console.log(`   ✅ Found ${results.features.length} earthing points`);

    return {
      features: results.features,
      count: results.features.length,
      searchRadius: bufferDistance
    };

  } catch (error) {
    console.error('❌ Earthing points query failed:', error);
    return { features: [], count: 0, error: error };
  }
}

/**
 * Calculate distances from earthing points to tracks
 * For RLN00398 §5.8 - earthing/joints must be ≥31m from track
 * 
 * @param {Array<Feature>} earthingPoints - Array of earthing point features
 * @param {Array<Feature>} trackFeatures - Array of track features
 * @returns {Array<Object>} Array of distance calculations
 */
export function calculateEarthingToTrackDistances(earthingPoints, trackFeatures) {
  console.log(`📏 Calculating distances from ${earthingPoints.length} earthing points to ${trackFeatures.length} tracks...`);

  const results = [];

  earthingPoints.forEach((earthingPoint, index) => {
    let minDistance = Infinity;
    let nearestTrack = null;

    trackFeatures.forEach(track => {
      try {
        const distance = geometryEngine.distance(
          earthingPoint.geometry,
          track.geometry,
          "meters"
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestTrack = track;
        }
      } catch (error) {
        console.warn(`   ⚠️ Distance calculation failed for earthing point ${index}:`, error);
      }
    });

    const result = {
      earthingPoint: earthingPoint,
      minDistanceToTrack: minDistance === Infinity ? null : minDistance,
      nearestTrack: nearestTrack,
      compliant: minDistance >= 31, // RLN00398 §5.8 requirement
      objectId: earthingPoint.attributes?.OBJECTID || index
    };

    results.push(result);

    if (result.minDistanceToTrack !== null) {
      const status = result.compliant ? '✅' : '❌';
      console.log(`   ${status} Earthing point ${result.objectId}: ${result.minDistanceToTrack.toFixed(2)}m from track`);
    }
  });

  const violations = results.filter(r => !r.compliant && r.minDistanceToTrack !== null);
  if (violations.length > 0) {
    console.log(`   ⚠️ Found ${violations.length} earthing point(s) too close to tracks (<31m)`);
  } else {
    console.log(`   ✅ All earthing points meet 31m clearance requirement`);
  }

  return results;
}

/**
 * Perform complete spatial analysis for a route
 * Queries all relevant layers and calculates distances
 * 
 * @param {Polyline} routeGeometry - The cable route geometry
 * @param {Object} layers - Object containing all required layers
 * @param {Layer} layers.technicalRoomsLayer - EV Gebouwen layer
 * @param {Layer} layers.tracksLayer - Spoorbaanhartlijn layer
 * @param {Layer} layers.trackSectionsLayer - Track sections layer (optional)
 * @param {Layer} layers.earthingLayer - Aarding layer (optional)
 * @returns {Promise<Object>} Complete analysis results
 */
export async function performCompleteSpatialAnalysis(routeGeometry, layers) {
  console.log('🔬 Performing complete spatial analysis...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const results = {
    technicalRooms: { features: [], minDistance: null },
    tracks: { features: [], minDistance: null },
    earthing: { features: [], count: 0 },
    earthingDistances: [],
    timestamp: new Date().toISOString()
  };

  // Query technical rooms
  if (layers.technicalRoomsLayer) {
    try {
      results.technicalRooms = await queryTechnicalRooms(
        routeGeometry,
        layers.technicalRoomsLayer
        // Uses default buffer distance from config
      );
    } catch (error) {
      console.error('❌ Technical rooms query failed:', error);
    }
  } else {
    console.warn('⚠️ Technical rooms layer not provided');
  }

  // Query ALL track layers (centerlines + sections) - FAST VERSION
  if (layers.tracksLayer || layers.trackSectionsLayer) {
    try {
      results.tracks = await queryAllTrackLayers(
        routeGeometry,
        {
          tracksLayer: layers.tracksLayer,
          trackSectionsLayer: layers.trackSectionsLayer
        },
        undefined,  // Use default buffer distance
        1.5         // Subtract 1.5m for track width adjustment
      );
    } catch (error) {
      console.error('❌ Tracks query failed:', error);
    }
  } else {
    console.warn('⚠️ No track layers provided');
  }

  // Query earthing points (optional)
  if (layers.earthingLayer) {
    try {
      results.earthing = await queryEarthingPoints(
        routeGeometry,
        layers.earthingLayer
        // Uses default buffer distance from config (50m)
      );

      // Calculate earthing to track distances if we have both
      if (results.earthing.features.length > 0 && results.tracks.features.length > 0) {
        results.earthingDistances = calculateEarthingToTrackDistances(
          results.earthing.features,
          results.tracks.features
        );
      }
    } catch (error) {
      console.error('❌ Earthing points query failed:', error);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Spatial analysis complete');
  console.log(`   🏢 Technical rooms: ${results.technicalRooms.features.length} found, min distance: ${results.technicalRooms.minDistance?.toFixed(2) || 'N/A'}m`);
  console.log(`   🛤️ Tracks: ${results.tracks.features.length} found, min distance: ${results.tracks.minDistance?.toFixed(2) || 'N/A'}m`);
  console.log(`   ⚡ Earthing points: ${results.earthing.count} found`);

  return results;
}

/**
 * Get layer by ID from the map
 * 
 * @param {Map} map - The ArcGIS map
 * @param {string} layerId - Layer ID to find
 * @returns {Layer|null} The layer or null if not found
 */
export function getLayerById(map, layerId) {
  if (!map) return null;
  
  // Search in all layers including nested group layers
  let targetLayer = null;
  
  map.allLayers.forEach(layer => {
    if (layer.id === layerId) {
      targetLayer = layer;
    }
  });

  if (!targetLayer) {
    console.warn(`⚠️ Layer "${layerId}" not found in map`);
  }

  return targetLayer;
}
