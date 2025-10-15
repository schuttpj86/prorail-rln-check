/**
 * Route Export/Import Utility
 * 
 * Handles exporting and importing route data as JSON files.
 * Exports all route information including coordinates, metadata, and configurations.
 */

/**
 * Export a single route to JSON
 * @param {Object} route - Route data from EnhancedDrawingManager
 * @returns {Object} - Serializable route data
 */
export function exportRouteToJSON(route) {
  if (!route) {
    throw new Error('Route data is required');
  }

  // Extract geometry coordinates from the graphic
  const geometry = route.graphic?.geometry;
  if (!geometry) {
    throw new Error('Route geometry not found');
  }

  // Get all coordinates from the polyline
  const coordinates = [];
  if (geometry.paths && geometry.paths.length > 0) {
    // Paths is an array of arrays: [[lon, lat], [lon, lat], ...]
    for (const path of geometry.paths) {
      for (const point of path) {
        coordinates.push({
          longitude: point[0],
          latitude: point[1],
          x: point[0],
          y: point[1]
        });
      }
    }
  }

  // Extract all metadata and attributes
  const routeData = {
    // Basic information
    id: route.id,
    name: route.name,
    description: route.description || '',
    created: route.created,
    lastModified: new Date().toISOString(),
    
    // Geometry
    geometry: {
      type: 'LineString',
      coordinates: coordinates.map(c => [c.longitude, c.latitude]),
      spatialReference: {
        wkid: geometry.spatialReference?.wkid || 4326,
        latestWkid: geometry.spatialReference?.latestWkid || 4326
      }
    },
    
    // Detailed waypoints with full coordinate information
    waypoints: coordinates,
    
    // Route measurements
    measurements: {
      totalLength: route.length || 0,
      totalLengthKm: route.length ? (route.length / 1000).toFixed(3) : '0.000',
      pointCount: route.points || coordinates.length,
      segmentCount: coordinates.length > 0 ? coordinates.length - 1 : 0
    },
    
    // Visual style
    style: {
      color: route.color || '#ff0000',
      width: 3,
      visible: route.visible !== false
    },
    
    // EMC Parameters and Metadata
    metadata: {
      // Infrastructure type
      infrastructureType: route.metadata?.infrastructureType || 'cable',
      
      // Electrical parameters
      voltageKv: route.metadata?.voltageKv !== null && route.metadata?.voltageKv !== undefined 
        ? route.metadata.voltageKv 
        : null,
      faultClearingTimeMs: route.metadata?.faultClearingTimeMs !== null && route.metadata?.faultClearingTimeMs !== undefined
        ? route.metadata.faultClearingTimeMs 
        : null,
      electrifiedSystem: route.metadata?.electrifiedSystem || 'standard',
      
      // Joint and crossing specifications
      minJointDistanceMeters: route.metadata?.minJointDistanceMeters !== null && route.metadata?.minJointDistanceMeters !== undefined
        ? route.metadata.minJointDistanceMeters
        : null,
      hasDoubleGuying: route.metadata?.hasDoubleGuying || null,
      hasBoredCrossing: route.metadata?.hasBoredCrossing || null,
      hasIsolatedNeutral: route.metadata?.hasIsolatedNeutral || null,
      
      // Additional notes
      notes: route.metadata?.notes || ''
    },
    
    // Graphic attributes (from ArcGIS graphic)
    attributes: route.graphic?.attributes || {},
    
    // Export metadata
    exportInfo: {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      application: 'ProRail Cable Route Evaluator',
      schema: 'prorail-route-v1'
    }
  };

  return routeData;
}

/**
 * Export all routes to a single JSON file
 * @param {Map} routes - Map of all routes from EnhancedDrawingManager
 * @returns {Object} - Complete export data
 */
export function exportAllRoutesToJSON(routes) {
  if (!routes || routes.size === 0) {
    throw new Error('No routes available to export');
  }

  const exportData = {
    exportInfo: {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      application: 'ProRail Cable Route Evaluator',
      schema: 'prorail-routes-collection-v1',
      routeCount: routes.size
    },
    routes: []
  };

  // Export each route
  routes.forEach((route, routeId) => {
    try {
      const routeData = exportRouteToJSON(route);
      exportData.routes.push(routeData);
    } catch (error) {
      console.error(`Failed to export route ${routeId}:`, error);
    }
  });

  return exportData;
}

/**
 * Download route data as a JSON file
 * @param {Object} routeData - Serialized route data
 * @param {string} filename - Desired filename (without extension)
 */
export function downloadRouteAsJSON(routeData, filename) {
  const jsonString = JSON.stringify(routeData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export a specific route and trigger download
 * @param {Object} route - Route data from EnhancedDrawingManager
 * @param {string} routeName - Optional custom name for the file
 */
export function exportAndDownloadRoute(route, routeName = null) {
  try {
    const routeData = exportRouteToJSON(route);
    const filename = routeName || route.name || `route-${route.id}`;
    const sanitizedFilename = filename.replace(/[^a-z0-9-_]/gi, '_');
    
    downloadRouteAsJSON(routeData, sanitizedFilename);
    
    console.log('✅ Route exported successfully:', sanitizedFilename);
    return true;
  } catch (error) {
    console.error('❌ Failed to export route:', error);
    alert(`Failed to export route: ${error.message}`);
    return false;
  }
}

/**
 * Export all routes and trigger download
 * @param {Map} routes - Map of all routes from EnhancedDrawingManager
 * @param {string} filename - Optional custom name for the file
 */
export function exportAndDownloadAllRoutes(routes, filename = null) {
  try {
    const exportData = exportAllRoutesToJSON(routes);
    const defaultFilename = `prorail-routes-${new Date().toISOString().split('T')[0]}`;
    const finalFilename = filename || defaultFilename;
    const sanitizedFilename = finalFilename.replace(/[^a-z0-9-_]/gi, '_');
    
    downloadRouteAsJSON(exportData, sanitizedFilename);
    
    console.log('✅ All routes exported successfully:', sanitizedFilename);
    console.log(`   - Total routes: ${exportData.routes.length}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to export routes:', error);
    alert(`Failed to export routes: ${error.message}`);
    return false;
  }
}

/**
 * Validate imported route data
 * @param {Object} data - Parsed JSON data
 * @returns {boolean} - True if valid
 */
export function validateRouteData(data) {
  if (!data) return false;
  
  // Check for single route format
  if (data.exportInfo?.schema === 'prorail-route-v1') {
    return (
      data.id &&
      data.name &&
      data.geometry &&
      data.geometry.coordinates &&
      Array.isArray(data.geometry.coordinates) &&
      data.waypoints &&
      Array.isArray(data.waypoints)
    );
  }
  
  // Check for multiple routes format
  if (data.exportInfo?.schema === 'prorail-routes-collection-v1') {
    return (
      data.routes &&
      Array.isArray(data.routes) &&
      data.routes.length > 0
    );
  }
  
  return false;
}

/**
 * Copy route data to clipboard
 * @param {Object} routeData - Serialized route data
 */
export async function copyRouteToClipboard(routeData) {
  try {
    const jsonString = JSON.stringify(routeData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    console.log('✅ Route data copied to clipboard');
    return true;
  } catch (error) {
    console.error('❌ Failed to copy to clipboard:', error);
    alert(`Failed to copy to clipboard: ${error.message}`);
    return false;
  }
}

/**
 * Generate a human-readable summary of the route
 * @param {Object} route - Route data
 * @returns {string} - Summary text
 */
export function generateRouteSummary(route) {
  const summary = [];
  
  summary.push(`Route: ${route.name}`);
  summary.push(`ID: ${route.id}`);
  summary.push(`Created: ${new Date(route.created).toLocaleString()}`);
  summary.push(`Length: ${route.measurements.totalLengthKm} km`);
  summary.push(`Waypoints: ${route.measurements.pointCount}`);
  
  if (route.description) {
    summary.push(`Description: ${route.description}`);
  }
  
  summary.push('');
  summary.push('EMC Parameters:');
  summary.push(`- Type: ${route.metadata.infrastructureType === 'cable' ? 'High-voltage cable' : 'Overhead line'}`);
  
  if (route.metadata.voltageKv !== null) {
    summary.push(`- Voltage: ${route.metadata.voltageKv} kV`);
  }
  
  if (route.metadata.faultClearingTimeMs !== null) {
    summary.push(`- Fault clearing time: ${route.metadata.faultClearingTimeMs} ms`);
  }
  
  summary.push(`- Electrified system: ${route.metadata.electrifiedSystem}`);
  
  if (route.metadata.minJointDistanceMeters !== null) {
    summary.push(`- Min. joint distance: ${route.metadata.minJointDistanceMeters} m`);
  }
  
  if (route.metadata.hasDoubleGuying) {
    summary.push('- Double guying: Confirmed');
  }
  
  if (route.metadata.hasBoredCrossing) {
    summary.push('- Bored crossing: Yes');
  }
  
  if (route.metadata.hasIsolatedNeutral) {
    summary.push('- Isolated neutral: Yes');
  }
  
  return summary.join('\n');
}
