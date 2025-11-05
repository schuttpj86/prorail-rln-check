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
    const midpointIndex = Math.floor(path.length / 2);
    return createPointFromCoords(path[midpointIndex], geometry.spatialReference);
  }

  return null;
}

// ============================================================================
// VECTOR & ANGLE CALCULATIONS
// ============================================================================

/**
 * Gets the direction vector of a polyline at a specific point
 * @param {Polyline} polyline 
 * @param {Point} point 
 * @returns {Object|null} - {x, y} normalized vector
 */
export function vectorAtPoint(polyline, point) {
  if (!polyline || !point) {
    return null;
  }

  const nearest = geometryEngine.nearestCoordinate(polyline, point);
  if (!nearest) {
    return null;
  }

  const path = polyline.paths?.[nearest.pathIndex];
  if (!path || path.length < 2) {
    return null;
  }

  let start = path[nearest.segmentIndex];
  let end = path[nearest.segmentIndex + 1];

  if (!start || !end) {
    if (nearest.segmentIndex > 0) {
      start = path[nearest.segmentIndex - 1];
      end = path[nearest.segmentIndex];
    } else if (nearest.segmentIndex + 1 < path.length) {
      start = path[nearest.segmentIndex];
      end = path[nearest.segmentIndex + 1];
    } else {
      return null;
    }
  }

  const vx = end[0] - start[0];
  const vy = end[1] - start[1];
  const length = Math.hypot(vx, vy);

  if (length === 0) {
    return null;
  }

  return {
    x: vx / length,
    y: vy / length
  };
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
 * @param {Polyline} routeRd - Route in RD coordinates
 * @param {Array<Geometry>} trackGeometries - Array of track centerlines
 * @returns {Object} - {crossesTrack, primaryAngle, angles[]}
 */
export function analyzeCrossings(routeRd, trackGeometries) {
  const angles = [];
  let crossesTrack = false;

  for (const geometry of trackGeometries) {
    if (!geometry) {
      continue;
    }

    const intersection = geometryEngine.intersect(routeRd, geometry);
    if (!intersection || intersection.isEmpty) {
      continue;
    }

    const intersectionPoint = extractPointFromGeometry(intersection);
    if (!intersectionPoint) {
      continue;
    }

    const routeVector = vectorAtPoint(routeRd, intersectionPoint);
    const trackVector = vectorAtPoint(geometry, intersectionPoint);
    const angle = angleBetweenVectors(routeVector, trackVector);

    if (angle === null) {
      continue;
    }

    angles.push(angle);
    crossesTrack = true;
  }

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
  computeTechnicalRoomDistance
};
