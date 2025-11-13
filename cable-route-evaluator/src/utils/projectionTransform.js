/**
 * Coordinate Projection Transformation Utility
 * 
 * Handles transformation between EPSG:28992 (RD New - Dutch National Grid)
 * and EPSG:4326 (WGS84 - Geographic coordinates)
 * 
 * RD New is the official coordinate system for the Netherlands.
 * Formula based on: https://www.kadaster.nl/zakelijk/producten/advies-en-ondersteuning/transformatie-rdnaptrans
 */

/**
 * Transform coordinates from EPSG:28992 (RD New) to EPSG:4326 (WGS84)
 * Uses the official RDNAPTRANS transformation parameters
 * 
 * @param {number} x - RD New X coordinate (Easting in meters)
 * @param {number} y - RD New Y coordinate (Northing in meters)
 * @returns {Object} - { longitude, latitude } in WGS84
 */
export function rdNewToWgs84(x, y) {
  // RD New reference point (Amersfoort)
  const X0 = 155000;
  const Y0 = 463000;
  
  // Calculate normalized coordinates
  const dX = (x - X0) * 1e-5;
  const dY = (y - Y0) * 1e-5;
  
  // Coefficients for latitude (φ) calculation
  const Kp = [
    { p: 0, q: 1, K: 3235.65389 },
    { p: 2, q: 0, K: -32.58297 },
    { p: 0, q: 2, K: -0.24750 },
    { p: 2, q: 1, K: -0.84978 },
    { p: 0, q: 3, K: -0.06550 },
    { p: 2, q: 2, K: -0.01709 },
    { p: 1, q: 0, K: -0.00738 },
    { p: 4, q: 0, K: 0.00530 },
    { p: 2, q: 3, K: -0.00039 },
    { p: 4, q: 1, K: 0.00033 },
    { p: 1, q: 1, K: -0.00012 }
  ];
  
  // Coefficients for longitude (λ) calculation
  const Kl = [
    { p: 1, q: 0, K: 5260.52916 },
    { p: 1, q: 1, K: 105.94684 },
    { p: 1, q: 2, K: 2.45656 },
    { p: 3, q: 0, K: -0.81885 },
    { p: 1, q: 3, K: 0.05594 },
    { p: 3, q: 1, K: -0.05607 },
    { p: 0, q: 1, K: 0.01199 },
    { p: 3, q: 2, K: -0.00256 },
    { p: 1, q: 4, K: 0.00128 },
    { p: 0, q: 2, K: 0.00022 },
    { p: 2, q: 0, K: -0.00022 },
    { p: 5, q: 0, K: 0.00026 }
  ];
  
  // Base coordinates (Amersfoort in WGS84)
  const phi0 = 52.15517440;  // Base latitude
  const lambda0 = 5.38720621;  // Base longitude
  
  // Calculate latitude
  let phi = phi0;
  for (const coef of Kp) {
    phi += (coef.K * Math.pow(dX, coef.p) * Math.pow(dY, coef.q)) / 3600;
  }
  
  // Calculate longitude
  let lambda = lambda0;
  for (const coef of Kl) {
    lambda += (coef.K * Math.pow(dX, coef.p) * Math.pow(dY, coef.q)) / 3600;
  }
  
  return {
    longitude: lambda,
    latitude: phi
  };
}

/**
 * Transform coordinates from EPSG:4326 (WGS84) to EPSG:28992 (RD New)
 * 
 * @param {number} longitude - WGS84 longitude
 * @param {number} latitude - WGS84 latitude
 * @returns {Object} - { x, y } in RD New (meters)
 */
export function wgs84ToRdNew(longitude, latitude) {
  // RD New reference point (Amersfoort)
  const X0 = 155000;
  const Y0 = 463000;
  
  // Base coordinates (Amersfoort in WGS84)
  const phi0 = 52.15517440;  // Base latitude
  const lambda0 = 5.38720621;  // Base longitude
  
  // Calculate normalized differences
  const dPhi = 0.36 * (latitude - phi0);
  const dLambda = 0.36 * (longitude - lambda0);
  
  // Coefficients for X calculation
  const Kp = [
    { p: 0, q: 1, K: 190094.945 },
    { p: 1, q: 1, K: -11832.228 },
    { p: 2, q: 1, K: -114.221 },
    { p: 0, q: 3, K: -32.391 },
    { p: 1, q: 0, K: -0.705 },
    { p: 3, q: 1, K: -2.340 },
    { p: 1, q: 3, K: -0.608 },
    { p: 0, q: 2, K: -0.008 },
    { p: 2, q: 3, K: 0.148 }
  ];
  
  // Coefficients for Y calculation
  const Kl = [
    { p: 1, q: 0, K: 309056.544 },
    { p: 0, q: 2, K: 3638.893 },
    { p: 2, q: 0, K: 73.077 },
    { p: 1, q: 2, K: -157.984 },
    { p: 3, q: 0, K: 59.788 },
    { p: 0, q: 1, K: 0.433 },
    { p: 2, q: 2, K: -6.439 },
    { p: 1, q: 1, K: -0.032 },
    { p: 0, q: 4, K: 0.092 },
    { p: 1, q: 4, K: -0.054 }
  ];
  
  // Calculate X
  let x = X0;
  for (const coef of Kp) {
    x += coef.K * Math.pow(dPhi, coef.p) * Math.pow(dLambda, coef.q);
  }
  
  // Calculate Y
  let y = Y0;
  for (const coef of Kl) {
    y += coef.K * Math.pow(dPhi, coef.p) * Math.pow(dLambda, coef.q);
  }
  
  return { x, y };
}

/**
 * Transform an array of RD New coordinates to WGS84
 * 
 * @param {Array} coordinates - Array of [x, y] in RD New
 * @returns {Array} - Array of [longitude, latitude] in WGS84
 */
export function transformRdNewPath(coordinates) {
  return coordinates.map(coord => {
    const { longitude, latitude } = rdNewToWgs84(coord[0], coord[1]);
    return [longitude, latitude];
  });
}

/**
 * Validate that coordinates are in RD New range
 * RD New valid range: X: 0-280000, Y: 300000-625000
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} - True if coordinates are in valid RD New range
 */
export function isValidRdNew(x, y) {
  return (
    x >= 0 && x <= 280000 &&
    y >= 300000 && y <= 625000
  );
}

/**
 * Detect coordinate system based on coordinate values
 * 
 * @param {Array} coord - [x, y] coordinate pair
 * @returns {string} - 'rdnew', 'wgs84', or 'unknown'
 */
export function detectCoordinateSystem(coord) {
  const [x, y] = coord;
  
  // RD New: large values (tens to hundreds of thousands)
  if (x >= 0 && x <= 280000 && y >= 300000 && y <= 625000) {
    return 'rdnew';
  }
  
  // WGS84: longitude (-180 to 180), latitude (-90 to 90)
  // Netherlands roughly: lon 3-7, lat 50-54
  if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
    return 'wgs84';
  }
  
  return 'unknown';
}

/**
 * Auto-transform coordinates to WGS84 if needed
 * 
 * @param {Array} coord - [x, y] coordinate pair
 * @returns {Array} - [longitude, latitude] in WGS84
 */
export function autoTransformToWgs84(coord) {
  const crs = detectCoordinateSystem(coord);
  
  if (crs === 'rdnew') {
    const { longitude, latitude } = rdNewToWgs84(coord[0], coord[1]);
    return [longitude, latitude];
  } else if (crs === 'wgs84') {
    return coord;
  } else {
    throw new Error(`Cannot determine coordinate system for: [${coord[0]}, ${coord[1]}]`);
  }
}

/**
 * Get CRS info from GeoJSON crs property
 * 
 * @param {Object} crs - GeoJSON crs object
 * @returns {Object} - { epsg, name }
 */
export function parseCrsInfo(crs) {
  if (!crs || !crs.properties) {
    return { epsg: 4326, name: 'WGS84' };
  }
  
  const crsName = crs.properties.name || '';
  
  if (crsName.includes('28992')) {
    return { epsg: 28992, name: 'RD New' };
  } else if (crsName.includes('4326')) {
    return { epsg: 4326, name: 'WGS84' };
  } else if (crsName.includes('3857')) {
    return { epsg: 3857, name: 'Web Mercator' };
  }
  
  return { epsg: 4326, name: 'WGS84' };
}
