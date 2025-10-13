import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator";

import { config } from "../config.js";

const RD_SPATIAL_REFERENCE = { wkid: 28992 };

const DEFAULT_METADATA = {
  infrastructureType: "cable",
  voltageKv: 110,
  electrifiedSystem: "standard",
  faultClearingTimeMs: 120,
  hasDoubleGuying: null,
  hasBoredCrossing: null,
  minJointDistanceMeters: null,
  minMastDistanceMeters: null,
  notes: ""
};

const RULE_DEFINITIONS = [
  {
    id: "CROSSING_ANGLE",
    title: "Crossing angle between 80° and 100°",
    clause: "§ 5.1 (1), § 5.2 (1)", // Corrected
    applicableFor: ["cable", "overhead"], // Both infrastructure types
    applies: (ctx) => ctx.crossing.crossesTrack,
    evaluate: (ctx) => {
      const min = config.compliance.crossingAngle.min;
      const max = config.compliance.crossingAngle.max;
      const angle = ctx.crossing.primaryAngle;

      if (angle === null || angle === undefined) {
        return {
          status: "not_evaluated",
          message: "Unable to determine crossing angle"
        };
      }

      const withinRange = angle >= min && angle <= max;
      return {
        status: withinRange ? "pass" : "fail",
        message: withinRange
          ? `Measured crossing angle ${angle.toFixed(1)}°`
          : `Crossing angle ${angle.toFixed(1)}° outside ${min}°–${max}° window`,
        metrics: {
          angleDegrees: angle,
          permittedMin: min,
          permittedMax: max
        }
      };
    },
    notApplicableMessage: "Route does not cross a railway track"
  },
  {
    id: "FAULT_CLEARING_TIME",
    title: "Fault must clear within 100 ms",
    clause: "§ 5.1 (4), § 5.2 (2)", // Corrected
    applicableFor: ["cable", "overhead"], // Both infrastructure types
    applies: () => true,
    evaluate: (ctx) => {
      const limit = config.compliance.faultClearingTime.max;
      const value = ctx.metadata.faultClearingTimeMs;
      if (value === null || value === undefined || Number.isNaN(value)) {
        return {
          status: "not_evaluated",
          message: "Provide the expected fault clearing time"
        };
      }

      const passes = Number(value) <= limit;
      return {
        status: passes ? "pass" : "fail",
        message: passes
          ? `Fault clearing time ${Number(value).toFixed(0)} ms`
          : `Fault clearing time ${Number(value).toFixed(0)} ms exceeds ${limit} ms`,
        metrics: {
          faultClearingTimeMs: Number(value),
          limitMs: limit
        }
      };
    }
  },
  {
    id: "OHL_DOUBLE_GUYING",
    title: "Crossing span is double-guyed",
    clause: "§ 5.1 (3)", // Corrected
    applicableFor: ["overhead"], // Only overhead lines
    applies: (ctx) => ctx.routeType === "overhead" && ctx.crossing.crossesTrack,
    evaluate: (ctx) => {
      const value = ctx.metadata.hasDoubleGuying;
      if (value === null || value === undefined) {
        return {
          status: "not_evaluated",
          message: "Confirm whether the crossing span is double-guyed"
        };
      }

      return {
        status: value ? "pass" : "fail",
        message: value
          ? "Double guying confirmed"
          : "Crossing span must be double-guyed"
      };
    },
    notApplicableMessage: "Applies only to overhead crossings"
  },
  {
    id: "OHL_NON_CROSSING_DISTANCE",
    title: "Overhead line distance to track",
    clause: "§ 5.1 (5)", // Corrected
    applicableFor: ["overhead"], // Only overhead lines
    applies: (ctx) => ctx.routeType === "overhead" && !ctx.crossing.crossesTrack,
    evaluate: (ctx) => {
      const threshold = ctx.metadata.electrifiedSystem === "25kv_50hz"
          ? config.compliance.nonCrossingDistances.electrified25kV
          : config.compliance.nonCrossingDistances.default;
      const distance = ctx.distances.track;

      if (distance === null) {
        return {
          status: "not_evaluated",
          message: "Track reference data unavailable"
        };
      }

      const passes = distance >= threshold;
      return {
        status: passes ? "pass" : "fail",
        message: passes
          ? `Minimum horizontal distance ${distance.toFixed(1)} m`
          : `Keep overhead line ${threshold} m from outermost track (current ${distance.toFixed(1)} m)`,
        metrics: {
          minimumDistanceMeters: distance,
          requiredDistanceMeters: threshold
        }
      };
    },
    notApplicableMessage: "Overhead line crosses the track"
  },
  {
    id: "CABLE_NON_CROSSING_HV",
    title: "≥35 kV cable distance to track",
    clause: "§ 5.2 (3)", // Corrected
    applicableFor: ["cable"], // Only cables
    applies: (ctx) => ctx.routeType === "cable" && !ctx.crossing.crossesTrack && ctx.metadata.voltageKv >= 35,
    evaluate: (ctx) => {
      const threshold = ctx.metadata.electrifiedSystem === "25kv_50hz"
          ? config.compliance.nonCrossingDistances.electrified25kV
          : config.compliance.nonCrossingDistances.default;
      const distance = ctx.distances.track;

      if (distance === null) {
        return {
          status: "not_evaluated",
          message: "Track reference data unavailable"
        };
      }

      const passes = distance >= threshold;
      return {
        status: passes ? "pass" : "fail",
        message: passes
          ? `Minimum horizontal distance ${distance.toFixed(1)} m`
          : `Maintain ${threshold} m separation from the track (current ${distance.toFixed(1)} m)`,
        metrics: {
          minimumDistanceMeters: distance,
          requiredDistanceMeters: threshold
        }
      };
    },
    notApplicableMessage: "Cable crosses the track"
  },
  {
    id: "CABLE_NON_CROSSING_LV",
    title: "<35 kV cable distance to track",
    clause: "§ 5.2 (4), § 5.2 (5)", // Corrected
    applicableFor: ["cable"], // Only cables
    applies: (ctx) => ctx.routeType === "cable" && !ctx.crossing.crossesTrack && ctx.metadata.voltageKv < 35,
    evaluate: (ctx) => {
      const threshold = config.compliance.nonCrossingDistances.lowVoltageCable;
      const distance = ctx.distances.track;

      if (distance === null) {
        return {
          status: "not_evaluated",
          message: "Track reference data unavailable"
        };
      }

      const passes = distance >= threshold;
      return {
        status: passes ? "pass" : "fail",
        message: passes
          ? `Minimum horizontal distance ${distance.toFixed(1)} m`
          : `Maintain ${threshold} m separation from the track (current ${distance.toFixed(1)} m)`,
        metrics: {
          minimumDistanceMeters: distance,
          requiredDistanceMeters: threshold
        }
      };
    },
    notApplicableMessage: "Cable crosses the track"
  },
  {
    id: "CABLE_BORE_CROSSING",
    title: "Bored insulated conduit for underpasses",
    clause: "§ 5.2 (7)", // Corrected
    applicableFor: ["cable"], // Only cables
    applies: (ctx) => ctx.routeType === "cable" && ctx.crossing.crossesTrack,
    evaluate: (ctx) => {
      const value = ctx.metadata.hasBoredCrossing;
      if (value === null || value === undefined) {
        return {
          status: "not_evaluated",
          message: "Confirm whether the crossing uses an insulated conduit"
        };
      }

      return {
        status: value ? "pass" : "fail",
        message: value
          ? "Bored insulated conduit confirmed"
          : "Provide insulated conduit for cable crossing"
      };
    },
    notApplicableMessage: "Cable does not cross the track"
  },
  {
    id: "TECHNICAL_ROOM_CLEARANCE",
    title: "No HV infrastructure within 20 m of technical rooms",
    clause: "§ 5.1 (8), § 5.2 (6)", // Corrected
    applicableFor: ["cable", "overhead"], // Both infrastructure types
    applies: () => true,
    evaluate: (ctx) => {
      const distance = ctx.distances.technicalRoom;
      if (distance === null) {
        return {
          status: "not_evaluated",
          message: ctx.layers.technicalRoomsLayer
            ? "Technical room data not found near route"
            : "Technical rooms layer not configured"
        };
      }

      const threshold = config.compliance.technicalRoomDistance.min;
      const passes = distance >= threshold;
      return {
        status: passes ? "pass" : "fail",
        message: passes
          ? `Nearest technical room ${distance.toFixed(1)} m away`
          : `Keep ≥${threshold} m from technical rooms (current ${distance.toFixed(1)} m)`,
        metrics: {
          minimumDistanceMeters: distance,
          requiredDistanceMeters: threshold
        }
      };
    }
  },
  {
    id: "JOINT_DISTANCE",
    title: "Joints and earthing ≥31 m from track",
    clause: "§ 5.2 (8)", // Corrected
    applicableFor: ["cable"], // Only cables (overhead lines don't have joints)
    applies: () => true,
    evaluate: (ctx) => {
      const threshold = config.compliance.jointDistance.min;
      const routeToTrackDistance = ctx.distances.track;
      const userMarkedJointDistance = ctx.metadata.minJointDistanceMeters;

      // Smart rule: If entire route is >31m from tracks, automatic pass
      if (routeToTrackDistance !== null && routeToTrackDistance >= threshold) {
        return {
          status: "pass",
          message: `Entire route is ${routeToTrackDistance.toFixed(1)} m from tracks - joints can be placed anywhere`,
          metrics: {
            minimumDistanceMeters: routeToTrackDistance,
            requiredDistanceMeters: threshold,
            autoEvaluated: true
          }
        };
      }

      // Route comes within 31m of tracks - need manual joint marking
      if (userMarkedJointDistance === null || userMarkedJointDistance === undefined || Number.isNaN(userMarkedJointDistance)) {
        return {
          status: "not_evaluated",
          message: routeToTrackDistance !== null
            ? `Route comes within ${routeToTrackDistance.toFixed(1)} m of tracks - mark joint locations for validation`
            : "Document minimum distance between joints/earthing and the track"
        };
      }

      const passes = Number(userMarkedJointDistance) >= threshold;
      return {
        status: passes ? "pass" : "fail",
        message: passes
          ? `Joints located ${Number(userMarkedJointDistance).toFixed(1)} m from track`
          : `Ensure joints ≥${threshold} m from track (current ${Number(userMarkedJointDistance).toFixed(1)} m)`,
        metrics: {
          minimumDistanceMeters: Number(userMarkedJointDistance),
          requiredDistanceMeters: threshold
        }
      };
    }
  },
  {
    id: "OHL_MAST_DISTANCE",
    title: "Masts ≥31 m from track",
    clause: "§ 5.1 (7)",
    applicableFor: ["overhead"], // Only for overhead lines
    applies: () => true,
    evaluate: (ctx) => {
      const threshold = config.compliance.mastDistance.min;
      const routeToTrackDistance = ctx.distances.track;
      const userMarkedMastDistance = ctx.metadata.minMastDistanceMeters;

      // Smart rule: If entire route is >31m from tracks, automatic pass
      if (routeToTrackDistance !== null && routeToTrackDistance >= threshold) {
        return {
          status: "pass",
          message: `Entire route is ${routeToTrackDistance.toFixed(1)} m from tracks - masts can be placed anywhere`,
          metrics: {
            minimumDistanceMeters: routeToTrackDistance,
            requiredDistanceMeters: threshold,
            autoEvaluated: true
          }
        };
      }

      // Route comes within 31m of tracks - need manual mast distance input
      if (userMarkedMastDistance === null || userMarkedMastDistance === undefined || Number.isNaN(userMarkedMastDistance)) {
        return {
          status: "not_evaluated",
          message: routeToTrackDistance !== null
            ? `Route comes within ${routeToTrackDistance.toFixed(1)} m of tracks - document minimum mast distance`
            : "Document minimum distance between masts and the track"
        };
      }

      const passes = Number(userMarkedMastDistance) >= threshold;
      return {
        status: passes ? "pass" : "fail",
        message: passes
          ? `Masts located ${Number(userMarkedMastDistance).toFixed(1)} m from track`
          : `Ensure masts ≥${threshold} m from track (current ${Number(userMarkedMastDistance).toFixed(1)} m)`,
        metrics: {
          minimumDistanceMeters: Number(userMarkedMastDistance),
          requiredDistanceMeters: threshold
        }
      };
    }
  }
];

let projectionReady = false;
let projectionPromise = null;

async function ensureProjectionLoaded() {
  if (projectionReady) {
    return;
  }
  if (!projectionPromise) {
    projectionPromise = projectOperator.load().then(() => {
      projectionReady = true;
    }).catch((error) => {
      projectionReady = false;
      console.warn("Projection engine failed to load for EMC evaluation", error);
    });
  }

  return projectionPromise;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function summarizeResults(ruleResults) {
  const counts = {
    pass: 0,
    fail: 0,
    notEvaluated: 0,
    notApplicable: 0
  };

  for (const rule of ruleResults) {
    switch (rule.status) {
      case "pass":
        counts.pass += 1;
        break;
      case "fail":
        counts.fail += 1;
        break;
      case "not_applicable":
        counts.notApplicable += 1;
        break;
      case "not_evaluated":
      default:
        counts.notEvaluated += 1;
        break;
    }
  }

  let overallStatus = "not_evaluated";
  if (counts.fail > 0) {
    overallStatus = "fail";
  } else if (counts.pass > 0 && counts.notEvaluated === 0) {
    overallStatus = "pass";
  } else if (counts.pass > 0 || counts.notEvaluated > 0) {
    overallStatus = "incomplete";
  }

  return {
    status: overallStatus,
    passCount: counts.pass,
    failCount: counts.fail,
    pendingCount: counts.notEvaluated,
    notApplicableCount: counts.notApplicable
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createPointFromCoords(coords, spatialReference) {
  if (!coords || coords.length < 2) {
    return null;
  }
  return new Point({
    x: coords[0],
    y: coords[1],
    spatialReference
  });
}

function extractPointFromGeometry(geometry) {
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

function vectorAtPoint(polyline, point) {
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

function angleBetweenVectors(vectorA, vectorB) {
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

function analyzeCrossings(routeRd, trackGeometries) {
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

async function fetchTrackGeometries(routeGeometry, layer) {
  if (!layer || typeof layer.createQuery !== "function") {
    return [];
  }

  try {
    const bufferDistance = config.spatialQuery?.bufferDistances?.tracks ?? 10000;
    const buffer = geometryEngine.geodesicBuffer(routeGeometry, bufferDistance, "meters");
    const query = layer.createQuery();
    query.geometry = buffer || routeGeometry.extent;
    query.spatialRelationship = "intersects";
    query.returnGeometry = true;
    query.outFields = ["OBJECTID"];
    query.outSpatialReference = RD_SPATIAL_REFERENCE;
    query.num = 2000;

    const result = await layer.queryFeatures(query);
    return (result?.features || []).map((feature) => feature.geometry).filter(Boolean);
  } catch (error) {
    console.warn("Failed to query railway track features", error);
    return [];
  }
}

function computeMinimumDistance(routeRd, geometries) {
  if (!geometries || geometries.length === 0) {
    return null;
  }

  let minDistance = Infinity;
  for (const geometry of geometries) {
    if (!geometry) {
      continue;
    }

    const distance = geometryEngine.distance(routeRd, geometry);
    if (typeof distance === "number" && distance < minDistance) {
      minDistance = distance;
    }
  }

  if (!Number.isFinite(minDistance)) {
    return null;
  }

  return minDistance;
}

async function computeTechnicalRoomDistance(routeGeometry, routeRd, layer) {
  if (!layer || typeof layer.createQuery !== "function") {
    return null;
  }

  try {
    const bufferDistance = config.spatialQuery?.bufferDistances?.technicalRooms ?? 10000;
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
    return computeMinimumDistance(routeRd, geometries);
  } catch (error) {
    console.warn("Failed to query technical rooms", error);
    return null;
  }
}

export async function evaluateRoute(route, options = {}) {
  if (!route || !route.geometry) {
    throw new Error("Route geometry is required for EMC evaluation");
  }

  const metadata = {
    ...DEFAULT_METADATA,
    ...(route.metadata || {}),
    ...(options.metadata || {})
  };

  metadata.voltageKv = toNumber(metadata.voltageKv) ?? DEFAULT_METADATA.voltageKv;
  metadata.faultClearingTimeMs = toNumber(metadata.faultClearingTimeMs);
  metadata.minJointDistanceMeters = toNumber(metadata.minJointDistanceMeters);
  metadata.minMastDistanceMeters = toNumber(metadata.minMastDistanceMeters);

  await ensureProjectionLoaded();

  const routeRd = projectOperator.execute(route.geometry, RD_SPATIAL_REFERENCE);
  if (!routeRd) {
    throw new Error("Unable to project route geometry to RD New (EPSG:28992)");
  }

  const trackGeometries = await fetchTrackGeometries(route.geometry, options.layers?.railwayTracksLayer);
  const crossing = analyzeCrossings(routeRd, trackGeometries);
  const minTrackDistance = computeMinimumDistance(routeRd, trackGeometries);
  const minTechnicalRoomDistance = await computeTechnicalRoomDistance(
    route.geometry,
    routeRd,
    options.layers?.technicalRoomsLayer
  );

  const routeType = (metadata.infrastructureType || "cable").toLowerCase();

  const evaluationContext = {
    route,
    metadata,
    routeType,
    geometry: route.geometry,
    routeRd,
    crossing,
    distances: {
      track: minTrackDistance,
      technicalRoom: minTechnicalRoomDistance
    },
    layers: options.layers || {}
  };

  // Filter rules based on infrastructure type
  const applicableRuleDefinitions = RULE_DEFINITIONS.filter(rule => 
    !rule.applicableFor || rule.applicableFor.includes(routeType)
  );

  console.log(`📋 Infrastructure type: ${routeType}`);
  console.log(`✅ Evaluating ${applicableRuleDefinitions.length} of ${RULE_DEFINITIONS.length} rules (filtered by infrastructure type)`);

  const rules = [];

  for (const rule of applicableRuleDefinitions) {
    let applies = true;

    try {
      applies = rule.applies ? rule.applies(evaluationContext) : true;
    } catch (error) {
      console.warn(`Failed to evaluate applicability for rule ${rule.id}`, error);
      applies = false;
    }

    if (!applies) {
      rules.push({
        id: rule.id,
        title: rule.title,
        clause: rule.clause,
        status: "not_applicable",
        message: rule.notApplicableMessage || "Not applicable"
      });
      continue;
    }

    try {
      const result = await rule.evaluate(evaluationContext);
      rules.push({
        id: rule.id,
        title: rule.title,
        clause: rule.clause,
        status: result.status,
        message: result.message,
        metrics: result.metrics || null
      });
    } catch (error) {
      console.warn(`Failed to evaluate rule ${rule.id}`, error);
      rules.push({
        id: rule.id,
        title: rule.title,
        clause: rule.clause,
        status: "not_evaluated",
        message: error?.message || "Evaluation error"
      });
    }
  }

  const summary = summarizeResults(rules);
  const evaluatedAt = new Date().toISOString();
  summary.evaluatedAt = evaluatedAt;
  summary.infrastructureType = routeType; // Add infrastructure type to summary

  return {
    evaluatedAt,
    summary,
    rules
  };
}
