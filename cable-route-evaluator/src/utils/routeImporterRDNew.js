/**
 * Dutch Cadastral Route Importer (RD New / EPSG:28992)
 * 
 * Specialized importer for Dutch cadastral survey data format.
 * Handles:
 * - EPSG:28992 (RD New) coordinate transformation
 * - MultiLineString geometry with multiple segments
 * - Interactive segment selection and configuration
 */

import { 
  rdNewToWgs84, 
  transformRdNewPath, 
  parseCrsInfo,
  isValidRdNew,
  detectCoordinateSystem 
} from './projectionTransform.js';

/**
 * Validate RD New format GeoJSON
 * @param {Object} data - Parsed JSON data
 * @returns {Object} - { valid: boolean, errors: array, warnings: array, info: object }
 */
export function validateRdNewData(data) {
  const errors = [];
  const warnings = [];
  const info = {};
  
  if (!data) {
    return { valid: false, errors: ['No data provided'], warnings: [], info: {} };
  }

  // Check for FeatureCollection
  if (data.type === 'FeatureCollection') {
    if (!data.features || !Array.isArray(data.features)) {
      errors.push('FeatureCollection must have features array');
    } else if (data.features.length === 0) {
      errors.push('FeatureCollection has no features');
    } else {
      info.featureCount = data.features.length;
      
      // Check first feature for geometry type
      const firstFeature = data.features[0];
      if (firstFeature.geometry) {
        info.geometryType = firstFeature.geometry.type;
      }
    }
  }
  // Check for single Feature
  else if (data.type === 'Feature') {
    info.featureCount = 1;
    
    if (!data.geometry) {
      errors.push('Feature missing geometry');
    } else {
      info.geometryType = data.geometry.type;
      
      if (data.geometry.type !== 'LineString' && data.geometry.type !== 'MultiLineString') {
        errors.push(`Unsupported geometry type: ${data.geometry.type}. Expected LineString or MultiLineString`);
      }
    }
  } else {
    errors.push('Data must be GeoJSON Feature or FeatureCollection');
  }

  // Check CRS
  const crs = data.crs || (data.features && data.features[0]?.crs);
  if (crs) {
    const crsInfo = parseCrsInfo(crs);
    info.crs = crsInfo;
    
    if (crsInfo.epsg !== 28992) {
      warnings.push(`Expected EPSG:28992 (RD New), found EPSG:${crsInfo.epsg}. Transformation may not work correctly.`);
    }
  } else {
    warnings.push('No CRS specified. Assuming EPSG:28992 (RD New)');
    info.crs = { epsg: 28992, name: 'RD New (assumed)' };
  }

  // Check coordinate validity if we have geometry
  if (data.type === 'Feature' && data.geometry?.coordinates) {
    const coords = data.geometry.coordinates;
    
    if (data.geometry.type === 'LineString') {
      if (coords.length < 2) {
        errors.push('LineString must have at least 2 coordinates');
      } else {
        // Check first coordinate
        const firstCoord = coords[0];
        if (!isValidRdNew(firstCoord[0], firstCoord[1])) {
          warnings.push(`First coordinate [${firstCoord[0]}, ${firstCoord[1]}] outside valid RD New range`);
        }
        info.coordinateCount = coords.length;
      }
    } else if (data.geometry.type === 'MultiLineString') {
      info.segmentCount = coords.length;
      info.coordinatesPerSegment = coords.map(seg => seg.length);
      info.totalCoordinates = coords.reduce((sum, seg) => sum + seg.length, 0);
      
      // Check first coordinate of first segment
      if (coords[0] && coords[0][0]) {
        const firstCoord = coords[0][0];
        if (!isValidRdNew(firstCoord[0], firstCoord[1])) {
          warnings.push(`First coordinate [${firstCoord[0]}, ${firstCoord[1]}] outside valid RD New range`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

/**
 * Extract and transform segments from MultiLineString geometry
 * @param {Object} geometry - GeoJSON geometry object
 * @param {Object} crsInfo - CRS information
 * @returns {Array} - Array of segment objects with transformed coordinates
 */
export function extractSegments(geometry, crsInfo) {
  const segments = [];
  
  if (geometry.type === 'MultiLineString') {
    // Multiple segments
    geometry.coordinates.forEach((segmentCoords, index) => {
      const transformedCoords = crsInfo.epsg === 28992 
        ? transformRdNewPath(segmentCoords)
        : segmentCoords;
      
      segments.push({
        index: index,
        id: `segment-${index + 1}`,
        name: `Segment ${index + 1}`,
        originalCoords: segmentCoords,
        wgs84Coords: transformedCoords,
        pointCount: segmentCoords.length,
        lengthMeters: calculateSegmentLength(segmentCoords, crsInfo.epsg)
      });
    });
  } else if (geometry.type === 'LineString') {
    // Single segment
    const transformedCoords = crsInfo.epsg === 28992 
      ? transformRdNewPath(geometry.coordinates)
      : geometry.coordinates;
    
    segments.push({
      index: 0,
      id: 'segment-1',
      name: 'Single Route',
      originalCoords: geometry.coordinates,
      wgs84Coords: transformedCoords,
      pointCount: geometry.coordinates.length,
      lengthMeters: calculateSegmentLength(geometry.coordinates, crsInfo.epsg)
    });
  }
  
  return segments;
}

/**
 * Calculate segment length (approximate)
 * @param {Array} coords - Coordinate array
 * @param {number} epsg - EPSG code
 * @returns {number} - Length in meters (approximate)
 */
function calculateSegmentLength(coords, epsg) {
  let totalLength = 0;
  
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    
    if (epsg === 28992) {
      // RD New uses meters, so direct distance calculation
      const dx = curr[0] - prev[0];
      const dy = curr[1] - prev[1];
      totalLength += Math.sqrt(dx * dx + dy * dy);
    } else {
      // For geographic coordinates, use simple Haversine
      totalLength += haversineDistance(prev[1], prev[0], curr[1], curr[0]);
    }
  }
  
  return totalLength;
}

/**
 * Haversine distance formula for geographic coordinates
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} - Distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Parse RD New format file
 * @param {Object} data - Parsed JSON data
 * @returns {Object} - Parsed route data with segments
 */
export function parseRdNewFile(data) {
  console.log('📥 Parsing RD New format file...');
  
  // Validate first
  const validation = validateRdNewData(data);
  
  if (!validation.valid) {
    throw new Error('Validation failed:\n' + validation.errors.join('\n'));
  }

  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:', validation.warnings);
  }

  console.log('   ℹ️ CRS:', validation.info.crs.name);
  console.log('   ℹ️ Geometry:', validation.info.geometryType);
  
  // Extract features
  let features = [];
  if (data.type === 'FeatureCollection') {
    features = data.features;
  } else if (data.type === 'Feature') {
    features = [data];
  }

  // Process each feature
  const routes = features.map((feature, featureIndex) => {
    const geometry = feature.geometry;
    const properties = feature.properties || {};
    
    // Extract segments
    const segments = extractSegments(geometry, validation.info.crs);
    
    console.log(`   📍 Feature ${featureIndex + 1}: ${segments.length} segment(s)`);
    segments.forEach(seg => {
      console.log(`      - ${seg.name}: ${seg.pointCount} points, ~${Math.round(seg.lengthMeters)}m`);
    });
    
    return {
      featureIndex,
      name: properties.name || properties.titel || properties.Name || `Route ${featureIndex + 1}`,
      description: properties.description || properties.omschrijving || '',
      properties,
      segments,
      originalCrs: validation.info.crs,
      
      // Store original data for reference
      originalData: {
        type: feature.type,
        geometry: feature.geometry,
        properties: feature.properties
      }
    };
  });

  return {
    routes,
    validation,
    metadata: {
      importDate: new Date().toISOString(),
      sourceFormat: 'RD New (EPSG:28992)',
      featureCount: routes.length,
      totalSegments: routes.reduce((sum, r) => sum + r.segments.length, 0)
    }
  };
}

/**
 * Create route configuration from segment
 * @param {Object} segment - Segment object
 * @param {Object} metadata - User-provided metadata
 * @returns {Object} - Route configuration ready for creation
 */
export function createRouteFromSegment(segment, metadata = {}) {
  return {
    name: metadata.name || segment.name,
    description: metadata.description || '',
    coordinates: segment.wgs84Coords,
    
    metadata: {
      infrastructureType: metadata.infrastructureType || 'cable',
      voltageKv: metadata.voltageKv || null,
      faultClearingTimeMs: metadata.faultClearingTimeMs || null,
      electrifiedSystem: metadata.electrifiedSystem || 'standard',
      minJointDistanceMeters: metadata.minJointDistanceMeters || null,
      
      // Step A configuration
      hasDeltaOrMulticore: metadata.hasDeltaOrMulticore ?? null,
      hasDeltaFormation: metadata.hasDeltaFormation ?? null,
      hasPadCurrentControl: metadata.hasPadCurrentControl ?? null,
      
      notes: metadata.notes || `Imported from RD New cadastral data. Original segment: ${segment.name}, ${segment.pointCount} points, ~${Math.round(segment.lengthMeters)}m`
    },
    
    color: metadata.color || null,
    
    spatialReference: { wkid: 4326 },
    
    // Import tracking
    importInfo: {
      source: 'RD New Import',
      originalSegmentId: segment.id,
      originalPointCount: segment.pointCount,
      transformedFrom: 'EPSG:28992',
      importDate: new Date().toISOString()
    }
  };
}

/**
 * Merge multiple segments into single route
 * @param {Array} segments - Array of segment objects
 * @param {Object} metadata - User-provided metadata
 * @returns {Object} - Merged route configuration
 */
export function mergeSegments(segments, metadata = {}) {
  if (!segments || segments.length === 0) {
    throw new Error('No segments to merge');
  }

  // Concatenate all coordinates
  const allCoords = [];
  let totalLength = 0;
  
  segments.forEach(segment => {
    allCoords.push(...segment.wgs84Coords);
    totalLength += segment.lengthMeters;
  });

  return {
    name: metadata.name || `Merged Route (${segments.length} segments)`,
    description: metadata.description || `Combined from ${segments.length} segments`,
    coordinates: allCoords,
    
    metadata: {
      infrastructureType: metadata.infrastructureType || 'cable',
      voltageKv: metadata.voltageKv || null,
      faultClearingTimeMs: metadata.faultClearingTimeMs || null,
      electrifiedSystem: metadata.electrifiedSystem || 'standard',
      minJointDistanceMeters: metadata.minJointDistanceMeters || null,
      
      // Step A configuration
      hasDeltaOrMulticore: metadata.hasDeltaOrMulticore ?? null,
      hasDeltaFormation: metadata.hasDeltaFormation ?? null,
      hasPadCurrentControl: metadata.hasPadCurrentControl ?? null,
      
      notes: metadata.notes || `Merged from ${segments.length} segments: ${segments.map(s => s.name).join(', ')}. Total length: ~${Math.round(totalLength)}m`
    },
    
    color: metadata.color || null,
    
    spatialReference: { wkid: 4326 },
    
    // Import tracking
    importInfo: {
      source: 'RD New Import (Merged)',
      mergedSegments: segments.map(s => s.id),
      originalPointCount: segments.reduce((sum, s) => sum + s.pointCount, 0),
      transformedFrom: 'EPSG:28992',
      importDate: new Date().toISOString()
    }
  };
}

/**
 * Read and parse RD New format JSON file
 * @param {File} file - File object from input element
 * @returns {Promise<Object>} - Parsed route data
 */
export function readRdNewFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        const parsedData = parseRdNewFile(jsonData);
        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Failed to parse RD New file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
