/**
 * Buffer Visualization Utility
 * 
 * Creates and displays buffer zones for EMC compliance analysis:
 * - 20m buffers around technical rooms (RLN00398 §4.8/§5.6)
 * - 31m buffers along track centerlines (RLN00398 §5.8)
 * - Visual feedback for compliance checking
 */

import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";

/**
 * Create a buffer zone around a geometry
 * 
 * @param {Geometry} geometry - The geometry to buffer (Point, Polyline, Polygon)
 * @param {number} distance - Buffer distance in meters
 * @param {Object} spatialReference - Spatial reference for the geometry
 * @returns {Polygon} Buffer polygon
 */
export function createBuffer(geometry, distance, spatialReference = { wkid: 28992 }) {
  try {
    // Ensure geometry has correct spatial reference
    if (!geometry.spatialReference) {
      geometry.spatialReference = spatialReference;
    }

    // Create buffer using geometryEngine
    const buffer = geometryEngine.buffer(geometry, distance, "meters");
    
    console.log(`✅ Created ${distance}m buffer:`, {
      inputType: geometry.type,
      bufferArea: buffer ? geometryEngine.planarArea(buffer, "square-meters").toFixed(2) + " m²" : "N/A"
    });

    return buffer;
  } catch (error) {
    console.error(`❌ Buffer creation failed:`, error);
    return null;
  }
}

/**
 * Create a buffer graphic for display on the map
 * 
 * @param {Polygon} bufferGeometry - The buffer polygon
 * @param {Object} options - Styling options
 * @param {string} options.type - Buffer type: 'safe', 'warning', 'violation'
 * @param {string} options.label - Label for the buffer
 * @param {Object} options.attributes - Additional attributes
 * @returns {Graphic} Buffer graphic
 */
export function createBufferGraphic(bufferGeometry, options = {}) {
  const {
    type = 'safe',
    label = 'Buffer Zone',
    attributes = {}
  } = options;

  // Color schemes based on buffer type
  const colorSchemes = {
    safe: {
      fill: [76, 175, 80, 0.15],    // Green with 15% opacity
      outline: [76, 175, 80, 0.8],   // Green outline
      outlineWidth: 2
    },
    warning: {
      fill: [255, 193, 7, 0.2],      // Amber with 20% opacity
      outline: [255, 152, 0, 0.9],   // Orange outline
      outlineWidth: 2
    },
    violation: {
      fill: [244, 67, 54, 0.25],     // Red with 25% opacity
      outline: [211, 47, 47, 1],     // Dark red outline
      outlineWidth: 3
    }
  };

  const colors = colorSchemes[type] || colorSchemes.safe;

  // Create symbol
  const symbol = new SimpleFillSymbol({
    color: colors.fill,
    outline: new SimpleLineSymbol({
      color: colors.outline,
      width: colors.outlineWidth,
      style: "solid"
    }),
    style: "solid"
  });

  // Create graphic
  const graphic = new Graphic({
    geometry: bufferGeometry,
    symbol: symbol,
    attributes: {
      type: 'buffer',
      bufferType: type,
      label: label,
      ...attributes
    }
  });

  console.log(`🎨 Created buffer graphic: ${label} (${type})`);

  return graphic;
}

/**
 * Create 20m buffer zones around technical rooms
 * 
 * @param {Array<Graphic>} technicalRoomFeatures - Array of technical room graphics/features
 * @param {Object} options - Options for buffer creation
 * @returns {Array<Graphic>} Array of buffer graphics
 */
export function createTechnicalRoomBuffers(technicalRoomFeatures, options = {}) {
  const {
    distance = 20,
    type = 'warning',
    visible = true
  } = options;

  console.log(`🏢 Creating ${distance}m buffers for ${technicalRoomFeatures.length} technical rooms...`);

  const bufferGraphics = [];

  technicalRoomFeatures.forEach((feature, index) => {
    const geometry = feature.geometry;
    if (!geometry) {
      console.warn(`⚠️ Technical room ${index} has no geometry`);
      return;
    }

    // Create buffer
    const buffer = createBuffer(geometry, distance);
    if (!buffer) return;

    // Create graphic
    const graphic = createBufferGraphic(buffer, {
      type: type,
      label: `Technical Room ${distance}m Buffer`,
      attributes: {
        technicalRoomId: feature.attributes?.OBJECTID || index,
        bufferDistance: distance,
        rule: 'RLN00398 §4.8/§5.6',
        description: `No HV infrastructure within ${distance}m`
      }
    });

    bufferGraphics.push(graphic);
  });

  console.log(`✅ Created ${bufferGraphics.length} technical room buffer graphics`);

  return bufferGraphics;
}

/**
 * Create 31m buffer zones along track centerlines
 * 
 * @param {Array<Graphic>} trackFeatures - Array of track centerline graphics/features
 * @param {Object} options - Options for buffer creation
 * @returns {Array<Graphic>} Array of buffer graphics
 */
export function createTrackBuffers(trackFeatures, options = {}) {
  const {
    distance = 31,
    type = 'warning',
    visible = true
  } = options;

  console.log(`🛤️ Creating ${distance}m buffers for ${trackFeatures.length} track segments...`);

  const bufferGraphics = [];

  trackFeatures.forEach((feature, index) => {
    const geometry = feature.geometry;
    if (!geometry) {
      console.warn(`⚠️ Track segment ${index} has no geometry`);
      return;
    }

    // Create buffer
    const buffer = createBuffer(geometry, distance);
    if (!buffer) return;

    // Create graphic
    const graphic = createBufferGraphic(buffer, {
      type: type,
      label: `Track ${distance}m Buffer`,
      attributes: {
        trackId: feature.attributes?.OBJECTID || index,
        bufferDistance: distance,
        rule: 'RLN00398 §5.8',
        description: `No joints/earthing within ${distance}m`
      }
    });

    bufferGraphics.push(graphic);
  });

  console.log(`✅ Created ${bufferGraphics.length} track buffer graphics`);

  return bufferGraphics;
}

/**
 * Calculate minimum distance from a geometry to a set of features
 * 
 * @param {Geometry} sourceGeometry - The source geometry (e.g., cable route)
 * @param {Array<Graphic>} targetFeatures - Array of target features to measure distance to
 * @returns {Object} Result containing minimum distance and nearest feature
 */
export function calculateMinimumDistance(sourceGeometry, targetFeatures) {
  if (!sourceGeometry || !targetFeatures || targetFeatures.length === 0) {
    return { distance: null, nearestFeature: null };
  }

  console.log(`📏 Calculating minimum distance to ${targetFeatures.length} features...`);

  let minDistance = Infinity;
  let nearestFeature = null;

  targetFeatures.forEach(feature => {
    const targetGeometry = feature.geometry;
    if (!targetGeometry) return;

    try {
      // Calculate distance using geometryEngine
      const distance = geometryEngine.distance(sourceGeometry, targetGeometry, "meters");
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestFeature = feature;
      }
    } catch (error) {
      console.warn(`⚠️ Distance calculation failed for feature:`, error);
    }
  });

  const result = {
    distance: minDistance === Infinity ? null : minDistance,
    nearestFeature: nearestFeature
  };

  if (result.distance !== null) {
    console.log(`✅ Minimum distance: ${result.distance.toFixed(2)}m`);
  } else {
    console.log(`⚠️ No valid distance calculated`);
  }

  return result;
}

/**
 * Check if a geometry intersects any buffer zones
 * 
 * @param {Geometry} geometry - The geometry to check (e.g., cable route)
 * @param {Array<Graphic>} bufferGraphics - Array of buffer graphics
 * @returns {Object} Result with intersection status and violated buffers
 */
export function checkBufferIntersections(geometry, bufferGraphics) {
  if (!geometry || !bufferGraphics || bufferGraphics.length === 0) {
    return { intersects: false, violations: [] };
  }

  console.log(`🔍 Checking intersections with ${bufferGraphics.length} buffer zones...`);

  const violations = [];

  bufferGraphics.forEach(bufferGraphic => {
    const bufferGeometry = bufferGraphic.geometry;
    if (!bufferGeometry) return;

    try {
      // Check if geometries intersect
      const intersects = geometryEngine.intersects(geometry, bufferGeometry);
      
      if (intersects) {
        violations.push({
          bufferGraphic: bufferGraphic,
          type: bufferGraphic.attributes?.bufferType || 'unknown',
          rule: bufferGraphic.attributes?.rule || 'N/A',
          description: bufferGraphic.attributes?.description || 'Buffer zone violation'
        });
      }
    } catch (error) {
      console.warn(`⚠️ Intersection check failed:`, error);
    }
  });

  const result = {
    intersects: violations.length > 0,
    violations: violations,
    violationCount: violations.length
  };

  if (result.intersects) {
    console.log(`❌ Found ${violations.length} buffer violations`);
  } else {
    console.log(`✅ No buffer violations detected`);
  }

  return result;
}

/**
 * Create a buffer graphics layer for the map
 * 
 * @param {string} id - Layer ID
 * @param {string} title - Layer title
 * @param {boolean} visible - Initial visibility
 * @returns {GraphicsLayer} Graphics layer for buffers
 */
export function createBufferLayer(id, title, visible = true) {
  // Note: GraphicsLayer import should be done in the calling code
  // This is just a helper function that returns layer configuration
  return {
    id: id,
    title: title,
    visible: visible,
    listMode: "show",
    graphics: []
  };
}

/**
 * Toggle buffer layer visibility
 * 
 * @param {GraphicsLayer} bufferLayer - The buffer layer
 * @param {boolean} visible - Visibility state
 */
export function toggleBufferVisibility(bufferLayer, visible) {
  if (!bufferLayer) {
    console.warn(`⚠️ Buffer layer not found`);
    return;
  }

  bufferLayer.visible = visible;
  console.log(`👁️ Buffer layer visibility: ${visible ? 'ON' : 'OFF'}`);
}

/**
 * Clear all buffers from a layer
 * 
 * @param {GraphicsLayer} bufferLayer - The buffer layer to clear
 */
export function clearBuffers(bufferLayer) {
  if (!bufferLayer) {
    console.warn(`⚠️ Buffer layer not found`);
    return;
  }

  const count = bufferLayer.graphics.length;
  bufferLayer.removeAll();
  console.log(`🗑️ Cleared ${count} buffer graphics`);
}

/**
 * Add buffers to a graphics layer
 * 
 * @param {GraphicsLayer} bufferLayer - The buffer layer
 * @param {Array<Graphic>} bufferGraphics - Array of buffer graphics to add
 */
export function addBuffersToLayer(bufferLayer, bufferGraphics) {
  if (!bufferLayer) {
    console.warn(`⚠️ Buffer layer not found`);
    return;
  }

  bufferLayer.addMany(bufferGraphics);
  console.log(`✅ Added ${bufferGraphics.length} buffers to layer "${bufferLayer.title}"`);
}
