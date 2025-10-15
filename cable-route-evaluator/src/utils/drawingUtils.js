/**
 * Drawing Utilities
 * 
 * Helper functions for enhanced route drawing capabilities including
 * snapping, distance measurement, and coordinate handling.
 */

import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";

// Load projection engine
let projectionEngineLoaded = false;
projectOperator.load().then(() => {
  projectionEngineLoaded = true;
}).catch(err => {
  console.warn('Could not load projection engine:', err);
});

const HTML_ESCAPE_LOOKUP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/[&<>"']/g, (match) => HTML_ESCAPE_LOOKUP[match] || match);
}

function getComplianceStatusLabel(status) {
  switch (status) {
    case 'pass':
      return 'Pass';
    case 'fail':
      return 'Fail';
    case 'incomplete':
      return 'Partial';
    case 'not_evaluated':
    default:
      return 'Not evaluated';
  }
}

/**
 * Calculate total length of a polyline in meters
 * 
 * @param {Polyline} polyline - The polyline geometry
 * @param {Object} spatialReference - Target spatial reference for measurement
 * @returns {number} Length in meters
 */
export function calculateRouteLength(polyline) {
  try {
    // geodesicLength works with any coordinate system - it converts internally
    const lengthMeters = geometryEngine.geodesicLength(polyline, "meters");
    
    // If geodesicLength returns a very small number, something went wrong
    if (Math.abs(lengthMeters) < 0.001) {
      console.warn('Geodesic length calculation returned near-zero, trying planar length');
      const planarLength = geometryEngine.planarLength(polyline, "meters");
      return Math.round(planarLength * 100) / 100;
    }
    
    return Math.round(Math.abs(lengthMeters) * 100) / 100; // Round to cm precision
  } catch (error) {
    console.warn('Could not calculate route length:', error);
    
    // Fallback: calculate simple distance between points
    try {
      const planarLength = geometryEngine.planarLength(polyline, "meters");
      console.log('Using planar length fallback:', planarLength);
      return Math.round(planarLength * 100) / 100;
    } catch (fallbackError) {
      console.error('Fallback calculation also failed:', fallbackError);
      return 0;
    }
  }
}

/**
 * Format distance for display
 * 
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  } else {
    return `${(meters / 1000).toFixed(2)} km`;
  }
}

/**
 * Find the nearest point on railway tracks for snapping
 * 
 * @param {Point} point - Point to snap
 * @param {FeatureLayer} railwayLayer - Railway tracks layer
 * @param {number} tolerance - Snap tolerance in meters
 * @returns {Promise<Point|null>} Snapped point or null if no snap found
 */
export async function snapToRailway(point, railwayLayer, tolerance = 50) {
  try {
    // Create buffer around point for query
    const buffer = geometryEngine.buffer(point, tolerance, "meters");
    
    // Query nearby railway features
    const query = {
      geometry: buffer,
      spatialRelationship: "intersects",
      returnGeometry: true,
      outFields: [],
      maxRecordCount: 10
    };
    
    const result = await railwayLayer.queryFeatures(query);
    
    if (result.features.length === 0) {
      return null; // No nearby tracks
    }
    
    // Find closest point on any track
    let closestPoint = null;
    let minDistance = Infinity;
    
    for (const feature of result.features) {
      const trackGeometry = feature.geometry;
      const nearestPoint = geometryEngine.nearestCoordinate(trackGeometry, point);
      
      if (nearestPoint && nearestPoint.distance < minDistance) {
        minDistance = nearestPoint.distance;
        closestPoint = nearestPoint.coordinate;
      }
    }
    
    return closestPoint;
  } catch (error) {
    console.warn('Snap to railway failed:', error);
    return null;
  }
}

/**
 * Create a styled symbol for route drawing
 * Note: For compliant/non-compliant status, we no longer change the route color.
 * Instead, the route keeps its original assigned color, and compliance is shown
 * through other visual indicators (like badges or outline styles in the UI).
 * 
 * @param {string} status - Route status: 'drawing', 'active', 'inactive'
 * @param {Object} customColor - Optional custom color {rgb: [r,g,b], hex: '#rrggbb'}
 * @returns {Object} ArcGIS symbol object
 */
export function createRouteSymbol(status = 'drawing', customColor = null) {
  const symbols = {
    drawing: {
      type: "simple-line",
      color: [37, 99, 235, 0.8], // Modern blue while drawing
      width: 3,
      style: "solid",
      cap: "round",
      join: "round"
    },
    active: {
      type: "simple-line",
      color: customColor ? [...customColor.rgb, 1] : [37, 99, 235, 1], // Use custom color or blue
      width: 5,
      style: "solid",
      cap: "round",
      join: "round"
    },
    inactive: {
      type: "simple-line",
      color: customColor ? [...customColor.rgb, 0.6] : [128, 128, 128, 0.6], // Dimmed version
      width: 3,
      style: "solid",
      cap: "round",
      join: "round"
    },
    compliant: {
      type: "simple-line",
      color: customColor ? [...customColor.rgb, 1] : [76, 175, 80, 1], // Use custom color or green
      width: 4,
      style: "solid",
      cap: "round",
      join: "round"
    },
    'non-compliant': {
      type: "simple-line",
      color: customColor ? [...customColor.rgb, 1] : [244, 67, 54, 1], // Use custom color or red
      width: 4,
      style: "solid",
      cap: "round",
      join: "round"
    }
  };
  
  return symbols[status] || symbols.drawing;
}
/**
 * Create waypoint markers for route endpoints
 * 
 * @param {string} type - 'start' or 'end'
 * @returns {Object} ArcGIS symbol object
 */
export function createWaypointSymbol(type = 'start') {
  const symbols = {
    start: {
      type: "simple-marker",
      color: [76, 175, 80, 1], // Green for start
      size: 16,
      style: "circle",
      outline: {
        color: [255, 255, 255, 1],
        width: 3
      }
    },
    end: {
      type: "simple-marker",
      color: [244, 67, 54, 1], // Red for end
      size: 16,
      style: "circle",
      outline: {
        color: [255, 255, 255, 1],
        width: 3
      }
    },
    waypoint: {
      type: "simple-marker",
      color: [33, 33, 33, 1], // Dark gray/black for waypoints
      size: 14,
      style: "circle",
      outline: {
        color: [255, 255, 255, 1],
        width: 2
      }
    }
  };
  
  return symbols[type] || symbols.waypoint;
}

/**
 * Generate unique route ID
 * 
 * @returns {string} Unique route identifier
 */
export function generateRouteId() {
  return `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Aesthetically pleasing color palette for routes
 * Modern, professional colors with good contrast
 */
const ROUTE_COLOR_PALETTE = [
  { hex: '#2563eb', rgb: [37, 99, 235], name: 'Blue' },        // Modern blue
  { hex: '#16a34a', rgb: [22, 163, 74], name: 'Green' },       // Forest green
  { hex: '#dc2626', rgb: [220, 38, 38], name: 'Red' },         // Vibrant red
  { hex: '#9333ea', rgb: [147, 51, 234], name: 'Purple' },     // Royal purple
  { hex: '#ea580c', rgb: [234, 88, 12], name: 'Orange' },      // Warm orange
  { hex: '#0891b2', rgb: [8, 145, 178], name: 'Cyan' },        // Ocean cyan
  { hex: '#c026d3', rgb: [192, 38, 211], name: 'Magenta' },    // Bright magenta
  { hex: '#65a30d', rgb: [101, 163, 13], name: 'Lime' },       // Fresh lime
  { hex: '#0284c7', rgb: [2, 132, 199], name: 'Sky Blue' },    // Sky blue
  { hex: '#db2777', rgb: [219, 39, 119], name: 'Pink' },       // Hot pink
];

let nextColorIndex = 0;

/**
 * Get the next color from the palette
 * Cycles through the palette for variety
 * 
 * @returns {Object} Color object with hex, rgb, and name
 */
export function getNextRouteColor() {
  const color = ROUTE_COLOR_PALETTE[nextColorIndex];
  nextColorIndex = (nextColorIndex + 1) % ROUTE_COLOR_PALETTE.length;
  return color;
}

/**
 * Reset color index (useful for testing or initialization)
 */
export function resetColorIndex() {
  nextColorIndex = 0;
}

/**
 * Convert route geometry to RD New coordinates for analysis
 * 
 * @param {Polyline} geometry - Route geometry in any projection
 * @returns {Polyline} Geometry projected to RD New (EPSG:28992)
 */
export function projectToRDNew(geometry) {
  try {
    if (!projectionEngineLoaded) {
      console.warn('Projection engine not yet loaded, returning original geometry');
      return geometry;
    }

    return projectOperator.execute(geometry, { wkid: 28992 });
  } catch (error) {
    console.warn('Could not project to RD New:', error);
    return geometry;
  }
}

/**
 * Create popup content for route graphics
 * 
 * @param {Object} routeData - Route data object
 * @returns {string} HTML content for popup
 */
export function createRoutePopupContent(routeData) {
  if (!routeData) {
    return `
      <div style="font-family: Arial, sans-serif;">
        <p style="margin: 0; color: #666;">Route details are unavailable.</p>
      </div>
    `;
  }

  const length = routeData.length || 0;
  const created = routeData.created ? new Date(routeData.created).toLocaleString('nl-NL') : 'Unknown';
  const metadata = routeData.metadata || {};
  const compliance = routeData.compliance;
  const summary = compliance?.summary;
  const status = summary?.status || 'not_evaluated';
  const statusLabel = getComplianceStatusLabel(status);

  let statusColor = '#616161';
  let statusBackground = '#f5f5f5';

  if (status === 'pass') {
    statusColor = '#2e7d32';
    statusBackground = '#e8f5e9';
  } else if (status === 'fail') {
    statusColor = '#c62828';
    statusBackground = '#ffebee';
  } else if (status === 'incomplete') {
    statusColor = '#f57c00';
    statusBackground = '#fff3e0';
  }

  let ruleListHtml = '';
  if (compliance?.rules?.length) {
    const failingRules = compliance.rules.filter(rule => rule.status === 'fail');
    const pendingRules = compliance.rules.filter(rule => rule.status === 'not_evaluated');

    if (failingRules.length) {
      ruleListHtml = `
        <div style="margin-top: 12px;">
          <div style="font-size: 12px; color: #c62828; margin-bottom: 4px;">Issues detected</div>
          <ul style="margin: 0; padding-left: 18px; color: #c62828; font-size: 12px; line-height: 1.5;">
            ${failingRules.map(rule => `<li>${escapeHtml(rule.title)} – ${escapeHtml(rule.message || 'Requirement not met')}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (pendingRules.length) {
      ruleListHtml = `
        <div style="margin-top: 12px;">
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Pending checks</div>
          <ul style="margin: 0; padding-left: 18px; color: #666; font-size: 12px; line-height: 1.5;">
            ${pendingRules.slice(0, 3).map(rule => `<li>${escapeHtml(rule.title)} – ${escapeHtml(rule.message || 'Manual verification needed')}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  const metadataRows = `
        <tr>
          <td style="padding: 4px 8px 4px 0; font-weight: bold;">Type:</td>
          <td style="padding: 4px 0;">${escapeHtml(metadata.infrastructureType || 'Unknown')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; font-weight: bold;">Voltage:</td>
          <td style="padding: 4px 0;">${metadata.voltageKv !== undefined && metadata.voltageKv !== null ? `${escapeHtml(metadata.voltageKv)} kV` : 'Unknown'}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; font-weight: bold;">Fault clearing:</td>
          <td style="padding: 4px 0;">${metadata.faultClearingTimeMs !== undefined && metadata.faultClearingTimeMs !== null ? `${escapeHtml(metadata.faultClearingTimeMs)} ms` : 'Unknown'}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; font-weight: bold;">Electrification:</td>
          <td style="padding: 4px 0;">${escapeHtml(metadata.electrifiedSystem === '25kv_50hz' ? '25 kV / 50 Hz' : 'Standard')}</td>
        </tr>
  `;

  return `
    <div style="font-family: Arial, sans-serif;">
      <h3 style="margin: 0 0 10px 0; color: #0079c1;">${escapeHtml(routeData.name || 'Unnamed Route')}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 8px 4px 0; font-weight: bold;">Length:</td>
          <td style="padding: 4px 0;">${formatDistance(length)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; font-weight: bold;">Created:</td>
          <td style="padding: 4px 0;">${escapeHtml(created)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; font-weight: bold;">Compliance:</td>
          <td style="padding: 4px 0;">
            <span style="
              display: inline-block;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 12px;
              background: ${statusBackground};
              color: ${statusColor};
              border: 1px solid ${statusColor};
            ">${escapeHtml(statusLabel)}</span>
            ${summary ? `<div style="margin-top: 4px; font-size: 12px; color: #666;">Pass: ${summary.passCount || 0} · Fail: ${summary.failCount || 0} · Pending: ${(summary.pendingCount || summary.notEvaluatedCount || 0)}</div>` : ''}
            ${summary?.evaluatedAt ? `<div style="font-size: 11px; color: #999; margin-top: 2px;">Last run: ${escapeHtml(new Date(summary.evaluatedAt).toLocaleString('nl-NL'))}</div>` : ''}
          </td>
        </tr>
      </table>

      <div style="margin-top: 12px;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #333;">Input parameters</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          ${metadataRows}
        </table>
      </div>

      ${routeData.description ? `
      <div style="margin-top: 12px; font-size: 12px; color: #666;">
        <div style="font-weight: bold; margin-bottom: 4px;">Notes</div>
        <div>${escapeHtml(routeData.description)}</div>
      </div>
      ` : ''}

      ${ruleListHtml}
    </div>
  `;
}