/**
 * Shared Geometry Utilities
 * Reusable geometric calculations for EMC evaluation (both V1 and V2)
 * 
 * These utilities are version-agnostic and handle:
 * - Spatial projections (WGS84 ↔ RD New)
 * - Distance calculations
 * - Angle measurements
 * - Track geometry queries
 */

import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator";

const RD_SPATIAL_REFERENCE = { wkid: 28992 };

// ============================================================================
// PROJECTION & COORDINATE UTILITIES
// ============================================================================

let projectionReady = false;
let projectionPromise = null;

/**
 * Ensures projection engine is loaded before use
 * @returns {Promise<void>}
 */
export async function ensureProjectionLoaded() {
  if (projectionReady) {
    return;
  }
  if (!projectionPromise) {
    projectionPromise = projectOperator.load().then(() => {
      projectionReady = true;
    }).catch((error) => {
      projectionReady = false;
      console.warn("Projection engine failed to load", error);
    });
  }
  return projectionPromise;
}

/**
 * Converts value to number, handling null/undefined/NaN
 * @param {*} value - Value to convert
 * @returns {number|null}
 */
export function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Clamps a value between min and max
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Creates a Point from coordinate array
 * @param {Array<number>} coords - [x, y] coordinates
 * @param {Object} spatialReference 
 * @returns {Point|null}
 */
export function createPointFromCoords(coords, spatialReference) {
  if (!coords || coords.length < 2) {
    return null;
  }
  return new Point({
    x: coords[0],
    y: coords[1],
    spatialReference
  });
}

/**
 * Extracts a single point from various geometry types
 * For polylines, returns the first point (not midpoint) for better intersection analysis
 * @param {Geometry} geometry 
 * @returns {Point|null}
 */
export function extractPointFromGeometry(geometry) {
  if (!geometry) {
    return null;
  }

  if (geometry.type === "point") {
    return geometry;
  }

  if (geometry.type === "multipoint" && geometry.points?.length) {
    return createPointFromCoords(geometry.points[0], geometry.spatialReference);
  }

  if (geometry.type === "polyline" && geometry.paths?.length) {
    const path = geometry.paths[0];
    if (!path || !path.length) {
      return null;
    }
    // Use the FIRST point instead of midpoint for intersection analysis
    // This represents the actual crossing location better
    return createPointFromCoords(path[0], geometry.spatialReference);
  }

  return null;
}

// ============================================================================
// VECTOR & ANGLE CALCULATIONS
// ============================================================================

/**
 * Gets the direction vector of a polyline at a specific point
 * Uses a robust approach that finds the nearest segment manually if needed
 * @param {Polyline} polyline 
 * @param {Point} point 
 * @param {number} searchRadius - Radius to search for segments (meters)
 * @returns {Object|null} - {x, y} normalized vector
 */
export function vectorAtPoint(polyline, point, searchRadius = 50) {
  if (!polyline || !point) {
    return null;
  }

  // Fallback: manually find the closest segment within search radius
  // This is more robust for intersection points, especially with complex geometries
  let closestSegment = null;
  let minDistance = Infinity;
  let segmentsChecked = 0;
  let validSegments = 0;

  for (let pathIdx = 0; pathIdx < (polyline.paths?.length || 0); pathIdx++) {
    const path = polyline.paths[pathIdx];
    if (!path || path.length < 2) continue;

    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      
      segmentsChecked++;
      
      if (!start || !end || start.length < 2 || end.length < 2) continue;
      
      validSegments++;

      // Calculate distance from point to segment midpoint
      const midX = (start[0] + end[0]) / 2;
      const midY = (start[1] + end[1]) / 2;
      const dx = point.x - midX;
      const dy = point.y - midY;
      const distance = Math.hypot(dx, dy);

      if (distance < minDistance) {
        minDistance = distance;
        if (distance <= searchRadius) {
          closestSegment = { start, end, distance };
        }
      }
    }
  }

  // If we found a close segment, use it
  if (closestSegment) {
    const vx = closestSegment.end[0] - closestSegment.start[0];
    const vy = closestSegment.end[1] - closestSegment.start[1];
    const length = Math.hypot(vx, vy);

    if (length > 0) {
      return {
        x: vx / length,
        y: vy / length
      };
    }
  }

  // If nothing found, log diagnostic info
  if (!closestSegment && segmentsChecked > 0) {
    console.log(`         ⚠️ vectorAtPoint: No segment within ${searchRadius}m. Checked ${segmentsChecked} segments, ${validSegments} valid. Closest was ${minDistance.toFixed(1)}m`);
  }

  return null;
}

/**
 * Calculates angle between two vectors (in degrees, 0-90°)
 * @param {Object} vectorA - {x, y}
 * @param {Object} vectorB - {x, y}
 * @returns {number|null} - Angle in degrees
 */
export function angleBetweenVectors(vectorA, vectorB) {
  if (!vectorA || !vectorB) {
    return null;
  }

  const dot = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
  const magnitudeA = Math.hypot(vectorA.x, vectorA.y);
  const magnitudeB = Math.hypot(vectorB.x, vectorB.y);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return null;
  }

  const cosine = clamp(dot / (magnitudeA * magnitudeB), -1, 1);
  const angleRad = Math.acos(cosine);
  let angleDeg = angleRad * (180 / Math.PI);

  if (angleDeg > 180) {
    angleDeg = 360 - angleDeg;
  }

  return angleDeg > 90 ? 180 - angleDeg : angleDeg;
}

/**
 * Analyzes crossing angles between route and track geometries
 * Uses a small buffer to detect near-crossings (within tolerance)
 * 
 * @param {Polyline} routeRd - Route in RD coordinates
 * @param {Array<Geometry>} trackGeometries - Array of track centerlines
 * @param {number} tolerance - Distance tolerance in meters for detecting crossings (default 2m)
 * @returns {Object} - {crossesTrack, primaryAngle, angles[]}
 */
export function analyzeCrossings(routeRd, trackGeometries, tolerance = 2) {
  const angles = [];
  let crossesTrack = false;
  
  console.log(`      🔍 Analyzing ${trackGeometries.length} tracks for crossings (tolerance: ${tolerance}m)...`);
  console.log(`      📍 Route SR: ${routeRd?.spatialReference?.wkid}, Type: ${routeRd?.type}`);
  console.log(`      📏 Route has ${routeRd?.paths?.length || 0} path(s)`);
  if (routeRd?.paths?.[0]) {
    console.log(`      📏 First path has ${routeRd.paths[0].length} points`);
  }
  
  let intersectionCount = 0;
  let emptyIntersectionCount = 0;
  let noPointCount = 0;
  let noVectorCount = 0;
  let nullGeometryCount = 0;
  let wrongTypeCount = 0;
  let nearMissCount = 0;

  // Sample first few tracks to see what we're working with
  for (let i = 0; i < Math.min(5, trackGeometries.length); i++) {
    const g = trackGeometries[i];
    console.log(`      📍 Track ${i}: SR=${g?.spatialReference?.wkid}, Type=${g?.type}, Paths=${g?.paths?.length || 0}`);
  }

  for (let i = 0; i < trackGeometries.length; i++) {
    const geometry = trackGeometries[i];
    if (!geometry) {
      nullGeometryCount++;
      continue;
    }
    
    if (geometry.type !== 'polyline') {
      wrongTypeCount++;
      continue;
    }

    // First check distance - if too far, skip
    const distance = geometryEngine.distance(routeRd, geometry, "meters");
    if (distance > tolerance) {
      continue;
    }
    
    if (distance < tolerance && i < 10) {
      console.log(`      📏 Track ${i} is ${distance.toFixed(2)}m from route (within tolerance)`);
    }

    // Use buffer approach for near-crossings
    // Buffer the track slightly to catch near-intersections
    const bufferedTrack = geometryEngine.buffer(geometry, tolerance, "meters");
    const intersection = geometryEngine.intersect(routeRd, bufferedTrack);
    
    // Debug first few intersections
    if (i < 3 || (distance < tolerance && i < 10)) {
      console.log(`      🔍 Track ${i}: distance=${distance.toFixed(2)}m, intersection=${intersection ? 'exists' : 'null'}, isEmpty=${intersection?.isEmpty}`);
    }
    
    if (!intersection || intersection.isEmpty) {
      if (distance < tolerance) {
        nearMissCount++;
      }
      emptyIntersectionCount++;
      continue;
    }

    intersectionCount++;
    console.log(`      ✅ Track ${i} has intersection! Type: ${intersection.type}, Distance: ${distance.toFixed(2)}m`);
    
    const intersectionPoint = extractPointFromGeometry(intersection);
    if (!intersectionPoint) {
      noPointCount++;
      console.log(`      ⚠️ Track ${i}: Could not extract point from intersection`);
      continue;
    }

    console.log(`      📍 Track ${i} intersection point: [${intersectionPoint.x.toFixed(2)}, ${intersectionPoint.y.toFixed(2)}]`);

    const routeVector = vectorAtPoint(routeRd, intersectionPoint);
    const trackVector = vectorAtPoint(geometry, intersectionPoint);
    
    if (!routeVector || !trackVector) {
      noVectorCount++;
      console.log(`      ⚠️ Track ${i}: Failed to get vectors (route=${!!routeVector}, track=${!!trackVector})`);
      continue;
    }
    
    const angle = angleBetweenVectors(routeVector, trackVector);

    if (angle === null) {
      noVectorCount++;
      console.log(`      ⚠️ Track ${i}: angleBetweenVectors returned null`);
      continue;
    }

    angles.push(angle);
    crossesTrack = true;
    console.log(`      ✅ Crossing #${angles.length} at track ${i}: ${angle.toFixed(1)}°`);
  }
  
  console.log(`      📊 Analysis results: ${intersectionCount} intersections, ${angles.length} angles calculated`);
  if (nullGeometryCount > 0) console.log(`      ⚠️ ${nullGeometryCount} null geometries`);
  if (wrongTypeCount > 0) console.log(`      ⚠️ ${wrongTypeCount} non-polyline geometries`);
  if (nearMissCount > 0) console.log(`      📏 ${nearMissCount} tracks within tolerance but no intersection found`);
  if (emptyIntersectionCount > 0) console.log(`      ℹ️ ${emptyIntersectionCount} tracks had no intersection`);
  if (noPointCount > 0) console.log(`      ⚠️ ${noPointCount} intersections had no extractable point`);
  if (noVectorCount > 0) console.log(`      ⚠️ ${noVectorCount} crossing points had invalid vectors`);

  let primaryAngle = null;
  if (angles.length) {
    primaryAngle = angles.reduce((best, current) => {
      if (best === null) {
        return current;
      }
      return Math.abs(90 - current) < Math.abs(90 - best) ? current : best;
    }, null);
  }

  return {
    crossesTrack,
    primaryAngle,
    angles
  };
}

// ============================================================================
// DISTANCE CALCULATIONS
// ============================================================================

/**
 * Fetches track geometries from available track layers
 * @param {Polyline} routeGeometry - Route geometry
 * @param {Object} trackLayers - Object containing track layers
 * @returns {Promise<Array<Geometry>>} - Array of track centerlines
 */
export async function fetchTrackGeometries(routeGeometry, trackLayers) {
  if (!trackLayers) {
    return [];
  }

  try {
    console.log(`   🔄 Projecting route from SR ${routeGeometry.spatialReference?.wkid || 'unknown'} to RD New (28992)...`);
    await ensureProjectionLoaded();
    const routeRd = projectOperator.execute(routeGeometry, RD_SPATIAL_REFERENCE);
    
    if (!routeRd) {
      console.error("   ❌ Failed to project route to RD New!");
      return [];
    }
    
    const bufferDistance = 10000; // 10km default buffer
    console.log(`   🔍 Creating ${bufferDistance}m buffer in RD coordinates...`);
    const buffer = geometryEngine.buffer(routeRd, bufferDistance, "meters");
    
    if (!buffer) {
      console.error("   ❌ Failed to create buffer!");
      return [];
    }
    
    const allGeometries = [];

    // Helper function to query a single track layer
    const queryLayer = async (layer, layerName) => {
      if (!layer || typeof layer.createQuery !== "function") {
        console.log(`   ⚠️ ${layerName}: Layer not available or invalid`);
        return [];
      }

      try {
        const query = layer.createQuery();
        query.geometry = buffer;
        query.spatialRelationship = "intersects";
        query.returnGeometry = true;
        query.outFields = ["OBJECTID"];
        query.outSpatialReference = RD_SPATIAL_REFERENCE;
        query.num = 2000;

        console.log(`   🔍 Querying ${layerName}...`);
        const result = await layer.queryFeatures(query);
        const geometries = (result?.features || []).map((feature) => feature.geometry).filter(Boolean);
        
        if (geometries.length > 0) {
          console.log(`   ✅ Fetched ${geometries.length} track geometries from ${layerName}`);
        } else {
          console.log(`   ⚠️ No tracks found in ${layerName}`);
        }
        
        return geometries;
      } catch (error) {
        console.warn(`   ❌ Failed to query ${layerName}`, error);
        return [];
      }
    };

    // Query all available track layers
    if (trackLayers.railwayTracksLayer || trackLayers.tracksLayer) {
      const layer = trackLayers.railwayTracksLayer || trackLayers.tracksLayer;
      const geometries = await queryLayer(layer, "railway tracks");
      allGeometries.push(...geometries);
    }

    if (trackLayers.trackSectionsLayer) {
      const geometries = await queryLayer(trackLayers.trackSectionsLayer, "track sections");
      allGeometries.push(...geometries);
    }

    if (trackLayers.switchesLayer) {
      const geometries = await queryLayer(trackLayers.switchesLayer, "switches");
      allGeometries.push(...geometries);
    }

    console.log(`   ✅ Total track geometries: ${allGeometries.length}`);
    return allGeometries;
  } catch (error) {
    console.warn("Failed to fetch track geometries", error);
    return [];
  }
}

/**
 * Calculates minimum distance from route to geometries
 * @param {Polyline} routeRd - Route geometry in RD coordinates
 * @param {Array<Geometry>} geometries - Array of geometries to check
 * @param {number} adjustment - Distance adjustment (e.g., track width)
 * @returns {number|null} - Minimum distance in meters, or null
 */
export function computeMinimumDistance(routeRd, geometries, adjustment = 1.5) {
  if (!geometries || geometries.length === 0) {
    console.warn("⚠️ No geometries provided for distance calculation");
    return null;
  }

  let minDistance = Infinity;
  let closestGeometryIndex = -1;
  
  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i];
    if (!geometry) {
      continue;
    }

    const distance = geometryEngine.distance(routeRd, geometry, "meters");
    if (typeof distance === "number") {
      if (distance < minDistance) {
        minDistance = distance;
        closestGeometryIndex = i;
      }
    }
  }

  if (!Number.isFinite(minDistance)) {
    console.warn("⚠️ No valid distance found");
    return null;
  }

  const adjustedDistance = Math.max(0, minDistance - adjustment);
  console.log(`   📐 Closest feature #${closestGeometryIndex}: ${minDistance.toFixed(2)}m (centerline) → ${adjustedDistance.toFixed(2)}m (adjusted)`);

  return adjustedDistance;
}

/**
 * Calculates distance to technical rooms
 * @param {Geometry} routeGeometry - Route geometry
 * @param {Polyline} routeRd - Route in RD coordinates
 * @param {FeatureLayer} layer - Technical rooms layer
 * @returns {Promise<number|null>}
 */
export async function computeTechnicalRoomDistance(routeGeometry, routeRd, layer) {
  if (!layer || typeof layer.createQuery !== "function") {
    console.warn("❌ Technical rooms layer not available");
    return null;
  }

  try {
    const bufferDistance = 10000; // 10km
    const buffer = geometryEngine.geodesicBuffer(routeGeometry, bufferDistance, "meters");
    const query = layer.createQuery();
    query.geometry = buffer || routeGeometry.extent;
    query.spatialRelationship = "intersects";
    query.returnGeometry = true;
    query.outFields = ["OBJECTID"];
    query.outSpatialReference = RD_SPATIAL_REFERENCE;
    query.num = 2000;

    const result = await layer.queryFeatures(query);
    const geometries = (result?.features || []).map((feature) => feature.geometry).filter(Boolean);
    const distance = computeMinimumDistance(routeRd, geometries, 0);
    
    if (distance !== null) {
      console.log(`   ✅ Minimum distance to technical room: ${distance.toFixed(2)}m`);
    }
    
    return distance;
  } catch (error) {
    console.error("❌ Failed to query technical rooms:", error);
    return null;
  }
}

/**
 * Determines if the HV route has a parallel run with the railway track
 * within a critical distance zone.
 * 
 * DEFINITION (per RLN00398 v4 interpretation):
 * A "parallel run" exists when the cable is inside the critical zone (700m or 11m)
 * AND does NOT qualify as a proper crossing (angle between 80° and 100°).
 * 
 * LOGIC:
 * - If cable is OUTSIDE zone → No parallel run
 * - If cable crosses track at 80-100° → No parallel run (proper crossing)
 * - If cable is INSIDE zone with angle < 80° or > 100° → Parallel run detected
 * - If cable is INSIDE zone but doesn't cross → Parallel run detected
 * 
 * This function checks if ANY crossing within the zone has an angle outside
 * the acceptable range (80-100°), OR if the cable enters the zone without
 * crossing at all.
 * 
 * @param {Polyline} routeRd - HV cable route in RD New coordinates
 * @param {Polyline|Polyline[]} trackGeometry - Railway track(s) in RD New coordinates
 * @param {number} zoneDistance - Critical distance threshold (700m for >24kV, 11m for ≤24kV)
 * @param {number} unused - Kept for backward compatibility (previously minParallelLength)
 * @returns {boolean} - True if parallel run detected, false otherwise
 */
export function hasParallelRun(routeRd, trackGeometry, zoneDistance, unused = null) {
  if (!routeRd || !trackGeometry) {
    console.warn('hasParallelRun: Missing route or track geometry');
    return false;
  }

  console.log(`      🔍 Checking for parallel run within ${zoneDistance}m zone...`);

  // Ensure trackGeometry is an array
  const tracks = Array.isArray(trackGeometry) ? trackGeometry : [trackGeometry];
  
  // Step 1: Check if route enters the zone at all
  const zoneBuffer = geometryEngine.buffer(routeRd, zoneDistance, "meters");
  let entersZone = false;
  
  for (const track of tracks) {
    if (!track) continue;
    const intersection = geometryEngine.intersect(zoneBuffer, track);
    if (intersection && !intersection.isEmpty) {
      entersZone = true;
      break;
    }
  }
  
  if (!entersZone) {
    console.log(`      ✅ Route stays outside ${zoneDistance}m zone - no parallel run`);
    return false;
  }
  
  console.log(`      📍 Route enters ${zoneDistance}m zone - checking crossings...`);
  
  // Step 2: Analyze crossings within the zone
  const crossingAnalysis = analyzeCrossings(routeRd, tracks, 2);
  
  if (!crossingAnalysis.crossesTrack) {
    // Route is in zone but doesn't cross track → parallel run
    console.log(`      ⚠️ Parallel run detected: Route in zone without crossing track`);
    return true;
  }
  
  // Step 3: Check if ALL crossings have acceptable angles (80-100°)
  const angles = crossingAnalysis.angles || [];
  console.log(`      📐 Found ${angles.length} crossing(s) with angle(s): ${angles.map(a => a.toFixed(1) + '°').join(', ')}`);
  
  for (const angle of angles) {
    if (angle < 80 || angle > 100) {
      console.log(`      ⚠️ Parallel run detected: Crossing angle ${angle.toFixed(1)}° outside acceptable range (80-100°)`);
      return true;
    }
  }
  
  console.log(`      ✅ All crossings within acceptable angle range (80-100°) - no parallel run`);
  return false;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const geometryUtils = {
  // Projection utilities
  ensureProjectionLoaded,
  RD_SPATIAL_REFERENCE,
  
  // Coordinate utilities
  toNumber,
  clamp,
  createPointFromCoords,
  extractPointFromGeometry,
  
  // Vector & angle calculations
  vectorAtPoint,
  angleBetweenVectors,
  analyzeCrossings,
  
  // Distance calculations
  fetchTrackGeometries,
  computeMinimumDistance,
  computeTechnicalRoomDistance,
  
  // Parallel run detection
  hasParallelRun
};
