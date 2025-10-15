# RLN00398 V002 Update - Quick Reference Guide

## 🎯 TL;DR - What You Need to Know

Your Cable Route Evaluator is based on the **2013 version** of ProRail's EMC standard.  
ProRail released an **updated 2020 version** with critical changes.

**Bottom Line:** Some evaluation thresholds are outdated, and new precision features are available.

---

## 📊 Impact at a Glance

| Change | Status | Priority | What It Means |
|--------|--------|----------|---------------|
| **B5: 50Hz DC Voltage Limits** | ❌ Missing | 🔴 **CRITICAL** | Thresholds changed from 7V/25V → 16V/40V (more than doubled) |
| **Appendix 2: Track Circuit Tables** | ❌ Not Available | 🟠 High | NEW: Precision tables for length-based immunity evaluation |
| **T4: Homopolar Current** | ⚠️ Incomplete | 🟡 Medium | NEW: Option to skip if "physically impossible" |
| **Document References** | ⚠️ Outdated | 🟢 Low | Need to update "RLN00398" → "RLN00398 V002 (2020)" |

---

## 🔍 The 4 Key Changes Explained

### 1. B5 Criterion: 50Hz in DC Traction (**MOST CRITICAL**)

**What changed:**
- **OLD (2013):** Max 50Hz component: 7V (continuous) / 25V (short circuit)
- **NEW (2020):** Max 50Hz component: **16V (continuous) / 40V (short circuit)**

**Why it matters:**
- Limits are now **2.3x more permissive**
- Current app either:
  - Uses old (too strict) limits → unnecessarily rejects valid routes
  - OR doesn't check this at all → missing safety check

**Status in your app:**
- ❌ **NOT FOUND** - This evaluation rule appears to be missing entirely

**What needs to happen:**
- Add new evaluation rule with V002 thresholds
- OR verify if this is implemented somewhere I missed

---

### 2. Appendix 2: Length-Based Track Circuit Immunity (**ACCURACY UPGRADE**)

**What changed:**
- **OLD (2013):** Generic thresholds (20V / 58A) for ALL track circuits
- **NEW (2020):** Detailed tables with **length-specific** immunity values

**Example - Why it matters:**

| Track Circuit Length | Generic Threshold (Old) | Precise Threshold (New, OV 231.112-4) | Difference |
|---------------------|------------------------|---------------------------------------|------------|
| 50m | 20V | 61.4V | **3x more permissive** |
| 200m | 20V | 34.1V | 1.7x more permissive |
| 600m | 20V | 23.8V | Slightly more permissive |

**Status in your app:**
- ⚠️ Uses generic 20V for everything
- Could be much more accurate with length-based tables

**What needs to happen:**
- Implement Appendix 2 lookup tables
- Add optional user input for track circuit length/type
- Future: Auto-detect from ProRail GIS data

---

### 3. T4: Homopolar Current Exception (**LOGIC REFINEMENT**)

**What changed:**
- **OLD (2013):** Always assume 10% homopolar current in calculations
- **NEW (2020):** Can be **skipped if physically impossible** (e.g., ungrounded network topology)

**Why it matters:**
- Some high-voltage networks have topologies that make homopolar current impossible
- Old approach was overly conservative for these cases
- New approach: let user confirm if this applies

**Status in your app:**
- ⚠️ Not explicitly modeled (app uses geometric proximity only)

**What needs to happen:**
- Add checkbox: "Consider 10% Homopolar Current (Asymmetry)"
- Default: checked (conservative)
- User can uncheck if network topology makes it impossible

---

### 4. Document Version References (**COMPLIANCE**)

**What changed:**
- All references should specify **version and date**

**Status in your app:**
- ⚠️ All say "RLN00398" without version

**What needs to happen:**
- Find/replace: "RLN00398" → "RLN00398, Version 002 (01-12-2020)"
- Update in code, translations, docs, and reports

---

## 🚦 Recommended Action Plan

### **Option 1: Quick Compliance Fix (1 week)**
✅ Implement B5 with correct V002 thresholds  
✅ Update all document references  
⏸️ Defer Appendix 2 and T4 toggle to later

**Best for:** Immediate compliance, minimal disruption

---

### **Option 2: Comprehensive Update (3-4 weeks)**
✅ Implement B5 with V002 thresholds  
✅ Add Appendix 2 tables (manual input mode)  
✅ Add T4 homopolar current toggle  
✅ Update all document references  

**Best for:** Full accuracy and feature parity with V002

---

### **Option 3: Incremental Rollout (4-6 weeks)**
✅ Week 1: B5 + document updates → Test & validate  
✅ Week 2: T4 toggle → Test & validate  
✅ Week 3-4: Appendix 2 tables → Test & validate  

**Best for:** Lowest risk, thorough testing at each step

---

## ❓ 5 Questions I Need You to Answer

### **Question 1: B5 Implementation**
How should 50Hz voltage be determined?
- [ ] A. User enters measured/calculated value (simplest)
- [ ] B. App calculates from route geometry (needs model)
- [ ] C. Make it optional/advanced feature only

**Your choice:** __________

---

### **Question 2: Appendix 2 Priority**
When should length-based track circuit tables be added?
- [ ] A. Phase 1 - alongside B5 fix (manual input)
- [ ] B. Phase 2 - after core fixes validated
- [ ] C. Future enhancement - not critical now

**Your choice:** __________

---

### **Question 3: Track Circuit Data**
Does ProRail GIS provide track circuit types and lengths?
- [ ] A. Yes, available in map services
- [ ] B. No, must be user input
- [ ] C. Unknown - need to investigate

**Your choice:** __________

---

### **Question 4: Homopolar Default**
What should be default for homopolar current toggle?
- [ ] A. Checked (assume possible - conservative)
- [ ] B. Unchecked (user confirms if applicable)

**Your choice:** __________

---

### **Question 5: Timeline Preference**
Which approach do you prefer?
- [ ] A. Option 1 - Quick fix (1 week)
- [ ] B. Option 2 - Comprehensive (3-4 weeks)
- [ ] C. Option 3 - Incremental (4-6 weeks)

**Your choice:** __________

---

## 📋 What Happens Next

Once you answer the 5 questions above:

1. ✅ I'll create detailed technical designs for each change
2. ✅ We'll implement step-by-step with validation at each stage
3. ✅ I'll provide test cases to verify correctness
4. ✅ We'll update all documentation for users

**Per our development protocol: I will NOT proceed until you confirm your answers above.**

---

## 📚 Reference Documents

- ✅ **V001 (2013):** `RLN00398-V001 eisen EMC spoor.md` (existing in workspace)
- ✅ **V002 (2020):** `RLN00398-V002.md` (just extracted from PDF)
- ✅ **Detailed Plan:** `RLN00398_VERSION_UPDATE_PLAN.md` (comprehensive analysis)
- ✅ **This Guide:** Quick reference for decision-making

---

## 🎓 Technical Terms Explained

**B5 Criterion:** Rule about maximum 50Hz voltage component allowed in 1500V DC traction systems

**Homopolar Current:** Unbalanced current flowing through ground (also called "zero-sequence current")

**Track Circuit:** Railway signaling system that detects train presence using electrical current through rails

**Immunity:** How much interference a system can tolerate before malfunctioning

**CM (Common Mode):** Electrical interference affecting all conductors equally relative to ground

**Spoorstroomloop:** Dutch term for "track circuit"

**Enkelbenig:** Dutch for "single-leg" track circuit (more sensitive to interference)

---

## 💡 Why This Matters

**For Engineers:**
- More accurate compliance assessments
- Better optimization of cable routes
- Alignment with latest ProRail requirements

**For Project Timelines:**
- Avoid route rejections due to outdated criteria
- Reduce unnecessary design iterations
- Support faster approval processes

**For Compliance:**
- Reference current (2020) standard, not outdated (2013) version
- Demonstrate due diligence in regulatory filings
- Avoid disputes over standard interpretation

---

**🚦 Status: AWAITING YOUR 5 ANSWERS TO PROCEED**

*Document prepared: October 15, 2025*  
*By: GitHub Copilot (AI Development Assistant)*  
*Following: Geospatial Engineering Collaborator Protocol*
