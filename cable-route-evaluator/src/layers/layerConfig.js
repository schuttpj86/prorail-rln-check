/**
 * Layer Configuration
 * 
 * Define all external FeatureServers and their sublayers here.
 * This makes it easy to add, remove, or modify data sources.
 */

import { config } from '../config.js';

/**
 * ProRail FeatureServer Layers
 */
export const prorailLayers = [
  {
    id: 'prorail-tracks',
    url: `${config.prorail.baseUrl}/6`,
    title: '🚂 Railway Tracks (Spoorbaanhartlijn)',
    description: 'Main railway track centerlines',
    visible: true,
    minScale: 0,
    maxScale: 0,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        color: [0, 0, 0, 1],
        width: 3,
        style: 'solid',
        cap: 'round',
        join: 'round'
      }
    },
    popupTemplate: {
      title: 'Railway Track',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  },
  {
    id: 'prorail-track-sections',
    url: `${config.prorail.baseUrl}/9`,
    title: '🛤️ Track Sections (Spoortakdeel)',
    description: 'Detailed track sections',
    visible: true,
    minScale: 50000,
    maxScale: 0,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        color: [120, 120, 120, 0.8],
        width: 2,
        style: 'solid'
      }
    },
    popupTemplate: {
      title: 'Track Section',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  },
  {
    id: 'prorail-stations',
    url: `${config.prorail.baseUrl}/1`,
    title: '🚉 Stations',
    description: 'Railway stations',
    visible: true,
    minScale: 1500000,
    maxScale: 0,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        color: [0, 121, 193, 1],
        size: 10,
        outline: {
          color: [255, 255, 255, 1],
          width: 2
        }
      }
    },
    popupTemplate: {
      title: 'Station: {*}',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  },
  {
    id: 'prorail-switches',
    url: `${config.prorail.baseUrl}/7`,
    title: '🔀 Switches (Wissel)',
    description: 'Railway switches',
    visible: false, // Off by default
    minScale: 25000,
    maxScale: 0,
    popupTemplate: {
      title: 'Switch',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  },
  {
    id: 'prorail-level-crossings',
    url: `${config.prorail.baseUrl}/0`,
    title: '⚠️ Level Crossings (Overweg)',
    description: 'Railway level crossings',
    visible: true,
    minScale: 500000,
    maxScale: 0,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        color: [230, 0, 0, 1],
        size: 8,
        style: 'x',
        outline: {
          color: [255, 255, 255, 1],
          width: 1
        }
      }
    },
    popupTemplate: {
      title: 'Level Crossing',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  }
];

/**
 * Structures and Buildings (Kunstwerken & Gebouwen)
 * Bridges, viaducts, aqueducts, tunnels, buildings and related works.
 */
export const structuresBuildingsLayers = [
  {
    id: 'structures-buildings',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Kunstwerken_gebouwen_002/FeatureServer',
    title: '🏗️ Structures & Buildings',
    description: 'Bridges, viaducts, aqueducts, tunnels, buildings and related works',
    visible: false,
    minScale: 100000,
    maxScale: 0,
    popupTemplate: {
      title: 'Structure/Building',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  }
];

/**
 * Energy Supply System (Energievoorzieningsysteem)
 * Overhead-line components, tank installations, substations, switching stations, etc.
 * 
 * NOTE: Using FeatureServer (not MapServer) to access specific sublayers.
 * FeatureServer allows direct sublayer access via /layerNumber
 */
export const energySupplyLayers = [
  {
    id: 'energy-supply-full',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Energievoorzieningsysteem_005/MapServer',
    title: '⚡ Energy Supply System (All)',
    description: 'Overhead-line components (poles, arms, crossbars), tank installations, substations, switching stations and autotransformer stations',
    visible: false,
    minScale: 100000,
    maxScale: 0,
    layerType: 'map-image', // Multi-sublayer service
    popupTemplate: {
      title: 'Energy Supply Component',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  },
  {
    id: 'ev-gebouwen',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Energievoorzieningsysteem_005/FeatureServer/5',
    title: '🏢 EV Gebouwen (Technical Rooms)',
    description: 'Substations, switching stations, autotransformer stations - CRITICAL for 20m clearance rule (RLN00398 §4.8/§5.6)',
    visible: true, // Visible by default for EMC analysis
    minScale: 100000,
    maxScale: 0,
    layerType: 'feature', // Single FeatureLayer from FeatureServer
    popupTemplate: {
      title: 'Technical Room/Substation',
      content: [{
        type: 'fields',
        fieldInfos: [
          { fieldName: 'OBJECTID', label: 'Object ID' },
          { fieldName: 'FUNCTION', label: 'Function' },
          { fieldName: 'TYPE', label: 'Type' },
          { fieldName: '*' }
        ]
      }]
    },
    outFields: ['*'],
    // Special flag for EMC evaluator to use this layer
    emcAnalysis: {
      purpose: 'technical-rooms',
      rule: 'No HV infrastructure within 20m of technical rooms',
      clause: 'RLN00398 §4.8 / §5.6'
    }
  }
];

/**
 * Train Protection System (Treinbeveiligingssysteem)
 * Signals, signal boards, balises, cabinets - sensitive to EMI
 */
export const trainProtectionLayers = [
  {
    id: 'train-protection',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Treinbeveiligingsysteem_007/MapServer',
    title: '🚦 Train Protection System',
    description: 'Signals, signal boards, balises and cabinets - sensitive to electromagnetic interference',
    visible: false,
    minScale: 50000,
    maxScale: 0,
    layerType: 'map-image', // Multi-sublayer service
    popupTemplate: {
      title: 'Train Protection Equipment',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  }
];

/**
 * Cable Situation (Kabelsituatie)
 * Underground cables, conduits, trenches, ducts, earthing, etc.
 * 
 * NOTE: This MapServer has multiple sublayers. We expose:
 * 1. The full MapServer (for general viewing of all cable infrastructure)
 * 2. Specific sublayers critical for EMC analysis:
 *    - Aarding (earthing points) - for 31m rule (RLN00398 §5.8)
 *    - Tracé (cable routes) - for identifying existing HV infrastructure
 *    - Kokertracé (conduit routes) - for identifying cable conduits
 */
export const cableSituationLayers = [
  {
    id: 'cable-situation-full',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Kabelsituatie_002/MapServer',
    title: '🔌 Cable Situation (All)',
    description: 'Underground cable and conduit objects, trenches, ducts, earthing, ATB/CTA cables, cabinets, lighting, crossings',
    visible: false,
    minScale: 25000,
    maxScale: 0,
    layerType: 'map-image', // Multi-sublayer service
    popupTemplate: {
      title: 'Cable/Conduit Object',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  },
  {
    id: 'aarding',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Kabelsituatie_002/FeatureServer/0',
    title: '⚡ Aarding (Earthing Points)',
    description: 'Earthing points - CRITICAL for 31m clearance rule (RLN00398 §5.8)',
    visible: true, // Visible by default for EMC analysis
    minScale: 25000,
    maxScale: 0,
    layerType: 'feature', // FeatureLayer for direct access
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        size: 8,
        color: [255, 170, 0, 0.8],
        outline: {
          color: [255, 85, 0, 1],
          width: 2
        },
        style: 'circle'
      }
    },
    popupTemplate: {
      title: 'Earthing Point',
      content: [{
        type: 'fields',
        fieldInfos: [
          { fieldName: 'OBJECTID', label: 'Object ID' },
          { fieldName: 'TYPE', label: 'Type' },
          { fieldName: '*' }
        ]
      }]
    },
    outFields: ['*'],
    // Special flag for EMC evaluator to use this layer
    emcAnalysis: {
      purpose: 'earthing-points',
      rule: 'Joints and earthing ≥31m from track',
      clause: 'RLN00398 §5.8'
    }
  },
  {
    id: 'cable-trace',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Kabelsituatie_002/FeatureServer/18',
    title: '📍 Tracé (Cable Routes)',
    description: 'Existing HV cable routes - for identifying existing infrastructure near planned routes',
    visible: false,
    minScale: 25000,
    maxScale: 0,
    layerType: 'feature', // FeatureLayer for direct access
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        color: [255, 0, 0, 0.7],
        width: 3,
        style: 'solid'
      }
    },
    popupTemplate: {
      title: 'Existing Cable Route',
      content: [{
        type: 'fields',
        fieldInfos: [
          { fieldName: 'OBJECTID', label: 'Object ID' },
          { fieldName: 'VOLTAGE', label: 'Voltage' },
          { fieldName: 'TYPE', label: 'Type' },
          { fieldName: '*' }
        ]
      }]
    },
    outFields: ['*'],
    emcAnalysis: {
      purpose: 'existing-hv-cables',
      rule: 'Identify existing HV infrastructure for 20m technical room clearance',
      clause: 'RLN00398 §4.8 / §5.6'
    }
  },
  {
    id: 'koker-trace',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Kabelsituatie_002/FeatureServer/13',
    title: '🔧 Kokertracé (Conduit Routes)',
    description: 'Cable conduit routes - for understanding cable infrastructure layout',
    visible: false,
    minScale: 25000,
    maxScale: 0,
    layerType: 'feature', // FeatureLayer for direct access
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        color: [128, 128, 128, 0.6],
        width: 2,
        style: 'dash'
      }
    },
    popupTemplate: {
      title: 'Cable Conduit Route',
      content: [{
        type: 'fields',
        fieldInfos: [
          { fieldName: 'OBJECTID', label: 'Object ID' },
          { fieldName: 'TYPE', label: 'Type' },
          { fieldName: '*' }
        ]
      }]
    },
    outFields: ['*']
  }
];

/**
 * Other Track Objects (Overige Spoorobjecten)
 * Service points, terrain lighting, hydrants, service platforms, etc.
 */
export const otherTrackObjectsLayers = [
  {
    id: 'other-track-objects',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Overige_spoorobjecten_002/MapServer',
    title: '🔧 Other Track Objects',
    description: 'Service points, terrain lighting, anti-suicide lighting, hydrants, service platforms and other trackside facilities',
    visible: false,
    minScale: 50000,
    maxScale: 0,
    layerType: 'map-image', // Multi-sublayer service
    popupTemplate: {
      title: 'Track Object',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  }
];

/**
 * Track Asset Distances (Trackasset Afstanden)
 * Platform walls, signal boards, light signals, speed signs with distance measurements
 */
export const trackAssetDistancesLayers = [
  {
    id: 'track-asset-distances',
    url: 'https://mapservices.prorail.nl/arcgis/rest/services/Trackasset_afstanden_002/MapServer',
    title: '📏 Track Asset Distances',
    description: 'Platform walls, signal boards, light signals and speed signs with distances from functional track section start/end',
    visible: false,
    minScale: 25000,
    maxScale: 0,
    layerType: 'map-image', // Multi-sublayer service
    popupTemplate: {
      title: 'Track Asset',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  }
];

/**
 * Combine all layer configurations
 */
export const allLayerConfigs = [
  ...prorailLayers,
  ...structuresBuildingsLayers,
  ...energySupplyLayers,
  ...trainProtectionLayers,
  ...cableSituationLayers,
  ...otherTrackObjectsLayers,
  ...trackAssetDistancesLayers
];

/**
 * Get layers by category
 */
export function getLayersByCategory(category) {
  switch(category) {
    case 'prorail':
      return prorailLayers;
    case 'structures-buildings':
      return structuresBuildingsLayers;
    case 'energy-supply':
      return energySupplyLayers;
    case 'train-protection':
      return trainProtectionLayers;
    case 'cable-situation':
      return cableSituationLayers;
    case 'other-track-objects':
      return otherTrackObjectsLayers;
    case 'track-asset-distances':
      return trackAssetDistancesLayers;
    default:
      return allLayerConfigs;
  }
}

/**
 * Get layer config by ID
 */
export function getLayerById(id) {
  return allLayerConfigs.find(layer => layer.id === id);
}
