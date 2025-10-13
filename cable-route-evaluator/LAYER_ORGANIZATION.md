# Layer Organization Guide

## Overview

The application now organizes layers into **categorized groups** in the Layer List panel. This makes it easier to manage multiple datasets and keeps the interface clean and organized.

## Layer Categories

The layers are organized into the following groups:

### 1. 🚂 ProRail Infrastructure
Contains all ProRail railway-related layers:
- Railway Tracks (Spoorbaanhartlijn)
- Track Sections (Spoortakdeel)
- Stations
- Switches (Wissel)
- Level Crossings (Overweg)

**Configuration:** `prorailLayers` array in `src/layers/layerConfig.js`

### 2. 🏢 Technical Rooms
Contains technical rooms and buildings data.

**Configuration:** `technicalRoomsLayers` array in `src/layers/layerConfig.js`

### 3. ⚡ High Voltage Infrastructure
Contains high voltage cables and related infrastructure.

**Configuration:** `highVoltageLayers` array in `src/layers/layerConfig.js`

### 4. 📍 Cable Routes
User-drawn cable routes (not in a group, always at the top).

## How to Add Layers

### Adding a Layer to an Existing Category

1. Open `src/layers/layerConfig.js`
2. Find the appropriate array (e.g., `technicalRoomsLayers`)
3. Uncomment the example or add a new layer object:

```javascript
export const technicalRoomsLayers = [
  {
    id: 'technical-rooms',
    url: 'https://your-server.com/arcgis/rest/services/TechnicalRooms/FeatureServer/0',
    title: '🏢 Technical Rooms',
    description: 'Railway technical rooms and buildings',
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
      title: 'Technical Room',
      content: [{
        type: 'fields',
        fieldInfos: [{ fieldName: '*' }]
      }]
    },
    outFields: ['*']
  }
];
```

### Adding a New Category

If you need to add a completely new category (e.g., "Environmental Data"):

1. **In `src/layers/layerConfig.js`:**
   ```javascript
   export const environmentalLayers = [
     {
       id: 'environmental-zones',
       url: 'https://your-server.com/arcgis/rest/services/Environmental/FeatureServer/0',
       title: '🌳 Environmental Zones',
       description: 'Protected environmental areas',
       visible: true,
       // ... rest of configuration
     }
   ];
   ```

2. **In `src/main.js`:**
   
   a. Add import:
   ```javascript
   import { prorailLayers, technicalRoomsLayers, highVoltageLayers, environmentalLayers } from "./layers/layerConfig.js";
   ```
   
   b. Create feature layers in `initializeMap()`:
   ```javascript
   const environmentalFeatureLayers = createFeatureLayersWithHandling(
     environmentalLayers,
     (layer, config) => {
       layer.queryFeatureCount().then(count => {
         console.log(`   📊 Total features in ${layer.title}: ${count}`);
       }).catch(err => {
         console.log(`   ⚠️ Could not count features:`, err.message);
       });
     },
     (layer, config, error) => {
       console.error(`Failed to load ${config.title}:`, error);
     }
   );
   ```
   
   c. Create group layer:
   ```javascript
   const environmentalGroup = new GroupLayer({
     title: "🌳 Environmental Data",
     layers: environmentalFeatureLayers,
     visible: true,
     visibilityMode: "independent"
   });
   ```
   
   d. Add to map layers:
   ```javascript
   const map = new Map({
     basemap: "streets-vector",
     layers: [
       prorailGroup,
       technicalRoomsGroup,
       highVoltageGroup,
       environmentalGroup,  // Add your new group here
       cableRoutesLayer
     ]
   });
   ```

## Layer List Behavior

### Default State
- The layer list panel now starts **closed** (collapsed) in the top-right corner
- Click the layers icon to expand it

### Group Behavior
- Each category is a collapsible group
- You can toggle the entire group on/off
- Individual layers within each group can be toggled independently
- Each layer shows a legend when expanded

### Adding Emojis
Use emojis in titles to make layers more visually distinctive:
- 🚂 Railway/Tracks
- 🏢 Buildings
- ⚡ Electricity/High Voltage
- 🌳 Environmental
- 📍 Points of Interest
- 🔀 Switches/Junctions
- ⚠️ Warnings/Hazards

## Configuration Reference

### Layer Properties
- **id**: Unique identifier for the layer
- **url**: FeatureServer endpoint URL
- **title**: Display name (use emojis for visual appeal)
- **description**: Layer description
- **visible**: Whether layer is visible on startup (true/false)
- **minScale**: Minimum scale at which layer is visible (0 = always)
- **maxScale**: Maximum scale at which layer is visible (0 = always)
- **renderer**: Defines how features are styled
- **popupTemplate**: Popup configuration when clicking features
- **outFields**: Which fields to retrieve ('*' = all)

### Group Properties
- **title**: Display name for the group
- **layers**: Array of layers in the group
- **visible**: Whether group is visible on startup
- **visibilityMode**: 
  - `"independent"`: Each layer can be toggled separately
  - `"inherited"`: All layers inherit visibility from group

## Best Practices

1. **Keep groups focused**: Each group should represent a logical dataset category
2. **Use emojis**: They make the interface more intuitive and visually appealing
3. **Set appropriate scale ranges**: Prevent layers from loading at inappropriate zoom levels
4. **Default visibility**: Consider which layers should be visible on startup
5. **Descriptive titles**: Use clear, concise names that describe the data
6. **Empty groups**: Groups with no layers won't cause errors; they'll just be empty

## Current State

- ✅ Layer list starts collapsed
- ✅ ProRail Infrastructure group is populated with 5 layers
- ⏳ Technical Rooms group is empty (awaiting data)
- ⏳ High Voltage group is empty (awaiting data)

To activate the placeholder groups, uncomment the example configurations in `layerConfig.js` and update with your actual data source URLs.
