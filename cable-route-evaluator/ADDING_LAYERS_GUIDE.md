# 🚀 Quick Start: Adding a New FeatureServer

## Real-World Example: Adding Technical Rooms

Let's say you have a FeatureServer with technical room data:
```
https://maps.example.nl/arcgis/rest/services/Technical_Infrastructure/FeatureServer
```

With sublayers:
- Layer 0: Technical Buildings (polygons)
- Layer 1: Electrical Rooms (points)
- Layer 2: Cable Ducts (polylines)

---

## Step 1: Add to Config (30 seconds)

**File: `src/config.js`**

```javascript
export const config = {
  // ... existing config
  
  // ADD THIS:
  technicalInfra: {
    baseUrl: 'https://maps.example.nl/arcgis/rest/services/Technical_Infrastructure/FeatureServer'
  }
};
```

---

## Step 2: Define Layers (5 minutes)

**File: `src/layers/layerConfig.js`**

Add at the bottom, before `allLayerConfigs`:

```javascript
/**
 * Technical Infrastructure FeatureServer
 */
export const technicalInfraLayers = [
  {
    id: 'tech-buildings',
    url: `${config.technicalInfra.baseUrl}/0`,
    title: '🏢 Technical Buildings',
    description: 'Railway technical buildings',
    visible: true,
    minScale: 100000, // Only show when zoomed in
    maxScale: 0,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-fill',
        color: [255, 170, 0, 0.5], // Semi-transparent orange
        outline: {
          color: [255, 85, 0, 1],
          width: 2
        }
      }
    },
    popupTemplate: {
      title: 'Building: {NAME}',
      content: [{
        type: 'fields',
        fieldInfos: [
          { fieldName: 'NAME', label: 'Building Name' },
          { fieldName: 'TYPE', label: 'Type' },
          { fieldName: 'AREA_M2', label: 'Area (m²)' }
        ]
      }]
    },
    outFields: ['*']
  },
  {
    id: 'elec-rooms',
    url: `${config.technicalInfra.baseUrl}/1`,
    title: '⚡ Electrical Rooms',
    visible: true,
    minScale: 50000,
    maxScale: 0,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        color: [255, 200, 0, 1],
        size: 8,
        style: 'square',
        outline: {
          color: [0, 0, 0, 1],
          width: 1
        }
      }
    },
    popupTemplate: {
      title: 'Electrical Room',
      content: 'Room ID: {ROOM_ID}<br>Voltage: {VOLTAGE}kV'
    },
    outFields: ['*']
  },
  {
    id: 'cable-ducts',
    url: `${config.technicalInfra.baseUrl}/2`,
    title: '🔌 Cable Ducts',
    visible: false, // Off by default - detailed view
    minScale: 25000,
    maxScale: 0,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        color: [200, 100, 255, 0.8],
        width: 2,
        style: 'short-dash'
      }
    },
    popupTemplate: {
      title: 'Cable Duct',
      content: 'Duct ID: {DUCT_ID}<br>Capacity: {CAPACITY} cables'
    },
    outFields: ['*']
  }
];

// UPDATE THIS LINE:
export const allLayerConfigs = [
  ...prorailLayers,
  ...technicalInfraLayers,  // ← ADD YOUR NEW LAYERS HERE
  ...technicalRoomsLayers,
  ...highVoltageLayers
];
```

---

## Step 3: Add to Map (1 minute)

**File: `src/main.js`**

```javascript
// At the top, update import:
import { 
  prorailLayers,
  technicalInfraLayers  // ← ADD THIS
} from "./layers/layerConfig.js";

// Inside initializeMap() function:
function initializeMap() {
  // ... existing code ...
  
  // Create ProRail layers
  const prorailFeatureLayers = createFeatureLayersWithHandling(prorailLayers);
  
  // ADD THIS:
  // Create Technical Infrastructure layers
  const techInfraFeatureLayers = createFeatureLayersWithHandling(technicalInfraLayers);
  
  // Create the map
  const map = new Map({
    basemap: "streets-vector",
    layers: [
      ...prorailFeatureLayers,
      ...techInfraFeatureLayers,  // ← ADD YOUR LAYERS
      cableRoutesLayer
    ]
  });
  
  // ... rest of code ...
}
```

---

## ✅ Done!

Save the files and Vite will auto-reload. You'll see:
- 🏢 Technical Buildings in the layer list
- ⚡ Electrical Rooms
- 🔌 Cable Ducts (off by default)

All with popups, symbology, and scale-dependent visibility!

---

## 🎨 Customization Tips

### Want different colors?
```javascript
color: [R, G, B, Alpha] // Values 0-255, Alpha 0-1
// Examples:
color: [255, 0, 0, 1]     // Red
color: [0, 121, 193, 1]   // Blue
color: [255, 170, 0, 0.6] // Semi-transparent orange
```

### Want different symbols?
**Lines:** `'solid'`, `'dash'`, `'dot'`, `'short-dash'`, `'long-dash'`  
**Points:** `'circle'`, `'square'`, `'x'`, `'cross'`, `'diamond'`, `'triangle'`

### Want to filter data?
Add `definitionExpression` to only show certain features:
```javascript
{
  id: 'high-voltage-buildings',
  url: '...',
  definitionExpression: "VOLTAGE >= 110", // Only show ≥110kV
  // ... rest of config
}
```

---

## 🔍 Debugging

Check browser console for:
```
✅ Layer loaded: 🏢 Technical Buildings
   📊 Total features in layer: 127
```

If you see errors:
- ❌ Check URL is correct
- ❌ Verify sublayer index (0, 1, 2...)
- ❌ Make sure FeatureServer is accessible (try in browser)
- ❌ Check CORS settings if external server

---

**That's it! 🎉 Now you can easily add any FeatureServer to your map.**
