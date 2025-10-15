/**
 * Application Configuration
 * Loads environment variables and defines constants
 */

export const config = {
  // ArcGIS API Configuration
  arcgis: {
    apiKey: import.meta.env.VITE_ARCGIS_API_KEY,
    clientId: import.meta.env.VITE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_CLIENT_SECRET
  },

  // ProRail Data Sources
  prorail: {
    baseUrl: import.meta.env.VITE_PRORAIL_BASE_URL,
    // Layer indices (to be verified from FeatureServer)
    layers: {
      tracks: 0,        // Railway tracks
      stations: 1,      // Railway stations
      technicalRooms: 2 // Technical rooms (to be confirmed)
    }
  },

  // Spatial Reference for Netherlands (RD New / Amersfoort)
  spatialReference: {
    wkid: 28992  // EPSG:28992 - Amersfoort / RD New
  },

  // Initial map extent (Netherlands)
  initialExtent: {
    xmin: 12000,
    ymin: 304000,
    xmax: 280000,
    ymax: 619000,
    spatialReference: { wkid: 28992 }
  },

  // ProRail EMC Compliance Criteria (from RLN00398)
  compliance: {
    // Criterion 1: Crossing angle
    crossingAngle: {
      min: 80,  // degrees
      max: 100  // degrees
    },
    
    // Criterion 2: Fault clearing time
    faultClearingTime: {
      max: 100  // milliseconds
    },
    
    // Criterion 6: Technical rooms
    technicalRoomDistance: {
      min: 20  // meters
    },
    
    // Criterion 8: Joints and grounding
    jointDistance: {
      min: 31  // meters (20m + 11m)
    },

    // NEWLY ADDED/CENTRALIZED VALUES:
    // Mast distance for overhead lines
    mastDistance: {
      min: 31  // meters for OHL masts from track
    },

    // Non-crossing distance thresholds (centralized from evaluator logic)
    nonCrossingDistances: {
      default: 700,              // meters, default for OHL and HV cables (≥35kV)
      electrified25kV: 11,       // meters, exception for 25kV 50Hz tracks
      lowVoltageCable: 11        // meters, for cables < 35kV
    }
  },

  // Spatial query buffer distances (in meters)
  spatialQuery: {
    bufferDistances: {
      tracks: 10000,          // 10km buffer for track queries
      technicalRooms: 10000,  // 10km buffer for technical room queries
      earthing: 50            // 50m buffer for earthing point queries (kept small - needs to be close)
    },
    // Track geometry adjustments
    trackWidth: {
      standard: 3.0,          // 3m buffer around track centerline (represents physical track width + safety margin)
      perTrack: 1.5           // ~1.5m per track (standard gauge + ballast)
    }
  },

  // Local storage keys
  storage: {
    projectKey: 'prorail-cable-routes',
    settingsKey: 'prorail-settings'
  }
};

// Validation
if (!config.arcgis.apiKey) {
  console.warn('⚠️ VITE_ARCGIS_API_KEY not found in environment variables');
}

if (!config.prorail.baseUrl) {
  console.warn('⚠️ VITE_PRORAIL_BASE_URL not found in environment variables');
}

export default config;
