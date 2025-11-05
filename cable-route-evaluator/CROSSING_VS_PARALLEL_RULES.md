# Crossing vs. Non-Crossing Rule Logic

## 🎯 The Key Question

**"If an overhead line comes within 700m anyway when crossing, how do the crossing angle and parallel distance rules work together?"**

## ✅ Answer: They Are Mutually Exclusive!

The rules **do not apply simultaneously**. The RLN00398 standard distinguishes between two scenarios:

---

## 📋 RLN00398 Standard Logic

### For Overhead Lines (§5.1):

**§5.1(1) - Crossing Rule:**
> "De hoogspanningslijn dient de spoorbaan haaks te kruisen met een hoek Ѱ, waarbij 80 ≤ Ѱ ≤100 graden"
> 
> Translation: The overhead line must cross the track perpendicularly at angle Ѱ, where 80° ≤ Ѱ ≤ 100°

**§5.1(5) - Non-Crossing (Parallel) Rule:**
> "Niet kruisende hoogspanningslijnen mogen niet aanwezig zijn binnen een afstand van – horizontaal gemeten - 700 m uit het hart van de buitenste spoorbaan"
> 
> Translation: **Non-crossing** overhead lines may not be present within a distance of - measured horizontally - 700 m from the center of the outermost track
> 
> **Exception:** "In afwijking van punt 5a geldt een afstand van 11 meter bij geëlektrificeerde sporen met een tractiespanning van 25 kV, 50 Hz"
> 
> Translation: By way of exception, a distance of 11 meters applies for electrified tracks with a traction voltage of 25 kV, 50 Hz

---

## 🔍 How Our Code Implements This

### 1. Crossing Detection (`analyzeCrossings()`)

```javascript
const crossing = analyzeCrossings(routeRd, trackGeometries);
// Returns: { crossesTrack: true/false, primaryAngle: 85.3, angles: [...] }
```

This determines whether the route **geometrically intersects** with any track.

---

### 2. Rule Application Logic

#### **A. Crossing Angle Rule** (Lines 22-52)

```javascript
{
  id: "CROSSING_ANGLE",
  title: "Crossing angle between 80° and 100°",
  clause: "§ 5.1 (1), § 5.2 (1)",
  applicableFor: ["cable", "overhead"],
  applies: (ctx) => ctx.crossing.crossesTrack,  // ✅ ONLY if crosses
  evaluate: (ctx) => {
    const angle = ctx.crossing.primaryAngle;
    const withinRange = angle >= 80 && angle <= 100;
    return { status: withinRange ? "pass" : "fail" };
  }
}
```

**Applies when:** `crossesTrack === true`

---

#### **B. Non-Crossing Distance Rule** (Lines 108-140)

```javascript
{
  id: "OHL_NON_CROSSING_DISTANCE",
  title: "Overhead line distance to track",
  clause: "§ 5.1 (5)",
  applicableFor: ["overhead"],
  applies: (ctx) => ctx.routeType === "overhead" && !ctx.crossing.crossesTrack,  // ✅ ONLY if does NOT cross
  evaluate: (ctx) => {
    const threshold = ctx.metadata.electrifiedSystem === "25kv_50hz"
        ? 11  // Electrified tracks: 11m
        : 700; // Non-electrified: 700m
    const distance = ctx.distances.track;
    const passes = distance >= threshold;
    return { status: passes ? "pass" : "fail" };
  },
  notApplicableMessage: "Overhead line crosses the track"  // ✅ Shown when crossing
}
```

**Applies when:** `routeType === "overhead"` **AND** `crossesTrack === false`

---

## 🎲 Decision Tree

```
Start: Evaluate Overhead Line Route
│
├─ Does route cross any track?
│  │
│  ├─ YES → Route CROSSES track
│  │        │
│  │        ├─ ✅ Apply: Crossing Angle Rule (80°-100°)
│  │        ├─ ❌ Skip: Non-Crossing Distance Rule (not applicable)
│  │        │
│  │        └─ Result:
│  │             • PASS if angle between 80°-100°
│  │             • FAIL if angle outside range
│  │
│  └─ NO → Route runs PARALLEL to track
│           │
│           ├─ ❌ Skip: Crossing Angle Rule (not applicable)
│           ├─ ✅ Apply: Non-Crossing Distance Rule
│           │
│           └─ Check minimum distance:
│                • Is track electrified (25kV 50Hz)?
│                   ├─ YES → Require ≥11m
│                   └─ NO  → Require ≥700m
│                │
│                └─ Result:
│                     • PASS if distance ≥ threshold
│                     • FAIL if distance < threshold
```

---

## 💡 Real-World Scenarios

### Scenario 1: Overhead Line Crosses Track

**Route:** Overhead line crosses railway at 85°

**Analysis:**
- `crossesTrack`: ✅ **true**
- `primaryAngle`: 85°
- `minimumDistance`: ~15m (at crossing point)

**Rules Applied:**
1. ✅ **Crossing Angle Rule**: Checks 80° ≤ 85° ≤ 100° → **PASS** ✅
2. ❌ **Non-Crossing Distance Rule**: Not applicable (route crosses)

**Result:** **PASS** - The crossing angle is acceptable. The 700m rule does NOT apply because the line crosses the track.

---

### Scenario 2: Overhead Line Runs Parallel (Non-Electrified Track)

**Route:** Overhead line runs parallel to railway, never crossing

**Analysis:**
- `crossesTrack`: ❌ **false**
- `primaryAngle`: null (no crossing)
- `minimumDistance`: 450m

**Rules Applied:**
1. ❌ **Crossing Angle Rule**: Not applicable (no crossing)
2. ✅ **Non-Crossing Distance Rule**: Checks distance ≥ 700m → **FAIL** ❌ (450m < 700m)

**Result:** **FAIL** - The line is too close to the track. Must be at least 700m away if running parallel.

---

### Scenario 3: Overhead Line Runs Parallel (Electrified Track)

**Route:** Overhead line runs parallel to electrified railway (25kV 50Hz)

**Analysis:**
- `crossesTrack`: ❌ **false**
- `primaryAngle`: null
- `minimumDistance`: 15m
- `electrifiedSystem`: "25kv_50hz"

**Rules Applied:**
1. ❌ **Crossing Angle Rule**: Not applicable (no crossing)
2. ✅ **Non-Crossing Distance Rule**: Checks distance ≥ 11m → **PASS** ✅ (15m > 11m)

**Result:** **PASS** - The 11m exception applies for electrified tracks.

---

### Scenario 4: Overhead Line Crosses at Shallow Angle

**Route:** Overhead line crosses railway at 35° (too shallow)

**Analysis:**
- `crossesTrack`: ✅ **true** (does intersect geometrically)
- `primaryAngle`: 35°
- `minimumDistance`: ~10m (at crossing point)

**Rules Applied:**
1. ✅ **Crossing Angle Rule**: Checks 80° ≤ 35° ≤ 100° → **FAIL** ❌
2. ❌ **Non-Crossing Distance Rule**: Not applicable (route crosses)

**Result:** **FAIL** - The crossing angle is too shallow. Even though the route comes close to the track, the 700m rule is NOT checked because it technically crosses.

---

## 🤔 Why This Makes Sense

### Engineering Rationale:

**When Crossing:**
- The route **must cross** the tracks to get from point A to point B
- The critical factor is **how it crosses** (angle)
- A perpendicular crossing (80°-100°) minimizes:
  - Length of exposure to EMC effects
  - Electromagnetic coupling
  - Fault current induction
- Distance is inherently limited by the crossing itself
- The **700m rule would be impossible to meet** at the crossing point

**When Parallel (Non-Crossing):**
- The route **could be routed elsewhere** (doesn't have to be near tracks)
- The critical factor is **minimum separation distance**
- The 700m distance ensures:
  - Minimal electromagnetic coupling over long parallel sections
  - Safety margin for fault scenarios
  - Reduced influence on train protection systems
- **Exception for electrified tracks (11m)**: Different EMC characteristics allow closer proximity

---

## 🛡️ Standard Intent

The RLN00398 standard recognizes two fundamentally different situations:

| Aspect | Crossing | Parallel (Non-Crossing) |
|--------|----------|------------------------|
| **Primary Concern** | Angle of crossing | Distance separation |
| **Can be avoided?** | No (route must cross) | Yes (route can be relocated) |
| **Exposure length** | Minimal (just crossing) | Extended (parallel section) |
| **Rule focus** | Geometry (angle) | Distance (separation) |
| **Feasibility** | Perpendicular crossing achievable | Large distance achievable |

---

## ✅ Summary

**Your Question:**
> "If it comes within 700m anyway for OHL crossing, how do these two rules keep track of each other?"

**Answer:**
The rules **don't need to keep track of each other** because they are **mutually exclusive**:

1. ✅ **Crossing** → Check angle (80°-100°), ignore 700m rule
2. ✅ **Parallel** → Check 700m distance, ignore angle rule

The code implements this correctly using the `applies` function:

```javascript
// Crossing rule
applies: (ctx) => ctx.crossing.crossesTrack

// Parallel rule
applies: (ctx) => ctx.routeType === "overhead" && !ctx.crossing.crossesTrack
```

**The 700m rule explicitly does NOT apply when crossing** - only when running parallel to the tracks.

---

## 🔧 Code Verification

You can verify this by:

1. **Draw a route that crosses** → See "Crossing Angle Rule" evaluated, "Non-Crossing Distance" shows "Not Applicable"
2. **Draw a route parallel to tracks** → See "Non-Crossing Distance Rule" evaluated, "Crossing Angle" shows "Not Applicable"

---

**Created:** 2025-10-19  
**Standard Reference:** RLN00398-V002 § 5.1 (1), (5); § 5.2 (1), (3)  
**Code Reference:** `emcEvaluator.js` lines 22-52 (crossing), 108-140 (parallel)
