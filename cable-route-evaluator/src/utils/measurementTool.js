/**
 * Measurement Tool
 * 
 * Interactive measurement widget for checking distances on the map.
 * Displays temporary measurement lines and labels.
 * Not saved - just for quick distance verification.
 */

import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";

/**
 * Measurement tool state
 */
const measurementState = {
  isActive: false,
  points: [],
  clickHandler: null,
  moveHandler: null,
  graphicsLayer: null,
  view: null,
  currentSegmentGraphics: [] // Temporary graphics for current segment
};

/**
 * Format distance for display
 */
function formatDistance(meters) {
  if (meters < 1) {
    return `${(meters * 100).toFixed(1)} cm`;
  } else if (meters < 1000) {
    return `${meters.toFixed(2)} m`;
  } else {
    return `${(meters / 1000).toFixed(3)} km`;
  }
}

/**
 * Create a point marker graphic
 */
function createPointMarker(point, index) {
  return new Graphic({
    geometry: point,
    symbol: {
      type: "simple-marker",
      style: "circle",
      color: [138, 43, 226, 1], // Purple color - distinct from route annotations
      size: 10,
      outline: {
        color: [255, 255, 255, 1],
        width: 2.5
      }
    },
    attributes: {
      type: "measurement-point",
      index: index
    }
  });
}

/**
 * Create a measurement line graphic
 */
function createMeasurementLine(point1, point2, isTemporary = false) {
  const line = new Polyline({
    paths: [[
      [point1.x, point1.y],
      [point2.x, point2.y]
    ]],
    spatialReference: point1.spatialReference
  });

  return new Graphic({
    geometry: line,
    symbol: {
      type: "simple-line",
      color: isTemporary ? [138, 43, 226, 0.5] : [138, 43, 226, 0.9], // Purple - distinct from gray route annotations
      width: isTemporary ? 2.5 : 3.5,
      style: isTemporary ? "short-dash" : "solid"
    },
    attributes: {
      type: "measurement-line",
      temporary: isTemporary
    }
  });
}

/**
 * Create distance label graphic
 */
function createDistanceLabel(point1, point2, distance, isTemporary = false) {
  // Calculate midpoint for label placement
  const midpoint = new Point({
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
    spatialReference: point1.spatialReference
  });

  return new Graphic({
    geometry: midpoint,
    symbol: {
      type: "text",
      color: isTemporary ? [138, 43, 226, 0.8] : [106, 27, 178, 1], // Purple/Deep purple for visibility
      text: formatDistance(distance),
      font: {
        size: 12,
        family: "Arial",
        weight: "bold"
      },
      haloColor: [255, 255, 255, 0.95],
      haloSize: 3,
      yoffset: -10
    },
    attributes: {
      type: "measurement-label",
      distance: distance,
      temporary: isTemporary
    }
  });
}

/**
 * Create total distance label at the last point
 */
function createTotalLabel(point, totalDistance) {
  return new Graphic({
    geometry: point,
    symbol: {
      type: "text",
      color: [106, 27, 178, 1], // Deep purple - highly visible
      text: `📏 Total: ${formatDistance(totalDistance)}`,
      font: {
        size: 14,
        family: "Arial",
        weight: "bold"
      },
      haloColor: [255, 255, 255, 0.98],
      haloSize: 3.5,
      yoffset: 18,
      xoffset: 0
    },
    attributes: {
      type: "measurement-total",
      totalDistance: totalDistance
    }
  });
}

/**
 * Calculate total distance of all segments
 * Uses geodesic distance for accuracy (same as route calculations)
 */
function calculateTotalDistance(points) {
  if (points.length < 2) return 0;
  
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    // Use geodesicLength for consistency with route calculations
    const line = new Polyline({
      paths: [[
        [points[i].x, points[i].y],
        [points[i + 1].x, points[i + 1].y]
      ]],
      spatialReference: points[i].spatialReference
    });
    
    const distance = geometryEngine.geodesicLength(line, "meters");
    total += Math.abs(distance);
  }
  
  return total;
}

/**
 * Update measurement graphics
 */
function updateMeasurementGraphics() {
  if (!measurementState.graphicsLayer) return;
  
  const { points, graphicsLayer } = measurementState;
  
  // Clear all measurement graphics
  const measurementGraphics = graphicsLayer.graphics.filter(g => 
    g.attributes?.type?.startsWith("measurement-")
  );
  graphicsLayer.removeMany(measurementGraphics.toArray());
  
  if (points.length === 0) return;
  
  // Add point markers
  points.forEach((point, index) => {
    graphicsLayer.add(createPointMarker(point, index));
  });
  
  // Add measurement lines and labels for each segment
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    // Use geodesic distance for consistency with route calculations
    const line = new Polyline({
      paths: [[
        [p1.x, p1.y],
        [p2.x, p2.y]
      ]],
      spatialReference: p1.spatialReference
    });
    
    const distance = Math.abs(geometryEngine.geodesicLength(line, "meters"));
    
    graphicsLayer.add(createMeasurementLine(p1, p2, false));
    graphicsLayer.add(createDistanceLabel(p1, p2, distance, false));
  }
  
  // Add total distance label at the last point
  if (points.length > 1) {
    const totalDistance = calculateTotalDistance(points);
    graphicsLayer.add(createTotalLabel(points[points.length - 1], totalDistance));
  }
}

/**
 * Update temporary segment preview
 */
function updateTemporarySegment(currentPoint) {
  if (!measurementState.graphicsLayer || measurementState.points.length === 0) return;
  
  const { points, graphicsLayer, currentSegmentGraphics } = measurementState;
  
  // Remove previous temporary graphics
  if (currentSegmentGraphics.length > 0) {
    graphicsLayer.removeMany(currentSegmentGraphics);
    measurementState.currentSegmentGraphics = [];
  }
  
  // Add temporary segment from last point to current mouse position
  const lastPoint = points[points.length - 1];
  
  // Use geodesic distance for consistency
  const line = new Polyline({
    paths: [[
      [lastPoint.x, lastPoint.y],
      [currentPoint.x, currentPoint.y]
    ]],
    spatialReference: lastPoint.spatialReference
  });
  
  const distance = Math.abs(geometryEngine.geodesicLength(line, "meters"));
  
  const tempLine = createMeasurementLine(lastPoint, currentPoint, true);
  const tempLabel = createDistanceLabel(lastPoint, currentPoint, distance, true);
  
  graphicsLayer.addMany([tempLine, tempLabel]);
  measurementState.currentSegmentGraphics = [tempLine, tempLabel];
}

/**
 * Clear temporary segment preview
 */
function clearTemporarySegment() {
  if (!measurementState.graphicsLayer) return;
  
  const { graphicsLayer, currentSegmentGraphics } = measurementState;
  
  if (currentSegmentGraphics.length > 0) {
    graphicsLayer.removeMany(currentSegmentGraphics);
    measurementState.currentSegmentGraphics = [];
  }
}

/**
 * Activate measurement tool
 */
export function activateMeasurementTool(view, graphicsLayer) {
  if (measurementState.isActive) {
    console.log('⚠️ Measurement tool already active');
    return;
  }
  
  console.log('📏 Activating measurement tool...');
  
  measurementState.isActive = true;
  measurementState.graphicsLayer = graphicsLayer;
  measurementState.view = view;
  measurementState.points = [];
  
  // Update cursor
  view.container.style.cursor = "crosshair";
  
  // Add click handler for adding points
  measurementState.clickHandler = view.on("click", (event) => {
    event.stopPropagation();
    
    const mapPoint = event.mapPoint;
    measurementState.points.push(mapPoint);
    
    console.log(`   📍 Point ${measurementState.points.length} added at (${mapPoint.x.toFixed(2)}, ${mapPoint.y.toFixed(2)})`);
    
    // Update graphics
    updateMeasurementGraphics();
    
    // Log current total distance
    if (measurementState.points.length > 1) {
      const totalDistance = calculateTotalDistance(measurementState.points);
      console.log(`   📏 Total distance: ${formatDistance(totalDistance)}`);
    }
  });
  
  // Add pointer move handler for preview
  measurementState.moveHandler = view.on("pointer-move", (event) => {
    if (measurementState.points.length === 0) return;
    
    const mapPoint = view.toMap({ x: event.x, y: event.y });
    if (mapPoint) {
      updateTemporarySegment(mapPoint);
    }
  });
  
  console.log('✅ Measurement tool active - Click to add points');
  console.log('   💡 Double-click or press ESC to finish');
  
  // Add double-click handler to finish
  const dblClickHandler = view.on("double-click", (event) => {
    event.stopPropagation();
    
    // Remove the last point (added by the click before double-click)
    if (measurementState.points.length > 0) {
      measurementState.points.pop();
    }
    
    deactivateMeasurementTool();
  });
  
  // Store handler to remove later
  measurementState.dblClickHandler = dblClickHandler;
  
  return {
    finish: deactivateMeasurementTool,
    clear: clearMeasurement
  };
}

/**
 * Deactivate measurement tool
 */
export function deactivateMeasurementTool() {
  if (!measurementState.isActive) {
    return;
  }
  
  console.log('📏 Deactivating measurement tool...');
  
  // Remove event handlers
  if (measurementState.clickHandler) {
    measurementState.clickHandler.remove();
    measurementState.clickHandler = null;
  }
  
  if (measurementState.moveHandler) {
    measurementState.moveHandler.remove();
    measurementState.moveHandler = null;
  }
  
  if (measurementState.dblClickHandler) {
    measurementState.dblClickHandler.remove();
    measurementState.dblClickHandler = null;
  }
  
  // Clear temporary segment
  clearTemporarySegment();
  
  // Reset cursor
  if (measurementState.view) {
    measurementState.view.container.style.cursor = "default";
  }
  
  // Log final measurement
  if (measurementState.points.length > 1) {
    const totalDistance = calculateTotalDistance(measurementState.points);
    console.log(`✅ Final measurement: ${formatDistance(totalDistance)} (${measurementState.points.length} points)`);
  }
  
  measurementState.isActive = false;
  measurementState.view = null;
  
  console.log('✅ Measurement tool deactivated');
}

/**
 * Clear all measurement graphics
 */
export function clearMeasurement() {
  console.log('🧹 Clearing measurements...');
  
  if (measurementState.graphicsLayer) {
    const measurementGraphics = measurementState.graphicsLayer.graphics.filter(g => 
      g.attributes?.type?.startsWith("measurement-")
    );
    measurementState.graphicsLayer.removeMany(measurementGraphics.toArray());
  }
  
  // Clear temporary segment
  clearTemporarySegment();
  
  measurementState.points = [];
  
  console.log('✅ Measurements cleared');
}

/**
 * Check if measurement tool is active
 */
export function isMeasurementActive() {
  return measurementState.isActive;
}

/**
 * Get current measurement points
 */
export function getMeasurementPoints() {
  return [...measurementState.points];
}

/**
 * Get current total distance
 */
export function getCurrentDistance() {
  return calculateTotalDistance(measurementState.points);
}
