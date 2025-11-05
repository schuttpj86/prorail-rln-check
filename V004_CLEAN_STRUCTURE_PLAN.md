# 🧹 V004 Clean Branch - Structure Plan

**Date:** November 5, 2025  
**Branch:** `feature/v004-clean`  
**Objective:** Create a minimal, production-ready V004 implementation with clean folder structure

---

## 🎯 Goals

1. ✅ Keep only essential Vite application files
2. ✅ Focus on V004 standard implementation (RLN00398-V004)
3. ✅ Remove all legacy V001/V002 code
4. ✅ Remove 30+ documentation markdown files from root
5. ✅ Clean, maintainable structure for future development
6. ✅ All necessary dependencies and configurations intact

---

## 📁 Target Folder Structure

```
prorail-rln-check/
├── .github/
│   └── instructions/
│       └── development-instructions.instructions.md    ✅ Keep (IDE instructions)
│
├── cable-route-evaluator/
│   ├── src/
│   │   ├── config.v4.js                               ✅ V004 configuration
│   │   ├── main.js                                     ✅ Application entry point
│   │   ├── style.css                                   ✅ Main styles
│   │   │
│   │   ├── i18n/                                       ✅ Translations (NL/EN)
│   │   │   ├── en.js
│   │   │   ├── nl.js
│   │   │   └── i18n.js
│   │   │
│   │   ├── layers/                                     ✅ ArcGIS layer configs
│   │   │   ├── baseConfig.js
│   │   │   ├── layerConfig.js
│   │   │   └── ... (other layer files)
│   │   │
│   │   ├── utils/
│   │   │   ├── v4/                                     ✅ V004 implementation ONLY
│   │   │   │   ├── flowchartEvaluator.js
│   │   │   │   └── reportGenerator.js
│   │   │   │
│   │   │   ├── shared/                                 ✅ Reusable utilities
│   │   │   │   └── geometryUtils.js
│   │   │   │
│   │   │   ├── drawingUtils.js                         ✅ Map drawing tools
│   │   │   ├── spatialQueries.js                       ✅ GIS queries
│   │   │   ├── routeImporter.js                        ✅ JSON import
│   │   │   ├── routeExporter.js                        ✅ JSON export
│   │   │   ├── reportExporter.js                       ✅ Report generation
│   │   │   ├── measurementTool.js                      ✅ Measurement widget
│   │   │   └── jointManager.js                         ✅ Cable joint management
│   │   │
│   │   └── image/                                      ✅ UI images (if any)
│   │
│   ├── index.html                                      ✅ Main HTML
│   ├── package.json                                    ✅ Dependencies
│   ├── vite.config.js                                  ✅ Vite configuration
│   ├── .gitignore                                      ✅ Git ignore rules
│   │
│   ├── README.md                                       ✅ V004 project documentation
│   └── docs/                                           ✅ NEW: Consolidated documentation
│       ├── ARCHITECTURE.md                             📝 System architecture
│       ├── V004_IMPLEMENTATION.md                      📝 V004 flowchart logic
│       ├── DEVELOPMENT_GUIDE.md                        📝 Developer guide
│       └── API_REFERENCE.md                            📝 API documentation
│
└── README.md                                           ✅ Root repository README

```

---

## 🗑️ Files & Folders to REMOVE

### Root Level (.md files - 30+ documentation files)
```
❌ ARCGIS_ONLINE_STYLE_INTEGRATION.md
❌ COMPREHENSIVE_DUTCH_TRANSLATION.md
❌ CURRENT_STATE_SUMMARY.md
❌ DEVELOPMENT_ROADMAP.md
❌ DISTANCE_CALCULATION_IMPROVEMENT.md
❌ DISTANCE_CALCULATION_VISUAL_GUIDE.md
❌ EVALUATION_UPDATE_FIX.md
❌ GEODESIC_CALCULATION_FIX.md
❌ GITHUB_PAGES_SETUP.md
❌ JOINT_EVALUATION_FIX.md
❌ JOINT_RESNAPPING_FEATURE.md
❌ LANGUAGE_TOGGLE_FEATURE.md
❌ MEASUREMENT_BUG_FIX_COMPLETE.md
❌ MEASUREMENT_FIX_SUMMARY.md
❌ MEASUREMENT_TOOL_CLARIFICATION.md
❌ MEASUREMENT_WIDGET_COMPLETE.md
❌ MEASUREMENT_WIDGET_FEATURE.md
❌ PRD.md
❌ PROFESSIONAL_UI_REDESIGN.md
❌ RLN00398-V001 eisen EMC spoor.md
❌ RLN00398-V002.md
❌ ROUTE_IMPORT_EXPORT_COMPLETE.md
❌ ROUTE_JSON_EXPORT_FEATURE.md
❌ ROUTE_STYLE_CUSTOMIZATION.md
❌ ROUTE_VISIBILITY_FEATURE.md
❌ SMART_JOINT_EVALUATION.md
❌ SPATIAL_REFERENCE_FIX.md
❌ STEP_1_JOINT_MANAGER.md
❌ STEP_2_VISUAL_MARKERS.md
❌ STEP_3_CLICK_TO_PLACE.md
❌ TRACE_COLOR_FEATURE.md
❌ TRACK_DISTANCE_COMPLETE_FIX.md
❌ TRACKS_LAYER_FIX.md
❌ UI_REORGANIZATION_COMPLETE.md
❌ UI_REORGANIZATION.md
❌ UNIFIED_TOOLS_WIDGET.md
```

### Root Level (other files)
```
❌ prorail-routes-2025-10-15.json
❌ Route_1.json
❌ jsapi-resources-main/ (entire folder)
❌ image/ (entire folder with subfolders)
```

### Cable-route-evaluator folder
```
❌ cable-route-evaluator/ADDING_LAYERS_GUIDE.md
❌ cable-route-evaluator/ARCHITECTURE_DIAGRAM.md
❌ cable-route-evaluator/BASELINE_COMPLETE.md
❌ cable-route-evaluator/CAD_TO_GEOJSON_GUIDE.md
❌ cable-route-evaluator/CROSSING_ANGLE_EXPLANATION.md
❌ cable-route-evaluator/CROSSING_VS_PARALLEL_RULES.md
❌ cable-route-evaluator/DISTANCE_ANNOTATION_FIX.md
❌ cable-route-evaluator/EMC_ANALYSIS_LAYERS.md
❌ cable-route-evaluator/EMC_LAYERS_INTEGRATION_SUMMARY.md
❌ cable-route-evaluator/IMPLEMENTATION_CHECKLIST.md
❌ cable-route-evaluator/INTEGRATION_COMPLETE.md
❌ cable-route-evaluator/LAYER_CHANGES_SUMMARY.md
❌ cable-route-evaluator/LAYER_FIX.md
❌ cable-route-evaluator/LAYER_ORGANIZATION.md
❌ cable-route-evaluator/MAPSERVER_FIX.md
❌ cable-route-evaluator/PROGRESS_SUMMARY.md
❌ cable-route-evaluator/PRORAIL_DATASETS.md
❌ cable-route-evaluator/ProRail-Comparative-Report-2025-10-15.md
❌ cable-route-evaluator/ProRail-Comparative-Report-2025-10-17 (1).md
❌ cable-route-evaluator/QGIS_QUICK_REFERENCE.md
❌ cable-route-evaluator/RLN00398_COMPARISON_CHART.md
❌ cable-route-evaluator/RLN00398_UPDATE_QUICK_REFERENCE.md
❌ cable-route-evaluator/RLN00398_V002_UPDATE_COMPLETE.md
❌ cable-route-evaluator/RLN00398_VERSION_UPDATE_PLAN.md
❌ cable-route-evaluator/STEP_1_BUFFER_TEST.md
❌ cable-route-evaluator/STEP_1_COMPLETE.md
❌ cable-route-evaluator/STEP_2_COMPLETE.md
❌ cable-route-evaluator/VERSION_CLARIFICATION_V004.md (move to docs/)
❌ cable-route-evaluator/Dockerfile
❌ cable-route-evaluator/Route_1.json
❌ cable-route-evaluator/examples/ (entire folder)
```

### Source files to remove
```
❌ src/config.js (V001 config - outdated)
❌ src/main_backup.js (backup file)
❌ src/utils/v1/ (entire folder - V001 legacy)
❌ src/utils/emcEvaluator.js (V001 evaluator - outdated)
❌ src/utils/V2_FRAMEWORK_README.md (outdated)
```

---

## ✅ Files to KEEP & Update

### Configuration Files
- ✅ `package.json` - Update description to V004
- ✅ `vite.config.js` - Keep as is
- ✅ `.gitignore` - Ensure comprehensive

### Application Core
- ✅ `index.html` - Update title/description for V004
- ✅ `src/main.js` - Update to import V004 evaluator only
- ✅ `src/style.css` - Keep all styles
- ✅ `src/config.v4.js` - Core V004 configuration

### V004 Implementation
- ✅ `src/utils/v4/flowchartEvaluator.js` - Main V004 logic
- ✅ `src/utils/v4/reportGenerator.js` - V004 report templates

### Supporting Utilities
- ✅ `src/utils/shared/geometryUtils.js` - Reusable functions
- ✅ `src/utils/drawingUtils.js` - Map drawing
- ✅ `src/utils/spatialQueries.js` - GIS queries
- ✅ `src/utils/routeImporter.js` - JSON import
- ✅ `src/utils/routeExporter.js` - JSON export
- ✅ `src/utils/reportExporter.js` - Report generation
- ✅ `src/utils/measurementTool.js` - Measurement widget
- ✅ `src/utils/jointManager.js` - Joint management
- ✅ `src/utils/EnhancedDrawingManager.js` - Drawing manager
- ✅ `src/utils/bufferVisualizer.js` - Buffer visualization
- ✅ `src/utils/assetPointManager.js` - Asset management

### Layers & i18n
- ✅ `src/layers/` - All layer configuration files
- ✅ `src/i18n/` - Translation files
- ✅ `src/image/` - If contains UI assets

---

## 📝 New Documentation Structure

Create consolidated documentation in `cable-route-evaluator/docs/`:

### 1. ARCHITECTURE.md
- System overview
- Component diagram
- Data flow
- Technology stack

### 2. V004_IMPLEMENTATION.md
- RLN00398-V004 standard overview
- Flowchart logic (Steps A-F)
- Assessment criteria
- Calculation methods

### 3. DEVELOPMENT_GUIDE.md
- Setup instructions
- How to run locally
- How to add features
- Testing procedures
- Deployment guide

### 4. API_REFERENCE.md
- Configuration API
- Evaluator API
- Utility functions
- Event handlers

---

## 🔧 Update Tasks

### 1. Update `package.json`
```json
{
  "name": "prorail-rln-v004-evaluator",
  "version": "1.0.0",
  "description": "ProRail RLN00398-V004 EMC Compliance Evaluation Tool",
  ...
}
```

### 2. Update `index.html`
- Change title to mention V004
- Update welcome message to reference V004
- Update version info

### 3. Update `src/main.js`
- Remove V001 imports
- Use V004 evaluator only
- Clean up comments

### 4. Create new `README.md` in cable-route-evaluator/
- Project overview
- V004 standard reference
- Quick start guide
- Features list
- Technology stack
- Documentation links

### 5. Update root `README.md`
- Brief project description
- Link to cable-route-evaluator/README.md
- Development status

---

## 🚀 Migration Steps

### Phase 1: Backup & Branch (DONE ✅)
```bash
git checkout -b feature/v004-clean
```

### Phase 2: Remove Unnecessary Files
```bash
# Remove root documentation
rm -rf image/
rm -rf jsapi-resources-main/
rm *.md (except README.md)
rm *.json (route files)

# Remove cable-route-evaluator documentation
cd cable-route-evaluator
rm *.md (all except README.md - will create new)
rm Dockerfile
rm Route_1.json
rm -rf examples/

# Remove legacy source code
rm src/config.js
rm src/main_backup.js
rm -rf src/utils/v1/
rm src/utils/emcEvaluator.js
rm src/utils/V2_FRAMEWORK_README.md
```

### Phase 3: Create New Documentation
```bash
mkdir cable-route-evaluator/docs
# Create ARCHITECTURE.md
# Create V004_IMPLEMENTATION.md
# Create DEVELOPMENT_GUIDE.md
# Create API_REFERENCE.md
```

### Phase 4: Update Existing Files
- Update package.json
- Update index.html
- Update main.js
- Create new README files

### Phase 5: Test & Verify
```bash
npm install
npm run dev
# Verify application works
# Test all features
```

### Phase 6: Commit & Push
```bash
git add .
git commit -m "feat: Clean V004 branch with streamlined structure"
git push -u origin feature/v004-clean
```

---

## ✅ Success Criteria

1. ✅ Application runs without errors
2. ✅ All V004 functionality intact
3. ✅ No legacy V001 code present
4. ✅ Clean, minimal folder structure
5. ✅ Comprehensive documentation in docs/
6. ✅ Easy to understand for new developers
7. ✅ Ready for V004 standard implementation

---

## 📋 Next Steps After Cleanup

1. **Implement V004 Flowchart Logic**
   - Map Steps A-F from standard
   - Implement decision trees
   - Add validation logic

2. **Enhance Documentation**
   - Document V004 requirements
   - Add code examples
   - Create user guide

3. **Testing & Validation**
   - Test with real data
   - Validate against V004 standard
   - Performance optimization

4. **Production Readiness**
   - Code review
   - Security audit
   - Deployment preparation

---

**Status:** 📝 Planning Phase Complete - Ready for Execution
