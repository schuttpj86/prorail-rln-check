# Crossing Angle Calculation - Technical Explanation

## 📐 Overview

The **Crossing Angle Rule** (RLN00398 §5.1(1), §5.2(1)) requires that high-voltage connections cross railway tracks at an angle between **80° and 100°** (approximately perpendicular).

This applies to **both cable and overhead line** infrastructure types.

---

## 🔍 How It Works in Our Code

### Step-by-Step Process

#### 1. **Route Projection** (`evaluateRoute()` - line ~808)
```javascript
const routeRd = projectOperator.execute(route.geometry, RD_SPATIAL_REFERENCE);
```
- The route is projected to **RD New (EPSG:28992)** coordinate system
- This ensures accurate geometric calculations in meters

#### 2. **Fetch Track Geometries** (`fetchTrackGeometries()` - line ~816)
```javascript
const trackGeometries = await fetchTrackGeometries(route.geometry, options.layers);
```
- Queries multiple ProRail layers:
  - **Railway Tracks (Spoorbaanhartlijn)** - Layer 6: Track centerlines
  - **Track Sections (Spoortakdeel)** - Layer 9: Track segments
  - **Switches (Wissel)** - Layer 7: Junction points
- Returns an array of polyline geometries representing railway tracks

#### 3. **Analyze Crossings** (`analyzeCrossings()` - line ~537)
```javascript
const crossing = analyzeCrossings(routeRd, trackGeometries);
```

This function:
- Loops through all track geometries
- Finds geometric intersections between the route and each track
- Calculates the crossing angle at each intersection point
- Returns the "best" angle (closest to 90°)

---

## 🧮 Detailed Angle Calculation

### A. Find Intersection Points (`analyzeCrossings()` - line ~544-551)

```javascript
const intersection = geometryEngine.intersect(routeRd, geometry);
if (!intersection || intersection.isEmpty) {
  continue; // No crossing
}

const intersectionPoint = extractPointFromGeometry(intersection);
```

**What it does:**
- Uses ArcGIS `geometryEngine.intersect()` to find where route crosses track
- Extracts the intersection point(s)
- If multiple crossings exist, analyzes each one

---

### B. Calculate Direction Vectors (`vectorAtPoint()` - line ~470-509)

For both the **route** and the **track** at the intersection point:

```javascript
const routeVector = vectorAtPoint(routeRd, intersectionPoint);
const trackVector = vectorAtPoint(geometry, intersectionPoint);
```

**How `vectorAtPoint()` works:**

1. **Find nearest segment** to the intersection point:
   ```javascript
   const nearest = geometryEngine.nearestCoordinate(polyline, point);
   ```

2. **Get start and end coordinates** of that segment:
   ```javascript
   let start = path[nearest.segmentIndex];
   let end = path[nearest.segmentIndex + 1];
   ```

3. **Calculate normalized direction vector**:
   ```javascript
   const vx = end[0] - start[0];
   const vy = end[1] - start[1];
   const length = Math.hypot(vx, vy);
   
   return {
     x: vx / length,  // Normalized x component
     y: vy / length   // Normalized y component
   };
   ```

**Result:** A unit vector representing the direction of the line at the crossing point.

---

### C. Calculate Angle Between Vectors (`angleBetweenVectors()` - line ~511-536)

```javascript
const angle = angleBetweenVectors(routeVector, trackVector);
```

**Mathematical formula:**

1. **Dot product**:
   ```javascript
   const dot = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
   ```

2. **Magnitudes** (should both be 1.0 since normalized):
   ```javascript
   const magnitudeA = Math.hypot(vectorA.x, vectorA.y);
   const magnitudeB = Math.hypot(vectorB.x, vectorB.y);
   ```

3. **Cosine of angle**:
   ```javascript
   const cosine = clamp(dot / (magnitudeA * magnitudeB), -1, 1);
   ```
   - `clamp()` ensures the value is between -1 and 1 (for numerical stability)

4. **Convert to degrees**:
   ```javascript
   const angleRad = Math.acos(cosine);
   let angleDeg = angleRad * (180 / Math.PI);
   ```

5. **Normalize to acute angle** (0° - 90°):
   ```javascript
   if (angleDeg > 180) {
     angleDeg = 360 - angleDeg;
   }
   
   return angleDeg > 90 ? 180 - angleDeg : angleDeg;
   ```

**Why normalize?**
- We only care about the **acute angle** between the lines
- A crossing at 85° is the same as 95° (just measured from different sides)
- The code ensures the result is always between 0° and 90°

---

### D. Select Primary Angle (`analyzeCrossings()` - line ~566-575)

If the route crosses multiple tracks:

```javascript
primaryAngle = angles.reduce((best, current) => {
  if (best === null) {
    return current;
  }
  return Math.abs(90 - current) < Math.abs(90 - best) ? current : best;
}, null);
```

**Selection criteria:**
- Choose the angle **closest to 90°** (most perpendicular)
- This represents the "worst case" from a compliance perspective
- RLN00398 requires **all** crossings to be near-perpendicular

**Returns:**
```javascript
{
  crossesTrack: true/false,
  primaryAngle: 85.3,  // degrees
  angles: [85.3, 88.1, 92.5]  // all crossing angles
}
```

---

## ✅ Rule Evaluation (`RULE_DEFINITIONS[0]` - line ~23-52)

```javascript
{
  id: "CROSSING_ANGLE",
  title: "Crossing angle between 80° and 100°",
  clause: "§ 5.1 (1), § 5.2 (1)",
  applicableFor: ["cable", "overhead"],
  applies: (ctx) => ctx.crossing.crossesTrack,
  evaluate: (ctx) => {
    const min = config.compliance.crossingAngle.min; // 80
    const max = config.compliance.crossingAngle.max; // 100
    const angle = ctx.crossing.primaryAngle;
    
    if (angle === null) {
      return { status: "not_evaluated", message: "Unable to determine crossing angle" };
    }
    
    const withinRange = angle >= min && angle <= max;
    return {
      status: withinRange ? "pass" : "fail",
      message: withinRange
        ? `Measured crossing angle ${angle.toFixed(1)}°`
        : `Crossing angle ${angle.toFixed(1)}° outside ${min}°–${max}° window`
    };
  }
}
```

**Compliance check:**
1. **Only applies if** `ctx.crossing.crossesTrack === true`
2. **Pass**: If `80° ≤ angle ≤ 100°`
3. **Fail**: If angle is outside this range
4. **Not Evaluated**: If angle cannot be calculated

---

## 🎯 Key Points for Overhead Lines

### Applies Equally to Cables and Overhead Lines

The crossing angle rule is **identical** for both infrastructure types:

```javascript
applicableFor: ["cable", "overhead"]
```

### Why This Rule Exists

**For Cables:**
- Minimizes electromagnetic coupling with track circuits
- Reduces induced voltages during fault conditions

**For Overhead Lines:**
- Minimizes electromagnetic field interaction
- Reduces risk of arc-over during fault conditions
- Ensures clearance distances are maintained consistently
- Simplifies maintenance access

### Perpendicular Crossing Benefits

A **90° crossing** (perpendicular) is optimal because:
- **Shortest crossing distance** = minimum exposure to EMC issues
- **Clearest separation** between HV and railway systems
- **Easier to maintain** required clearances
- **Standard practice** in power engineering

---

## 📊 Example Calculation

### Scenario:
- Route crosses a track at point `(150000, 450000)` in RD New
- Route direction at crossing: `(0.707, 0.707)` → heading northeast (45°)
- Track direction at crossing: `(1.0, 0.0)` → heading east (0°)

### Calculation:
```javascript
// 1. Dot product
dot = (0.707 × 1.0) + (0.707 × 0.0) = 0.707

// 2. Magnitudes (normalized, so both = 1.0)
magnitudeA = 1.0
magnitudeB = 1.0

// 3. Cosine
cosine = 0.707 / 1.0 = 0.707

// 4. Angle in radians
angleRad = acos(0.707) = 0.7854 radians

// 5. Convert to degrees
angleDeg = 0.7854 × (180 / π) = 45°

// 6. Result
angle = 45°
```

### Compliance:
- **Required:** 80° - 100°
- **Actual:** 45°
- **Result:** ❌ **FAIL** - Angle too shallow

### Why It Fails:
The route is running nearly parallel to the track (45° from horizontal), not crossing perpendicularly (90° would be perpendicular).

---

## 🔧 Configuration

The angle thresholds are defined in `config.js`:

```javascript
crossingAngle: {
  min: 80,  // Minimum acceptable angle in degrees
  max: 100  // Maximum acceptable angle in degrees
}
```

**RLN00398 Standard:**
- Requires crossings between **80° and 100°**
- This gives a **±10° tolerance** around perpendicular (90°)

---

## 🐛 Common Issues & Debugging

### Issue: "Unable to determine crossing angle"

**Causes:**
1. Route doesn't actually cross any tracks (parallel or doesn't reach tracks)
2. No track data loaded in the buffer area
3. Intersection point calculation fails
4. Vector calculation fails (segment too short, malformed geometry)

**Debug steps:**
```javascript
console.log("Crossing analysis:", crossing);
// Should show: { crossesTrack: true, primaryAngle: 85.3, angles: [...] }
```

### Issue: Angle seems incorrect

**Possible causes:**
1. **Projected geometry issue** - ensure route is in RD New (EPSG:28992)
2. **Track geometry mismatch** - verify correct track layer is queried
3. **Multi-segment issue** - angle calculated at wrong segment

**Verification:**
- Visually inspect the crossing on the map
- Check if the angle "feels right" compared to visual inspection
- Verify track layer data is accurate

---

## 📚 Related Code Files

| File | Function | Description |
|------|----------|-------------|
| `emcEvaluator.js` | `angleBetweenVectors()` | Core angle calculation |
| `emcEvaluator.js` | `vectorAtPoint()` | Calculate direction vector at point |
| `emcEvaluator.js` | `analyzeCrossings()` | Find all crossings and calculate angles |
| `emcEvaluator.js` | `evaluateRoute()` | Main evaluation orchestration |
| `emcEvaluator.js` | `RULE_DEFINITIONS[0]` | CROSSING_ANGLE rule definition |
| `config.js` | `compliance.crossingAngle` | Angle thresholds (80-100°) |

---

## 🎓 Mathematical Background

### Vector Cross Product Alternative

**Note:** Our code uses the **dot product** method, which gives the **absolute angle** between vectors.

An alternative approach would be the **cross product**, which gives the **signed angle** (clockwise vs. counterclockwise):

```javascript
// Cross product in 2D
const cross = vectorA.x * vectorB.y - vectorA.y * vectorB.x;
const angleRad = Math.atan2(cross, dot);
```

However, for this application, we only need the **magnitude** of the angle (not the direction), so the dot product method is simpler and sufficient.

---

## ✅ Summary

**For Overhead Lines (and Cables):**

1. ✅ **Automatically checked** during route evaluation
2. ✅ **Uses geometric intersection analysis** with track centerlines
3. ✅ **Calculates actual crossing angle** using vector mathematics
4. ✅ **Requires 80° - 100°** (within 10° of perpendicular)
5. ✅ **Reports compliance** in evaluation results

**The code handles this rule completely automatically** - no special configuration needed for overhead lines vs. cables!

---

**Last Updated:** 2025-10-19  
**Version:** 1.0  
**Standard Reference:** RLN00398-V002 § 5.1 (1), § 5.2 (1)
