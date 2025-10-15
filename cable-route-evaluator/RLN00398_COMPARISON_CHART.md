# RLN00398 Version Comparison Chart
## V001 (2013) vs V002 (2020) - Side-by-Side Analysis

---

## Section-by-Section Comparison

### ✅ UNCHANGED: Core Structure and Most Rules

| Section | V001 (2013) | V002 (2020) | Status |
|---------|-------------|-------------|--------|
| **5.1 Point 1** | Crossing angle 80°-100° | Crossing angle 80°-100° | ✅ Identical |
| **5.1 Point 2** | Clearance per NEN-EN 50341 | Clearance per NEN-EN 50341 | ✅ Identical |
| **5.1 Point 3** | Double guying for crossing | Double guying for crossing | ✅ Identical |
| **5.1 Point 4** | Fault clearing ≤100ms | Fault clearing ≤100ms | ✅ Identical |
| **5.1 Point 5** | Non-crossing OHL: 700m / 11m | Non-crossing OHL: 700m / 11m | ✅ Identical |
| **5.1 Point 6** | Magnetic field ≤100µT @ 1m | Magnetic field ≤100µT @ 1m | ✅ Identical |
| **5.1 Point 7** | Masts ≥31m from track | Masts ≥31m from track | ✅ Identical |
| **5.1 Point 8** | OHL ≥20m from tech rooms | OHL ≥20m from tech rooms | ✅ Identical |
| **5.2 Point 1** | Cable crossing 80°-100° | Cable crossing 80°-100° | ✅ Identical |
| **5.2 Point 2** | Fault clearing ≤100ms | Fault clearing ≤100ms | ✅ Identical |
| **5.2 Point 3-5** | Non-crossing cable distances | Non-crossing cable distances | ✅ Identical |
| **5.2 Point 6** | Cables ≥20m from tech rooms | Cables ≥20m from tech rooms | ✅ Identical |
| **5.2 Point 7** | Insulated conduit for crossing | Insulated conduit for crossing | ✅ Identical |
| **5.2 Point 8** | Joints/earthing ≥31m from track | Joints/earthing ≥31m from track | ✅ Identical |

**Application Impact:** ✅ **NO CHANGES NEEDED** - These rules are correctly implemented

---

## 🔄 CHANGED/ENHANCED: Critical Updates

### 1. Section 5.3: Model Study Validation Process

| Aspect | V001 (2013) | V002 (2020) | Impact |
|--------|-------------|-------------|--------|
| **When required** | If initial checks fail | If initial checks fail | ✅ Same |
| **Validation requirement** | Must be "plausible" | **NEW:** Specific thresholds:<br>• <50%: Reference comparison<br>• 50-80%: Second opinion required<br>• >80%: Continuous monitoring | 📝 Documentation |

**Application Impact:** Documentation update (process change, not logic change)

---

### 2. Table T4: Homopolar Current Assumption

| Aspect | V001 (2013) | V002 (2020) | Impact |
|--------|-------------|-------------|--------|
| **Assumption** | 10% homopolar current | 10% homopolar current | ✅ Same |
| **Exception** | *(Not mentioned)* | **NEW:** "Can be disregarded if physically impossible due to network topology (e.g., ungrounded star point)" | 🟡 Logic refinement |

**Application Impact:** Add user toggle to skip homopolar consideration when applicable

---

### 3. Criterion B1: Track Circuit Immunity

| Aspect | V001 (2013) | V002 (2020) | Impact |
|--------|-------------|-------------|--------|
| **Generic limits** | 20 Vcm (continuous)<br>65 Vcm (short circuit)<br>58 Acm | 20 Vcm (continuous)<br>65 Vcm (short circuit)<br>58 Acm | ✅ Same |
| **Length-based** | *(Not available)* | **NEW: Appendix 2**<br>5 detailed tables:<br>• Table 2: Continuous current limits<br>• Table 3: Continuous voltage limits<br>• Table 4: Fault current limits<br>• Table 5: Fault voltage limits<br>All indexed by:<br>- Track circuit type (OV 231.xxx)<br>- Length (25m increments, 0-700m) | 🟠 Major enhancement |

**Application Impact:** Implement length-based lookup for more accurate assessments

---

### 4. Criterion B5: 50Hz Component in 1500V DC Traction (**CRITICAL**)

| Aspect | V001 (2013) | V002 (2020) | Impact |
|--------|-------------|-------------|--------|
| **Continuous limit** | 7V | **16V** (2.3x increase) | 🔴 **CRITICAL** |
| **Short circuit limit** | 25V | **40V** (1.6x increase) | 🔴 **CRITICAL** |
| **Duration** | >1s | >1s | ✅ Same |

**Application Impact:** Update thresholds immediately - current values too restrictive

---

## 📊 Detailed Appendix 2 Analysis

### Sample Data: How Much More Accurate Can We Be?

**Scenario:** Evaluating route near track circuit type OV 231.112-4

| Track Length | Generic Limit<br>(Current App) | V002 Appendix 2<br>Actual Limit | Difference | Interpretation |
|--------------|-------------------------------|--------------------------------|------------|----------------|
| **25m** | 20V | 61.4V | +206% | Much more permissive |
| **50m** | 20V | 48.1V | +140% | Much more permissive |
| **100m** | 20V | 42.8V | +114% | Much more permissive |
| **200m** | 20V | 34.1V | +70% | More permissive |
| **400m** | 20V | 25.7V | +28% | Slightly more permissive |
| **600m** | 20V | 23.8V | +19% | Slightly more permissive |
| **700m** | 20V | 21.4V | +7% | Nearly same |

**Key Insight:** Shorter track circuits can tolerate **much more** interference than the generic 20V limit suggests.

**Benefit of Implementation:**
- More accurate assessments
- Fewer unnecessary route rejections
- Better optimization opportunities for short parallel sections

---

## 🎯 Priority Matrix

### Urgency vs. Complexity

```
HIGH URGENCY
│
│   B5 Update          │  Appendix 2 Tables
│   (CRITICAL)         │  (Accuracy++)
│   ████████           │  ████████████
│   Effort: Medium     │  Effort: High
│                      │
├──────────────────────┼────────────────────
│                      │
│   Doc Updates        │  T4 Toggle
│   (Compliance)       │  (Refinement)
│   ████               │  ████████
│   Effort: Low        │  Effort: Low
│                      │
LOW URGENCY            └──────────────────────
    LOW COMPLEXITY          HIGH COMPLEXITY
```

**Recommended Sequence:**
1. 🔴 B5 Update (critical + medium effort)
2. 🟢 Doc Updates (low effort, quick win)
3. 🟡 T4 Toggle (low effort, useful refinement)
4. 🟠 Appendix 2 (high effort, significant value)

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes
- [ ] **Locate B5 implementation** (or confirm it's missing)
- [ ] **Add B5 evaluation rule** with 16V/40V thresholds
- [ ] **Add UI inputs** for 50Hz voltage measurement
- [ ] **Update translations** (EN/NL) for B5
- [ ] **Test B5 logic** with reference scenarios
- [ ] **Update all "RLN00398" references** to include version/date
- [ ] **Update translations** for document references
- [ ] **Update report templates** with V002 citation

### Phase 2: Enhancements
- [ ] **Add homopolar current toggle** to UI
- [ ] **Update evaluation logic** to respect T4 toggle
- [ ] **Add tooltip/help text** explaining when to uncheck
- [ ] **Update translations** (EN/NL) for T4 toggle
- [ ] **Create Appendix 2 data structures** (Tables 2-5)
- [ ] **Implement lookup function** for length-based immunity
- [ ] **Add UI inputs** for track circuit length + type
- [ ] **Modify B1 evaluation** to use Appendix 2 when available
- [ ] **Add "Advanced Mode" toggle** for optional precision
- [ ] **Update translations** (EN/NL) for Appendix 2 features
- [ ] **Test all new logic** with reference scenarios
- [ ] **Update documentation** (README, user guide)

### Phase 3: Validation
- [ ] **Create test cases** for all updated rules
- [ ] **Compare results** with V001 baseline
- [ ] **Validate against ProRail reference examples** (if available)
- [ ] **User acceptance testing**
- [ ] **Update CHANGELOG** with version migration notes

---

## 🔬 Technical Deep Dive: B5 Criterion

### Why Did the Limits Change?

**V002 Documentation Explains:**

> "Rijdend materieel kan bij een 50 Hz spanningscomponent in de 1500V DC tractiespanning, problemen in de railinfrastructuur veroorzaken. In de RIS is opgenomen dat materieel bij een 50V50Hz spanning onder de 5.3A75Hz blijft.
>
> Voor enkelbenige spoorstroomlopen wordt een grenswaarde van 1.7A/4.25A (T > 1.8s) gehanteerd. Wanneer deze lineair worden geschaald (aanname), dan komt men uit op een spanning van 16V/40V."

**Translation & Explanation:**

"Rolling stock with a 50Hz voltage component in the 1500V DC traction power can cause problems in rail infrastructure. RIS specifies that equipment must stay below 5.3A at 75Hz when exposed to 50V at 50Hz.

For single-leg track circuits, the threshold is 1.7A/4.25A (T > 1.8s). When scaled linearly, this corresponds to voltages of **16V/40V**."

**Key Points:**
1. **Root cause:** 50Hz voltage in DC system creates 75Hz harmonics in rolling stock
2. **Cascade effect:** 75Hz harmonics interfere with track circuit detection
3. **Calculation:** Limits derived from track circuit immunity, not arbitrary
4. **Conservative factor:** 1s duration assumes Track Repeater (TPR) response time

### Implementation Considerations

**Option A: User Input (Recommended for Phase 1)**
```javascript
metadata: {
  measured50HzVoltage: null,  // User provides measured value
  // ... other fields
}
```

**Pros:**
- Simple to implement
- No complex calculations needed
- User can use their own measurement methods

**Cons:**
- Requires external measurement/calculation
- Extra input burden on user

**Option B: Calculated (Future Enhancement)**
```javascript
// Calculate induced voltage from:
// - Route geometry (distance to HV line)
// - HV line characteristics (voltage, current, phase balance)
// - Ground conductivity
// - Parallel run length
```

**Pros:**
- Automated evaluation
- No extra user input

**Cons:**
- Complex electromagnetic field calculations
- Requires detailed HV line data
- May need external libraries (e.g., EMTP, CDEGS)

---

## 📚 Appendix 2 Data Structure Design

### Proposed Implementation

```javascript
const APPENDIX_2_IMMUNITY = {
  // Table 2: Continuous operation current limits (Amperes)
  continuous_current: {
    "231.111-2": [
      { length: 25, limit: 1006 },
      { length: 50, limit: 504 },
      { length: 75, limit: 336 },
      // ... up to 700m
    ],
    "231.112-4": [
      { length: 25, limit: 1405 },
      // ... etc
    ],
    // ... other types
  },
  
  // Table 3: Continuous operation voltage limits (Volts @ 10Ω fault)
  continuous_voltage: {
    "231.111-2": [
      { length: 25, limit: 62.1 },
      // ... etc
    ],
  },
  
  // Table 4: Fault condition current limits
  fault_current: { /* ... */ },
  
  // Table 5: Fault condition voltage limits
  fault_voltage: { /* ... */ }
};

// Lookup function with interpolation
function getImmunityLimit(type, length, metric, condition) {
  const table = APPENDIX_2_IMMUNITY[`${condition}_${metric}`][type];
  
  // Find bounding values
  const lower = table.filter(e => e.length <= length).pop();
  const upper = table.find(e => e.length > length);
  
  if (!lower) return table[0].limit;  // Shorter than min
  if (!upper) return lower.limit;     // Longer than max
  
  // Linear interpolation
  const ratio = (length - lower.length) / (upper.length - lower.length);
  return lower.limit + ratio * (upper.limit - lower.limit);
}
```

---

## 🎓 Training Notes for Users

### When to Use Appendix 2 (Advanced Mode)

**Use generic 20V/58A when:**
- ✅ Quick preliminary assessment
- ✅ Track circuit details unknown
- ✅ Conservative estimate acceptable

**Use Appendix 2 tables when:**
- ✅ Optimizing route near track circuits
- ✅ Track circuit type/length known (from ProRail data)
- ✅ Route appears to fail with generic limits
- ✅ Want most accurate assessment possible

### When to Uncheck Homopolar Current Toggle

**Keep checked (default) when:**
- ✅ Unsure about HV network topology
- ✅ Standard delta or grounded-wye configuration
- ✅ Want conservative assessment

**Uncheck when:**
- ✅ HV network has ungrounded wye (floating neutral)
- ✅ Network topology makes homopolar current impossible
- ✅ Network operator confirms with documentation

---

## 📞 Support & Questions

**If you have questions about:**

- **Standard interpretation:** Contact ProRail AM Treinbeveiliging
- **Application usage:** See updated README and user guide
- **Technical implementation:** Review detailed plan document
- **Report errors:** Create issue in repository

---

**Document Version:** 1.0  
**Last Updated:** October 15, 2025  
**Related Documents:**
- `RLN00398-V002.md` - Full standard text
- `RLN00398_VERSION_UPDATE_PLAN.md` - Detailed implementation plan
- `RLN00398_UPDATE_QUICK_REFERENCE.md` - Quick decision guide

---

**🚦 CURRENT STATUS: AWAITING USER INPUT TO PROCEED WITH IMPLEMENTATION**
