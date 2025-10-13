# EMC Analysis Layers - Integration Guide

## Overview

The application now includes **specific sublayers** from ProRail's infrastructure services that are critical for automated EMC compliance checking according to RLN00398. These layers support the two key spatial analysis rules:

1. **No HV infrastructure within 20m of technical rooms** (§4.8 / §5.6)
2. **Joints and earthing ≥31m from track** (§5.8)

---

## 🏢 Critical Layers for EMC Analysis

### 1. EV Gebouwen (Technical Rooms)

**Layer ID:** `ev-gebouwen`  
**Source:** Energievoorzieningsysteem_005/MapServer/5  
**Type:** Polygons  
**Default Visibility:** ✅ **ON** (visible by default)

**Description:**  
Contains substations, switching stations, and autotransformer stations - the "technical rooms" referenced in RLN00398.

**EMC Rule:**  
§4.8 / §5.6 - High-voltage infrastructure must maintain **≥20m clearance** from these facilities.

**Usage in Analysis:**
```javascript
// The EMC evaluator will:
1. Create a 20m buffer around each EV gebouw
2. Check if the proposed cable route intersects any buffer
3. Report violations with specific distances
```

**Visual Characteristics:**
- Displayed as polygons (building footprints)
- Should be styled with orange/yellow fill for visibility
- Critical for route planning - avoid these areas or plan shielding

---

### 2. Aarding (Earthing Points)

**Layer ID:** `aarding`  
**Source:** Kabelsituatie_002/MapServer/0  
**Type:** Points  
**Default Visibility:** ✅ **ON** (visible by default)

**Description:**  
Earthing points for existing cable infrastructure. Includes both existing earthing and planned joint/earthing locations.

**EMC Rule:**  
§5.8 - Joints and earthing points must be located **≥31m from the outermost track centerline**.

**Usage in Analysis:**
```javascript
// The EMC evaluator will:
1. Identify all earthing points along/near the route
2. Create 31m buffer around track centerlines
3. Flag any earthing points within the buffer zone
4. For new routes: validate planned joint locations
```

**Visual Characteristics:**
- Displayed as circular markers (orange/red)
- Size: 8px with 2px outline
- Highly visible for quick identification

**Important Note:**  
For **new cable designs**, you'll need to specify planned joint/earthing locations in the route metadata. The existing earthing layer shows only currently installed infrastructure.

---

### 3. Tracé (Existing HV Cable Routes)

**Layer ID:** `cable-trace`  
**Source:** Kabelsituatie_002/MapServer/18  
**Type:** Polylines  
**Default Visibility:** ❌ OFF (toggle on when needed)

**Description:**  
Existing high-voltage cable routes in the ProRail network. Shows where HV cables are already installed.

**EMC Rule Support:**  
While not directly part of a compliance rule, this layer helps identify:
- Existing HV infrastructure that must stay ≥20m from technical rooms
- Potential cable corridors for new routes
- Areas where cable density is already high

**Usage:**
- Toggle ON when planning new routes to avoid conflicts
- Identify existing cable paths that successfully meet EMC requirements
- Understand cable density in specific areas

**Visual Characteristics:**
- Red solid lines (width: 3px, 70% opacity)
- Should stand out against the basemap

---

### 4. Kokertracé (Cable Conduit Routes)

**Layer ID:** `koker-trace`  
**Source:** Kabelsituatie_002/MapServer/13  
**Type:** Polylines  
**Default Visibility:** ❌ OFF (toggle on when needed)

**Description:**  
Cable conduit routes - the physical conduits/ducts that contain cables.

**Usage:**
- Understand conduit infrastructure layout
- Plan cable installations within existing conduits
- Identify where new conduits may be needed

**Visual Characteristics:**
- Gray dashed lines (width: 2px, 60% opacity)
- Subtle appearance to avoid clutter

---

## 🔍 How These Layers Support EMC Evaluation

### Rule 1: Technical Room Clearance (20m)

**Data Flow:**
```
User draws route
    ↓
App queries EV Gebouwen layer
    ↓
For each technical room:
  - Create 20m buffer
  - Check intersection with route
    ↓
Report: Pass/Fail + exact distance
```

**Implementation Status:**
- ✅ Layer configured and visible
- ✅ EMC evaluator has placeholder logic
- 🔄 **TODO:** Implement spatial query in `emcEvaluator.js`
- 🔄 **TODO:** Add buffer visualization on map

---

### Rule 2: Earthing/Joint Clearance (31m)

**Data Flow:**
```
User draws route + marks joint locations
    ↓
App queries track centerlines (Spoorbaanhartlijn)
    ↓
For each joint/earthing point:
  - Calculate distance to nearest track
  - Check if ≥31m
    ↓
Report: Pass/Fail + exact distance
```

**Implementation Status:**
- ✅ Earthing layer configured and visible
- ✅ Track centerline layer available
- ✅ EMC evaluator accepts `minJointDistanceMeters` metadata
- 🔄 **TODO:** Add UI for marking joint locations on route
- 🔄 **TODO:** Implement automated distance calculation
- 🔄 **TODO:** Add 31m buffer visualization around tracks

---

## 📊 Layer Organization in Layer List

The layers are organized into groups for easy management:

```
Layer List
├── 📍 Cable Routes (user drawings)
├── 🚂 ProRail Base Infrastructure
│   ├── 🚂 Railway Tracks (Spoorbaanhartlijn) ✅ ON
│   ├── 🛤️ Track Sections (Spoortakdeel)
│   ├── 🚉 Stations
│   ├── 🔀 Switches (Wissel)
│   └── ⚠️ Level Crossings (Overweg)
├── 🏗️ Structures & Buildings
├── ⚡ Energy Supply System
│   ├── ⚡ Energy Supply System (All) ❌ OFF
│   └── 🏢 EV Gebouwen (Technical Rooms) ✅ ON ⭐ CRITICAL
├── 🚦 Train Protection System
├── 🔌 Cable Situation
│   ├── 🔌 Cable Situation (All) ❌ OFF
│   ├── ⚡ Aarding (Earthing Points) ✅ ON ⭐ CRITICAL
│   ├── 📍 Tracé (Cable Routes) ❌ OFF
│   └── 🔧 Kokertracé (Conduit Routes) ❌ OFF
├── 🔧 Other Track Objects
└── 📏 Track Asset Distances
```

**Key:**
- ✅ ON = Visible by default
- ❌ OFF = Hidden by default (toggle on when needed)
- ⭐ CRITICAL = Essential for EMC compliance checking

---

## 🎯 Recommended Workflow for EMC Analysis

### Phase 1: Initial Route Planning
**Enable:**
- ✅ 🚂 Railway Tracks (Spoorbaanhartlijn)
- ✅ 🏢 EV Gebouwen (Technical Rooms)
- ✅ ⚡ Aarding (Earthing Points)

**Goal:**  
Identify safe corridors that maintain clearances from technical rooms and existing earthing infrastructure.

---

### Phase 2: Detailed Route Design
**Enable:**
- ✅ All Phase 1 layers
- ✅ 📍 Tracé (Cable Routes) - see existing cables
- ✅ 🏗️ Structures & Buildings - identify physical constraints

**Goal:**  
Refine route to avoid conflicts with existing infrastructure while maintaining EMC clearances.

---

### Phase 3: Joint Location Planning
**Enable:**
- ✅ All previous layers
- ✅ 🛤️ Track Sections - for precise track geometry
- ✅ 🔀 Switches - joints can't be near switches

**Goal:**  
Mark planned joint/earthing locations ensuring they're ≥31m from all tracks.

---

### Phase 4: Compliance Validation
**Action:**  
Run EMC evaluator → Check all 8 criteria → Generate compliance report

**Result:**  
Pass/Fail for each criterion with specific measurements and recommendations.

---

## 🚀 Next Development Steps

### 1. Implement Spatial Queries (HIGH PRIORITY)

**File:** `src/utils/emcEvaluator.js`

**Tasks:**
```javascript
// Add function to query technical rooms within buffer
async function queryTechnicalRooms(routeGeometry, bufferDistance = 20) {
  const evGebouwenLayer = map.findLayerById('ev-gebouwen');
  // Create buffer around route
  // Query features within buffer
  // Return nearest distance
}

// Add function to calculate earthing point distances
async function checkEarthingClearances(earthingPoints, trackLayer) {
  // For each earthing point
  // Find nearest track centerline
  // Calculate distance
  // Return violations (distance < 31m)
}
```

---

### 2. Add Buffer Visualization (MEDIUM PRIORITY)

**File:** `src/main.js` or new `src/utils/bufferVisualizer.js`

**Features:**
- Generate 20m buffer polygons around technical rooms
- Generate 31m buffer zones along track centerlines
- Display buffers with semi-transparent fills
- Color-code: green = safe, red = violation zone
- Toggle buffer visibility on/off

---

### 3. Joint Location Marking UI (MEDIUM PRIORITY)

**File:** `src/main.js` - extend drawing tools

**Features:**
- Add "Mark Joint" tool to drawing manager
- Click on route to add joint/earthing marker
- Store joint locations in route metadata
- Display joints as special symbols on map
- Auto-calculate distance to nearest track

---

### 4. Enhanced Metadata Form (LOW PRIORITY)

**File:** `src/main.js` - route metadata form

**Add Fields:**
- Joint locations (array of {x, y} coordinates)
- Joint type (dropdown: earthing / splice / termination)
- Conduit specifications
- Cable manufacturer/type
- Installation date (planned)

---

## 📝 Technical Notes

### Sublayer Access
The layers use the format:
```
https://...MapServer/[sublayer_id]
```

Where `sublayer_id` is the numeric index of the specific sublayer. To find sublayer IDs:
1. Visit the MapServer URL in a browser
2. View the layer list
3. Note the ID number of the layer you need

**Example:**
- Full service: `.../Energievoorzieningsysteem_005/MapServer`
- EV Gebouwen sublayer: `.../Energievoorzieningsysteem_005/MapServer/5`

### MapImageLayer vs FeatureLayer
These layers are configured as `layerType: 'map-image'` because they're sublayers of MapServer services. For more advanced querying and editing, you may need to convert them to FeatureLayers or use the Query API.

### Spatial Reference
All ProRail data uses **RD New (EPSG:28992)**. The application handles coordinate transformation automatically.

---

## 📞 Support & Resources

- **ProRail RLN00398**: Complete EMC policy document
- **ArcGIS MapServer Documentation**: https://developers.arcgis.com/rest/services-reference/enterprise/map-service.htm
- **Geometry Engine API**: For buffer and intersection operations
- **Query API**: For spatial queries against layers

---

**Last Updated:** October 8, 2025  
**Status:** Layers configured ✅ | Spatial analysis TODO 🔄  
**Next Milestone:** Implement automated distance calculations
