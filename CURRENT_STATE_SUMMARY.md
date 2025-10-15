# ProRail Cable Route Evaluator - Current State Summary

**Date:** October 15, 2025  
**Project:** ProRail RLN Check (EMC Compliance Tool)  
**Purpose:** For developer review regarding route reporting requirements

---

## 🎯 Overview

The **ProRail Cable Route Evaluator** is a web-based GIS application for planning and evaluating cable and overhead line routes along railway infrastructure. It validates routes against EMC (Electromagnetic Compatibility) compliance rules from the RLN00398 standard.

---

## 🏗️ Technology Stack

- **Frontend Framework:** Vanilla JavaScript (ES6+)
- **GIS Library:** ArcGIS Maps SDK for JavaScript 4.32+
- **Build Tool:** Vite 7.1.9
- **UI Components:** Calcite Components 3.3.2
- **Map Data Source:** ProRail ArcGIS FeatureServer
- **Spatial Reference:** RD New (EPSG:28992) for calculations, Web Mercator (102100) for display

---

## 📁 Project Structure

```
cable-route-evaluator/
├── src/
│   ├── main.js                    # Main application entry point
│   ├── config.js                  # API keys & configuration
│   ├── style.css                  # Application styles
│   ├── i18n/
│   │   └── translations.js        # Dutch/English translations
│   ├── layers/
│   │   ├── layerConfig.js         # Layer definitions & metadata
│   │   └── layerFactory.js        # Layer creation & loading
│   └── utils/
│       ├── EnhancedDrawingManager.js   # Route drawing & editing
│       ├── emcEvaluator.js             # EMC rule evaluation engine
│       ├── spatialQueries.js           # GIS spatial analysis
│       ├── bufferVisualizer.js         # Buffer zone visualization
│       ├── jointManager.js             # Joint/earthing point management
│       ├── assetPointManager.js        # Asset point tracking & validation
│       └── drawingUtils.js             # Drawing utilities
├── index.html                     # Main HTML file
└── package.json                   # Dependencies
```

---

## 🗺️ Core Features

### 1. **Interactive Route Drawing**
- Click-to-draw polyline routes on map
- Real-time length calculation
- Multi-route support with color-coding
- Edit mode: click points to reposition them
- Visual feedback with distance annotations every ~650m

### 2. **Multi-Language Support (NL/EN)**
- Complete Dutch and English translations
- Toggle button in top-right corner
- UI labels, tooltips, and messages fully translated

### 3. **Route Types**
Currently supports two infrastructure types:
- **Cable Routes** (Kabelroutes)
- **Overhead Lines** (Bovenleidingen)

### 4. **EMC Compliance Evaluation**

Routes are automatically evaluated against **10 EMC rules** from RLN00398:

#### Cable Route Rules (7 applicable):
1. ✅ **Power Lines**: Stay ≥31m from high-voltage power lines
2. ✅ **Parallel Routes**: Limit parallel sections to ≤1000m
3. ✅ **Technical Rooms**: Route must pass within 1000m of technical rooms
4. ✅ **AC Traction**: Keep ≥5m from AC traction power systems
5. ⏳ **Joints/Earthing**: Must place joints ≥31m from track centerline (user must mark)
6. ✅ **Track Parallel**: Limit track-parallel sections to ≤200m
7. ✅ **Level Crossings**: Avoid level crossings (keep ≥15m buffer)

#### Overhead Line Rules (3 additional):
8. ⏳ **Mast Placement**: Masts must be ≥31m from track centerline (user must mark)
9. ✅ **Fault Clearing**: Based on voltage and clearing time parameters
10. ✅ **Adjacent Tracks**: Distance requirements based on track characteristics

**Rule Status:**
- ✅ **Pass** - Complies with rule
- ❌ **Fail** - Violates rule (details shown)
- ⏳ **Pending** - User action required (e.g., mark joints)
- ➖ **N/A** - Not applicable to this route type

### 5. **Joint & Earthing Point Management**

**Current Capability:**
- Interactive mode to mark joints/earthing points on cable routes
- Click-to-place functionality
- Snap points to route geometry
- Validate distance to nearest track (must be ≥31m)
- Visual markers with compliance indicators:
  - 🟢 Green = Compliant (≥31m from track)
  - 🔴 Red = Non-compliant (<31m from track)
- Automatic re-snapping when route is edited
- Shows chainage (distance from route start) for each point

**Workflow:**
1. Create a cable route
2. Click "Mark Joints/Earthing" button
3. Click along the route to place points
4. System validates each point against nearest track
5. Evaluation updates automatically

### 6. **Visual Feedback Systems**

#### Buffer Zones
- Configurable buffer visualization around routes
- Default: 31m buffer (minimum safe distance)
- Color-coded by compliance status
- Can be toggled on/off per route

#### Distance Annotations
- Automatic distance markers along route
- Shows cumulative distance from start
- ~650m spacing (20 samples per route)
- Updates when route is edited

#### Route Color-Coding
- **Blue (#2563eb)** - Route 1
- **Green (#16a34a)** - Route 2
- **Purple (#9333ea)** - Route 3
- **Orange (#ea580c)** - Route 4
- **Pink (#db2777)** - Route 5+

### 7. **Layer Management**

**ProRail Data Layers (14 layers):**
- 📍 Tracé (Cable Routes) - 645 features
- 🔧 Kokertracé (Conduit Routes) - 11,544 features
- ⚡ Aarding (Earthing Points) - 360,338 features
- 🏢 EV Gebouwen (Technical Rooms) - 60,495 features
- 🏗️ Structures & Buildings - 12 features
- 🚂 Railway Tracks (Spoorbaanhartlijn) - 615 features
- 🛤️ Track Sections (Spoortakdeel) - 11,058 features
- 🚉 Stations - 425 features
- ⚠️ Level Crossings (Overweg) - 3,936 features
- 🔀 Switches (Wissel) - 7,379 features

**MapImageLayers (Dynamic):**
- ⚡ Energy Supply System (8 sublayers)
- 🚦 Train Protection System (46 sublayers)
- 🔌 Cable Situation (22 sublayers)
- 🔧 Other Track Objects (21 sublayers)
- 📏 Track Asset Distances (1 sublayer)

**User Drawing Layers:**
- 📍 Cable Routes (user-drawn routes)
- 📍 Buffer Zones (validation buffers)
- 📏 Distance Annotations (distance markers)
- 🎯 Asset Points (joints, masts, earthing)

---

## 💾 Data Storage

### Route Data Structure
```javascript
{
  id: "route-1760477186419-h3nmbdwo0",  // Unique identifier
  name: "Route 1",                       // Display name
  geometry: Polyline,                    // ArcGIS Polyline geometry
  length: 13036.2,                       // Length in meters
  created: "2025-10-14T21:26:26.420Z",  // ISO timestamp
  infrastructureType: "cable",           // "cable" or "overhead"
  voltageKv: 20,                         // Voltage (kV)
  faultClearingTimeMs: 100,              // Fault clearing time (ms)
  color: "#2563eb",                      // Route color
  evaluation: {                          // EMC evaluation results
    status: "pass",                      // "pass", "fail", "incomplete", "pending"
    passCount: 4,
    failCount: 0,
    pendingCount: 0,
    notApplicableCount: 3,
    rules: [...]                         // Detailed rule results
  }
}
```

### Asset Point Data Structure
```javascript
{
  id: "joint-1760477500000-abc123",     // Unique identifier
  routeId: "route-1760477186419-...",   // Parent route ID
  type: "joint",                         // "joint", "earthing", "mast"
  chainageMeters: 1250.5,                // Distance from route start (m)
  geometry: Point,                       // ArcGIS Point geometry
  distanceToTrackMeters: 45.2,           // Distance to nearest track (m)
  nearestTrackId: "track-12345",         // Nearest track feature ID
  compliant: true,                       // Meets ≥31m requirement
  created: "2025-10-14T21:30:00.000Z"   // ISO timestamp
}
```

---

## 🎨 User Interface

### Left Panel - Drawing Controls
- **New Route** button
- **Route type** selector (Cable/Overhead)
- **Voltage** input (kV)
- **Fault clearing time** input (ms)
- **Instructions** panel with step-by-step guidance

### Right Panel - Route List
- List of all drawn routes
- Color-coded route indicators
- Route metadata (name, length, type)
- Per-route actions:
  - 📏 Show/hide buffer
  - ✏️ Edit route
  - 🎯 Mark joints/earthing (cable routes only)
  - ♻️ Re-evaluate
  - 🗑️ Delete route
  - 🎨 Change color
- Compliance status badges
- Expandable evaluation details

### Top Bar
- Application title: "ProRail Cable Route Evaluator"
- Language toggle (NL/EN)
- Help button (?)

### Map View
- Interactive ArcGIS map
- ProRail basemap (streets)
- Layer legend (bottom-left)
- Zoom controls
- Scale bar
- Coordinate display

---

## 🔧 Recent Technical Updates

### October 14, 2025 - Projection API Migration
**Issue:** Deprecated `esri.geometry.projection` module  
**Solution:** Migrated to `esri.geometry.operators.projectOperator`

**Changes:**
- Updated imports in `main.js` and `assetPointManager.js`
- Changed `projection.project()` → `projectOperator.execute()`
- Fixed joint placement click handler
- Eliminated deprecation warnings

### Key Technical Details
- Projection engine loads on application start
- All spatial calculations use RD New (EPSG:28992)
- Display coordinate system is Web Mercator (102100)
- Automatic coordinate transformation when needed

---

## 📊 Current Limitations & Known Issues

1. **No Report Generation**
   - Routes and evaluations are only visible in UI
   - No PDF/document export capability
   - No printable summary
   - No data export (JSON, CSV, etc.)

2. **No Persistence**
   - Routes are lost on page refresh
   - No save/load functionality
   - No project management

3. **Limited Metadata**
   - No project name/description
   - No user/author tracking
   - No version control
   - No modification history

4. **Joint/Mast Management**
   - Manual placement only (no auto-suggestion)
   - No spacing validation between joints
   - No joint type differentiation
   - Limited edit capabilities

5. **Performance**
   - Large routes (>50 points) may slow down
   - No route simplification
   - All evaluations recalculate fully

---

## 🎯 DEVELOPER TASK: Report Requirements Analysis

### What We Need From You

Please review the application and **recommend what information should be included in a route evaluation report**. Consider:

### 1. **Report Metadata**
- Project information (name, description, date, author)
- Report generation timestamp
- Application version
- Data source version/timestamp

### 2. **Route Information**
For each route, what should be documented?
- Basic properties (name, length, type, voltage, etc.)
- Geometry data (coordinates, waypoints)
- Creation/modification timestamps
- Visual elements (map snapshots, route profile)

### 3. **Compliance Evaluation Results**
- Overall compliance status (pass/fail/incomplete)
- Individual rule results with details
- Failure explanations and recommendations
- Severity levels for violations
- Visual indicators (color-coding, icons)

### 4. **Spatial Analysis Data**
- Buffer zones and intersections
- Distance measurements to critical infrastructure
- Parallel route sections (with track names/IDs)
- Proximity to technical rooms, crossings, etc.

### 5. **Asset Points (Joints/Masts/Earthing)**
- Location and chainage of each point
- Compliance status (distance to track)
- Nearest track information
- Visual markers on map

### 6. **Comparative Analysis** (if multiple routes)
- Side-by-side comparison table
- Recommended route with justification
- Cost/benefit considerations
- Risk assessment

### 7. **Visualizations**
- Route map with layers
- Buffer zones
- Violation areas highlighted
- Distance annotations
- Legend and scale

### 8. **Export Formats**
- PDF report (printable)
- Excel/CSV data export
- JSON data export (for archival)
- Map image exports

### 9. **Regulatory Compliance**
- Reference to RLN00398 standard sections
- Audit trail for compliance verification
- Sign-off/approval workflow considerations

### 10. **Additional Considerations**
- Multi-language support (NL/EN)
- Company branding/logo
- Page layout and formatting
- Accessibility requirements

---

## 📝 Deliverable

Please provide:

1. **Prioritized list** of report sections (must-have vs. nice-to-have)
2. **Sample report structure/outline** (can be sketch/mockup)
3. **Data fields** needed for each section
4. **Format preferences** (PDF layout, Excel templates, etc.)
5. **Any regulatory requirements** from ProRail or industry standards

Once we have your recommendations, we'll integrate report generation capabilities into the application.

---

## 🔗 Key Files for Reference

- **UI Layout:** `index.html`
- **Main Logic:** `src/main.js`
- **Evaluation Engine:** `src/utils/emcEvaluator.js`
- **Route Management:** `src/utils/EnhancedDrawingManager.js`
- **Asset Management:** `src/utils/assetPointManager.js`
- **Translations:** `src/i18n/translations.js`

---

## 🚀 How to Run Locally

```bash
cd cable-route-evaluator
npm install
npm run dev
```

Access at: http://localhost:3000/

---

**Questions?** Contact the development team for clarification on any features or technical details.
