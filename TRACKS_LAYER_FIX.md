# Tracks Layer Fix for Joint Distance Calculation

## Problem

When placing joints, the system was unable to calculate the distance to railway tracks:
- Console showed: `⚠️ Tracks layer not available`
- Joint `distanceToTrackMeters` was `null`
- `getMinimumJointToTrackDistance()` returned `null`
- Metadata `minJointDistanceMeters` was not set
- Evaluation rule stayed in "Pending" state

## Root Cause

**Wrong Layer ID Used**

In the joint placement code:
```javascript
const tracksLayer = map.findLayerById('railway-tracks');  // ❌ WRONG ID
```

But the actual railway tracks layer has:
```javascript
customId: 'prorail-tracks'  // ✅ Correct ID
```

The layer was being searched with the wrong ID, so it was never found!

## Solution

Use the tracks layer from the drawing manager, which already has a reference to the correct layer:

```javascript
// Get tracks layer from drawing manager
const tracksLayer = drawingManager.railwayTracksLayer;

if (tracksLayer) {
  console.log(`   ✅ Tracks layer available: ${tracksLayer.title} (${tracksLayer.id})`);
} else {
  console.warn('   ⚠️ Tracks layer not found - joint distances will not be calculated');
}
```

## Benefits

1. **Uses existing layer reference** - No need to search by ID
2. **Always correct** - The drawing manager already has the right layer
3. **Better logging** - Shows which layer is being used
4. **Consistent** - Same pattern used in evaluation code

## Expected Behavior After Fix

### Console Logs When Placing Joint:
```
✅ Joint marking active for route route-xxx
   👆 Click on the route to place joints/earthing points
   ✅ Tracks layer available: 🚂 Railway Tracks (Spoorbaanhartlijn) (prorail-tracks-xxx)
📍 Map clicked - placing joint...
   🔄 Projecting click point from 102100 to 28992 (RD New)...
   🔄 Projecting route geometry from 4326 to 28992 (RD New)...
   📏 Distance from click to route: 0.10m
   ✅ Snapping to nearest point on route...
   📏 Chainage calculated: 528.32m from route start
   🛤️ Querying nearest track...
   ❌ Distance to track: 15.90m                    ← NOW CALCULATED! ✅
✅ joint added at 528.3m - ❌ Violation
   📊 Updated route minimum joint distance: 15.90m  ← NOW SET! ✅
   🔄 Triggering re-evaluation after joint placement...
```

### Evaluation Results:
```
✅ EMC evaluation complete
   📊 Status: fail
   ✅ Pass: 2, ❌ Fail: 1, ⏳ Pending: 0           ← NO MORE PENDING! ✅
```

The joint distance rule will now properly evaluate instead of staying pending!

## Testing

1. **Joint Near Track (< 31m):**
   - Place joint close to railway
   - ✅ Should see: `❌ Distance to track: XX.XXm` (< 31m)
   - ✅ Should see: `Updated route minimum joint distance: XX.XXm`
   - ✅ Evaluation shows: **Fail** for joint rule
   - ✅ Message: "Ensure joints ≥31 m from track (current XX.X m)"

2. **Joint Far from Track (> 31m):**
   - Place joint far from railway
   - ✅ Should see: `✅ Distance to track: XX.XXm` (> 31m)
   - ✅ Should see: `Updated route minimum joint distance: XX.XXm`
   - ✅ Evaluation shows: **Pass** for joint rule
   - ✅ Message: "Joints located XX.X m from track"

3. **Route Far from All Tracks:**
   - Create route > 31m from all tracks
   - ✅ Evaluation shows automatic pass
   - ✅ Message: "Entire route is XX.X m from tracks - joints can be placed anywhere"

## Related Files

- `main.js` - Joint marking click handler
- `jointManager.js` - `getMinimumJointToTrackDistance()` function
- `emcEvaluator.js` - Joint distance evaluation rule
- `spatialQueries.js` - `findNearestTrack()` function

## Technical Notes

- The `drawingManager.railwayTracksLayer` is set during initialization
- It references the layer with `customId === 'prorail-tracks'`
- The same layer is used for route evaluations
- Distance calculations use RD New (EPSG:28992) coordinate system
- Track search radius is 200m
