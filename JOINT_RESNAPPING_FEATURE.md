# Joint Re-Snapping Feature

## Problem

When editing a cable route (moving waypoints), joints placed on the route would stay at their original map coordinates:
- Route moves ✅
- Joints stay in place ❌
- Joints become detached from the route
- User has to delete and re-place all joints

## Solution

**Automatic Joint Re-Snapping** - When route geometry changes, all joints are automatically re-positioned:
1. Maintains the same **chainage** (distance along route)
2. Updates to new **map coordinates**
3. Recalculates **distance to nearest track**
4. Updates **compliance status**
5. Refreshes **map graphics**

## How It Works

### 1. Re-Snap Function (`resnapJointsToRoute`)

Located in `jointManager.js`:

```javascript
export async function resnapJointsToRoute(routeId, newRouteGeometry, tracksLayer = null) {
  // For each joint:
  // 1. Get point at same chainage on new geometry
  // 2. Update geometry to new position
  // 3. Recalculate distance to nearest track
  // 4. Update compliance status
  // 5. Return updated joint data
}
```

**Key Features:**
- Uses `geometryEngine.geometryAtLength()` to find new position
- Maintains original chainage value
- Recalculates track distances if tracks layer available
- Handles errors gracefully (keeps original position if re-snap fails)

### 2. Automatic Trigger (`onRouteUpdated`)

Located in `main.js`:

```javascript
drawingManager.onRouteUpdated = async (routeData) => {
  // 1. Clear old compliance data
  // 2. Re-snap all joints to new geometry
  // 3. Update graphics on map
  // 4. Update UI
  // 5. Trigger re-evaluation
}
```

**Workflow:**
1. User edits route (moves waypoint)
2. `onRouteUpdated` callback fires
3. System detects existing joints
4. Calls `resnapJointsToRoute()` with new geometry
5. Removes old joint graphics from map
6. Adds new joint graphics at updated positions
7. Triggers evaluation with new distances

## User Experience

### Before (Broken):
1. User places joint at chainage 1017m
2. Joint is at position (X: 123, Y: 456) on map
3. User moves route waypoint
4. Route moves to new position ✅
5. **Joint stays at (X: 123, Y: 456)** ❌
6. Joint is no longer on the route ❌
7. User must delete and re-place joint ❌

### After (Fixed):
1. User places joint at chainage 1017m
2. Joint is at position (X: 123, Y: 456) on map
3. User moves route waypoint
4. Route moves to new position ✅
5. **Joint automatically moves to new position** ✅
6. **Joint stays at chainage 1017m on route** ✅
7. Distance to track recalculated ✅
8. Compliance status updated ✅
9. User sees updated joint position immediately ✅

## Console Output Example

### Route Update with Joint Re-Snapping:
```
🔄 Route updated callback: Object
🔄 Re-snapping 1 joint(s) to updated route...
🔄 Re-snapping joints for route route-xxx to updated geometry...
   🛤️ Finding nearest track to joint...
   📊 Found 2 track(s) nearby
   ✅ Nearest track: 42.50m away
   ✅ Re-snapped joint at 1017.3m - new track distance: 42.50m
✅ Re-snapped 1 joint(s) for route route-xxx
✅ Updated 1 joint graphic(s) on map
🔄 Triggering automatic re-evaluation after route update...
```

### Joint Position Maintained:
```
Before move: Joint at chainage 1017.3m, track distance 16.3m ❌ Violation
After move:  Joint at chainage 1017.3m, track distance 42.5m ✅ Compliant
```

The chainage stays the same (1017.3m), but the track distance updates based on the new route position!

## Technical Details

### Geometry Operations

**Finding New Position:**
```javascript
const newPoint = geometryEngine.geometryAtLength(newRouteGeometry, joint.chainageMeters, "meters");
```
- `geometryAtLength()` returns a point at specified distance along polyline
- Maintains relative position on route
- Works even if route shape changes dramatically

**Track Distance Recalculation:**
```javascript
const trackResult = await findNearestTrack(newPoint, tracksLayer, 200);
joint.distanceToTrackMeters = trackResult.distance;
joint.compliant = validateJointCompliance(trackResult.distance);
```
- Queries tracks within 200m of new position
- Updates distance and compliance status
- Async operation with error handling

### Graphic Updates

**Remove Old Graphics:**
```javascript
const oldGraphics = jointsLayer.graphics.filter(g => g.attributes?.routeId === routeData.id);
jointsLayer.removeMany(oldGraphics.toArray());
```

**Add New Graphics:**
```javascript
const newGraphics = updatedJoints.map(joint => {
  const graphic = createJointGraphic(joint);
  graphic.attributes.routeId = routeData.id;
  return graphic;
});
jointsLayer.addMany(newGraphics);
```

### Error Handling

- If re-snap fails for a joint, keeps original position
- Logs warnings for debugging
- Continues with other joints
- Graceful degradation

## Edge Cases Handled

1. **Joint beyond new route length:** Re-snap fails gracefully, keeps original
2. **No tracks layer:** Re-snaps position but doesn't recalculate distance
3. **Multiple joints:** All joints re-snapped in sequence
4. **Route shortened:** Joints beyond new length stay at original position
5. **Async errors:** Caught and logged, doesn't break the flow

## Benefits

✅ **User-Friendly** - Joints automatically follow route edits
✅ **Accurate** - Maintains chainage position precisely
✅ **Smart** - Recalculates track distances automatically
✅ **Efficient** - No need to delete and re-place joints
✅ **Robust** - Handles errors gracefully
✅ **Transparent** - Clear console logging for debugging

## Testing Scenarios

### Test 1: Move Route Away from Tracks
1. Place route close to tracks (< 31m)
2. Place joint → Shows violation ❌
3. Move waypoint to move route away from tracks
4. ✅ Joint moves with route
5. ✅ Distance recalculated (now > 31m)
6. ✅ Status changes to compliant ✅

### Test 2: Move Route Closer to Tracks
1. Place route far from tracks (> 31m)
2. Place joint → Shows compliant ✅
3. Move waypoint to move route closer to tracks
4. ✅ Joint moves with route
5. ✅ Distance recalculated (now < 31m)
6. ✅ Status changes to violation ❌

### Test 3: Multiple Joints
1. Place 3 joints at different chainages
2. Move route waypoints
3. ✅ All joints move to maintain their chainages
4. ✅ All distances recalculated
5. ✅ All graphics updated

### Test 4: Extreme Route Changes
1. Place joint on straight route segment
2. Add sharp curve or loop in route
3. ✅ Joint repositions to maintain chainage
4. ✅ Works even with dramatic shape changes

## Related Files

- `jointManager.js` - `resnapJointsToRoute()` function
- `main.js` - `onRouteUpdated` callback
- `spatialQueries.js` - `findNearestTrack()` for distance calculation
- `geometryEngine` - ArcGIS geometry operations

## Future Enhancements

Possible improvements:
- Visual animation showing joint movement
- Option to "freeze" joints at map coordinates
- Bulk joint operations (move all, delete all)
- Joint snapping to specific route segments
- Joint duplication/copying between routes
