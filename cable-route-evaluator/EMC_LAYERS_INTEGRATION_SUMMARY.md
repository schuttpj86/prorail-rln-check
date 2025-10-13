# EMC Layers Integration - Summary

## ✅ What Was Added

### New Sublayers for EMC Compliance Analysis

I've added **5 new specific sublayers** to support the EMC compliance rules you described:

#### 1. 🏢 EV Gebouwen (Technical Rooms) - **CRITICAL**
- **Purpose:** Support the 20m clearance rule (RLN00398 §4.8/§5.6)
- **Source:** Energievoorzieningsysteem_005/MapServer/5
- **Visibility:** ✅ ON by default
- **Contains:** Substations, switching stations, autotransformer stations
- **Rule:** No HV infrastructure within 20m of these buildings

#### 2. ⚡ Aarding (Earthing Points) - **CRITICAL**
- **Purpose:** Support the 31m clearance rule (RLN00398 §5.8)
- **Source:** Kabelsituatie_002/MapServer/0
- **Visibility:** ✅ ON by default
- **Contains:** Existing earthing points for cables
- **Rule:** Joints and earthing must be ≥31m from track centerline

#### 3. 📍 Tracé (Existing HV Cable Routes)
- **Purpose:** Identify existing HV infrastructure
- **Source:** Kabelsituatie_002/MapServer/18
- **Visibility:** ❌ OFF (toggle on when needed)
- **Contains:** Existing high-voltage cable routes
- **Use:** Understand existing infrastructure, identify conflicts

#### 4. 🔧 Kokertracé (Conduit Routes)
- **Purpose:** Understand cable conduit infrastructure
- **Source:** Kabelsituatie_002/MapServer/13
- **Visibility:** ❌ OFF (toggle on when needed)
- **Contains:** Cable conduit/duct routes
- **Use:** Plan cable installations, understand layout

#### 5. ⚡ Energy Supply System (All) - **Renamed**
- **Purpose:** General overview of all overhead-line infrastructure
- **Source:** Energievoorzieningsysteem_005/MapServer (full service)
- **Visibility:** ❌ OFF
- **Note:** Renamed from "Energy Supply System" to "Energy Supply System (All)" to distinguish from specific sublayers

---

## 📁 Files Modified

### 1. `src/layers/layerConfig.js`

**Changes:**
- ✅ Expanded `energySupplyLayers` array from 1 to 2 layers
  - Added `ev-gebouwen` sublayer (technical rooms) ⭐ CRITICAL
  - Renamed original layer to `energy-supply-full`
  
- ✅ Expanded `cableSituationLayers` array from 1 to 4 layers
  - Added `aarding` sublayer (earthing points) ⭐ CRITICAL
  - Added `cable-trace` sublayer (existing HV cables)
  - Added `koker-trace` sublayer (conduit routes)
  - Renamed original layer to `cable-situation-full`

**Special Features Added:**
```javascript
emcAnalysis: {
  purpose: 'technical-rooms',
  rule: 'No HV infrastructure within 20m of technical rooms',
  clause: 'RLN00398 §4.8 / §5.6'
}
```
This metadata helps the EMC evaluator identify which layers to use for specific compliance checks.

---

## 🎨 Visual Styling

### EV Gebouwen (Technical Rooms)
- Type: Polygons (building footprints)
- Default styling applied by MapServer
- Recommendation: Style with orange/yellow fill for high visibility

### Aarding (Earthing Points)
- Type: Point markers
- Symbol: Orange circles (8px) with red outline (2px)
- High visibility for safety-critical infrastructure

### Tracé (Cable Routes)
- Type: Lines
- Symbol: Red solid lines (3px, 70% opacity)
- Clearly visible against basemap

### Kokertracé (Conduits)
- Type: Lines
- Symbol: Gray dashed lines (2px, 60% opacity)
- Subtle to avoid visual clutter

---

## 🗺️ How to Use

### Viewing the New Layers

1. **Open the application** (if not already running):
   ```powershell
   cd "c:\Users\PESCHU\DNV\EFT DNV GL - Documents\General\AI\Prorail-RLN\cable-route-evaluator"
   npm run dev
   ```

2. **Open the Layer List** (top-right corner of map)

3. **Navigate to layer groups:**
   - Expand **⚡ Energy Supply System**
     - You'll see: "Energy Supply System (All)" and "🏢 EV Gebouwen (Technical Rooms)"
   - Expand **🔌 Cable Situation**
     - You'll see 4 layers including "⚡ Aarding (Earthing Points)"

4. **Toggle layers on/off** as needed for your analysis

---

## 🎯 EMC Compliance Workflow

### Step 1: Enable Critical Layers
When starting a new route:
- ✅ Enable **🏢 EV Gebouwen** (should be on by default)
- ✅ Enable **⚡ Aarding** (should be on by default)
- ✅ Enable **🚂 Railway Tracks**

### Step 2: Draw Route
- Use the drawing tools to create your cable route
- Visually check clearances from technical rooms and earthing points
- Avoid orange building polygons (20m buffer zone conceptually)

### Step 3: Validate Clearances
**Current Status:** Manual visual inspection  
**Future:** Automated spatial analysis will:
- Calculate exact distance to nearest technical room
- Calculate exact distance from joints/earthing to tracks
- Report Pass/Fail for each rule

---

## 🚀 Next Steps for Full Automation

To enable **automated** EMC compliance checking, we need to implement:

### 1. Spatial Query Functions (Priority: HIGH)

**Location:** `src/utils/emcEvaluator.js`

Add functions to:
```javascript
// Query technical rooms within 20m of route
async function checkTechnicalRoomClearance(routeGeometry) {
  const buffer = geometryEngine.buffer(routeGeometry, 20, 'meters');
  const query = evGebouwenLayer.createQuery();
  query.geometry = buffer;
  query.spatialRelationship = 'intersects';
  const results = await evGebouwenLayer.queryFeatures(query);
  // Calculate minimum distance
  // Return pass/fail + distance
}

// Calculate distance from earthing points to tracks
async function checkEarthingClearances(routeGeometry) {
  // Get earthing points along route
  // For each point, find nearest track
  // Calculate distance
  // Flag violations (< 31m)
}
```

### 2. Buffer Visualization (Priority: MEDIUM)

**Location:** New file `src/utils/bufferVisualizer.js`

Add ability to:
- Generate 20m buffer polygons around technical rooms
- Generate 31m buffer zones along track centerlines
- Display on map with color-coding (green=safe, red=violation)
- Toggle buffer visibility

### 3. Joint Marking UI (Priority: MEDIUM)

**Location:** Extend `src/utils/EnhancedDrawingManager.js`

Add features:
- "Mark Joint" tool
- Click on route to place joint/earthing markers
- Store joint locations in route metadata
- Auto-calculate distance to nearest track
- Visual feedback if joint is too close to track (<31m)

---

## 📊 Current vs. Future State

### Current State ✅
- ✅ Critical layers configured and visible
- ✅ Data sources connected
- ✅ Manual visual inspection possible
- ✅ Layers properly organized in Layer List
- ✅ EMC evaluator accepts metadata (voltageKv, minJointDistanceMeters, etc.)

### Future State 🔄 (TODO)
- 🔄 Automated spatial queries
- 🔄 Real-time distance calculations
- 🔄 Buffer zone visualization
- 🔄 Joint marking and validation
- 🔄 Automated compliance report generation
- 🔄 Visual highlighting of violations

---

## 📖 Documentation

Two comprehensive guides have been created:

1. **`EMC_ANALYSIS_LAYERS.md`** (397 lines)
   - Complete reference for all EMC-related layers
   - Detailed usage instructions
   - Implementation roadmap
   - Technical notes and best practices

2. **This file** (`EMC_LAYERS_INTEGRATION_SUMMARY.md`)
   - Quick summary of changes
   - How to use the new layers
   - Next steps for automation

---

## 🎓 Understanding the Two Key Rules

### Rule 1: No HV Infrastructure within 20m of Technical Rooms
**RLN00398 §4.8 / §5.6**

**What it means:**  
High-voltage cables and overhead lines must stay at least 20 meters away from technical rooms (substations, switching stations, autotransformer stations).

**Why:**  
- Prevents electromagnetic interference with sensitive control equipment
- Reduces risk of induced currents
- Safety margin for maintenance and emergencies

**How to check:**
1. Identify all technical rooms near route (🏢 EV Gebouwen layer)
2. Create 20m buffer around each room
3. Ensure route doesn't enter buffer zones

**Implementation:**  
Currently visual inspection, automation planned.

---

### Rule 2: Joints and Earthing ≥31m from Track
**RLN00398 §5.8**

**What it means:**  
Cable joints and earthing points must be located at least 31 meters from the outermost track centerline.

**Why:**  
- Joints are potential EMI sources
- Earthing creates ground loops that can couple with track circuits
- 31m = 20m standard clearance + 11m additional safety margin

**How to check:**
1. Identify all joint/earthing locations (⚡ Aarding layer + planned joints)
2. Find nearest track centerline (🚂 Railway Tracks layer)
3. Measure distance (must be ≥31m)

**Implementation:**  
Currently requires manual measurement, automation planned.

---

## ✨ What You Can Do Right Now

1. **Visual Analysis:**
   - Draw a route and see technical rooms (orange polygons)
   - See existing earthing points (orange markers)
   - Identify areas where clearances might be tight

2. **Route Planning:**
   - Use the new layers to plan safer routes
   - Avoid technical rooms by 20m+ margin
   - Plan joint locations away from tracks (31m+ margin)

3. **Data Exploration:**
   - Click on technical rooms to see details
   - Click on earthing points to understand existing infrastructure
   - Toggle different layers to understand the complete picture

4. **Compliance Documentation:**
   - Screenshot routes with layers visible
   - Manually measure and document clearances
   - Use as input for formal EMC compliance reports

---

## 🐛 Troubleshooting

### Layers Not Showing?
- Check zoom level (some layers only appear at certain scales)
- Check Layer List - ensure layers are toggled ON
- Check console for loading errors

### Can't See Technical Rooms?
- Zoom in closer (minScale: 100,000)
- Check if layer is ON in Layer List
- Some areas may not have technical room data

### Earthing Points Not Visible?
- Zoom in to at least 1:25,000 scale
- Check if Aarding layer is ON
- Orange circular markers should be visible

---

## 📞 Questions?

Refer to:
- **`EMC_ANALYSIS_LAYERS.md`** for detailed documentation
- **`PRORAIL_DATASETS.md`** for complete data source reference
- **`DEVELOPMENT_ROADMAP.md`** for planned enhancements

---

**Last Updated:** October 8, 2025  
**Status:** ✅ Layers integrated and visible  
**Next Milestone:** Implement automated spatial analysis
