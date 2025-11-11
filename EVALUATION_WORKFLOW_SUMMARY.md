# RLN00398-V004 Evaluation Workflow Summary

**Date:** November 6, 2025  
**Version:** V004 Clean Implementation

---

## 🎯 Complete Workflow Overview

### **1. Route Creation** (Left Panel)
Users can:
- ✅ Draw cable/overhead line routes on the map
- ✅ Add joints/moffen locations
- ✅ Add mast locations
- ✅ Add technical rooms/buildings
- ✅ Edit route metadata:
  - Nominal voltage (kV)
  - Circuit type (single-core, three-core, bundle)
  - Fault clearing time (ms)
  - Min. joint distance (m)
  - Double guying (Yes/No)
  - Insulated conduit (Yes/No)
  - Notes

### **2. Automatic Evaluation** (Backend)
When a route is created or modified, the system automatically:
1. **Initial Distance Check** - Determines if detailed study is needed
2. **Step A Checks** - Circuit configuration, homopolar current, fault risk
3. **Step B Checks** - Zone distance, crossing angle, technical rooms, protection time
4. **Step C** - Unity study (if provided)
5. **Step D** - Detailed EMC study (if provided)

### **3. Results Display** (Right Panel)

---

## 📊 What You'll See on the Right Panel

### **Section 1: Route Snapshot**
```
╔══════════════════════════════════════════════╗
║           Route snapshot                     ║
╠══════════════════════════════════════════════╣
║ Length:              1,250 m                 ║
║ Points:              8                       ║
║ Created:             2025-11-06 14:23:45     ║
║ Infrastructure type: Hoogspanningskabel      ║
║ Nominal voltage:     110 kV                  ║
║ Fault clearing time: 80 ms                   ║
║ Min. joint distance: 50 m                    ║
║ Double guying:       No                      ║
║ Insulated conduit:   Yes                     ║
║ Notes:               Underground section     ║
╚══════════════════════════════════════════════╝
```

### **Section 2: Rule Breakdown**
```
╔══════════════════════════════════════════════╗
║ Rule breakdown            🟢 Compliant       ║
╠══════════════════════════════════════════════╣
║ Pass: 6 | Fail: 0 | Pending: 0 | N/A: 2     ║
║ Last run: 2025-11-06 14:23:45               ║
╚══════════════════════════════════════════════╝
```

### **Section 3: Detailed Rules Table**

| Rule | Status | Details |
|------|--------|---------|
| **Initial - Afstandscheck**<br><small>Bevindt hoogspanningsverbinding zich buiten zone</small> | ✅ Pass | >24 kV buiten 700m zone - Afstand: 850.0 m - VOLDOET (geen modelstudies vereist) |
| **A.1 - Circuit configuratie**<br><small>(Lijn-)circuit in driehoek</small> | ✅ Pass | Circuit type threeCore allowed |
| **A.2 - Homopolaire stroom**<br><small>Geen pad voor homopolaire stroom</small> | ✅ Pass | Homopolar current control present |
| **A.3 - Eenfase-sluiting**<br><small>Kans op 1 fase sluiting met aarde nabij spoor klein</small> | ✅ Pass | Nearest joint/earth point is 45.2 m away (>31 m) |
| **B.4 - Zone afstand**<br><small>Loopt verbinding buiten zone</small> | ✅ Pass | Distance 850.0 m exceeds required 700 m |
| **B.5 - Kruisingshoek**<br><small>Kruist verbinding spoor ongeveer haaks</small> | • N/A | No parallel section detected |
| **B.6 - Technische ruimte**<br><small>Afstand >20m vanaf technische ruimte</small> | ✅ Pass | Nearest technical room is 35.0 m away (>20 m) |
| **B.7 - Beveiligingstijd**<br><small>Eerste orde lijnfout binnen 100ms afgeschakeld</small> | ✅ Pass | Protection clears in 80 ms ≤ 100 ms |

---

## 🔄 Real-Time Compliance Modification

Users can **modify the route** and see compliance updates in real-time:

### Example Scenario 1: Route Too Close
```
Initial State:
- Distance: 650 m from rail
- Status: ❌ Fail (within 700m zone for >24kV)
- Action Required: Move route further away

User Action:
→ Drags route further from railway

New Evaluation:
- Distance: 750 m from rail
- Status: ✅ Pass (outside 700m zone)
- Result: NO DETAILED STUDY REQUIRED
```

### Example Scenario 2: Joint Placement Issue
```
Initial State:
- A.3 Status: ❌ Fail
- Joint at 25m from rail (< 31m threshold)
- Action Required: Relocate joint

User Action:
→ Moves joint location further away

New Evaluation:
- Joint at 35m from rail
- A.3 Status: ✅ Pass
- Result: Compliance improved
```

### Example Scenario 3: Crossing Angle Problem
```
Initial State:
- B.5 Status: ❌ Fail
- Crossing angle: 45° (outside 80-100° range)
- Action Required: Adjust crossing angle

User Action:
→ Redraws route to cross perpendicularly

New Evaluation:
- Crossing angle: 88°
- B.5 Status: ✅ Pass
- Result: Crossing now compliant
```

---

## 📋 Rules Explained

### **Initial Distance Check** ⭐ CRITICAL FIRST STEP
- **>24 kV**: Must be >700m from centerline of outermost rail
- **≤24 kV**: Must be >31m from centerline of outermost rail
- **If PASS**: No model studies or detailed studies required → COMPLIANT
- **If FAIL**: Continue to Steps A & B

### **Step A: Basic Configuration (A.1 - A.3)**
- **A.1**: Circuit configuration (single cable, three-core, or bundle)
- **A.2**: Homopolar current control (grounded neutral point)
- **A.3**: Single-phase fault risk (joints/earth points >31m from track)

### **Step B: Geometric Compliance (B.4 - B.7)**
- **B.4**: Penetration zone distance
- **B.5**: Crossing angle (80-100 degrees) - only if crossing exists
- **B.6**: Technical room distance (>20m from buildings, not cabinets)
- **B.7**: Protection clearing time (≤100ms)

### **Step C: Unity Study** (if Steps A & B fail)
- Requires electromagnetic calculations
- NEW connection alone evaluated
- Must contribute ≤20% to criteria (G2)

### **Step D: Detailed EMC Study** (if Step C fails)
- Full network analysis (new + existing connections)
- Must remain ≤100% of criteria

---

## 📄 Report Generation (Future Implementation)

### Planned Report Structure:
1. **Project Header**
   - Project name, location, date
   - Responsible parties
   - Document references

2. **Situation Description**
   - Screenshot of route in relation to railway
   - Route metadata and characteristics
   - Infrastructure details

3. **Requirements Table**
   | Requirement | Voldaan | Toelichting | Reference |
   |-------------|---------|-------------|-----------|
   | Initial | J/N | Distance info | [Figure 1] |
   | A.1 | J/N | Circuit config | [Spec/Drawing] |
   | A.2 | J/N | Homopolar | [G3 proof] |
   | A.3 | J/N | Fault risk | [Joint locations] |
   | B.4 | J/N | Zone distance | [Route tracing] |
   | B.5 | J/N/N.V.T. | Crossing angle | [Measurement] |
   | B.6 | J/N | Tech room | [Distance map] |
   | B.7 | J/N | Protection | [Concept doc] |

4. **Conclusions & Recommendations**
   - Compliance status
   - Required next steps
   - Recommendations for design changes

5. **Annexes**
   - Supporting calculations
   - Reference documents
   - Spatial data exports

### Download Formats:
- ✅ Markdown (current)
- 🔄 PDF (planned)
- 🔄 Word/DOCX (planned)

---

## 🎯 Key Features

### ✅ Currently Working:
- Route drawing and editing
- Joint/mast placement
- Metadata input (voltage, circuit type, etc.)
- Automatic evaluation on route changes
- Real-time compliance display
- Initial + Step A + Step B evaluation
- Rules table with Pass/Fail/N/A status
- Markdown report export

### 🔄 In Development:
- Step C (Unity study) integration
- Step D (Detailed study) integration
- Spatial queries for actual railway distances
- Crossing angle calculation
- Technical room detection
- Enhanced report template
- PDF/Word export

### 📋 Planned:
- Import existing study results
- Multi-route comparison
- Design optimization suggestions
- Automated mitigation recommendations

---

## 💡 Important Notes

### Critical Input Requirements:
All metadata must be captured correctly for accurate evaluation:
- ✅ **Nominal voltage** - Determines zone thresholds
- ✅ **Circuit type** - Affects A.1 compliance
- ✅ **Homopolar control** - Required for A.2
- ✅ **Joint locations** - Critical for A.3
- ✅ **Fault clearing time** - Must be ≤100ms for B.7
- ✅ **Technical room locations** - Must be >20m for B.6

### Validation Reminders:
- Distance measurements are from **centerline of outermost rail**
- Technical rooms = **buildings**, NOT cabinets
- Crossing angles only apply when route **crosses** the railway
- Protection times refer to **first order faults** only

---

## 🚀 Next Steps

1. **Test the evaluation flow** with various scenarios
2. **Verify all rules display correctly** in the UI
3. **Provide report template** for final output format
4. **Test real-time modification** and re-evaluation
5. **Integrate spatial queries** for actual geometry calculations
6. **Implement PDF/Word export** functionality

---

**End of Summary**
