# RLN00398-V002 Refactor Framework

**Branch:** `feature/rln00398-v002-refactor`  
**Created:** November 5, 2025  
**Status:** 🚧 **FRAMEWORK BASELINE** - Awaiting flowchart logic mapping

---

## 📋 Overview

This is a **clean baseline framework** for implementing RLN00398-V002 (effective 01-12-2020), which introduces a fundamentally different **flowchart-based sequential assessment approach** compared to V001's direct rule evaluation.

### Key Changes in V002:
- ✅ Flowchart-based filtering (Steps A → B → C → D → E/F)
- ✅ 25kV AC electrification special handling (11m exception)
- ✅ HVDC connection requirements (§5.3)
- ✅ Unity study integration (§5.2 C/D)
- ✅ New reporting templates (Bijlage 3 & 4)
- ✅ Moffen/aarding proximity checks

---

## 📁 New Directory Structure

```
src/
├── utils/
│   ├── v1/                          # Legacy RLN00398-V001
│   │   └── emcEvaluatorV1.js       # Original evaluator (backup)
│   │
│   ├── v2/                          # NEW: RLN00398-V002
│   │   ├── flowchartEvaluator.js   # ✅ Core flowchart engine
│   │   ├── reportGenerator.js      # ✅ Bijlage 3/4 report templates
│   │   └── unityStudyValidator.js  # 🚧 TODO: Unity study validation
│   │
│   └── shared/                      # Version-agnostic utilities
│       └── geometryUtils.js         # ✅ Reusable geometry functions
│
├── config.js                        # V001 config (unchanged)
└── config.v2.js                     # ✅ NEW: V002 flowchart config
```

---

## 🏗️ Framework Components

### ✅ **COMPLETED BASELINE**

#### 1. **`shared/geometryUtils.js`** - Reusable Utilities
All geometry calculations extracted from V001, now version-agnostic:
- Projection utilities (WGS84 ↔ RD New)
- Distance calculations
- Angle measurements
- Track geometry queries
- Technical room distance
- Crossing analysis

**API:**
```javascript
import { geometryUtils } from './shared/geometryUtils.js';

// Projection
await geometryUtils.ensureProjectionLoaded();

// Geometry
const point = geometryUtils.extractPointFromGeometry(geometry);
const angle = geometryUtils.angleBetweenVectors(vectorA, vectorB);

// Distance
const trackGeoms = await geometryUtils.fetchTrackGeometries(route, layers);
const distance = geometryUtils.computeMinimumDistance(routeRd, trackGeoms);
```

---

#### 2. **`config.v2.js`** - V002 Configuration
Comprehensive configuration for the new standard:

```javascript
import { configV2 } from './config.v2.js';

// Flowchart thresholds
const stepAConfig = configV2.flowchart.stepA;
const voltageThreshold = stepAConfig.voltage.lowVoltageThreshold_kV; // 24

// Electrification types
const ac25kv = configV2.electrification.types.AC_25KV_50HZ;
const parallelDist = ac25kv.parallelDistance_m; // 11 (exception!)

// Reporting templates
const basicTemplate = configV2.reporting.templates.basic; // Bijlage 3
```

**Key Configuration Sections:**
- `flowchart.stepA/B/C/D` - Sequential filtering thresholds
- `electrification.types` - Track electrification handling
- `hvdc` - HVDC connection requirements (§5.3)
- `reporting.templates` - Bijlage 3/4 report formats
- `beoordelingsCriteria` - Assessment criteria (Chapter 7)
- `modeling` - Modeling assumptions (Chapter 6)

---

#### 3. **`v2/flowchartEvaluator.js`** - Core Evaluator
Main evaluation engine with flowchart logic:

```javascript
import { FlowchartEvaluator, evaluateRouteV2 } from './v2/flowchartEvaluator.js';

// Simple API
const result = await evaluateRouteV2(route, {
  layers: { tracksLayer, technicalRoomsLayer },
  unityStudy: unityStudyData  // Optional
});

// Advanced API
const evaluator = new FlowchartEvaluator(route, options);
const result = await evaluator.evaluate();
```

**Evaluation Flow:**
```
┌─────────────────────────────────────────┐
│ 1. buildEvaluationContext()             │
│    - Project to RD New                  │
│    - Fetch track geometries             │
│    - Calculate distances                │
│    - Analyze crossings                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. evaluateStepA()                      │
│    - Voltage checks                     │
│    - Eenfase sluiting risk              │
│    - Special case: ≤24kV outside 11m    │
└─────────────────────────────────────────┘
         ↓ passes                ↓ fails
┌─────────────────────┐   ┌──────────────────┐
│ 3. evaluateStepB()  │   │ Exit: Requires   │
│    - Parallel dist  │   │ further study    │
│    - Crossing angle │   └──────────────────┘
└─────────────────────┘
         ↓ passes
┌─────────────────────┐
│ 4. evaluateStepC()  │
│    - Unity study    │
└─────────────────────┘
         ↓ passes
┌─────────────────────┐
│ 5. evaluateStepD()  │
│    - EMC detail     │
└─────────────────────┘
         ↓ passes
┌─────────────────────┐
│ ✅ COMPLIANT!       │
└─────────────────────┘
```

**Current Status:** 🚧 Skeleton implementation
- ✅ Class structure complete
- ✅ Context building complete
- 🚧 Step A: Placeholder (awaiting your flowchart mapping)
- 🚧 Step B: Placeholder (awaiting your flowchart mapping)
- 🚧 Step C: Placeholder (awaiting unity study logic)
- 🚧 Step D: Placeholder (awaiting EMC detail logic)

---

#### 4. **`v2/reportGenerator.js`** - Report Generation
Generates compliance reports per Bijlage 3/4:

```javascript
import { generateReport } from './v2/reportGenerator.js';

const report = generateReport(evaluationResult, 'json');
// Returns: { onderbouwing, flowchartDocumentation, compliance, ... }
```

**Report Types:**
- **Bijlage 3** (Basic): For Steps A/B - simpler assessments
- **Bijlage 4** (Detailed): For Steps C/D - unity/EMC studies

**Current Status:** 🚧 Framework only - templates to be implemented

---

### 🚧 **TODO: To Be Implemented**

#### 5. **`v2/unityStudyValidator.js`** (Not yet created)
Unity study validation logic:
```javascript
// Future API
import { validateUnityStudy } from './v2/unityStudyValidator.js';

const validation = validateUnityStudy(unityStudyData, {
  criteria: configV2.flowchart.stepC.criteria
});
```

---

## 🎯 Integration Plan

### Phase 1: **Flowchart Logic Mapping** (CURRENT - Awaiting Your Input)
You are mapping out the flowchart logic. Once ready:
1. Implement `evaluateStepA()` checks (items 1-3)
2. Implement `evaluateStepB()` checks (items 4-7)
3. Implement `evaluateStepC()` checks (items 8-9)
4. Implement `evaluateStepD()` checks (items 10-12)
5. Implement `evaluateStepEF()` decision tree

### Phase 2: **UI Integration**
1. Create version selector (V1 vs V2)
2. Build flowchart progress component
3. Add unity study upload
4. Implement new result display

### Phase 3: **Reporting**
1. Implement Bijlage 3 template (basic)
2. Implement Bijlage 4 template (detailed)
3. Add PDF generation
4. Add onderbouwing documentation

### Phase 4: **Data Layer Enhancements**
1. Add 25kV AC electrification zones layer
2. Add moffen (cable joints) layer
3. Add HVDC connections layer
4. Add clearance time zones

### Phase 5: **Testing & Validation**
1. Test with known V001 scenarios
2. Test V002-specific scenarios
3. ProRail validation
4. User acceptance testing

---

## 🔄 Migration Strategy

### For Existing Code:
1. **Old evaluator preserved:** `v1/emcEvaluatorV1.js`
2. **Current evaluator unchanged:** `emcEvaluator.js` (still in use)
3. **New evaluator separate:** `v2/flowchartEvaluator.js`

### Import Paths Update (When Ready):
```javascript
// Old (V001) - still works
import { evaluateRoute } from './utils/emcEvaluator.js';

// New (V002) - when ready
import { evaluateRouteV2 } from './utils/v2/flowchartEvaluator.js';

// Shared utilities
import { geometryUtils } from './utils/shared/geometryUtils.js';
```

---

## 📝 Key Differences: V001 vs V002

| Aspect | V001 | V002 |
|--------|------|------|
| **Approach** | Direct rule evaluation | Flowchart filtering |
| **Steps** | 10 independent rules | Sequential A→B→C→D→E/F |
| **25kV AC** | Same as 1500V DC | Special 11m exception |
| **HVDC** | Not mentioned | New §5.3 requirements |
| **Reporting** | Generic | Bijlage 3/4 templates |
| **Moffen/Aarding** | Implicit in joint rule | Explicit check (31m) |
| **Unity Study** | Optional | Integrated in flowchart |

---

## 🧪 Testing the Framework

### Quick Test (When Flowchart Logic Added):
```javascript
import { evaluateRouteV2 } from './utils/v2/flowchartEvaluator.js';

const testRoute = {
  geometry: testPolyline,
  metadata: {
    infrastructureType: 'cable',
    voltageKv: 110,
    electrifiedSystem: '25kv_50hz'  // NEW: Test 25kV exception
  }
};

const result = await evaluateRouteV2(testRoute, {
  layers: { tracksLayer, technicalRoomsLayer }
});

console.log(result.status);           // 'compliant' | 'requires_study' | 'error'
console.log(result.exitStep);         // 'Step A' | 'Step B' | etc.
console.log(result.flowchartResults); // Detailed step results
```

---

## 📚 Reference Documents

- **RLN00398-V001:** Original standard (legacy)
- **RLN00398-V002:** New standard (this implementation)
- **Flowchart:** Figure 1 (your mapping in progress)
- **Bijlage 3:** Template tbv basisrapportage EMC
- **Bijlage 4:** Checklist tbv RLN00398 EMC-detailstudies

---

## 🚀 Next Steps

1. ✅ **Framework baseline created** (DONE)
2. 🔄 **You:** Map out flowchart logic (IN PROGRESS)
3. ⏳ **Then:** Implement flowchart steps A-D
4. ⏳ **Then:** Build UI integration
5. ⏳ **Then:** Implement reporting
6. ⏳ **Then:** Testing & validation

---

## 💡 Notes

- **No breaking changes:** Old code still works with `emcEvaluator.js`
- **Clean separation:** V1 and V2 are completely independent
- **Shared utilities:** Common geometry functions prevent duplication
- **Extensible:** Easy to add HVDC, 25kV AC, and future requirements
- **Type-safe ready:** Structure supports TypeScript migration if needed

---

## 🛠️ Development Commands

```bash
# Switch to refactor branch
git checkout feature/rln00398-v002-refactor

# View new structure
ls src/utils/v1/
ls src/utils/v2/
ls src/utils/shared/

# Test imports (when implemented)
npm run dev
```

---

**Status:** Framework ready for flowchart logic implementation!  
**Waiting on:** Your flowchart mapping for Steps A-F implementation
