# Evaluation Update Fix

## Problem

When editing a route waypoint and triggering a re-evaluation:
1. The evaluation would run successfully (visible in console logs)
2. But the UI would still show "Evaluation Pending" status
3. Multiple evaluations were being triggered simultaneously
4. The evaluation results were not being properly displayed after geometry changes

## Root Causes

### 1. **No Automatic Re-Evaluation After Geometry Changes**
When a waypoint was edited, the `onRouteUpdated` callback was triggered, but:
- The old compliance data remained attached to the route
- No automatic re-evaluation was triggered
- The UI showed stale or incomplete evaluation status

### 2. **Race Condition in UI Updates**
Multiple functions were calling `renderEvaluationReports()` in quick succession:
- `updateRouteInList()` called it
- `evaluateRouteCompliance()` called it multiple times
- `showRouteDetails()` might trigger additional renders
- This caused the UI to flicker between states

### 3. **Duplicate Evaluation Prevention Not Working**
The check for `evaluationUIState.runningRouteIds.has(routeId)` was there but:
- The message didn't clearly indicate it was skipping a duplicate
- Multiple calls could still queue up before the first one completed

## Solutions Implemented

### 1. **Automatic Re-Evaluation After Geometry Changes**
```javascript
drawingManager.onRouteUpdated = (routeData) => {
  // Clear old compliance data when geometry changes
  if (routeData.compliance) {
    drawingManager.setRouteCompliance(routeData.id, null);
  }
  
  // ... update UI ...
  
  // Auto-evaluate after a short delay
  setTimeout(() => {
    evaluateRouteCompliance(routeData.id);
  }, 100);
};
```

**Benefits:**
- Compliance data is cleared immediately when geometry changes
- Automatic re-evaluation starts after UI updates settle
- User doesn't need to manually click "Re-run evaluation"

### 2. **Improved Duplicate Prevention**
```javascript
if (evaluationUIState.runningRouteIds.has(routeId)) {
  console.info(`⏭️ Evaluation already running for route ${routeId}, skipping duplicate request`);
  return;
}
```

**Benefits:**
- Clear logging when duplicates are detected
- Prevents multiple simultaneous evaluations of the same route

### 3. **Streamlined UI Update Flow**
In `updateRouteInList()`:
```javascript
// Update compliance UI - this will show "not evaluated" if compliance was cleared
updateRouteComplianceUI(routeData.id);

// Note: renderEvaluationReports will be called after auto-evaluation completes
// (Removed the immediate renderEvaluationReports call)
```

In `evaluateRouteCompliance()`:
```javascript
// Update UI to show "running" state
renderEvaluationReports(routeId);

// ... run evaluation ...

// Update UI components in order after completion
updateRouteComplianceUI(routeId);
renderEvaluationReports(routeId);
```

**Benefits:**
- Reduces redundant UI renders
- Clearer sequence: show "running" → run evaluation → show results
- UI updates happen in a predictable order

## User Experience Improvements

### Before:
1. User edits waypoint ✏️
2. Route updates but shows old/stale evaluation ❌
3. User manually clicks "Re-run evaluation" 
4. Evaluation runs but UI might not update properly
5. User sees "Pending" status despite evaluation completing ⏳

### After:
1. User edits waypoint ✏️
2. Route updates and clears old evaluation ✅
3. **Automatic re-evaluation starts immediately** 🔄
4. UI shows "Running EMC checks..." status clearly
5. **Evaluation completes and UI updates with new results** ✅
6. User sees current pass/fail status immediately 🎯

## Testing Recommendations

1. **Edit a waypoint** - Verify auto-evaluation triggers
2. **Edit multiple waypoints quickly** - Verify no duplicate evaluations
3. **Check console logs** - Should see clear start/complete messages
4. **Watch the Results panel** - Should show "Running → Complete" progression
5. **Verify final status** - Should show correct pass/fail counts

## Technical Notes

- The 100ms delay in the setTimeout allows the UI to settle before starting evaluation
- The duplicate prevention ensures only one evaluation runs at a time per route
- The compliance data is cleared immediately to prevent showing stale results
- All UI updates happen in a controlled sequence to prevent race conditions
