/**
 * Add Distance Markers to Routes
 * 
 * Creates distance markers along a route at regular intervals
 */

import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

/**
 * Add distance markers along a route
 * 
 * @param {Polyline} polyline - Route geometry
 * @param {GraphicsLayer} layer - Layer to add markers to
 * @param {number} intervalMeters - Distance between markers (default: 500m)
 * @param {Object} options - Display options
 * @returns {Array} Array of marker graphics
 */
export function addRouteDistanceMarkers(polyline, layer, intervalMeters = 500, options = {}) {
  const markers = [];
  
  const {
    color = [0, 0, 0, 0.9],
    backgroundColor = [255, 255, 255, 0.9],
    fontSize = 10,
    showKm = true
  } = options;
  
  try {
    // Get total length
    const totalLength = geometryEngine.geodesicLength(polyline, 'meters');
    
    if (totalLength < intervalMeters) {
      // Route too short for markers
      return markers;
    }
    
    // Calculate number of markers
    const numMarkers = Math.floor(totalLength / intervalMeters);
    
    // Place markers at intervals
    for (let i = 1; i <= numMarkers; i++) {
      const distanceMeters = i * intervalMeters;
      const distanceKm = distanceMeters / 1000;
      
      // Get point at this distance along the route
      const point = geometryEngine.pointAtDistance(polyline, distanceMeters, 'meters');
      
      if (!point) continue;
      
      // Create distance label
      const label = showKm ? `${distanceKm.toFixed(1)} km` : `${distanceMeters}m`;
      
      // Create text symbol with background
      const markerGraphic = new Graphic({
        geometry: point,
        symbol: {
          type: "text",
          text: label,
          color: color,
          haloColor: backgroundColor,
          haloSize: 2,
          xoffset: 0,
          yoffset: -10, // Offset above the line
          font: {
            size: fontSize,
            family: "Arial",
            weight: "bold"
          }
        }
      });
      
      markers.push(markerGraphic);
      layer.add(markerGraphic);
    }
    
    console.log(`📏 Added ${markers.length} distance markers to route (${intervalMeters}m intervals)`);
    
  } catch (error) {
    console.error('❌ Failed to add distance markers:', error);
  }
  
  return markers;
}

/**
 * Remove distance markers from layer
 * 
 * @param {GraphicsLayer} layer - Layer containing markers
 * @param {Array} markers - Array of marker graphics to remove
 */
export function removeDistanceMarkers(layer, markers) {
  if (!markers || markers.length === 0) return;
  
  markers.forEach(marker => {
    layer.remove(marker);
  });
  
  console.log(`🗑️ Removed ${markers.length} distance markers`);
}

/**
 * Update distance markers for a route
 * Removes old markers and creates new ones
 * 
 * @param {Polyline} polyline - Route geometry
 * @param {GraphicsLayer} layer - Layer for markers
 * @param {Array} oldMarkers - Existing markers to remove
 * @param {number} intervalMeters - Distance between markers
 * @param {Object} options - Display options
 * @returns {Array} New array of marker graphics
 */
export function updateDistanceMarkers(polyline, layer, oldMarkers, intervalMeters = 500, options = {}) {
  // Remove old markers
  if (oldMarkers && oldMarkers.length > 0) {
    removeDistanceMarkers(layer, oldMarkers);
  }
  
  // Add new markers
  return addRouteDistanceMarkers(polyline, layer, intervalMeters, options);
}
