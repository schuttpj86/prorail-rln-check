# Comparative Route Evaluation Report

## High Voltage Connection Route Evaluation

---

**Project:** High Voltage Connection Route Evaluation

**Organization:** ProRail

**Author:** _[To be completed]_

**Date:** 16/10/2025

**Number of Routes Evaluated:** 3

**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)

---

\pagebreak

## 1. Executive Summary

This report presents a comparative evaluation of 3 alternative routes for the High Voltage Connection Route Evaluation. Each route has been evaluated against ProRail's EMC compliance standards (RLN00398 v002).

### 1.1 Route Comparison Summary

| Route | Length | Status | Pass | Fail | Pending | N/A |
|-------|--------|--------|------|------|---------|-----|
| Route 1 - 20kV | 8.74 km | ✅ | 4 | 0 | 0 | 3 |
| Route 2 | 10.87 km | ✅ | 4 | 0 | 0 | 2 |
| Route 3 | 4.37 km | ❌ | 1 | 2 | 1 | 3 |

### 1.2 Recommended Route

Multiple routes meet the EMC compliance criteria. Further evaluation based on cost, constructability, and other factors is recommended:

- Route 1 - 20kV
- Route 2

\pagebreak

## 2. Individual Route Evaluations

### 2.1 Route 1 - 20kV



## 1. Executive Summary

**Route Name:** Route 1 - 20kV

**Route Length:** 8.74 km

**Infrastructure Type:** Underground Cable

**Nominal Voltage:** 20 kV

**Overall Compliance Status:** ✅ **COMPLIANT**

### Evaluation Summary

| Criteria | Count |
|----------|-------|
| ✅ Pass | 4 |
| ❌ Fail | 0 |
| ⏳ Pending | 0 |
| ➖ Not Applicable | 3 |

> **✅ PRELIMINARY APPROVAL:** This route meets all evaluated EMC compliance criteria based on current information.





## 2. Report & Data Details

**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)

**Evaluation Tool:** ProRail Cable Route Evaluator (Web Application)

**Report Generated:** 16/10/2025

**Spatial Reference System:** RD New (EPSG:28992)

**Data Sources:**
- ProRail Infrastructure Data (Railway Tracks, Track Sections, Switches)
- ProRail Energy Supply System Data
- ProRail Train Protection System Data
- Technical Rooms and Facilities Data





## 3. Route Overview

### 3.1 Route Geometry

**Route Identifier:** route-1760567830094-4azvyqd63

**Route Name:** Route 1 - 20kV

**Total Length:** 8.74 km

**Infrastructure Type:** Underground Cable

**Number of Vertices:** 6

**Start Coordinates (RD):** X=5.21, Y=52.13

**End Coordinates (RD):** X=5.34, Y=52.14

### 3.2 Design Parameters

| Parameter | Value |
|-----------|-------|
| Infrastructure Type | Underground Cable |
| Nominal Voltage | 20 kV |
| Electrified System | standard |
| Fault Clearing Time | 100 ms |
| Bored Crossing | Not specified |
| Min. Joint Distance | N/A |




## 4. Detailed EMC Compliance Evaluation

This section presents the results of the automated EMC compliance evaluation against ProRail RLN00398 v002.

### 4.1 Evaluation Results by Criterion

#### 4.1.1 Crossing angle between 80° and 100°

**Status:** ➖ **NOT APPLICABLE**

**Standard Reference:** § 5.1 (1), § 5.2 (1)

**Assessment:** Not applicable to this route configuration.

**Note:** Route does not cross a railway track

---

#### 4.1.2 Fault must clear within 100 ms

**Status:** ✅ **PASS**

**Standard Reference:** § 5.1 (4), § 5.2 (2)

**Assessment Result:**

Fault clearing time 100 ms

**Measured Values:**

- Fault Clearing Time: 100 ms
- Maximum Limit: 100 ms

---

#### 4.1.3 ≥35 kV cable distance to track

**Status:** ➖ **NOT APPLICABLE**

**Standard Reference:** § 5.2 (3)

**Assessment:** Not applicable to this route configuration.

**Note:** Cable crosses the track

---

#### 4.1.4 <35 kV cable distance to track

**Status:** ✅ **PASS**

**Standard Reference:** § 5.2 (4), § 5.2 (5)

**Assessment Result:**

Minimum horizontal distance 653.7 m

**Measured Values:**

- Minimum Distance: 653.67 m
- Required Distance: 11.00 m

---

#### 4.1.5 Bored insulated conduit for underpasses

**Status:** ➖ **NOT APPLICABLE**

**Standard Reference:** § 5.2 (7)

**Assessment:** Not applicable to this route configuration.

**Note:** Cable does not cross the track

---

#### 4.1.6 No HV infrastructure within 20 m of technical rooms

**Status:** ✅ **PASS**

**Standard Reference:** § 5.1 (8), § 5.2 (6)

**Assessment Result:**

Nearest technical room 995.0 m away

**Measured Values:**

- Minimum Distance: 994.99 m
- Required Distance: 20.00 m

---

#### 4.1.7 Joints and earthing ≥31 m from track

**Status:** ✅ **PASS**

**Standard Reference:** § 5.2 (8)

**Assessment Result:**

Entire route is 653.7 m from tracks - joints can be placed anywhere

**Measured Values:**

- Minimum Distance: 653.67 m
- Required Distance: 31.00 m
- Auto-evaluated: Yes

---





## 5. Recommendations and Next Steps

### 5.1 Preliminary Approval

Based on the current evaluation, this route meets all applicable EMC compliance criteria. The following next steps are recommended:

1. Complete the detailed system design parameters (Appendix B)
2. Conduct detailed EMC modeling using approved software (e.g., CDEGS, RailwaySafe)
3. Verify assumptions with field measurements where applicable
4. Obtain final approval from ProRail EMC specialists

\pagebreak

### 2.2 Route 2



## 1. Executive Summary

**Route Name:** Route 2

**Route Length:** 10.87 km

**Infrastructure Type:** Overhead Line

**Nominal Voltage:** 110 kV

**Overall Compliance Status:** ✅ **COMPLIANT**

### Evaluation Summary

| Criteria | Count |
|----------|-------|
| ✅ Pass | 4 |
| ❌ Fail | 0 |
| ⏳ Pending | 0 |
| ➖ Not Applicable | 2 |

> **✅ PRELIMINARY APPROVAL:** This route meets all evaluated EMC compliance criteria based on current information.





## 2. Report & Data Details

**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)

**Evaluation Tool:** ProRail Cable Route Evaluator (Web Application)

**Report Generated:** 16/10/2025

**Spatial Reference System:** RD New (EPSG:28992)

**Data Sources:**
- ProRail Infrastructure Data (Railway Tracks, Track Sections, Switches)
- ProRail Energy Supply System Data
- ProRail Train Protection System Data
- Technical Rooms and Facilities Data





## 3. Route Overview

### 3.1 Route Geometry

**Route Identifier:** route-1760567882208-dx13zxobt

**Route Name:** Route 2

**Total Length:** 10.87 km

**Infrastructure Type:** Overhead Line

**Number of Vertices:** 6

**Start Coordinates (RD):** X=5.25, Y=52.12

**End Coordinates (RD):** X=5.39, Y=52.10

### 3.2 Design Parameters

| Parameter | Value |
|-----------|-------|
| Infrastructure Type | Overhead Line |
| Nominal Voltage | 110 kV |
| Electrified System | standard |
| Fault Clearing Time | 100 ms |
| Double Guying | Not specified |
| Min. Mast Distance | N/A |




## 4. Detailed EMC Compliance Evaluation

This section presents the results of the automated EMC compliance evaluation against ProRail RLN00398 v002.

### 4.1 Evaluation Results by Criterion

#### 4.1.1 Crossing angle between 80° and 100°

**Status:** ➖ **NOT APPLICABLE**

**Standard Reference:** § 5.1 (1), § 5.2 (1)

**Assessment:** Not applicable to this route configuration.

**Note:** Route does not cross a railway track

---

#### 4.1.2 Fault must clear within 100 ms

**Status:** ✅ **PASS**

**Standard Reference:** § 5.1 (4), § 5.2 (2)

**Assessment Result:**

Fault clearing time 100 ms

**Measured Values:**

- Fault Clearing Time: 100 ms
- Maximum Limit: 100 ms

---

#### 4.1.3 Crossing span is double-guyed

**Status:** ➖ **NOT APPLICABLE**

**Standard Reference:** § 5.1 (3)

**Assessment:** Not applicable to this route configuration.

**Note:** Applies only to overhead crossings

---

#### 4.1.4 Overhead line distance to track

**Status:** ✅ **PASS**

**Standard Reference:** § 5.1 (5)

**Assessment Result:**

Minimum horizontal distance 1839.0 m

**Measured Values:**

- Minimum Distance: 1839.02 m
- Required Distance: 700.00 m

---

#### 4.1.5 No HV infrastructure within 20 m of technical rooms

**Status:** ✅ **PASS**

**Standard Reference:** § 5.1 (8), § 5.2 (6)

**Assessment Result:**

Nearest technical room 1913.8 m away

**Measured Values:**

- Minimum Distance: 1913.82 m
- Required Distance: 20.00 m

---

#### 4.1.6 Masts ≥31 m from track

**Status:** ✅ **PASS**

**Standard Reference:** § 5.1 (7)

**Assessment Result:**

Entire route is 1839.0 m from tracks - masts can be placed anywhere

**Measured Values:**

- Minimum Distance: 1839.02 m
- Required Distance: 31.00 m
- Auto-evaluated: Yes

---





## 5. Recommendations and Next Steps

### 5.1 Preliminary Approval

Based on the current evaluation, this route meets all applicable EMC compliance criteria. The following next steps are recommended:

1. Complete the detailed system design parameters (Appendix B)
2. Conduct detailed EMC modeling using approved software (e.g., CDEGS, RailwaySafe)
3. Verify assumptions with field measurements where applicable
4. Obtain final approval from ProRail EMC specialists

\pagebreak

### 2.3 Route 3



## 1. Executive Summary

**Route Name:** Route 3

**Route Length:** 4.37 km

**Infrastructure Type:** Underground Cable

**Nominal Voltage:** 110 kV

**Overall Compliance Status:** ❌ **NON-COMPLIANT**

### Evaluation Summary

| Criteria | Count |
|----------|-------|
| ✅ Pass | 1 |
| ❌ Fail | 2 |
| ⏳ Pending | 1 |
| ➖ Not Applicable | 3 |

> **⚠️ ACTION REQUIRED:** This route has 2 failing criteria that must be addressed before proceeding with detailed design.





## 2. Report & Data Details

**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)

**Evaluation Tool:** ProRail Cable Route Evaluator (Web Application)

**Report Generated:** 16/10/2025

**Spatial Reference System:** RD New (EPSG:28992)

**Data Sources:**
- ProRail Infrastructure Data (Railway Tracks, Track Sections, Switches)
- ProRail Energy Supply System Data
- ProRail Train Protection System Data
- Technical Rooms and Facilities Data





## 3. Route Overview

### 3.1 Route Geometry

**Route Identifier:** route-1760567937423-dhe77chbe

**Route Name:** Route 3

**Total Length:** 4.37 km

**Infrastructure Type:** Underground Cable

**Number of Vertices:** 5

**Start Coordinates (RD):** X=5.36, Y=52.13

**End Coordinates (RD):** X=5.41, Y=52.15

### 3.2 Design Parameters

| Parameter | Value |
|-----------|-------|
| Infrastructure Type | Underground Cable |
| Nominal Voltage | 110 kV |
| Electrified System | standard |
| Fault Clearing Time | 120 ms |
| Bored Crossing | Not specified |
| Min. Joint Distance | N/A |




## 4. Detailed EMC Compliance Evaluation

This section presents the results of the automated EMC compliance evaluation against ProRail RLN00398 v002.

### 4.1 Evaluation Results by Criterion

#### 4.1.1 Crossing angle between 80° and 100°

**Status:** ➖ **NOT APPLICABLE**

**Standard Reference:** § 5.1 (1), § 5.2 (1)

**Assessment:** Not applicable to this route configuration.

**Note:** Route does not cross a railway track

---

#### 4.1.2 Fault must clear within 100 ms

**Status:** ❌ **FAIL**

**Standard Reference:** § 5.1 (4), § 5.2 (2)

**Assessment Result:**

Fault clearing time 120 ms exceeds 100 ms

**Measured Values:**

- Fault Clearing Time: 120 ms
- Maximum Limit: 100 ms

> **⚠️ NON-COMPLIANCE:** This criterion requires design modifications or further investigation.

---

#### 4.1.3 ≥35 kV cable distance to track

**Status:** ❌ **FAIL**

**Standard Reference:** § 5.2 (3)

**Assessment Result:**

Maintain 700 m separation from the track (current 0.0 m)

**Measured Values:**

- Minimum Distance: 0.00 m
- Required Distance: 700.00 m

> **⚠️ NON-COMPLIANCE:** This criterion requires design modifications or further investigation.

---

#### 4.1.4 <35 kV cable distance to track

**Status:** ➖ **NOT APPLICABLE**

**Standard Reference:** § 5.2 (4), § 5.2 (5)

**Assessment:** Not applicable to this route configuration.

**Note:** Cable crosses the track

---

#### 4.1.5 Bored insulated conduit for underpasses

**Status:** ➖ **NOT APPLICABLE**

**Standard Reference:** § 5.2 (7)

**Assessment:** Not applicable to this route configuration.

**Note:** Cable does not cross the track

---

#### 4.1.6 No HV infrastructure within 20 m of technical rooms

**Status:** ✅ **PASS**

**Standard Reference:** § 5.1 (8), § 5.2 (6)

**Assessment Result:**

Nearest technical room 1786.0 m away

**Measured Values:**

- Minimum Distance: 1786.00 m
- Required Distance: 20.00 m

---

#### 4.1.7 Joints and earthing ≥31 m from track

**Status:** ⏳ **PENDING**

**Standard Reference:** § 5.2 (8)

**Assessment Result:**

Route comes within 0.0 m of tracks - mark joint locations for validation

> **ℹ️ ACTION REQUIRED:** Additional information or field verification needed to complete this evaluation.

---





## 5. Recommendations and Next Steps

### 5.1 Critical Issues

The following criteria do not meet the required standards and must be addressed:

1. **Fault must clear within 100 ms** (§ 5.1 (4), § 5.2 (2))
   - Current Status: Fault clearing time 120 ms exceeds 100 ms
   - Recommended Action: _[To be completed by design engineer]_

2. **≥35 kV cable distance to track** (§ 5.2 (3))
   - Current Status: Maintain 700 m separation from the track (current 0.0 m)
   - Recommended Action: _[To be completed by design engineer]_

### 5.2 Information Required

The following items require additional information or design details:

1. **Joints and earthing ≥31 m from track** (§ 5.2 (8))
   - Required Information: Route comes within 0.0 m of tracks - mark joint locations for validation
   - Responsible Party: _[To be completed]_
   - Target Date: _[To be completed]_

### 5.3 General Recommendations

1. Address all critical issues before proceeding with detailed design
2. Gather all required information for pending evaluations
3. Complete the system design parameters in Appendix B
4. Conduct site visit to verify assumptions and constraints
5. Engage ProRail EMC specialists for review and guidance

\pagebreak

