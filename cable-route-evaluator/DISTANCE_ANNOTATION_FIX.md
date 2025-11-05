# Distance Annotation Fix - Crossing Routes

## 🐛 Bug Report

**Issue:** When drawing a route that crosses the railway tracks at a valid angle (80°-100°), the application correctly evaluates the crossing angle rule and marks the 700m distance rule as "not applicable". However, the visual distance annotations (gray dashed lines showing distance from waypoints to nearest track) still appear and may show "<700m", which is confusing because that rule doesn't apply to crossing routes.

**Reported by User:** 
> "i did create a route and made it cross within the angle limits, but then it flags it from the waypoints distances to less than 700m"

---

## 🔍 Root Cause Analysis

### The Problem

The application has **two separate systems** for distance checking:

1. **EMC Rule Evaluation** (`emcEvaluator.js`)
   - ✅ Correctly implements mutual exclusivity
   - ✅ Crossing angle rule applies when `crossesTrack === true`
   - ✅ 700m distance rule applies when `crossesTrack === false` (overhead only)
   - ✅ Rules never both apply simultaneously

2. **Visual Distance Annotations** (`main.js` - `addDistanceAnnotations()`)
   - ❌ **Does NOT check if route crosses**
   - ❌ Shows distance from every waypoint to nearest track
   - ❌ Creates visual confusion when route crosses

### Code Flow

```
User draws route that crosses track
│
├─ EMC Evaluation (emcEvaluator.js)
│  ├─ analyzeCrossings() → crossesTrack: true, angle: 85°
│  ├─ CROSSING_ANGLE rule: applies = true → evaluates 85° → PASS ✅
│  └─ OHL_NON_CROSSING_DISTANCE rule: applies = false → "Not Applicable" ✅
│
└─ Visual Annotations (main.js)
   ├─ addDistanceAnnotations()
   ├─ ❌ Doesn't check evaluationResult.crossing.crossesTrack
   ├─ Samples waypoints along route
   ├─ Measures distance from each waypoint to nearest track
   └─ ❌ Shows "45m", "23m", etc. even though 700m rule doesn't apply!
```

---

## ✅ Solution Implemented

### Change 1: Include `crossing` data in evaluation result

**File:** `src/utils/emcEvaluator.js` (line ~905)

**Before:**
```javascript
  return {
    evaluatedAt,
    summary,
    rules
  };
```

**After:**
```javascript
  return {
    evaluatedAt,
    summary,
    rules,
    crossing // ✅ Include crossing information so UI can determine if distance annotations are relevant
  };
```

**Impact:** The evaluation result now includes the crossing analysis (`crossesTrack`, `primaryAngle`, `angles`), making it available to the UI.

---

### Change 2: Skip distance annotations for crossing routes

**File:** `src/main.js` (line ~1807)

**Before:**
```javascript
async function addDistanceAnnotations(routeId, evaluationResult) {
  const { distanceAnnotationsLayer, drawingManager, map } = window.app || {};
  if (!distanceAnnotationsLayer || !drawingManager) {
    return;
  }

  // Clear existing annotations for this route
  const existingAnnotations = distanceAnnotationsLayer.graphics.filter(
    g => g.attributes?.routeId === routeId
  );
  distanceAnnotationsLayer.removeMany(existingAnnotations.toArray());

  const route = drawingManager.getRoute(routeId);
  if (!route || !route.geometry) {
    return;
  }

  const routeGeometry = route.geometry;
  // ... continues to create annotations
```

**After:**
```javascript
async function addDistanceAnnotations(routeId, evaluationResult) {
  const { distanceAnnotationsLayer, drawingManager, map } = window.app || {};
  if (!distanceAnnotationsLayer || !drawingManager) {
    return;
  }

  // Clear existing annotations for this route
  const existingAnnotations = distanceAnnotationsLayer.graphics.filter(
    g => g.attributes?.routeId === routeId
  );
  distanceAnnotationsLayer.removeMany(existingAnnotations.toArray());

  const route = drawingManager.getRoute(routeId);
  if (!route || !route.geometry) {
    return;
  }

  // ✅ FIX: Check if route crosses tracks - if it does, distance annotations are not relevant
  // The 700m rule only applies to NON-CROSSING routes (parallel routes)
  const routeCrossesTracks = evaluationResult?.crossing?.crossesTrack ?? false;
  if (routeCrossesTracks) {
    console.log(`   ℹ️ Route ${routeId} crosses tracks - distance annotations not applicable (crossing angle rule applies instead)`);
    return; // Don't show distance annotations for crossing routes
  }

  const routeGeometry = route.geometry;
  // ... continues to create annotations only for NON-crossing routes
```

**Impact:** Distance annotations are now **only shown for parallel (non-crossing) routes** where the 700m rule actually applies.

---

## 🎯 Behavior After Fix

### Scenario 1: Overhead Line Crosses Track

**User Action:** Draw overhead line that crosses railway at 85°

**Result:**
```
EMC Evaluation:
  ✅ Crossing Angle: PASS (85° is within 80°-100°)
  ⚪ 700m Distance: Not Applicable (route crosses)
  
Visual Annotations:
  ℹ️ No distance annotations shown
  📝 Console: "Route R1 crosses tracks - distance annotations not applicable"
```

---

### Scenario 2: Overhead Line Parallel to Track (Far)

**User Action:** Draw overhead line parallel to railway, 800m away

**Result:**
```
EMC Evaluation:
  ⚪ Crossing Angle: Not Applicable (no crossing)
  ✅ 700m Distance: PASS (800m ≥ 700m)
  
Visual Annotations:
  ✅ Gray dashed lines showing distances at waypoints
  📏 Text labels: "800.5m", "805.2m", etc.
```

---

### Scenario 3: Overhead Line Parallel to Track (Close)

**User Action:** Draw overhead line parallel to railway, 450m away

**Result:**
```
EMC Evaluation:
  ⚪ Crossing Angle: Not Applicable (no crossing)
  ❌ 700m Distance: FAIL (450m < 700m)
  
Visual Annotations:
  ✅ Gray dashed lines showing distances at waypoints
  📏 Text labels: "450.2m", "448.7m", etc.
  ⚠️ Visual feedback shows route is too close
```

---

### Scenario 4: Overhead Line Parallel to Electrified Track

**User Action:** Draw overhead line parallel to 25kV electrified railway, 15m away

**Result:**
```
EMC Evaluation:
  ⚪ Crossing Angle: Not Applicable (no crossing)
  ✅ 700m Distance: PASS (15m ≥ 11m exception)
  
Visual Annotations:
  ✅ Gray dashed lines showing distances at waypoints
  📏 Text labels: "15.3m", "14.8m", etc.
```

---

## 📋 Testing Checklist

- [x] Route that crosses at valid angle (80-100°) → No distance annotations shown ✅
- [ ] Route that crosses at invalid angle (<80° or >100°) → No distance annotations shown
- [ ] Overhead line parallel >700m → Distance annotations shown, rule passes
- [ ] Overhead line parallel <700m → Distance annotations shown, rule fails
- [ ] Overhead line parallel to 25kV track >11m → Distance annotations shown, rule passes
- [ ] Cable crossing track → No distance annotations shown
- [ ] Cable parallel >700m (≥35kV) → Distance annotations shown, rule passes
- [ ] Cable parallel <700m (≥35kV) → Distance annotations shown, rule fails

---

## 🎨 Future Enhancement Ideas

### Option A: Show Crossing Point Annotations Instead

For crossing routes, instead of hiding all annotations, show **crossing point analysis**:

```javascript
if (routeCrossesTracks) {
  // Show crossing point marker with angle instead of distance
  const crossingPoint = findCrossingPoint(route, tracks);
  addCrossingAngleAnnotation(crossingPoint, evaluationResult.crossing.primaryAngle);
  return;
}
```

Visual:
```
Route crosses track
     │
     ├─ 🎯 Crossing Point
     │    └─ "Angle: 85.3°" ✅
```

---

### Option B: Contextual Color Coding

Use different colors for annotations based on rule status:

```javascript
const threshold = infrastructureType === 'overhead' ? 700 : 35;
const color = distance >= threshold 
  ? [0, 255, 0, 0.6]   // Green - compliant
  : [255, 0, 0, 0.6];  // Red - violation
```

---

### Option C: Toggle Distance Annotations

Add a button to show/hide distance annotations:

```
[Show Distance Annotations] ☑️
```

Useful when:
- User wants to see distances even for crossing routes (informational)
- Cluttered map needs simplification
- Exporting clean maps for reports

---

## 🔗 Related Documentation

- `CROSSING_VS_PARALLEL_RULES.md` - Detailed explanation of rule mutual exclusivity
- `CROSSING_ANGLE_EXPLANATION.md` - Mathematical explanation of angle calculation
- `RLN00398-V002.md` - ProRail standard (§5.1 for overhead lines, §5.2 for cables)

---

## ✅ Summary

**Problem:** Distance annotations showed for all routes, even when crossing (where 700m rule doesn't apply)

**Root Cause:** Annotation system didn't check if route crosses before showing distances

**Fix:** 
1. Include `crossing` data in evaluation result
2. Check `evaluationResult.crossing.crossesTrack` before showing distance annotations
3. Skip annotations for crossing routes (crossing angle rule applies instead)

**Result:** Distance annotations now only appear for parallel (non-crossing) routes where the 700m/11m distance rule is actually relevant. Crossing routes only show crossing angle evaluation.

---

**Fixed:** 2025-01-20  
**Files Modified:** 
- `src/utils/emcEvaluator.js` (added `crossing` to return value)
- `src/main.js` (added crossing check in `addDistanceAnnotations()`)
