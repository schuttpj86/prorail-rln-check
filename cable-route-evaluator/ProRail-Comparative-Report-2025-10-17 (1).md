# Comparative Route Evaluation Report

## High Voltage Connection Route Evaluation

---

**Project:** High Voltage Connection Route Evaluation

**Organization:** ProRail

**Author:** _[To be completed]_

**Date:** 17/10/2025

**Number of Routes Evaluated:** 2

**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)

---

\pagebreak

## 1. Executive Summary

This report presents a comparative evaluation of 2 alternative routes for the High Voltage Connection Route Evaluation. Each route has been evaluated against ProRail's EMC compliance standards (RLN00398 v002).

### 1.1 Route Comparison Summary

| Route | Length | Status | Pass | Fail | Pending | N/A |
|-------|--------|--------|------|------|---------|-----|
| Route 1 - 20 kV Cabler | 22.53 km | ✅ | 4 | 0 | 0 | 3 |
| Route 2 | 24.21 km | ❌ | 3 | 1 | 0 | 3 |

### 1.2 Recommended Route

Based on the EMC compliance evaluation, **Route 1 - 20 kV Cabler** is recommended for further detailed design.

\pagebreak

## 2. Individual Route Evaluations

### 2.1 Route 1 - 20 kV Cabler



## 1. Executive Summary

**Route Name:** Route 1 - 20 kV Cabler

**Route Length:** 22.53 km

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

**Report Generated:** 17/10/2025

**Spatial Reference System:** RD New (EPSG:28992)

**Data Sources:**
- ProRail Infrastructure Data (Railway Tracks, Track Sections, Switches)
- ProRail Energy Supply System Data
- ProRail Train Protection System Data
- Technical Rooms and Facilities Data





## 3. Route Overview

### 3.1 Route Geometry

**Route Identifier:** route-1760688100468-ff2kicypc

**Route Name:** Route 1 - 20 kV Cabler

**Total Length:** 22.53 km

**Infrastructure Type:** Underground Cable

**Number of Vertices:** 8

**Start Coordinates (RD):** X=5.40, Y=51.81

**End Coordinates (RD):** X=5.69, Y=51.88

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

Minimum horizontal distance 3934.8 m

**Measured Values:**

- Minimum Distance: 3934.80 m
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

Nearest technical room 3932.6 m away

**Measured Values:**

- Minimum Distance: 3932.62 m
- Required Distance: 20.00 m

---

#### 4.1.7 Joints and earthing ≥31 m from track

**Status:** ✅ **PASS**

**Standard Reference:** § 5.2 (8)

**Assessment Result:**

Entire route is 3934.8 m from tracks - joints can be placed anywhere

**Measured Values:**

- Minimum Distance: 3934.80 m
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

**Route Length:** 24.21 km

**Infrastructure Type:** Underground Cable

**Nominal Voltage:** 110 kV

**Overall Compliance Status:** ❌ **NON-COMPLIANT**

### Evaluation Summary

| Criteria | Count |
|----------|-------|
| ✅ Pass | 3 |
| ❌ Fail | 1 |
| ⏳ Pending | 0 |
| ➖ Not Applicable | 3 |

> **⚠️ ACTION REQUIRED:** This route has 1 failing criteria that must be addressed before proceeding with detailed design.





## 2. Report & Data Details

**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)

**Evaluation Tool:** ProRail Cable Route Evaluator (Web Application)

**Report Generated:** 17/10/2025

**Spatial Reference System:** RD New (EPSG:28992)

**Data Sources:**
- ProRail Infrastructure Data (Railway Tracks, Track Sections, Switches)
- ProRail Energy Supply System Data
- ProRail Train Protection System Data
- Technical Rooms and Facilities Data





## 3. Route Overview

### 3.1 Route Geometry

**Route Identifier:** route-1760688230381-9xgcckrh3

**Route Name:** Route 2

**Total Length:** 24.21 km

**Infrastructure Type:** Underground Cable

**Number of Vertices:** 6

**Start Coordinates (RD):** X=5.42, Y=51.79

**End Coordinates (RD):** X=5.75, Y=51.85

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

**Status:** ✅ **PASS**

**Standard Reference:** § 5.2 (3)

**Assessment Result:**

Minimum horizontal distance 2062.2 m

**Measured Values:**

- Minimum Distance: 2062.16 m
- Required Distance: 700.00 m

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

Nearest technical room 3067.7 m away

**Measured Values:**

- Minimum Distance: 3067.69 m
- Required Distance: 20.00 m

---

#### 4.1.7 Joints and earthing ≥31 m from track

**Status:** ✅ **PASS**

**Standard Reference:** § 5.2 (8)

**Assessment Result:**

Entire route is 2062.2 m from tracks - joints can be placed anywhere

**Measured Values:**

- Minimum Distance: 2062.16 m
- Required Distance: 31.00 m
- Auto-evaluated: Yes

---





## 5. Recommendations and Next Steps

### 5.1 Critical Issues

The following criteria do not meet the required standards and must be addressed:

1. **Fault must clear within 100 ms** (§ 5.1 (4), § 5.2 (2))
   - Current Status: Fault clearing time 120 ms exceeds 100 ms
   - Recommended Action: _[To be completed by design engineer]_

### 5.3 General Recommendations

1. Address all critical issues before proceeding with detailed design
2. Gather all required information for pending evaluations
3. Complete the system design parameters in Appendix B
4. Conduct site visit to verify assumptions and constraints
5. Engage ProRail EMC specialists for review and guidance

\pagebreak

