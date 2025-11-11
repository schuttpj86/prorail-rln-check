# RLN00398-V004 Implementation Notes

## Summary of V004 Changes

Based on the PDF content provided, here are the key V004 updates that need to be implemented in the `flowchartEvaluator.js`:

### 1. General Flowchart Principles (Toelichting Algemeen)

**Critical Rules:**
- Each step (A-D) requires ALL requirements in that block to be satisfied
- Each requirement must have explicit justification (why it passes/fails)
- **"Not applicable" = "Pass"** - This must be explicitly documented with reason
- Steps A-C are parameter-based checks (no calculations)
- From step C onwards, calculations are required

### 2. HVDC Connections (§5.3)

HVDC connections are OUT OF SCOPE for standard flowchart:
- Requires custom/maatwerk approach
- Early consultation with ProRail is **mandatory**
- Location-specific risk assessment needed
- Standard RLN00398 logic does NOT apply

**Implementation:**
```javascript
if (this.options.isHVDC) {
  return {
    status: 'requires_consultation',
    reason: 'HVDC',
    message: 'HVDC connections require custom EMC approach. Early consultation with ProRail is mandatory (§5.3).',
    nextStep: 'Contact ProRail to develop location-specific HVDC assessment approach'
  };
}
```

### 3. 25 kV AC Traction Systems (§5.4)

**Simplified requirements** because these systems are:
- Hard-grounded
- Operate at 50 Hz AC (unlike conventional 1500 V DC)

**For Overhead Lines:** Only 2 requirements:
1. Minimum clearance per NEN-EN 50341-1 and NEN-EN 50341-2-15 [B]
2. Double insulator/chain configuration at crossing masts (both sides)

**For Cable Connections:** NO additional requirements

**Implementation:**
```javascript
if (this.options.tractionSystem === '25kV_AC') {
  return this.evaluate25kVACSystem();
}

evaluate25kVACSystem() {
  if (this.options.connectionType === 'cable') {
    return {
      status: 'compliant',
      message: 'Cable connection to 25 kV AC system – no additional EMC requirements (§5.4)'
    };
  }
  
  // For overhead lines: check clearance & double insulators at crossings
  // ...
}
```

### 4. Step A Updates

**V004 Clarification:** Step A check 3 has specific rules for ≤24 kV connections:

From the PDF:
> "Bij punt 3) geldt, dat als aan de van toepassing zijnde onderstaande bullits aantoonbaar voldaan wordt, de kans op eenfase sluiting met aarde nabij het spoor voldoende klein wordt geacht:
> - In geval van een kabelverbinding moet aangetoond worden dat er zich geen moffen bevinden binnen een afstand van 31 m uit het hart van het buitenste spoor..."

**Key Change:** If connections meet certain criteria (no joints within 31m, etc.) but DON'T fully pass step A for ≤24 kV connections, they still may only need a potential funnel analysis (potentiaaltrechterbepaling) rather than a full EMC detailed study.

### 5. Step B Updates

**Condition 4 Clarification (from Toelichting B):**

> "Bij punt 4) geldt dat als de situatie een parallelloop betreft (geen kruising) dat voldaan moet worden aan de liggingseis buiten 700 m... Betreft het wel een kruising en is er geen parallelloop binnen dezelfde zones, dan vervalt deze eis en kan 4) als voldaan worden beschouwd, indien aan 5) en 6) wordt voldaan."

**Implementation logic:**
- If CROSSING without parallel run → distance check (4) is NOT APPLICABLE
- Must then satisfy conditions 5 (crossing angle 80-100°) and 6 (>20m from technical rooms)

### 6. Step C - Unity Study

**V004 Clarification (from Toelichting C):**

Requirements must include:
- Network parameters (listed in checklist blocks A-E, Bijlage 4)
- Unity study results
- Verification against ALL assessment criteria
- Must comply with G2 assumption (20% margin for non-short-circuit situations)

### 7. Step D - Detailed Study

**V004 Clarification (from Toelichting D):**

For step 11 and 12:
- Must sum influence of ALL connections (not for short circuits)
- Must check compliance with RLN00398

### 8. Step E/F Classification

**From Toelichting:**
- **(E) "Net niet"** = If modeler estimates that more detailed calculation COULD still comply
- **(F) "Ruim niet"** = If even detailed calculations will exceed limits → requires mitigation

## Required Constructor Options (V004)

```javascript
constructor(route, options = {}) {
  this.options = Object.assign({
    // Existing
    ratedVoltageKv: 0,
    circuitType: 'singleCore',
    hasPadCurrentControl: false,
    joints: [],
    earthPoints: [],
    technicalRooms: [],
    protectionTimeMs: Infinity,
    unityStudy: null,
    detailedStudy: null,
    
    // V004 additions
    isHVDC: false,                    // §5.3: HVDC requires custom approach
    tractionSystem: '1500V_DC',       // Options: '1500V_DC', '25kV_AC', 'none'
    connectionType: 'cable',          // Options: 'cable', 'overhead_line'
    hasDoubleInsulators: false,       // §5.4: For overhead lines crossing tracks
    clearanceCompliant: null          // §5.4: NEN-EN 50341-1/-2-15 compliance
  }, options);
}
```

## Key Validation Updates

### All Steps Must Include:
1. **Explicit justification** for each check
2. **"Not applicable" handling** - treated as pass
3. **Documentation** of why not applicable

### Example Structure:
```javascript
{
  passes: true,
  checks: [
    {
      status: 'pass',  // or 'fail', 'not_applicable', 'requires_verification'
      message: 'Description of what was checked',
      justification: 'Why this passes/fails/is not applicable',
      requirement: 'Reference to §5.x requirement'
    }
  ],
  justifications: [
    'Explicit list of all justifications for reporting'
  ]
}
```

## Output Format Requirements

Per V004, the evaluation must produce:
1. Clear pass/fail/not-applicable status for EACH requirement
2. Explicit justification for each status
3. Reference to which paragraph/requirement is being checked
4. For "not applicable": explicit reason WHY it's not applicable

## Next Steps Guidance

The flowchart now has clearer guidance:
- Compliant → No study needed
- Requires unity study → Provide memo with parameters (§5.5)
- Requires detailed study → Full EMC analysis (§5.6)
- Requires consultation → HVDC or complex situations
- Requires mitigation → Discuss measures with both parties

## Implementation Priority

1. ✅ Add HVDC detection and consultation path
2. ✅ Add 25 kV AC simplified evaluation path
3. ⚠️ Update all steps to handle "not applicable = pass"
4. ⚠️ Add justifications array to all step results
5. ⚠️ Update Step B condition 4 logic for crossings
6. ⚠️ Add explicit documentation requirements to output
7. 🔲 Implement unity study validation (§5.5 - in development)
8. 🔲 Add potential funnel analysis for partial Step A failures

Legend: ✅ Implemented | ⚠️ Partially Implemented | 🔲 Not Yet Implemented
