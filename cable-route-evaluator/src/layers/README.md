# Layer Management System

This folder contains the configuration and factory functions for managing external data sources (FeatureServers).

## 📁 Files

- **`layerConfig.js`** - Define all FeatureServer layers here
- **`layerFactory.js`** - Factory functions to create ArcGIS layers from configs

## 🆕 How to Add a New FeatureServer

### Step 1: Add the URL to `config.js`

First, add your FeatureServer URL to the main config:

```javascript
// In src/config.js
export const config = {
  // ... existing config
  
  // Add your new data source
  technicalRooms: {
    baseUrl: 'https://your-server.com/arcgis/rest/services/TechnicalRooms/FeatureServer'
  }
};
```

### Step 2: Define Layers in `layerConfig.js`

Create a new array for your FeatureServer's sublayers:

```javascript
// In src/layers/layerConfig.js
import { config } from '../config.js';

export const technicalRoomsLayers = [
  {
    id: 'technical-rooms-buildings',
    url: `${config.technicalRooms.baseUrl}/0`, // Sublayer 0
    title: '🏢 Technical Buildings',
    description: 'Railway technical buildings',
    visible: true,
    minScale: 100000,
    maxScale: 0,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-fill',
        color: [255, 170, 0, 0.6],
        outline: {
          color: [255, 85, 0, 1],
          width: 2
        }
      }
    },
    popupTemplate: {
      title: 'Technical Room: {NAME}',
      content: [{
        type: 'fields',
        fieldInfos: [
          { fieldName: 'NAME', label: 'Name' },
          { fieldName: 'TYPE', label: 'Type' },
          { fieldName: 'ADDRESS', label: 'Address' }
        ]
      }]
    },
    outFields: ['*']
  },
  // Add more sublayers from the same FeatureServer...
];

// Add to allLayerConfigs
export const allLayerConfigs = [
  ...prorailLayers,
  ...technicalRoomsLayers,  // ← Add your new layers
  ...highVoltageLayers
];
```

### Step 3: Use in `main.js`

Import and add your layers to the map:

```javascript
// In src/main.js
import { prorailLayers, technicalRoomsLayers } from "./layers/layerConfig.js";
import { createFeatureLayersWithHandling } from "./layers/layerFactory.js";

function initializeMap() {
  // Create ProRail layers
  const prorailFeatureLayers = createFeatureLayersWithHandling(prorailLayers);
  
  // Create Technical Rooms layers
  const technicalRoomFeatureLayers = createFeatureLayersWithHandling(technicalRoomsLayers);
  
  // Add to map
  const map = new Map({
    basemap: "streets-vector",
    layers: [
      ...prorailFeatureLayers,
      ...technicalRoomFeatureLayers,  // ← Add your layers
      cableRoutesLayer
    ]
  });
}
```

## 🎨 Renderer Types

### Line Symbol (for tracks, cables, etc.)
```javascript
renderer: {
  type: 'simple',
  symbol: {
    type: 'simple-line',
    color: [255, 0, 0, 1], // [R, G, B, Alpha]
    width: 3,
    style: 'solid' // 'dash', 'dot', 'short-dash', etc.
  }
}
```

### Marker Symbol (for points, stations, etc.)
```javascript
renderer: {
  type: 'simple',
  symbol: {
    type: 'simple-marker',
    color: [0, 121, 193, 1],
    size: 10,
    style: 'circle', // 'square', 'x', 'cross', 'diamond', etc.
    outline: {
      color: [255, 255, 255, 1],
      width: 2
    }
  }
}
```

### Fill Symbol (for polygons, buildings, etc.)
```javascript
renderer: {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [255, 170, 0, 0.6],
    outline: {
      color: [255, 85, 0, 1],
      width: 2
    }
  }
}
```

## 🔍 Finding FeatureServer Information

### Get FeatureServer Metadata
```
https://your-server.com/arcgis/rest/services/YourService/FeatureServer?f=json
```

### Get Sublayer Information
```
https://your-server.com/arcgis/rest/services/YourService/FeatureServer/0?f=json
```

The JSON response will tell you:
- Available fields
- Geometry type (point, polyline, polygon)
- Spatial reference
- Min/max scale
- Feature count

## ✅ Best Practices

1. **Use descriptive IDs**: `'prorail-tracks'` not `'layer1'`
2. **Add emojis to titles**: Makes layer list more visual
3. **Set appropriate scale ranges**: Don't show detailed layers at country-zoom
4. **Include popupTemplates**: Users can click to inspect features
5. **Use `outFields: ['*']`**: Gets all attributes for analysis
6. **Group related layers**: Keep layers from same FeatureServer together

## 🐛 Troubleshooting

### Layer doesn't appear
- Check browser console for errors
- Verify FeatureServer URL is accessible
- Check sublayer index (0, 1, 2, etc.)
- Verify minScale/maxScale settings
- Check if layer is outside current map extent

### Layer loads but no features visible
- Check renderer symbol colors (might be transparent)
- Zoom to appropriate scale
- Check spatial reference compatibility
- Query feature count: `layer.queryFeatureCount()`

### Performance issues
- Set appropriate `minScale` to avoid loading too many features
- Reduce `outFields` to only needed attributes
- Consider using `definitionExpression` to filter data

## 📚 More Information

- [ArcGIS FeatureLayer API](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html)
- [Renderer Types](https://developers.arcgis.com/javascript/latest/visualization/)
- [Symbol Types](https://developers.arcgis.com/javascript/latest/symbology/)
