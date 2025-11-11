/**
 * V004 UPDATE: Check circuit configuration
 * Returns status with explicit justification per V004 requirements
 */
checkCircuitConfiguration() {
  const allowed = ['singleCore', 'threeCore', 'bundle'];
  const type = this.context.metadata.circuitType;
  
  if (allowed.includes(type)) {
    return {
      status: 'pass',
      message: `Circuit type ${type} allowed`,
      justification: `Circuit configuration '${type}' meets Step A requirement 1: single cable or bundled three-core construction`
    };
  }
  
  return {
    status: 'fail',
    message: `Circuit type ${type} not permitted`,
    justification: `Circuit configuration '${type}' does not meet Step A requirement 1: only single cable or bundled three-core allowed`
  };
}

/**
 * V004 UPDATE: Check homopolar current control
 * V004 clarification: "not applicable" = "pass" for low voltage outside 11m
 */
checkPadCurrentControl() {
  const voltage = this.context.metadata.voltageKv;
  const trackDistance = this.context.distances.track;
  
  // V004: Low voltage outside 11m makes this check not applicable
  if (voltage <= 24 && trackDistance > 11) {
    return {
      status: 'not_applicable',
      message: 'Low voltage outside 11 m – pad current control not required',
      justification: 'Step A requirement 2 not applicable: voltage ≤24 kV and distance >11 m per §5.2(A) toelichting'
    };
  }
  
  if (this.context.metadata.padCurrentControlled) {
    return {
      status: 'pass',
      message: 'Homopolar current control present',
      justification: 'Step A requirement 2 satisfied: single grounded neutral point present (no pad for homopolar current)'
    };
  }
  
  return {
    status: 'fail',
    message: 'Homopolar current control missing',
    justification: 'Step A requirement 2 not satisfied: no single grounded neutral point (homopolar current path exists)'
  };
}

/**
 * V004 UPDATE: Check single-phase fault risk near railway
 * Enhanced logic for ≤24 kV connections per V004 toelichting (A.3)
 */
checkSinglePhaseFaultRisk() {
  const voltage = this.context.metadata.voltageKv;
  const jointDistance = Math.min(
    this.context.distances.joints,
    this.context.distances.earthPoints
  );
  
  // No joints/earth points provided
  if (jointDistance === Infinity) {
    return {
      status: 'not_applicable',
      message: 'No joints or earth points provided',
      justification: 'Step A requirement 3 not applicable: no joints (moffen) or earth points present in connection'
    };
  }
  
  // Distance check: must be >31m
  if (jointDistance > 31) {
    return {
      status: 'pass',
      message: `Nearest joint/earth point is ${jointDistance.toFixed(2)} m away (>31 m)`,
      justification: `Step A requirement 3 satisfied: all joints and earth points are >${jointDistance.toFixed(2)}m from track (threshold: 31m)`
    };
  }
  
  // V004 special case: ≤24 kV with joints within 31m
  // May still pass with potential funnel analysis (potentiaaltrechterbepaling)
  if (voltage <= 24) {
    return {
      status: 'requires_analysis',
      subtype: 'potential_funnel',
      message: `Joint/earth point at ${jointDistance.toFixed(2)} m for ≤24 kV connection`,
      justification: `Step A requirement 3: joints/earth points within 31m for ≤24kV connection. Requires potential funnel analysis (potentiaaltrechterbepaling) per §5.2(A) toelichting, not full EMC detailed study.`
    };
  }
  
  // >24 kV with joints too close = fail
  return {
    status: 'fail',
    message: `Joint/earth point only ${jointDistance.toFixed(2)} m away (≤31 m)`,
    justification: `Step A requirement 3 not satisfied: joints or earth points at ${jointDistance.toFixed(2)}m < 31m threshold. Risk of single-phase earth fault near track is not sufficiently small.`
  };
}

/**
 * V004 UPDATE: Enhanced Step B evaluation with improved crossing logic
 * Implements clarifications from V004 toelichting (B.4)
 */
async evaluateStepB() {
  const results = {
    passes: true,
    checks: [],
    justifications: []
  };

  const voltage = this.context.metadata.voltageKv;
  const trackDistance = this.context.distances.track;
  const crossesTrack = this.context.crossing.crossesTrack;
  const hasParallel = this.hasParallelRun();

  // Condition 4: Zone distance check
  // V004 clarification: For crossings WITHOUT parallel run, this check is NOT APPLICABLE
  let zoneCheck;
  if (crossesTrack && !hasParallel) {
    zoneCheck = {
      status: 'not_applicable',
      message: 'Crossing without parallel run – distance zone check waived',
      justification: 'Step B requirement 4 not applicable per §5.2(B) toelichting: connection crosses track without parallel run within zones, requirements 5 and 6 apply instead'
    };
  } else {
    // Parallel run OR no crossing: perform zone distance check
    const minDistance = voltage > 24 ? 700 : 11;
    if (trackDistance > minDistance) {
      zoneCheck = {
        status: 'pass',
        message: `Distance ${trackDistance.toFixed(2)} m exceeds required ${minDistance} m`,
        justification: `Step B requirement 4 satisfied: connection distance ${trackDistance.toFixed(2)}m > ${minDistance}m penetration zone (${voltage > 24 ? '>24kV' : '≤24kV'})`
      };
    } else {
      zoneCheck = {
        status: 'fail',
        message: `Distance ${trackDistance.toFixed(2)} m within ${minDistance} m zone`,
        justification: `Step B requirement 4 not satisfied: connection distance ${trackDistance.toFixed(2)}m ≤ ${minDistance}m penetration zone (${voltage > 24 ? '>24kV' : '≤24kV'})`
      };
    }
  }
  results.checks.push(zoneCheck);
  results.justifications.push(zoneCheck.justification);

  // Conditions 5/6: Crossing angle (80-100 degrees)
  let angleCheck;
  if (!crossesTrack) {
    angleCheck = {
      status: 'not_applicable',
      message: 'No crossing detected',
      justification: 'Step B requirements 5/6 not applicable: connection does not cross railway track'
    };
  } else {
    const angle = this.context.crossing.angleDeg;
    if (angle != null && angle >= 80 && angle <= 100) {
      angleCheck = {
        status: 'pass',
        message: `Crossing angle ${angle.toFixed(1)}° within 80–100°`,
        justification: `Step B requirements 5/6 satisfied: crossing angle ${angle.toFixed(1)}° approximately perpendicular (80-100° range)`
      };
    } else {
      angleCheck = {
        status: 'fail',
        message: angle == null ? 'Unable to determine crossing angle' : `Crossing angle ${angle.toFixed(1)}° outside 80–100° range`,
        justification: angle == null 
          ? 'Step B requirements 5/6 cannot be verified: crossing angle could not be determined'
          : `Step B requirements 5/6 not satisfied: crossing angle ${angle.toFixed(1)}° not approximately perpendicular (required: 80-100°)`
      };
    }
  }
  results.checks.push(angleCheck);
  results.justifications.push(angleCheck.justification);

  // Condition 7: Technical room distance >20m
  const techDistance = this.context.distances.technicalRooms;
  let techCheck;
  if (techDistance === Infinity) {
    techCheck = {
      status: 'not_applicable',
      message: 'No technical rooms provided',
      justification: 'Step B requirement 7 not applicable: no technical rooms (buildings, not cabinets) present near connection'
    };
  } else if (techDistance > 20) {
    techCheck = {
      status: 'pass',
      message: `Nearest technical room ${techDistance.toFixed(2)} m away (>20 m)`,
      justification: `Step B requirement 7 satisfied: nearest technical room at ${techDistance.toFixed(2)}m > 20m threshold`
    };
  } else {
    techCheck = {
      status: 'fail',
      message: `Technical room only ${techDistance.toFixed(2)} m away (≤20 m)`,
      justification: `Step B requirement 7 not satisfied: technical room at ${techDistance.toFixed(2)}m ≤ 20m threshold`
    };
  }
  results.checks.push(techCheck);
  results.justifications.push(techCheck.justification);

  // Condition 8: Protection clearing time ≤100ms
  const protection = this.context.metadata.protectionTimeMs;
  let protectionCheck;
  if (!isFinite(protection)) {
    protectionCheck = {
      status: 'fail',
      message: 'Protection clearing time not provided',
      justification: 'Step B requirement 8 not satisfied: first order fault protection clearing time not specified'
    };
  } else if (protection <= 100) {
    protectionCheck = {
      status: 'pass',
      message: `Protection clears in ${protection} ms ≤ 100 ms`,
      justification: `Step B requirement 8 satisfied: first order fault cleared within ${protection}ms ≤ 100ms`
    };
  } else {
    protectionCheck = {
      status: 'fail',
      message: `Protection time ${protection} ms exceeds 100 ms`,
      justification: `Step B requirement 8 not satisfied: first order fault clearance time ${protection}ms > 100ms threshold`
    };
  }
  results.checks.push(protectionCheck);
  results.justifications.push(protectionCheck.justification);

  // V004: "not applicable" counts as "pass"
  results.passes = results.checks.every(c => c.status === 'pass' || c.status === 'not_applicable');
  return results;
}
