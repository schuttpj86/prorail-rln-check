# System Architecture

**Application:** ProRail RLN00398-V004 EMC Evaluator  
**Version:** 1.0.0  
**Last Updated:** November 2025

---

## 📐 Overview

The ProRail EMC Evaluator is a single-page application (SPA) built with modern web technologies, focusing on clean architecture, modularity, and maintainability.

### Design Principles

1. **Configuration-Driven** - EMC rules defined in config files, not hardcoded
2. **Modular Components** - Clear separation of concerns
3. **Version Isolation** - V001/V004 implementations completely separate
4. **Reusable Utilities** - Shared geometry and GIS functions
5. **Standards-Based** - Direct mapping to RLN00398 standard structure

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  (index.html + Calcite Components)                              │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Routes    │  │    Tools    │  │   Results   │            │
│  │    Panel    │  │    Panel    │  │    Panel    │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
┌─────────┴─────────────────┴─────────────────┴──────────────────┐
│                      APPLICATION CORE                            │
│                       (src/main.js)                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Event Handlers & Orchestration               │  │
│  │  • Route Creation    • Map Interactions                  │  │
│  │  • Evaluation        • Import/Export                      │  │
│  │  • UI Updates        • Language Switching                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬──────────────┬──────────────┬───────────────┬─────────┘
         │              │              │               │
    ┌────┴────┐    ┌───┴───┐     ┌───┴────┐    ┌────┴─────┐
    │ Drawing │    │  EMC  │     │  GIS   │    │  i18n    │
    │ Manager │    │ Eval  │     │ Layers │    │ Manager  │
    └────┬────┘    └───┬───┘     └───┬────┘    └────┬─────┘
         │             │             │              │
┌────────┴─────────────┴─────────────┴──────────────┴─────────────┐
│                      UTILITY LAYER                               │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  V004 Evaluator  │  │ Spatial Queries  │  │   Geometry    │ │
│  │  ┌──────────┐    │  │  • Buffer        │  │   Utils       │ │
│  │  │Flowchart │    │  │  • Intersection  │  │  • Distance   │ │
│  │  │  Logic   │    │  │  • Query Layers  │  │  • Angle      │ │
│  │  └──────────┘    │  │                  │  │  • Geodesic   │ │
│  │  ┌──────────┐    │  └──────────────────┘  └───────────────┘ │
│  │  │ Report   │    │                                            │
│  │  │Generator │    │  ┌──────────────────┐  ┌───────────────┐ │
│  │  └──────────┘    │  │   Route I/O      │  │ Measurement   │ │
│  └──────────────────┘  │  • Import        │  │    Tool       │ │
│                        │  • Export        │  │               │ │
│  ┌──────────────────┐  │  • Validation    │  └───────────────┘ │
│  │  Joint Manager   │  └──────────────────┘                     │
│  │  • Add/Remove    │                                            │
│  │  • Visualization │  ┌──────────────────┐                     │
│  └──────────────────┘  │  Report Export   │                     │
│                        │  • Markdown      │                     │
│                        │  • Comparative   │                     │
│                        └──────────────────┘                     │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│                    CONFIGURATION LAYER                            │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  config.v4.js    │  │  Layer Config    │  │  Translations │ │
│  │  • Thresholds    │  │  • ProRail WMS   │  │  • NL / EN    │ │
│  │  • Flowchart     │  │  • Basemaps      │  │               │ │
│  │  • Criteria      │  │  • Symbology     │  │               │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
└───────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            ArcGIS Maps SDK for JavaScript                   │ │
│  │  • Map Display      • Spatial Analysis                     │ │
│  │  • Drawing Tools    • Coordinate Systems                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              ProRail WMS Services                           │ │
│  │  • Spoortak (Tracks)    • Technical Rooms                  │ │
│  │  • Overhead Lines       • Infrastructure Zones             │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Core Components

### 1. Application Core (`src/main.js`)

**Responsibilities:**
- Application initialization
- ArcGIS map setup
- Event handling and routing
- UI state management
- Orchestration of all components

**Key Functions:**
```javascript
initializeApp()       // Main entry point
setupMap()            // Create ArcGIS map and view
setupUI()             // Initialize Calcite components
handleRouteCreation() // Route drawing workflow
handleEvaluation()    // Trigger EMC assessment
```

### 2. V004 Evaluator (`src/utils/v4/flowchartEvaluator.js`)

**Responsibilities:**
- Implement RLN00398-V004 flowchart logic
- Sequential filtering through Steps A-F
- Decision tree evaluation
- Result aggregation

**Architecture:**
```javascript
evaluateRouteV4(route, options)
  ├─→ Step A: Basic Requirements
  ├─→ Step B: Distance/Parallel Checks
  ├─→ Step C: Unity Study Assessment
  ├─→ Step D: Detail Study Requirements
  └─→ Steps E/F: Mitigation Recommendations
```

### 3. Spatial Queries (`src/utils/spatialQueries.js`)

**Responsibilities:**
- Query ProRail WMS layers
- Buffer and intersection analysis
- Distance calculations
- Feature attribute extraction

**Key Functions:**
```javascript
queryTracksNearRoute(route, buffer)
queryTechnicalRooms(route, buffer)
queryCrossings(route)
measureDistances(route, features)
```

### 4. Geometry Utilities (`src/utils/shared/geometryUtils.js`)

**Responsibilities:**
- Geodesic distance calculations
- Crossing angle computation
- Coordinate transformations
- Geometric validation

**Key Functions:**
```javascript
calculateGeodesicDistance(point1, point2)
calculateCrossingAngle(line1, line2)
isParallelTo(route, track, threshold)
transformCoordinates(geometry, fromSR, toSR)
```

### 5. Drawing Manager (`src/utils/drawingUtils.js`)

**Responsibilities:**
- Interactive route drawing
- Edit/delete operations
- Symbology management
- Graphic layer management

### 6. Report Generator (`src/utils/v4/reportGenerator.js`)

**Responsibilities:**
- Generate V004-compliant reports
- Format evaluation results
- Apply report templates (Bijlage 3 & 4)
- Markdown formatting

---

## 📊 Data Flow

### Route Evaluation Flow

```
User Draws Route
     ↓
Geometry Created (ArcGIS Graphic)
     ↓
Convert to GeoJSON
     ↓
Add Route Metadata (voltage, type, config)
     ↓
Trigger Evaluation
     ↓
┌──────────────────┐
│ V004 Evaluator   │
│                  │
│ Step A ───────→  │  Query Basic Requirements
│   ↓              │  (voltage, clearance, faults)
│ Step B ───────→  │  Query Infrastructure
│   ↓              │  (tracks, rooms, parallel runs)
│ Step C ───────→  │  Assess Unity Study Needs
│   ↓              │  (existing connections)
│ Step D ───────→  │  Determine Detail Study
│   ↓              │  (thresholds, validation)
│ Step E/F ─────→  │  Mitigation Recommendations
└──────────────────┘
     ↓
Aggregate Results
     ↓
Generate Report
     ↓
Display in UI
```

### Layer Query Flow

```
Route Geometry
     ↓
Define Buffer (e.g., 700m, 31m, 11m)
     ↓
Create Query Geometry
     ↓
Query WMS Layer
     ↓
Filter Results (spatial + attribute)
     ↓
Extract Features
     ↓
Calculate Distances/Angles
     ↓
Return Structured Data
```

---

## 🗂️ File Organization

### By Functionality

```
src/
├── main.js                    # Entry point + orchestration
├── style.css                  # Global styles
├── config.v4.js              # V004 configuration
│
├── i18n/                     # Internationalization
│   ├── en.js                 # English translations
│   ├── nl.js                 # Dutch translations
│   └── i18n.js              # i18n manager
│
├── layers/                   # GIS layer configuration
│   ├── baseConfig.js        # Base map settings
│   └── layerConfig.js       # ProRail layers
│
└── utils/                    # Utility functions
    ├── v4/                   # V004 implementation
    │   ├── flowchartEvaluator.js
    │   └── reportGenerator.js
    │
    ├── shared/               # Reusable across versions
    │   └── geometryUtils.js
    │
    ├── drawingUtils.js       # Route drawing
    ├── spatialQueries.js     # GIS queries
    ├── routeImporter.js      # Import from GeoJSON
    ├── routeExporter.js      # Export to JSON
    ├── reportExporter.js     # Comparative reports
    ├── measurementTool.js    # Distance measurement
    └── jointManager.js       # Cable joint management
```

---

## 🔌 External Dependencies

### Core Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `@arcgis/core` | 4.33 | GIS mapping and spatial analysis |
| `@esri/calcite-components` | 3.2 | UI component library |
| `vite` | 7.0 | Build tool and dev server |

### ArcGIS Services

- **Coordinate System:** EPSG:28992 (RD New / Amersfoort)
- **ProRail WMS:** Track infrastructure, overhead lines, technical rooms
- **Basemap:** OpenStreetMap / ProRail custom basemap

---

## 🔐 Configuration Management

### Configuration Hierarchy

```
config.v4.js
├── standard                  # Standard metadata
│   ├── name: 'RLN00398'
│   ├── version: '004'
│   └── effectiveDate
│
├── flowchart                 # Flowchart thresholds
│   ├── stepA: { ... }
│   ├── stepB: { ... }
│   ├── stepC: { ... }
│   └── stepD: { ... }
│
├── spatial                   # GIS settings
│   ├── referenceSystem
│   ├── queryBuffers
│   └── trackGeometry
│
├── beoordelingsCriteria     # Assessment criteria
│   ├── commonMode_enkelbenig
│   ├── commonMode_dubbelbenig
│   ├── magneticFields
│   └── electricFields
│
└── modeling                  # Calculation parameters
    ├── ground
    ├── faults
    └── track
```

### Configuration Loading

1. Application starts → Load `config.v4.js`
2. Evaluator imports config → Use thresholds
3. UI queries config → Display options
4. Reports reference config → Document parameters used

---

## 🧪 Testing Strategy

### Component Testing

- **Unit Tests:** Geometry calculations, distance computations
- **Integration Tests:** Spatial queries, layer interactions
- **UI Tests:** User workflows, route creation, evaluation

### Test Data

- Sample routes (straight, curved, crossing)
- Mock ProRail layer responses
- Edge cases (parallel, perpendicular, tangent)

---

## 🚀 Deployment Architecture

### Development

```
localhost:3000
     ↓
Vite Dev Server
     ↓
Hot Module Replacement
     ↓
Browser
```

### Production

```
Static Build (npm run build)
     ↓
dist/
├── index.html
├── assets/
│   ├── index.[hash].js
│   └── index.[hash].css
     ↓
Deployed to Web Server
     ↓
Users Access via HTTPS
```

### Hosting Requirements

- **Static File Server** (Nginx, Apache, CDN)
- **HTTPS Required** (for ArcGIS API)
- **CORS Configuration** (for ProRail WMS)

---

## 📈 Performance Considerations

### Optimization Strategies

1. **Code Splitting** - ArcGIS SDK loaded separately
2. **Lazy Loading** - Load evaluation logic on demand
3. **Caching** - Cache WMS layer queries
4. **Debouncing** - Throttle real-time calculations
5. **Web Workers** - Offload heavy calculations (future)

### Performance Targets

- **Initial Load:** < 3 seconds
- **Route Drawing:** Real-time feedback
- **Evaluation:** < 2 seconds for typical route
- **Report Generation:** < 1 second

---

## 🔮 Future Architecture Enhancements

### Planned Improvements

1. **Backend API** - Python FastAPI for complex calculations
2. **Database** - Store routes and results
3. **Authentication** - User accounts and permissions
4. **Collaboration** - Multi-user editing
5. **Offline Mode** - Service worker + IndexedDB
6. **PDF Export** - Server-side report rendering

### Scalability Considerations

- Move heavy calculations to backend
- Implement caching strategy
- Add CDN for static assets
- Consider microservices for large-scale deployment

---

**Last Updated:** November 2025  
**Maintained By:** DNV Development Team
