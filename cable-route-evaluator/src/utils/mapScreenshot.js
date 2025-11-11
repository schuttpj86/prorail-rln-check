/**
 * Map Screenshot Utility
 * 
 * Captures map view as PNG image for inclusion in reports.
 * Handles route isolation and view restoration.
 */

/**
 * Capture the map view showing only a specific route
 * @param {MapView} mapView - ArcGIS MapView instance
 * @param {Object} route - Route object with graphic
 * @param {GraphicsLayer} routesLayer - The graphics layer containing routes
 * @param {GraphicsLayer} annotationsLayer - The graphics layer containing distance annotations
 * @returns {Promise<Blob>} PNG image blob
 */
export async function captureRouteMap(mapView, route, routesLayer, annotationsLayer) {
  console.log('📸 Capturing map screenshot for route:', route.id);
  
  // Store original state
  const originalExtent = mapView.extent.clone();
  const originalGraphics = routesLayer.graphics.toArray();
  const originalAnnotations = annotationsLayer ? annotationsLayer.graphics.toArray() : [];
  const routeGraphic = route.graphic;
  
  if (!routeGraphic || !routeGraphic.geometry) {
    throw new Error('Route graphic or geometry not found');
  }
  
  try {
    // 1. Hide all other routes (keep only the target route)
    console.log('   🔒 Hiding other routes...');
    routesLayer.removeAll();
    routesLayer.add(routeGraphic);
    
    // 2. Hide annotations for other routes (keep only annotations for target route)
    if (annotationsLayer) {
      console.log('   🔒 Hiding other route annotations...');
      annotationsLayer.removeAll();
      const targetRouteAnnotations = originalAnnotations.filter(
        g => g.attributes?.routeId === route.id
      );
      if (targetRouteAnnotations.length > 0) {
        annotationsLayer.addMany(targetRouteAnnotations);
        console.log(`   ✅ Kept ${targetRouteAnnotations.length} annotations for route ${route.id}`);
      }
    }
    
    // 3. Zoom to route extent with padding
    console.log('   🔍 Zooming to route extent...');
    const routeExtent = routeGraphic.geometry.extent;
    await mapView.goTo({
      target: routeExtent,
      scale: mapView.scale * 1.2 // Add 20% padding
    }, {
      duration: 500,
      easing: 'ease-in-out'
    });
    
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Take screenshot
    console.log('   📸 Taking screenshot...');
    const screenshot = await mapView.takeScreenshot({
      format: 'png',
      quality: 95,
      width: 1920,
      height: 1080
    });
    
    // Convert data URL to Blob
    const blob = await dataURLToBlob(screenshot.dataUrl);
    
    console.log('   ✅ Screenshot captured:', {
      size: `${(blob.size / 1024).toFixed(2)} KB`,
      type: blob.type
    });
    
    return blob;
    
  } finally {
    // 5. Restore original state
    console.log('   🔄 Restoring original view...');
    routesLayer.removeAll();
    routesLayer.addMany(originalGraphics);
    
    if (annotationsLayer) {
      annotationsLayer.removeAll();
      annotationsLayer.addMany(originalAnnotations);
    }
    
    await mapView.goTo(originalExtent, {
      duration: 500,
      easing: 'ease-in-out'
    });
    
    console.log('   ✅ View restored');
  }
}

/**
 * Convert data URL to Blob
 * @param {string} dataUrl - Data URL from screenshot
 * @returns {Promise<Blob>}
 */
function dataURLToBlob(dataUrl) {
  return fetch(dataUrl).then(res => res.blob());
}

/**
 * Download blob as file
 * @param {Blob} blob - File blob
 * @param {string} filename - Desired filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`✅ Downloaded: ${filename}`);
}

/**
 * Capture and download route map screenshot
 * @param {MapView} mapView - ArcGIS MapView instance
 * @param {Object} route - Route object
 * @param {GraphicsLayer} routesLayer - Routes graphics layer
 * @param {GraphicsLayer} annotationsLayer - Distance annotations graphics layer
 * @param {string} baseFilename - Base filename (without extension)
 * @returns {Promise<string>} Downloaded filename
 */
export async function captureAndDownloadRouteMap(mapView, route, routesLayer, annotationsLayer, baseFilename) {
  try {
    const blob = await captureRouteMap(mapView, route, routesLayer, annotationsLayer);
    const filename = `${baseFilename}.png`;
    downloadBlob(blob, filename);
    return filename;
  } catch (error) {
    console.error('Failed to capture route map:', error);
    throw error;
  }
}
