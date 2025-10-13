/**
 * Joint and Earthing Point Manager
 * Manages marking, validation, and tracking of joints/earthing points along cable routes
 * 
 * RLN00398 §5.8: Joints and earthing points must be ≥31m from track centerline
 */

import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";

/**
 * Storage for joints by route ID
 * Structure: Map<routeId, Array<JointData>>
 */
const routeJoints = new Map();

/**
 * Joint data structure
 * @typedef {Object} JointData
 * @property {string} id - Unique joint identifier
 * @property {string} routeId - Associated route ID
 * @property {string} type - "joint" or "earthing"
 * @property {number} chainageMeters - Distance from route start (m)
 * @property {Point} geometry - Map point geometry
 * @property {number|null} distanceToTrackMeters - Distance to nearest track (m)
 * @property {string|null} nearestTrackId - ID of nearest track feature
 * @property {boolean} compliant - Whether ≥31m from track
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
    // Get the nearest coordinate on the route to the click point
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

    // Calculate distance from start of route to snapped point
    // We need to measure along the route, not straight-line distance
    const routePaths = routeGeometry.paths;
    if (!routePaths || routePaths.length === 0) {
      console.warn('⚠️ Route has no paths');
      return null;
    }

    // For simplicity, we'll use the vertex index to estimate position
    // nearestCoordinate.vertexIndex tells us which segment
    let accumulatedDistance = 0;
    const vertexIndex = nearestCoordinate.vertexIndex;

    // Sum up distances of all segments before the snapped point
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

    // Add distance from last vertex to snapped point
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
 * Find nearest track to a joint point and calculate distance
 * 
 * @param {Point} jointPoint - The joint/earthing point geometry
 * @param {FeatureLayer} tracksLayer - Railway tracks layer
 * @param {number} searchRadius - Search radius in meters (default: 200m)
 * @returns {Promise<Object>} { distance: number, trackFeature: Feature }
 */
export async function findNearestTrack(jointPoint, tracksLayer, searchRadius = 200) {
  console.log('🛤️  Finding nearest track to joint...');

  if (!jointPoint || !tracksLayer) {
    console.warn('⚠️ Missing joint point or tracks layer');
    return { distance: null, trackFeature: null };
  }

  try {
    // Create buffer for query
    const searchBuffer = geometryEngine.buffer(jointPoint, searchRadius, "meters");
    
    // Query tracks within buffer
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

    // Find closest track
    let minDistance = Infinity;
    let nearestTrack = null;

    results.features.forEach(track => {
      const distance = geometryEngine.distance(jointPoint, track.geometry, "meters");
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
 * Validate joint compliance with RLN00398 §5.8
 * 
 * @param {number} distanceToTrack - Distance from joint to nearest track (meters)
 * @returns {boolean} True if compliant (≥31m)
 */
export function validateJointCompliance(distanceToTrack) {
  const MINIMUM_DISTANCE = 31; // RLN00398 §5.8
  
  if (distanceToTrack === null || distanceToTrack === undefined) {
    return false;
  }

  return distanceToTrack >= MINIMUM_DISTANCE;
}

/**
 * Create joint data object
 * 
 * @param {Object} params - Joint parameters
 * @param {Point} params.geometry - Joint point geometry
 * @param {number} params.chainage - Distance from route start
 * @param {string} params.type - "joint" or "earthing"
 * @param {string} params.routeId - Associated route ID
 * @param {number} params.distanceToTrack - Distance to nearest track
 * @param {Feature} params.nearestTrack - Nearest track feature
 * @returns {JointData} Joint data object
 */
export function createJointData({
  geometry,
  chainage,
  type = "joint",
  routeId,
  distanceToTrack = null,
  nearestTrack = null
}) {
  const jointId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const compliant = validateJointCompliance(distanceToTrack);

  const jointData = {
    id: jointId,
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
    id: jointId,
    chainage: `${chainage.toFixed(2)}m`,
    trackDistance: distanceToTrack ? `${distanceToTrack.toFixed(2)}m` : 'N/A',
    compliant: compliant ? '✅' : '❌'
  });

  return jointData;
}

/**
 * Add joint to route
 * 
 * @param {string} routeId - Route identifier
 * @param {JointData} jointData - Joint data object
 */
export function addJoint(routeId, jointData) {
  if (!routeJoints.has(routeId)) {
    routeJoints.set(routeId, []);
  }

  const joints = routeJoints.get(routeId);
  joints.push(jointData);

  // Sort by chainage
  joints.sort((a, b) => a.chainageMeters - b.chainageMeters);

  console.log(`📍 Added ${jointData.type} to route ${routeId} (total: ${joints.length})`);
}

/**
 * Remove joint from route
 * 
 * @param {string} routeId - Route identifier
 * @param {string} jointId - Joint identifier
 * @returns {boolean} True if removed successfully
 */
export function removeJoint(routeId, jointId) {
  if (!routeJoints.has(routeId)) {
    console.warn(`⚠️ No joints found for route ${routeId}`);
    return false;
  }

  const joints = routeJoints.get(routeId);
  const initialLength = joints.length;
  
  const filtered = joints.filter(j => j.id !== jointId);
  routeJoints.set(routeId, filtered);

  const removed = filtered.length < initialLength;
  
  if (removed) {
    console.log(`✅ Removed joint ${jointId} from route ${routeId}`);
  } else {
    console.warn(`⚠️ Joint ${jointId} not found in route ${routeId}`);
  }

  return removed;
}

/**
 * Get all joints for a route
 * 
 * @param {string} routeId - Route identifier
 * @returns {Array<JointData>} Array of joint data objects (sorted by chainage)
 */
export function getJointsForRoute(routeId) {
  return routeJoints.get(routeId) || [];
}

/**
 * Get all joints across all routes
 * 
 * @returns {Map<string, Array<JointData>>} Map of route IDs to joint arrays
 */
export function getAllJoints() {
  return routeJoints;
}

/**
 * Clear all joints for a route
 * 
 * @param {string} routeId - Route identifier
 */
export function clearJointsForRoute(routeId) {
  if (routeJoints.has(routeId)) {
    const count = routeJoints.get(routeId).length;
    routeJoints.delete(routeId);
    console.log(`🗑️  Cleared ${count} joint(s) from route ${routeId}`);
  }
}

/**
 * Calculate minimum distance to track from all joints in a route
 * Used for EMC evaluation
 * 
 * @param {string} routeId - Route identifier
 * @returns {number|null} Minimum distance in meters, or null if no joints
 */
export function getMinimumJointToTrackDistance(routeId) {
  const joints = getJointsForRoute(routeId);
  
  if (joints.length === 0) {
    return null;
  }

  const distances = joints
    .map(j => j.distanceToTrackMeters)
    .filter(d => d !== null && d !== undefined);

  if (distances.length === 0) {
    return null;
  }

  const minDistance = Math.min(...distances);
  
  console.log(`📊 Route ${routeId}: ${joints.length} joint(s), min distance: ${minDistance.toFixed(2)}m`);
  
  return minDistance;
}

/**
 * Get compliance summary for route joints
 * 
 * @param {string} routeId - Route identifier
 * @returns {Object} Summary statistics
 */
export function getJointComplianceSummary(routeId) {
  const joints = getJointsForRoute(routeId);
  
  const total = joints.length;
  const compliant = joints.filter(j => j.compliant).length;
  const violations = total - compliant;
  const minDistance = getMinimumJointToTrackDistance(routeId);

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
 * Create visual marker graphic for a joint
 * 
 * @param {JointData} jointData - Joint data object
 * @returns {Graphic} Map graphic for the joint
 */
export function createJointGraphic(jointData) {
  const isCompliant = jointData.compliant;
  const color = isCompliant ? [0, 200, 0, 0.9] : [220, 20, 20, 0.9]; // Green or Red
  const outlineColor = isCompliant ? [0, 120, 0] : [160, 0, 0];

  // Icon based on type
  const icon = jointData.type === "earthing" ? "⚡" : "🔗";
  
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

  // Label showing chainage
  const labelText = `${icon} ${Math.round(jointData.chainageMeters)}m`;

  const graphic = new Graphic({
    geometry: jointData.geometry,
    symbol: markerSymbol,
    attributes: {
      id: jointData.id,
      type: jointData.type,
      chainage: jointData.chainageMeters,
      distanceToTrack: jointData.distanceToTrackMeters,
      compliant: jointData.compliant
    },
    popupTemplate: {
      title: `${jointData.type === "earthing" ? "Earthing Point" : "Joint"} at ${jointData.chainageMeters.toFixed(1)}m`,
      content: `
        <b>Chainage:</b> ${jointData.chainageMeters.toFixed(2)} m from route start<br>
        <b>Distance to track:</b> ${jointData.distanceToTrackMeters ? jointData.distanceToTrackMeters.toFixed(2) + ' m' : 'Unknown'}<br>
        <b>Status:</b> ${jointData.compliant ? '✅ Compliant (≥31m)' : '❌ Violation (<31m)'}<br>
        <b>Created:</b> ${new Date(jointData.timestamp).toLocaleString()}
      `
    }
  });

  return graphic;
}

/**
 * Re-snap joints to updated route geometry
 * Maintains chainage position along the route when geometry changes
 * 
 * @param {string} routeId - Route identifier
 * @param {Polyline} newRouteGeometry - Updated route geometry
 * @param {FeatureLayer} tracksLayer - Railway tracks layer for distance recalculation
 * @returns {Promise<Array<JointData>>} Updated joint data array
 */
export async function resnapJointsToRoute(routeId, newRouteGeometry, tracksLayer = null) {
  console.log(`🔄 Re-snapping joints for route ${routeId} to updated geometry...`);
  
  const joints = getJointsForRoute(routeId);
  
  if (joints.length === 0) {
    console.log('   ℹ️  No joints to re-snap');
    return [];
  }
  
  const updatedJoints = [];
  
  for (const joint of joints) {
    try {
      // Get point at the same chainage on the new route
      const newPoint = geometryEngine.geometryAtLength(newRouteGeometry, joint.chainageMeters, "meters");
      
      if (!newPoint) {
        console.warn(`   ⚠️ Could not re-snap joint ${joint.id} at chainage ${joint.chainageMeters}m`);
        // Keep original position if re-snap fails
        updatedJoints.push(joint);
        continue;
      }
      
      // Update geometry
      joint.geometry = newPoint;
      
      // Recalculate distance to track if tracks layer is available
      if (tracksLayer) {
        try {
          const trackResult = await findNearestTrack(newPoint, tracksLayer, 200);
          joint.distanceToTrackMeters = trackResult.distance;
          joint.nearestTrackId = trackResult.trackFeature?.attributes?.OBJECTID || null;
          joint.compliant = validateJointCompliance(trackResult.distance);
          
          console.log(`   ✅ Re-snapped ${joint.type} at ${joint.chainageMeters.toFixed(1)}m - new track distance: ${trackResult.distance?.toFixed(2) || 'N/A'}m`);
        } catch (error) {
          console.warn(`   ⚠️ Could not recalculate track distance for joint ${joint.id}:`, error);
        }
      } else {
        console.log(`   ✅ Re-snapped ${joint.type} at ${joint.chainageMeters.toFixed(1)}m (track distance not recalculated)`);
      }
      
      updatedJoints.push(joint);
    } catch (error) {
      console.error(`   ❌ Error re-snapping joint ${joint.id}:`, error);
      updatedJoints.push(joint); // Keep original on error
    }
  }
  
  // Update storage with re-snapped joints
  routeJoints.set(routeId, updatedJoints);
  
  console.log(`✅ Re-snapped ${updatedJoints.length} joint(s) for route ${routeId}`);
  
  return updatedJoints;
}

console.log('✅ Joint Manager utility loaded');
