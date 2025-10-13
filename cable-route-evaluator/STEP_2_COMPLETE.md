# Step 2 Complete: Spatial Query Functions ✅

## What Was Built

### New Files Created:
1. ✅ **`src/utils/spatialQueries.js`** (394 lines)
   - Complete spatial query functions for ProRail layers
   - Query technical rooms (EV Gebouwen)
   - Query track centerlines (Spoorbaanhartlijn)
   - Query earthing points (Aarding)
   - Calculate distances for EMC compliance
   - Comprehensive spatial analysis function

### Files Modified:
1. ✅ **`src/main.js`**
   - Added imports for spatial query functions
   - Updated `resolveTechnicalRoomsLayer()` to find EV Gebouwen layer by ID
   - Now passes correct layers to EMC evaluator

---

## 🎯 What This Fixes

### Before Step 2:
```
❌ Technical rooms layer not configured
❌ Document minimum distance between joints/earthing and the track
```

### After Step 2:
```
✅ Technical rooms layer configured and accessible
✅ Spatial queries can calculate real distances
✅ EMC evaluator receives actual ProRail infrastructure data
```

---

## 🔬 How It Works

### Query Flow:
```
User draws route
    ↓
Click "Run EMC Evaluator"
    ↓
evaluateRouteCompliance() is called
    ↓
resolveTechnicalRoomsLayer(map) → finds 'ev-gebouwen' layer
    ↓
evaluateRoute(route, { layers: { technicalRoomsLayer, tracksLayer } })
    ↓
emcEvaluator queries layers within buffer
    ↓
calculateMinimumDistance(route, technical rooms)
    ↓
Returns: { distance: 45.3m, status: 'pass' }
    ↓
Display in compliance report
```

---

## 📊 Key Functions

### 1. Query Technical Rooms
```javascript
queryTechnicalRooms(routeGeometry, technicalRoomsLayer, bufferDistance)
```
**What it does:**
- Creates 100m buffer around route
- Queries EV Gebouwen layer for buildings within buffer
- Calculates minimum distance to nearest building
- Returns features, distance, and nearest building

**Example Output:**
```javascript
{
  features: [Feature1, Feature2, Feature3],
  minDistance: 45.3,  // meters
  nearestFeature: Feature1,
  searchRadius: 100
}
```

---

### 2. Query Track Centerlines
```javascript
queryTrackCenterlines(routeGeometry, tracksLayer, bufferDistance)
```
**What it does:**
- Creates 100m buffer around route
- Queries Spoorbaanhartlijn layer for tracks
- Calculates minimum distance to nearest track
- Returns track segments and distance

---

### 3. Query Earthing Points
```javascript
queryEarthingPoints(routeGeometry, earthingLayer, bufferDistance)
```
**What it does:**
- Creates 50m buffer around route
- Queries Aarding layer for earthing points
- Returns all earthing points within buffer

---

### 4. Calculate Earthing-to-Track Distances
```javascript
calculateEarthingToTrackDistances(earthingPoints, trackFeatures)
```
**What it does:**
- For each earthing point, finds nearest track
- Calculates distance
- Checks if distance ≥31m (RLN00398 §5.8)
- Flags violations

---

### 5. Complete Spatial Analysis
```javascript
performCompleteSpatialAnalysis(routeGeometry, layers)
```
**What it does:**
- Runs all queries in sequence
- Collects all spatial data
- Returns comprehensive analysis results

---

## 🧪 Testing

### Test: Draw a Route and Run EMC Evaluator

1. **Open** http://localhost:3001/
2. **Draw a route** using the drawing tools
3. **Click "Run EMC Evaluator"** button
4. **Check console** for query messages:
   ```
   🏢 Querying technical rooms within 100m of route...
      🔍 Query created with 100m buffer
      ✅ Found 2 technical rooms
      📏 Minimum distance to technical room: 45.32m
   
   🛤️ Querying track centerlines within 100m of route...
      🔍 Query created with 100m buffer
      ✅ Found 5 track segments
      📏 Minimum distance to track: 12.50m
   ```

5. **Check compliance report** - Should now show:
   ```
   ✅ PASS: Nearest technical room 45.3m away (≥20m required)
   ```
   Instead of:
   ```
   ⏳ Pending: Technical rooms layer not configured
   ```

---

## 📈 Expected Results

### Technical Room Clearance Rule

**Before:**
```
⏳ Pending
Technical rooms layer not configured
```

**After (if route is compliant):**
```
✅ PASS
Nearest technical room 45.3 m away
```

**After (if route violates):**
```
❌ FAIL
Keep ≥20 m from technical rooms (current 15.2 m)
```

---

### Joint/Earthing Distance Rule

**Before:**
```
⏳ Pending
Document minimum distance between joints/earthing and the track
```

**After (when user enters distance):**
```
✅ PASS
Joints located 35.0 m from track
```

**Note:** This rule still requires user to manually enter `minJointDistanceMeters` in the route metadata form. Automatic calculation will come in Step 4 (Joint Marking UI).

---

## 🔍 Layer Resolution

The updated `resolveTechnicalRoomsLayer()` function now:

1. **First:** Looks for layer with ID `'ev-gebouwen'` (most reliable)
2. **Fallback:** Searches by title/ID keywords:
   - 'ev-gebouwen'
   - 'ev gebouwen'
   - 'technical room'
   - 'technische ruimte'
3. **Caches:** Stores found layer in `window.app.technicalRoomsLayer`

**Console Output:**
```
✅ Found EV Gebouwen (Technical Rooms) layer by ID
```

---

## 🎓 Understanding Spatial Queries

### Buffer-Based Querying:
```
Route Geometry
    ↓
geometryEngine.buffer(route, 100, "meters")
    ↓
Buffer Polygon (100m around route)
    ↓
query.geometry = buffer
query.spatialRelationship = "intersects"
    ↓
Execute query on layer
    ↓
Returns: All features intersecting the buffer
```

### Distance Calculation:
```
Route + Array of Features
    ↓
Loop through each feature:
  distance = geometryEngine.distance(route, feature, "meters")
    ↓
Track minimum distance
    ↓
Returns: { minDistance, nearestFeature }
```

---

## 🚀 What's Next (Step 3)

Now that we can query layers and calculate distances, the next step is to:

### Step 3: Visual Buffer Display & Integration

**Goals:**
1. Display 20m buffer zones around technical rooms
2. Display 31m buffer zones along tracks
3. Highlight violations visually on the map
4. Toggle buffer visibility on/off
5. Color-code: green = safe, yellow = warning, red = violation

**Will integrate:**
- `spatialQueries.js` (queries) ✅ DONE
- `bufferVisualizer.js` (visualization) ✅ DONE
- Map display and user controls 🔄 TODO

---

## ✅ Validation Checklist

To confirm Step 2 works:

- [ ] Dev server reloaded without errors
- [ ] No import/syntax errors in console
- [ ] Draw a route successfully
- [ ] Click "Run EMC Evaluator"
- [ ] Console shows spatial query messages
- [ ] Technical room clearance rule shows real distance (not "layer not configured")
- [ ] Compliance report updates with actual data

---

## 🐛 Troubleshooting

### Issue: Still shows "Technical rooms layer not configured"

**Causes:**
1. EV Gebouwen layer not loaded in map
2. Layer ID mismatch
3. Layer not visible/enabled

**Solutions:**
1. Check Layer List - Find "⚡ Energy Supply System" group
2. Expand it - Look for "🏢 EV Gebouwen (Technical Rooms)"
3. Ensure layer is toggled ON (should be by default)
4. Check console for layer resolution messages
5. Verify layer ID in `layerConfig.js` matches `'ev-gebouwen'`

---

### Issue: Query returns 0 features

**Causes:**
1. Route is far from any technical rooms (>100m search radius)
2. Layer has no data in that area
3. Spatial reference mismatch

**Solutions:**
1. Draw route closer to infrastructure (near stations/substations)
2. Zoom in to see if technical room polygons are visible
3. Check console for query results: "Found X technical rooms"
4. Try different route location

---

### Issue: Distance calculation error

**Causes:**
1. Geometry has no spatial reference
2. Invalid geometry
3. geometryEngine operation failed

**Solutions:**
1. Check console for detailed error messages
2. Verify route geometry is valid polyline
3. Check that layers are loaded (wait for map to fully load)

---

## 📝 Next Steps

### Ready for Step 3?

Once you confirm:
- ✅ "Technical room clearance now shows real distance"
- ✅ "Console shows query messages"
- ✅ "No more 'layer not configured' message"

Reply with: **"Step 2 confirmed"** or **"Spatial queries working"**

And we'll proceed to **Step 3: Visual Buffer Display**! 🚀

---

**Status:** ✅ Code Complete | 🧪 Awaiting Test Confirmation  
**Next:** Step 3 - Visual Buffer Display & Violation Highlighting  
**Estimated Time for Step 3:** 20-30 minutes
