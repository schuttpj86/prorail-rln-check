/**
 * Asset Point Manager
 * Manages marking, validation, and tracking of point assets (joints, masts, etc.) along routes.
 * Validates compliance based on minimum distance to track.
 * 
 * RLN00398 §5.2 (8): Joints and earthing points must be ≥31m from track centerline
 * RLN00398 §5.1 (7): Overhead line masts must be ≥31m from track centerline
 */

import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as projection from "@arcgis/core/geometry/projection";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

// Storage for points by route ID. Structure: Map<routeId, Array<AssetPointData>>
const routeAssetPoints = new Map();

/**
 * Asset Point data structure
 * @typedef {Object} AssetPointData
 * @property {string} id - Unique point identifier
 * @property {string} routeId - Associated route ID
 * @property {string} type - 'joint', 'earthing', 'mast', etc.
 * @property {number} chainageMeters - Distance from route start (m)
 * @property {Point} geometry - Map point geometry
 * @property {number|null} distanceToTrackMeters - Distance to nearest track (m)
 * @property {string|null} nearestTrackId - ID of nearest track feature
 * @property {boolean} compliant - Whether it meets the minimum distance requirement
 * @property {string} timestamp - ISO timestamp of creation
 */

/**
 * Calculate chainage (distance along route from start point)
 * 
 * @param {Polyline} routeGeometry - The route polyline
 * @param {Point} clickPoint - Point where user clicked
 * @returns {Object} { chainage: number, snappedPoint: Point }
 */
export function calculateChainage(routeGeometry, clickPoint) {
  console.log('📏 Calculating chainage for point on route...');

  try {
    const nearestCoordinate = geometryEngine.nearestCoordinate(routeGeometry, clickPoint);
    
    if (!nearestCoordinate || !nearestCoordinate.coordinate) {
      console.warn('⚠️ Could not find nearest point on route');
      return null;
    }

    const snappedPoint = new Point({
      x: nearestCoordinate.coordinate.x,
      y: nearestCoordinate.coordinate.y,
      spatialReference: routeGeometry.spatialReference
    });

    const routePaths = routeGeometry.paths;
    if (!routePaths || routePaths.length === 0) {
      console.warn('⚠️ Route has no paths');
      return null;
    }

    let accumulatedDistance = 0;
    const vertexIndex = nearestCoordinate.vertexIndex;
    const path = routePaths[0]; // Assuming single path for now
    
    for (let i = 0; i < vertexIndex && i < path.length - 1; i++) {
      const p1 = new Point({
        x: path[i][0],
        y: path[i][1],
        spatialReference: routeGeometry.spatialReference
      });
      const p2 = new Point({
        x: path[i + 1][0],
        y: path[i + 1][1],
        spatialReference: routeGeometry.spatialReference
      });
      
      const segmentLength = geometryEngine.distance(p1, p2, "meters");
      accumulatedDistance += segmentLength;
    }

    if (vertexIndex < path.length) {
      const lastVertex = new Point({
        x: path[vertexIndex][0],
        y: path[vertexIndex][1],
        spatialReference: routeGeometry.spatialReference
      });
      const finalSegment = geometryEngine.distance(lastVertex, snappedPoint, "meters");
      accumulatedDistance += finalSegment;
    }

    console.log(`   ✅ Chainage calculated: ${accumulatedDistance.toFixed(2)}m from route start`);
    console.log(`   📍 Snapped to route at vertex ${vertexIndex}`);

    return {
      chainage: accumulatedDistance,
      snappedPoint: snappedPoint,
      vertexIndex: vertexIndex
    };

  } catch (error) {
    console.error('❌ Chainage calculation failed:', error);
    return null;
  }
}

/**
 * Find nearest track to a point and calculate distance
 * 
 * @param {Point} point - The point geometry
 * @param {FeatureLayer} tracksLayer - Railway tracks layer
 * @param {number} searchRadius - Search radius in meters (default: 200m)
 * @returns {Promise<Object>} { distance: number, trackFeature: Feature }
 */
export async function findNearestTrack(point, tracksLayer, searchRadius = 200) {
  console.log('🛤️  Finding nearest track to point...');

  if (!point || !tracksLayer) {
    console.warn('⚠️ Missing point or tracks layer');
    return { distance: null, trackFeature: null };
  }

  try {
    const searchBuffer = geometryEngine.buffer(point, searchRadius, "meters");
    
    const query = tracksLayer.createQuery();
    query.geometry = searchBuffer;
    query.spatialRelationship = "intersects";
    query.outFields = ["*"];
    query.returnGeometry = true;

    const results = await tracksLayer.queryFeatures(query);
    
    if (results.features.length === 0) {
      console.log(`   ℹ️ No tracks found within ${searchRadius}m`);
      return { distance: null, trackFeature: null };
    }

    console.log(`   📊 Found ${results.features.length} track(s) nearby`);

    let minDistance = Infinity;
    let nearestTrack = null;

    results.features.forEach(track => {
      const distance = geometryEngine.distance(point, track.geometry, "meters");
      if (distance < minDistance) {
        minDistance = distance;
        nearestTrack = track;
      }
    });

    console.log(`   ✅ Nearest track: ${minDistance.toFixed(2)}m away`);

    return {
      distance: minDistance,
      trackFeature: nearestTrack
    };

  } catch (error) {
    console.error('❌ Track query failed:', error);
    return { distance: null, trackFeature: null };
  }
}

/**
 * Validate point compliance based on its type
 * 
 * @param {number} distanceToTrack - Distance from point to nearest track (meters)
 * @param {string} pointType - Type of point ('joint', 'earthing', 'mast')
 * @returns {boolean} True if compliant
 */
export function validatePointCompliance(distanceToTrack, pointType) {
  // All current point types require 31m minimum distance
  const MINIMUM_DISTANCE = (pointType === 'mast' || pointType === 'joint' || pointType === 'earthing') ? 31 : 0;
  
  if (distanceToTrack === null || distanceToTrack === undefined) {
    return false;
  }

  return distanceToTrack >= MINIMUM_DISTANCE;
}

/**
 * Create asset point data object
 * 
 * @param {Object} params - Point parameters
 * @param {Point} params.geometry - Point geometry
 * @param {number} params.chainage - Distance from route start
 * @param {string} params.type - 'joint', 'earthing', 'mast', etc.
 * @param {string} params.routeId - Associated route ID
 * @param {number} params.distanceToTrack - Distance to nearest track
 * @param {Feature} params.nearestTrack - Nearest track feature
 * @returns {AssetPointData} Point data object
 */
export function createPointData({
  geometry,
  chainage,
  type = "joint",
  routeId,
  distanceToTrack = null,
  nearestTrack = null
}) {
  const pointId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const compliant = validatePointCompliance(distanceToTrack, type);

  const pointData = {
    id: pointId,
    routeId: routeId,
    type: type,
    chainageMeters: chainage,
    geometry: geometry,
    distanceToTrackMeters: distanceToTrack,
    nearestTrackId: nearestTrack?.attributes?.OBJECTID || null,
    compliant: compliant,
    timestamp: new Date().toISOString()
  };

  console.log(`✅ Created ${type} data:`, {
    id: pointId,
    chainage: `${chainage.toFixed(2)}m`,
    trackDistance: distanceToTrack ? `${distanceToTrack.toFixed(2)}m` : 'N/A',
    compliant: compliant ? '✅' : '❌'
  });

  return pointData;
}

/**
 * Add asset point to route
 * 
 * @param {string} routeId - Route identifier
 * @param {AssetPointData} pointData - Point data object
 */
export function addPoint(routeId, pointData) {
  if (!routeAssetPoints.has(routeId)) {
    routeAssetPoints.set(routeId, []);
  }

  const points = routeAssetPoints.get(routeId);
  points.push(pointData);

  // Sort by chainage
  points.sort((a, b) => a.chainageMeters - b.chainageMeters);

  console.log(`📍 Added ${pointData.type} to route ${routeId} (total: ${points.length})`);
}

/**
 * Remove asset point from route
 * 
 * @param {string} routeId - Route identifier
 * @param {string} pointId - Point identifier
 * @returns {boolean} True if removed successfully
 */
export function removePoint(routeId, pointId) {
  if (!routeAssetPoints.has(routeId)) {
    console.warn(`⚠️ No points found for route ${routeId}`);
    return false;
  }

  const points = routeAssetPoints.get(routeId);
  const initialLength = points.length;
  
  const filtered = points.filter(p => p.id !== pointId);
  routeAssetPoints.set(routeId, filtered);

  const removed = filtered.length < initialLength;
  
  if (removed) {
    console.log(`✅ Removed point ${pointId} from route ${routeId}`);
  } else {
    console.warn(`⚠️ Point ${pointId} not found in route ${routeId}`);
  }

  return removed;
}

/**
 * Get all asset points for a route
 * 
 * @param {string} routeId - Route identifier
 * @returns {Array<AssetPointData>} Array of point data objects (sorted by chainage)
 */
export function getPointsForRoute(routeId) {
  return routeAssetPoints.get(routeId) || [];
}

/**
 * Get all asset points across all routes
 * 
 * @returns {Map<string, Array<AssetPointData>>} Map of route IDs to point arrays
 */
export function getAllPoints() {
  return routeAssetPoints;
}

/**
 * Clear all asset points for a route
 * 
 * @param {string} routeId - Route identifier
 */
export function clearPointsForRoute(routeId) {
  if (routeAssetPoints.has(routeId)) {
    const count = routeAssetPoints.get(routeId).length;
    routeAssetPoints.delete(routeId);
    console.log(`🗑️  Cleared ${count} point(s) from route ${routeId}`);
  }
}

/**
 * Calculate minimum distance to track from all points of a specific type in a route
 * Used for EMC evaluation
 * 
 * @param {string} routeId - Route identifier
 * @param {string} pointType - Type of point ('joint', 'earthing', 'mast')
 * @returns {number|null} Minimum distance in meters, or null if no points of this type
 */
export function getMinimumDistanceForType(routeId, pointType) {
  const points = getPointsForRoute(routeId).filter(p => p.type === pointType);
  
  if (points.length === 0) {
    return null;
  }

  const distances = points
    .map(p => p.distanceToTrackMeters)
    .filter(d => d !== null && d !== undefined);

  if (distances.length === 0) {
    return null;
  }

  const minDistance = Math.min(...distances);
  
  console.log(`📊 Route ${routeId}: ${points.length} ${pointType}(s), min distance: ${minDistance.toFixed(2)}m`);
  
  return minDistance;
}

/**
 * Get compliance summary for route points of a specific type
 * 
 * @param {string} routeId - Route identifier
 * @param {string} pointType - Type of point ('joint', 'earthing', 'mast')
 * @returns {Object} Summary statistics
 */
export function getComplianceSummaryForType(routeId, pointType) {
  const points = getPointsForRoute(routeId).filter(p => p.type === pointType);
  
  const total = points.length;
  const compliant = points.filter(p => p.compliant).length;
  const violations = total - compliant;
  const minDistance = getMinimumDistanceForType(routeId, pointType);

  return {
    total,
    compliant,
    violations,
    minDistance,
    hasViolations: violations > 0,
    allCompliant: total > 0 && violations === 0
  };
}

/**
 * Create visual marker graphic for an asset point
 * 
 * @param {AssetPointData} pointData - Point data object
 * @returns {Graphic} Map graphic for the point
 */
export function createPointGraphic(pointData) {
  const isCompliant = pointData.compliant;
  const color = isCompliant ? [0, 200, 0, 0.9] : [220, 20, 20, 0.9]; // Green or Red
  const outlineColor = isCompliant ? [0, 120, 0] : [160, 0, 0];

  // Icon and title based on type
  let icon, title;
  switch (pointData.type) {
    case 'mast':
      icon = '🗼'; // Tower icon for overhead line masts
      title = 'Overhead Line Mast';
      break;
    case 'earthing':
      icon = '⚡'; // Lightning for earthing point
      title = 'Earthing Point';
      break;
    case 'joint':
    default:
      icon = '🔗'; // Link icon for cable joint
      title = 'Cable Joint';
      break;
  }
  
  // Marker symbol
  const markerSymbol = new SimpleMarkerSymbol({
    style: "circle",
    color: color,
    size: 12,
    outline: {
      color: outlineColor,
      width: 2
    }
  });

  const graphic = new Graphic({
    geometry: pointData.geometry,
    symbol: markerSymbol,
    attributes: {
      id: pointData.id,
      type: pointData.type,
      chainage: pointData.chainageMeters,
      distanceToTrack: pointData.distanceToTrackMeters,
      compliant: pointData.compliant
    },
    popupTemplate: {
      title: `${title} at ${pointData.chainageMeters.toFixed(1)}m`,
      content: `
        <b>Chainage:</b> ${pointData.chainageMeters.toFixed(2)} m from route start<br>
        <b>Distance to track:</b> ${pointData.distanceToTrackMeters ? pointData.distanceToTrackMeters.toFixed(2) + ' m' : 'Unknown'}<br>
        <b>Status:</b> ${pointData.compliant ? '✅ Compliant (≥31m)' : '❌ Violation (<31m)'}<br>
        <b>Created:</b> ${new Date(pointData.timestamp).toLocaleString()}
      `
    }
  });

  return graphic;
}

/**
 * Re-snap points to updated route geometry
 * Maintains chainage position along the route when geometry changes
 * 
 * @param {string} routeId - Route identifier
 * @param {Polyline} newRouteGeometry - Updated route geometry
 * @param {FeatureLayer} tracksLayer - Railway tracks layer for distance recalculation
 * @returns {Promise<Array<AssetPointData>>} Updated point data array
 */
export async function resnapPointsToRoute(routeId, newRouteGeometry, tracksLayer = null) {
  console.log(`🔄 Re-snapping points for route ${routeId} to updated geometry...`);
  
  const points = getPointsForRoute(routeId);
  
  if (points.length === 0) {
    console.log('   ℹ️  No points to re-snap');
    return [];
  }
  
  // Ensure projection engine is loaded
  await projection.load();
  
  // Project route to RD New (28992) for accurate distance calculations
  const rdNewSR = new SpatialReference({ wkid: 28992 });
  let workingGeometry = newRouteGeometry;
  
  if (newRouteGeometry.spatialReference.wkid !== 28992) {
    console.log(`   🔄 Projecting route from ${newRouteGeometry.spatialReference.wkid} to RD New (28992)...`);
    workingGeometry = projection.project(newRouteGeometry, rdNewSR);
  }
  
  const updatedPoints = [];
  
  for (const point of points) {
    try {
      // Calculate point at the same chainage on the new route
      // We need to manually walk along the route to find the position at the given chainage
      const paths = workingGeometry.paths;
      if (!paths || paths.length === 0) {
        console.warn(`   ⚠️ Route has no paths for ${point.type} ${point.id}`);
        updatedPoints.push(point);
        continue;
      }

      const path = paths[0];
      const targetChainage = point.chainageMeters;
      let accumulatedDistance = 0;
      let newPoint = null;

      // Walk along the path to find the point at the target chainage
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = new Point({
          x: path[i][0],
          y: path[i][1],
          spatialReference: rdNewSR
        });
        const p2 = new Point({
          x: path[i + 1][0],
          y: path[i + 1][1],
          spatialReference: rdNewSR
        });

        const segmentLength = geometryEngine.distance(p1, p2, "meters");
        
        if (accumulatedDistance + segmentLength >= targetChainage) {
          // Target point is within this segment
          const remainingDistance = targetChainage - accumulatedDistance;
          const ratio = remainingDistance / segmentLength;
          
          // Interpolate position along the segment
          newPoint = new Point({
            x: p1.x + (p2.x - p1.x) * ratio,
            y: p1.y + (p2.y - p1.y) * ratio,
            spatialReference: rdNewSR
          });
          break;
        }
        
        accumulatedDistance += segmentLength;
      }

      // If chainage is beyond route length, place at end
      if (!newPoint && path.length > 0) {
        const lastPoint = path[path.length - 1];
        newPoint = new Point({
          x: lastPoint[0],
          y: lastPoint[1],
          spatialReference: rdNewSR
        });
        console.warn(`   ⚠️ Chainage ${targetChainage}m exceeds route length, placing at end`);
      }
      
      if (!newPoint) {
        console.warn(`   ⚠️ Could not re-snap ${point.type} ${point.id} at chainage ${point.chainageMeters}m`);
        // Keep original position if re-snap fails
        updatedPoints.push(point);
        continue;
      }
      
      // Update geometry
      point.geometry = newPoint;
      
      // Recalculate distance to track if tracks layer is available
      if (tracksLayer) {
        try {
          const trackResult = await findNearestTrack(newPoint, tracksLayer, 200);
          point.distanceToTrackMeters = trackResult.distance;
          point.nearestTrackId = trackResult.trackFeature?.attributes?.OBJECTID || null;
          point.compliant = validatePointCompliance(trackResult.distance, point.type);
          
          console.log(`   ✅ Re-snapped ${point.type} at ${point.chainageMeters.toFixed(1)}m - new track distance: ${trackResult.distance?.toFixed(2) || 'N/A'}m`);
        } catch (error) {
          console.warn(`   ⚠️ Could not recalculate track distance for ${point.type} ${point.id}:`, error);
        }
      } else {
        console.log(`   ✅ Re-snapped ${point.type} at ${point.chainageMeters.toFixed(1)}m (track distance not recalculated)`);
      }
      
      updatedPoints.push(point);
    } catch (error) {
      console.error(`   ❌ Error re-snapping ${point.type} ${point.id}:`, error);
      updatedPoints.push(point); // Keep original on error
    }
  }
  
  // Update storage with re-snapped points
  routeAssetPoints.set(routeId, updatedPoints);
  
  console.log(`✅ Re-snapped ${updatedPoints.length} point(s) for route ${routeId}`);
  
  return updatedPoints;
}

console.log('✅ Asset Point Manager utility loaded');
