/**
 * Route Import Utility
 * 
 * Handles importing route data from JSON files.
 * Supports both minimal (CAD-converted) and full (previously exported) formats.
 */

import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

/**
 * Validate imported route data structure
 * @param {Object} data - Parsed JSON data
 * @returns {Object} - { valid: boolean, type: string, errors: array }
 */
export function validateImportData(data) {
  const errors = [];
  
  if (!data) {
    return { valid: false, type: 'unknown', errors: ['No data provided'] };
  }

  // Detect import type
  let importType = 'unknown';
  
  // Check for full export format (from our app)
  if (data.exportInfo?.schema === 'prorail-route-v1') {
    importType = 'full';
    
    // Validate full format
    if (!data.id) errors.push('Missing route ID');
    if (!data.name) errors.push('Missing route name');
    if (!data.geometry?.coordinates || !Array.isArray(data.geometry.coordinates)) {
      errors.push('Missing or invalid geometry coordinates');
    }
    if (!data.waypoints || !Array.isArray(data.waypoints)) {
      errors.push('Missing or invalid waypoints');
    }
    
  } 
  // Check for minimal format (CAD conversion)
  else if (data.coordinates || data.waypoints || data.points) {
    importType = 'minimal';
    
    // Get coordinate array from various possible fields
    const coords = data.coordinates || data.waypoints || data.points;
    
    if (!Array.isArray(coords)) {
      errors.push('Coordinates must be an array');
    } else if (coords.length < 2) {
      errors.push('Route must have at least 2 points');
    } else {
      // Validate coordinate format
      const firstPoint = coords[0];
      if (Array.isArray(firstPoint)) {
        // Format: [[x, y], [x, y], ...]
        if (firstPoint.length < 2) {
          errors.push('Each coordinate must have at least 2 values [x, y]');
        }
      } else if (typeof firstPoint === 'object') {
        // Format: [{x: ..., y: ...}, ...] or [{longitude: ..., latitude: ...}, ...]
        if (!('x' in firstPoint || 'longitude' in firstPoint || 'lon' in firstPoint)) {
          errors.push('Each coordinate object must have x/longitude/lon property');
        }
        if (!('y' in firstPoint || 'latitude' in firstPoint || 'lat' in firstPoint)) {
          errors.push('Each coordinate object must have y/latitude/lat property');
        }
      } else {
        errors.push('Invalid coordinate format');
      }
    }
  }
  // Check for collection format
  else if (data.exportInfo?.schema === 'prorail-routes-collection-v1') {
    importType = 'collection';
    
    if (!data.routes || !Array.isArray(data.routes)) {
      errors.push('Collection must have routes array');
    } else if (data.routes.length === 0) {
      errors.push('Collection has no routes');
    }
  } else {
    errors.push('Unrecognized data format. Must be either a route object with coordinates or a full export.');
  }

  return {
    valid: errors.length === 0,
    type: importType,
    errors: errors
  };
}

/**
 * Normalize coordinate to standard format
 * @param {Object|Array} coord - Coordinate in various formats
 * @returns {Array} - [longitude, latitude]
 */
function normalizeCoordinate(coord) {
  if (Array.isArray(coord)) {
    // Format: [x, y] or [lon, lat]
    return [parseFloat(coord[0]), parseFloat(coord[1])];
  } else if (typeof coord === 'object') {
    // Try different property names
    const x = coord.x ?? coord.longitude ?? coord.lon ?? coord.X ?? coord.LONGITUDE ?? coord.LON;
    const y = coord.y ?? coord.latitude ?? coord.lat ?? coord.Y ?? coord.LATITUDE ?? coord.LAT;
    
    if (x === undefined || y === undefined) {
      throw new Error('Coordinate object missing x/y or longitude/latitude properties');
    }
    
    return [parseFloat(x), parseFloat(y)];
  }
  
  throw new Error('Invalid coordinate format');
}

/**
 * Import a route from minimal format (CAD conversion)
 * @param {Object} data - Minimal route data
 * @returns {Object} - Normalized route data ready for creation
 */
export function importMinimalRoute(data) {
  console.log('📥 Importing minimal route format');
  
  // Get coordinates from various possible fields
  const rawCoords = data.coordinates || data.waypoints || data.points;
  
  if (!rawCoords || !Array.isArray(rawCoords)) {
    throw new Error('No valid coordinates found');
  }

  // Normalize all coordinates to [longitude, latitude] format
  const coordinates = rawCoords.map((coord, index) => {
    try {
      return normalizeCoordinate(coord);
    } catch (error) {
      throw new Error(`Invalid coordinate at index ${index}: ${error.message}`);
    }
  });

  // Get basic route information with sensible defaults
  const routeData = {
    name: data.name || data.routeName || data.title || 'Imported Route',
    description: data.description || data.desc || data.notes || '',
    coordinates: coordinates,
    
    // Optional metadata with defaults
    metadata: {
      infrastructureType: data.infrastructureType || data.type || 'cable',
      voltageKv: data.voltageKv || data.voltage || data.kV || null,
      faultClearingTimeMs: data.faultClearingTimeMs || data.clearingTime || null,
      electrifiedSystem: data.electrifiedSystem || data.system || 'standard',
      minJointDistanceMeters: data.minJointDistanceMeters || data.jointDistance || null,
      hasDoubleGuying: data.hasDoubleGuying ?? null,
      hasBoredCrossing: data.hasBoredCrossing ?? null,
      hasIsolatedNeutral: data.hasIsolatedNeutral ?? null,
      notes: data.metadata?.notes || data.additionalNotes || ''
    },
    
    // Visual style (optional)
    color: data.color || data.routeColor || null, // null = use app default
    
    // Coordinate system info (if provided)
    spatialReference: data.spatialReference || data.srs || data.crs || { wkid: 4326 }
  };

  console.log(`   ✓ Name: ${routeData.name}`);
  console.log(`   ✓ Coordinates: ${coordinates.length} points`);
  console.log(`   ✓ Infrastructure: ${routeData.metadata.infrastructureType}`);
  if (routeData.metadata.voltageKv) {
    console.log(`   ✓ Voltage: ${routeData.metadata.voltageKv} kV`);
  }

  return routeData;
}

/**
 * Import a route from full export format
 * @param {Object} data - Full route export data
 * @returns {Object} - Normalized route data ready for creation
 */
export function importFullRoute(data) {
  console.log('📥 Importing full route format');
  
  // Extract coordinates from geometry
  let coordinates;
  if (data.geometry?.coordinates) {
    coordinates = data.geometry.coordinates.map(coord => {
      if (Array.isArray(coord)) {
        return [parseFloat(coord[0]), parseFloat(coord[1])];
      }
      return normalizeCoordinate(coord);
    });
  } else if (data.waypoints) {
    coordinates = data.waypoints.map(wp => normalizeCoordinate(wp));
  } else {
    throw new Error('No coordinates found in full route data');
  }

  const routeData = {
    // Preserve original ID if available (useful for tracking)
    originalId: data.id,
    
    // Basic information
    name: data.name,
    description: data.description || '',
    coordinates: coordinates,
    
    // Complete metadata
    metadata: {
      infrastructureType: data.metadata?.infrastructureType || 'cable',
      voltageKv: data.metadata?.voltageKv ?? null,
      faultClearingTimeMs: data.metadata?.faultClearingTimeMs ?? null,
      electrifiedSystem: data.metadata?.electrifiedSystem || 'standard',
      minJointDistanceMeters: data.metadata?.minJointDistanceMeters ?? null,
      hasDoubleGuying: data.metadata?.hasDoubleGuying ?? null,
      hasBoredCrossing: data.metadata?.hasBoredCrossing ?? null,
      hasIsolatedNeutral: data.metadata?.hasIsolatedNeutral ?? null,
      notes: data.metadata?.notes || ''
    },
    
    // Visual style
    color: data.style?.color || null,
    visible: data.style?.visible !== false,
    
    // Spatial reference
    spatialReference: data.geometry?.spatialReference || { wkid: 4326 },
    
    // Original export info (for reference)
    importInfo: {
      originalExportDate: data.exportInfo?.exportDate,
      originalApplication: data.exportInfo?.application,
      importDate: new Date().toISOString()
    }
  };

  console.log(`   ✓ Name: ${routeData.name}`);
  console.log(`   ✓ Original ID: ${routeData.originalId}`);
  console.log(`   ✓ Coordinates: ${coordinates.length} points`);
  console.log(`   ✓ Infrastructure: ${routeData.metadata.infrastructureType}`);
  if (routeData.metadata.voltageKv) {
    console.log(`   ✓ Voltage: ${routeData.metadata.voltageKv} kV`);
  }

  return routeData;
}

/**
 * Import route(s) from JSON data
 * @param {Object} data - Parsed JSON data
 * @returns {Array} - Array of normalized route data objects
 */
export function importRoutes(data) {
  console.log('📥 Starting route import...');
  
  // Validate data
  const validation = validateImportData(data);
  
  if (!validation.valid) {
    const errorMsg = 'Import validation failed:\n' + validation.errors.join('\n');
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  console.log(`   ℹ️ Import type: ${validation.type}`);

  const routes = [];

  try {
    switch (validation.type) {
      case 'minimal':
        routes.push(importMinimalRoute(data));
        break;
        
      case 'full':
        routes.push(importFullRoute(data));
        break;
        
      case 'collection':
        // Import multiple routes from collection
        console.log(`   ℹ️ Importing ${data.routes.length} routes from collection`);
        data.routes.forEach((routeData, index) => {
          console.log(`   📍 Route ${index + 1}/${data.routes.length}`);
          try {
            routes.push(importFullRoute(routeData));
          } catch (error) {
            console.error(`   ❌ Failed to import route ${index + 1}:`, error.message);
            // Continue with other routes
          }
        });
        break;
        
      default:
        throw new Error('Unknown import type');
    }
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }

  console.log(`✅ Import successful: ${routes.length} route(s) processed`);
  return routes;
}

/**
 * Create route geometry from coordinates
 * @param {Array} coordinates - Array of [longitude, latitude] pairs
 * @param {Object} spatialReference - Spatial reference object
 * @returns {Polyline} - ArcGIS Polyline geometry
 */
export function createRouteGeometry(coordinates, spatialReference = { wkid: 4326 }) {
  return new Polyline({
    paths: [coordinates],
    spatialReference: spatialReference
  });
}

/**
 * Calculate route length from coordinates
 * @param {Array} coordinates - Array of [longitude, latitude] pairs
 * @returns {number} - Length in meters
 */
export function calculateImportedRouteLength(coordinates) {
  const polyline = createRouteGeometry(coordinates);
  
  // Use geodesic length for accurate distance calculation
  const lengthMeters = geometryEngine.geodesicLength(polyline, 'meters');
  
  return lengthMeters;
}

/**
 * Read and parse JSON file
 * @param {File} file - File object from input element
 * @returns {Promise<Object>} - Parsed JSON data
 */
export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        resolve(jsonData);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
