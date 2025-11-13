/**
 * RLN00398-V004 Flowchart-based EMC Evaluation
 *
 * This module implements the decision logic from figure�1 of the RLN00398-V004
 * specification.  The flowchart describes a sequence of tests used to
 * determine whether an overhead or buried high-voltage connection can be
 * considered safe with respect to nearby railway infrastructure or whether
 * further electromagnetic compatibility (EMC) analysis is required.
 *
 * The evaluator exposes a single class, `FlowchartEvaluator`, which accepts
 * geometric information about a proposed high-voltage route along with
 * auxiliary metadata (e.g. rated voltage, presence of joints, circuit
 * configuration, protection timing, etc.).  It evaluates the route against
 * the RLN00398 flowchart and returns a detailed report indicating which
 * steps passed, which were not applicable and, if a step fails, what
 * additional study is required.  The structure of the report mirrors the
 * structure of the flowchart with keys for each major step (A�D) and the
 * final decision.
 *
 * Example usage:
 *
 * ```js
 * import { FlowchartEvaluator } from './flowchartEvaluator.js';
 *
 * const evaluator = new FlowchartEvaluator(routeGeoJson, {
 *   ratedVoltageKv: 110,
 *   circuitType: 'threeCore',
 *   hasPadCurrentControl: true,
 *   joints: [{ position: �, type: 'mof' }, �],
 *   technicalRooms: [�],
 *   protectionTimeMs: 80,
 *   unityStudy: myUnityStudyResults,
 *   detailedStudy: myDetailedStudyResults
 * });
 * const result = await evaluator.evaluate();
 * if (result.status === 'compliant') {
 *   // proceed with construction
 * } else {
 *   // examine result.nextStep for guidance on required studies
 * }
 * ```
 */

import { geometryUtils } from '../shared/geometryUtils.js';
import { configV2 } from '../../config.v2.js';

/**
 * FlowchartEvaluator encapsulates the logic from RLN00398-V004 figure�1.
 */
export class FlowchartEvaluator {
  /**
   * Construct a new evaluator.
   *
   * @param {Object} route  Geometry representing the high-voltage connection.
   *   At a minimum this should include a LineString for the HV route and a
   *   LineString for the parallel railway.  Additional metadata (e.g. joints
   *   and technical rooms) may be provided via the options object.
   * @param {Object} options  Miscellaneous parameters used during evaluation.
   *   Recognised keys include:
   *   - ratedVoltageKv {Number}: nominal system voltage in kilovolts
   *   - circuitType {String}: 'singleCore', 'threeCore' or 'bundle'
   *   - hasPadCurrentControl {Boolean}: true if homopolar currents are
   *     controlled by a grounded neutral point
   *   - joints {Array}: list of joint objects containing at least a
   *     `position` property; used to compute the distance from each joint
   *     to the railway
   *   - earthPoints {Array}: positions of earthing points relative to the
   *     railway
   *   - technicalRooms {Array}: positions of technical rooms (cabinets,
   *     buildings, etc.) used in step�B
   *   - protectionTimeMs {Number}: protection clearing time for first order
   *     faults (in milliseconds)
   *   - unityStudy {Object}: results of a unity study (optional)
   *   - detailedStudy {Object}: results of an EMC detailed study (optional)
   */
  constructor(route, options = {}) {
    this.route = route;
    this.options = Object.assign({
      ratedVoltageKv: 0,
      circuitType: 'singleCore',
      hasPadCurrentControl: false,
      joints: [],
      earthPoints: [],
      technicalRooms: [],
      protectionTimeMs: Infinity,
      unityStudy: null,
      detailedStudy: null,
      preCalculatedDistances: null  // Optional: { trackDistance, technicalRoomsDistance }
    }, options);
    this.context = null;
    this.flowchartResults = {
      initial: null,
      stepA: null,
      stepB: null,
      stepC: null,
      stepD: null,
      finalDecision: null
    };
  }

  /**
   * Entry point for the evaluation.  This method orchestrates the
   * sequential filtering described in the flowchart.  Each step records
   * its individual outcome in `this.flowchartResults`.  If a step fails
   * irretrievably the evaluation terminates early with a status of
   * `requires_detailed_study` or `requires_mitigation` depending on the
   * failure severity.
   *
   * @returns {Promise<Object>} an object describing the compliance status
   *          and any additional information on next actions.
   */
  async evaluate() {
    // Build evaluation context once.  This typically computes distances
    // between the HV route and the railway and caches other derived
    // quantities.  It is implemented separately to keep evaluate() clean.
    this.context = await this.buildEvaluationContext();

    // Step 0: preliminary distance check.  If the HV connection is far
    // enough from the railway based on the rated voltage then no further
    // evaluation is needed.
    const initial = this.evaluateInitialDistance();
    this.flowchartResults.initial = initial;
    if (initial.passes) {
      return {
        status: 'compliant',
        flowchartResults: this.flowchartResults,
        message: 'High voltage connection is sufficiently distant; no EMC study required'
      };
    }

    // Step A: basic construction and fault risk checks.
    const stepA = await this.evaluateStepA();
    this.flowchartResults.stepA = stepA;
    if (stepA.passes) {
      // Step A passed - no need for further checks
      return {
        status: 'compliant',
        flowchartResults: this.flowchartResults,
        message: 'Step A requirements satisfied; no EMC study required'
      };
    }

    // Step A failed - continue to Step B: parallel and crossing distance checks.
    const stepB = await this.evaluateStepB();
    this.flowchartResults.stepB = stepB;
    if (stepB.passes) {
      // Step B passed - compliant
      return {
        status: 'compliant',
        flowchartResults: this.flowchartResults,
        message: 'Step B requirements satisfied; no EMC study required'
      };
    }
    
    // Step B also failed - requires further study
    if (!stepB.passes) {
      // Geospatial quick scan ends here - Steps C & D require EMC calculations
      // Per RLN00398-V004: "Tot aan (C) is het op basis van bekende parameters bepalen 
      // of het voldoet; vanaf (C) zijn er berekeningen nodig"
      return {
        status: 'requires_further_study',
        reason: 'step_b_failed',
        flowchartResults: this.flowchartResults,
        message: 'Geospatial quick scan complete - Step B requirements not satisfied',
        nextStep: 'Follow RLN00398-V004 standard procedure:\n\n' +
                  '� Use template "Bijlage 3: Template tbv basisrapportage EMC" to document Steps A & B findings\n' +
                  '� Proceed to Step C: Perform unity study with network parameters (Bijlage 4, blocks A-E)\n' +
                  '� If unity study shows =20% contribution ? Memo with parameters suffices\n' +
                  '� If unity study shows >20% contribution ? Proceed to Step D (EMC detail study)\n\n' +
                  'Note: Steps C & D require electromagnetic calculations beyond geospatial analysis'
      };
    }

    // Step C: unity study (20% criteria per G2).
    // Evaluates NEW connection ALONE (excluding existing connections).
    // Per flowchart: If passes (<=20%), memo with unity study suffices -> COMPLIANT.
    // If fails (>20%), continue to Step D (detailed study with all connections).
    const stepC = await this.evaluateStepC();
    this.flowchartResults.stepC = stepC;
    
    // Check if unity study is missing
    if (stepC.requiresInput) {
      return this.requiresDetailStudy('Unity study required per �5.2(C)', stepC);
    }
    
    // If Step C PASSES (<=20%): COMPLIANT - memo with unity study suffices
    if (stepC.passes) {
      this.flowchartResults.finalDecision = {
        status: 'compliant',
        message: 'Unity study shows new connection contributes <=20% of criteria - memo with parameters and unity study suffices (per G2)'
      };
      return {
        status: 'compliant',
        flowchartResults: this.flowchartResults,
        message: 'Unity study shows new connection contributes <=20% of criteria - memo with parameters and unity study suffices (per G2)'
      };
    }

    // Step C FAILED (>20%): Continue to Step D - detailed study with ALL connections
    // Step D: full network composition assessment (new + existing connections within 700m).
    // This may return: pass (<=100%), borderline "net niet" (slightly >100%), 
    // or fail "ruim niet" (significantly >100%).
    const stepD = await this.evaluateStepD();
    this.flowchartResults.stepD = stepD;
    
    // Check if detailed study is missing
    if (stepD.requiresInput) {
      return this.requiresDetailStudy('Detailed study required per �5.2(D) - new connection contributes >20%', stepD);
    }
    
    // If Step D PASSES (<=100%): COMPLIANT
    if (stepD.passes) {
      this.flowchartResults.finalDecision = {
        status: 'compliant',
        message: 'Detailed study shows total situation (new + existing connections) complies with RLN00398'
      };
      return {
        status: 'compliant',
        flowchartResults: this.flowchartResults,
        message: 'Detailed study shows total situation (new + existing connections) complies with RLN00398'
      };
    }
    
    // Step D FAILED: Route to E/F based on severity
    return this.evaluateStepEF(stepD);
  }

  /**
   * Construct an evaluation context containing geometric and meta
   * information derived from the input route.  This method computes
   * distances between the high-voltage route and the railway, identifies
   * crossing points and crossing angles, and determines the minimum
   * distances to joints, earth points and technical rooms.  All distances
   * are expressed in metres.
   *
   * @returns {Promise<Object>} context with derived quantities
   */
  async buildEvaluationContext() {
    const context = {
      // Straight line distance from the closest point on the HV line to
      // the outermost rail.  geometryUtils.distanceToSegment() returns
      // metres.  Fallback to Infinity if geometry cannot be computed.
      distances: {
        track: Infinity,
        joints: Infinity,
        earthPoints: Infinity,
        technicalRooms: Infinity
      },
      crossing: {
        crossesTrack: false,
        angleDeg: null
      },
      metadata: {
        voltageKv: this.options.ratedVoltageKv,
        circuitType: this.options.circuitType,
        padCurrentControlled: this.options.hasPadCurrentControl,
        protectionTimeMs: this.options.protectionTimeMs
      }
    };

    // Use pre-calculated distances if available (from spatial queries)
    if (this.options.preCalculatedDistances) {
      if (this.options.preCalculatedDistances.trackDistance !== undefined) {
        context.distances.track = this.options.preCalculatedDistances.trackDistance;
        console.log(`   ? Using pre-calculated track distance: ${context.distances.track?.toFixed(1)} m`);
      }
      if (this.options.preCalculatedDistances.technicalRoomsDistance !== undefined) {
        context.distances.technicalRooms = this.options.preCalculatedDistances.technicalRoomsDistance;
        console.log(`   ? Using pre-calculated technical rooms distance: ${context.distances.technicalRooms?.toFixed(1)} m`);
      }
    }

    // Compute the minimum distance to the railway track centreline if not pre-calculated
    if (context.distances.track === Infinity && this.route && this.route.hvLine && this.route.track) {
      try {
        // Note: geometryUtils must be imported for this to work
        // For now, we rely on pre-calculated distances from spatialQueries
        console.warn('?? Track geometry available but geometryUtils not imported - using spatial query results');
      } catch (err) {
        // If geometryUtils throws (e.g. invalid geometry), keep Infinity
        console.warn('Unable to compute HV�track distance', err);
      }
    }

    // Minimum distance to joints (moffen) or earthing points within the
    // HV route.  These distances are used in step�A to assess the risk
    // of a single-phase earth fault near the track.  If no joints are
    // provided the distance remains Infinity and the check passes.
    if (Array.isArray(this.options.joints) && this.options.joints.length) {
      let minJoint = Infinity;
      console.log(`   ?? Processing ${this.options.joints.length} joint(s)...`);
      for (const joint of this.options.joints) {
        console.log(`   ?? Joint data:`, joint);
        // First check if joint already has a pre-calculated distance (from asset point manager)
        // The asset point manager stores it as 'distanceToTrackMeters'
        if (joint.distanceToTrackMeters !== undefined) {
          const d = parseFloat(joint.distanceToTrackMeters);
          console.log(`   ?? distanceToTrackMeters:`, joint.distanceToTrackMeters, typeof joint.distanceToTrackMeters);
          console.log(`   ?? Parsed as number:`, d);
          if (!isNaN(d) && d < minJoint) {
            minJoint = d;
            console.log(`   ? Updated minJoint to ${d}m`);
          }
          continue;
        }
        // Fallback: check for trackDistance field (alternative format)
        if (joint.trackDistance !== undefined) {
          const d = parseFloat(joint.trackDistance);
          if (!isNaN(d) && d < minJoint) minJoint = d;
          continue;
        }
        // Otherwise try to calculate from geometry position
        if (!joint.position) continue;
        try {
          const d = geometryUtils.minimumDistance(joint.position, this.route.track);
          if (d < minJoint) minJoint = d;
        } catch (err) {
          // ignore individual errors
        }
      }
      context.distances.joints = minJoint;
      console.log(`   ?? Processed ${this.options.joints.length} joint(s), min distance to track: ${minJoint === Infinity ? 'N/A' : minJoint.toFixed(2) + 'm'}`);
    }

    if (Array.isArray(this.options.earthPoints) && this.options.earthPoints.length) {
      let minEarth = Infinity;
      for (const ep of this.options.earthPoints) {
        if (!ep.position) continue;
        try {
          const d = geometryUtils.minimumDistance(ep.position, this.route.track);
          if (d < minEarth) minEarth = d;
        } catch (err) {
          // ignore
        }
      }
      context.distances.earthPoints = minEarth;
    }

    // Minimum distance to technical rooms used in step�B.  If no rooms
    // exist this stays Infinity.
    if (Array.isArray(this.options.technicalRooms) && this.options.technicalRooms.length) {
      let minTech = Infinity;
      for (const room of this.options.technicalRooms) {
        if (!room.position) continue;
        try {
          const d = geometryUtils.minimumDistance(room.position, this.route.track);
          if (d < minTech) minTech = d;
        } catch (err) {
          // ignore
        }
      }
      context.distances.technicalRooms = minTech;
    }

    // Determine whether the HV line crosses the railway and, if so,
    // compute the crossing angle (in degrees).  A crossing is defined by
    // a point where the perpendicular distance between the two lines is
    // less than a configurable threshold (configV2.crossingTolerance).  The
    // angle is measured between the HV line segment and the railway
    // segment at the closest approach.  If no crossing is detected,
    // crossesTrack remains false and angleDeg is null.
    
    // Use pre-calculated crossing data from spatial analysis if available
    if (this.options.preCalculatedDistances?.crossing) {
      context.crossing.crossesTrack = this.options.preCalculatedDistances.crossing.crossesTrack;
      context.crossing.angleDeg = this.options.preCalculatedDistances.crossing.primaryAngle;
      
      if (context.crossing.crossesTrack) {
        console.log(`   ✅ Using pre-calculated crossing angle: ${context.crossing.angleDeg?.toFixed(1)}°`);
      } else {
        console.log(`   ℹ️ No crossing detected - route runs parallel to tracks`);
      }
    } else {
      console.log('   ⚠️ Crossing angle data not available in spatial analysis');
    }

    return context;
  }

  /**
   * Evaluate the initial distance criterion at the top of the flowchart.
   * High-voltage connections that remain sufficiently far from the
   * railway based on their rated voltage require no further study.
   *
   * @returns {Object} result with `passes` boolean and explanatory text
   */
  evaluateInitialDistance() {
    const voltage = this.context.metadata.voltageKv;
    const distance = this.context.distances.track;
    const result = { passes: false, details: {} };
    // >24�kV: must be outside 700�m; =24�kV: must be outside 31�m.
    if (voltage > 24 && distance > 700) {
      result.passes = true;
      result.details = {
        criterion: '>24�kV outside 700�m',
        distance
      };
    } else if (voltage <= 24 && distance > 31) {
      result.passes = true;
      result.details = {
        criterion: '=24�kV outside 31�m',
        distance
      };
    } else {
      result.passes = false;
      result.details = {
        criterion: 'Distance too small',
        distance
      };
    }
    return result;
  }

  /**
   * Step�A of the flowchart: basic configuration and single-phase fault
   * risk checks.  All listed conditions must be satisfied unless the
   * special case of =24�kV outside 11�m applies, in which case the
   * connection automatically passes this step.  See paragraph�5.2(A).
   */
  async evaluateStepA() {
    const results = {
      passes: true,
      checks: []
    };

    const voltage = this.context.metadata.voltageKv;
    const trackDistance = this.context.distances.track;

    // Special case: low voltage and sufficient distance already mitigates
    // single-phase fault risk.  The RLN00398 toelichting notes that
    // connections =24�kV outside 11�m may bypass detailed checks (step�A).
    if (voltage <= 24 && trackDistance > 11) {
      results.specialCase = '=24�kV outside 11�m � automatic compliance';
      return results;
    }

    // Check�1: Circuit in one cable, or three-core bundled single cores.
    const circuitCheck = this.checkCircuitConfiguration();
    results.checks.push(circuitCheck);

    // Check�2: Homopolar current control (single grounded neutral point).
    const currentCheck = this.checkPadCurrentControl();
    results.checks.push(currentCheck);

    // Check�3: Risk of single-phase earth fault near the track is small.
    const eenfaseCheck = this.checkSinglePhaseFaultRisk();
    results.checks.push(eenfaseCheck);

    results.passes = results.checks.every(c => c.status === 'pass');
    return results;
  }

  /**
   * Step�B of the flowchart: parallel distance and crossing checks.  See
   * paragraph�5.2(B).  The evaluator differentiates between genuine
   * crossings and parallel runs.  If the HV line crosses the railway
   * without a parallel run within the zones described in the flowchart,
   * the distance check may be skipped in favour of crossing angle and
   * proximity checks.  Otherwise both the zone distance and additional
   * criteria must be satisfied.
   */
  async evaluateStepB() {
    const results = {
      passes: true,
      checks: []
    };

    const voltage = this.context.metadata.voltageKv;
    const trackDistance = this.context.distances.track;

    // Condition�4: Distance outside the penetration zone.  >24�kV must
    // exceed 700�m; =24�kV must exceed 11�m.  For a crossing (no
    // parallel run) this requirement can be relaxed per the toelichting.
    let zoneCheck = { status: 'pass', message: '' };
    const hasParallel = this.hasParallelRun();
    if (!this.context.crossing.crossesTrack || hasParallel) {
      // Perform the zone distance check
      const minDistance = voltage > 24 ? 700 : 11;
      if (trackDistance > minDistance) {
        zoneCheck = {
          status: 'pass',
          message: `Distance ${trackDistance.toFixed(2)}�m exceeds required ${minDistance}�m`
        };
      } else {
        zoneCheck = {
          status: 'fail',
          message: `Distance ${trackDistance.toFixed(2)}�m is within the ${minDistance}�m zone`
        };
      }
    } else {
      // Crossing without parallel run: zone requirement is not applicable
      zoneCheck = {
        status: 'not_applicable',
        message: 'Crossing without parallel run � distance zone ignored'
      };
    }
    results.checks.push(zoneCheck);

    // Condition�5/6: Crossing angle.  If a crossing occurs the angle
    // between the HV line and the railway must be approximately
    // perpendicular (80�100�degrees).  If no crossing is detected we
    // treat the angle check as not applicable (since the line is either
    // parallel or sufficiently far away as determined by the zone check).
    let angleCheck = { status: 'not_applicable', message: '' };
    if (this.context.crossing.crossesTrack) {
      const angle = this.context.crossing.angleDeg;
      if (angle != null && angle >= 80 && angle <= 100) {
        angleCheck = {
          status: 'pass',
          message: `Crossing angle ${angle.toFixed(1)}� within 80�100�`
        };
      } else {
        angleCheck = {
          status: 'fail',
          message: angle == null
            ? 'Unable to determine crossing angle'
            : `Crossing angle ${angle.toFixed(1)}� outside 80�100� range`
        };
      }
    }
    results.checks.push(angleCheck);

    // Condition�7: Distance to nearest technical room must exceed 20�m.
    const techDistance = this.context.distances.technicalRooms;
    let techCheck;
    if (techDistance === Infinity || techDistance > 20) {
      techCheck = {
        status: 'pass',
        message: techDistance === Infinity
          ? 'No technical rooms nearby - requirement satisfied'
          : `Nearest technical room is ${techDistance.toFixed(2)}�m away (>20�m)`
      };
    } else {
      techCheck = {
        status: 'fail',
        message: `Technical room only ${techDistance.toFixed(2)}�m away (=20�m)`
      };
    }
    results.checks.push(techCheck);

    // Condition�8: Fault clearing time.  The first order protection must
    // operate within 100�ms.  If the provided protection time is
    // undefined or Infinity we fail this check.
    const protection = this.context.metadata.protectionTimeMs;
    let protectionCheck;
    if (!isFinite(protection)) {
      protectionCheck = {
        status: 'fail',
        message: 'Protection clearing time not provided'
      };
    } else if (protection <= 100) {
      protectionCheck = {
        status: 'pass',
        message: `Protection clears in ${protection}�ms = 100�ms`
      };
    } else {
      protectionCheck = {
        status: 'fail',
        message: `Protection time ${protection}�ms exceeds 100�ms`
      };
    }
    results.checks.push(protectionCheck);

    // Step�B passes if all checks are either passing or not applicable
    results.passes = results.checks.every(c => c.status === 'pass' || c.status === 'not_applicable');
    return results;
  }

  /**
   * Step�C: Unity study requirements.  Paragraph�5.2(C) specifies that
   * certain network parameters must be supplied and that the proposed
   * situation must be assessed using a unity study against the RLN00398
   * acceptance criteria (G2) with a 20�% margin.  If no unity study
   * results are provided the evaluator flags a missing input.  A unity
   * study result should include indicators of compliance for each
   * criterion.
   */
  async evaluateStepC() {
    // The absence of a unity study is treated as a missing required input
    if (!this.options.unityStudy) {
      return {
        passes: false,
        requiresInput: true,
        message: 'Unity study required per �5.2(C) � please provide study results'
      };
    }
    // Validate the unity study.  The validation function returns an
    // object with `passes` and optionally detail on which criteria
    // succeeded or failed.  For simplicity we assume the provided study
    // contains a property `criteria` mapping criterion names to values
    // relative to their limits, where values =�1.0 indicate compliance.
    const validation = this.validateUnityStudy(this.options.unityStudy);
    return validation;
  }

  /**
   * Step�D: EMC detailed study threshold.  This step evaluates the
   * proposed connection in the context of the entire network (all
   * parallel and crossing connections) and determines whether the
   * situation remains within the RLN00398 limits.  Step�D may result in
   * three outcomes: pass (all criteria satisfied), borderline (net�niet),
   * or fail (ruim�niet).  Borderline results may still be acceptable
   * after a more detailed study; clear failures require mitigation.
   */
  async evaluateStepD() {
    // No detailed study supplied � cannot perform this evaluation
    if (!this.options.detailedStudy) {
      return {
        passes: false,
        requiresInput: true,
        message: 'EMC detailed study required per �5.2(D) � please provide study results'
      };
    }
    const { passRatio, maxRatio } = this.validateDetailedStudy(this.options.detailedStudy);
    // If all criteria are below 1.0, the connection is compliant (pass)
    if (maxRatio <= 1.0) {
      return {
        passes: true,
        details: {
          maxRatio,
          message: 'All criteria within limits'
        }
      };
    }
    // If some criteria slightly exceed the limit (e.g. up to 1.1) we
    // classify as borderline (net�niet).  Beyond that we classify as
    // significantly non-compliant (ruim�niet).  These thresholds can be
    // tuned via configuration if required.
    if (maxRatio > 1.0 && maxRatio <= 1.1) {
      return {
        passes: false,
        borderline: true,
        maxRatio,
        message: `Some criteria slightly exceed limits (max ratio ${maxRatio.toFixed(3)})`
      };
    }
    return {
      passes: false,
      borderline: false,
      maxRatio,
      message: `Criteria significantly exceed limits (max ratio ${maxRatio.toFixed(3)})`
    };
  }

  /**
   * Determine the next action when step�D fails.  If the results are
   * borderline (net�niet) we suggest a more detailed calculation or a
   * second unity study (step�E).  If the results are clearly non-
   * compliant (ruim�niet) we proceed to discuss mitigation measures
   * (step�F).
   *
   * @param {Object} stepDResults
   */
  evaluateStepEF(stepDResults) {
    if (stepDResults.borderline) {
      return {
        status: 'requires_detailed_study',
        reason: 'net_niet',
        flowchartResults: this.flowchartResults,
        message: 'Results are close to the limit � perform EMC detailed study using unity study or second study (step�E)',
        nextStep: 'Proceed to EMC detailed study (step�E)'
      };
    }
    return {
      status: 'requires_mitigation',
      reason: 'ruim_niet',
      flowchartResults: this.flowchartResults,
      message: 'Results significantly exceed limits � mitigation measures required (step�F)',
      nextStep: 'Discuss mitigation options with the network and railway owners (step�F)'
    };
  }

  /**
   * Helper to indicate that a detailed or unity study is required
   * because an earlier step failed.  This is used by steps A�C when
   * necessary inputs are missing or criteria fail outright.
   *
   * @param {String} reason
   * @param {Object} stepResults
   */
  requiresDetailStudy(reason, stepResults) {
    return {
      status: 'requires_input',
      reason,
      flowchartResults: this.flowchartResults,
      message: `${reason} � please provide additional study or remedy failing criteria`,
      stepResults
    };
  }

  /**
   * Determine whether the HV line has a meaningful parallel run with the
   * railway within the critical distance zone.  A parallel run exists if
   * the two lines overlap for more than a minimal length and their
   * separation remains below the zone threshold.  This simplistic
   * implementation delegates the geometry check to geometryUtils.  A
   * missing geometry or error is interpreted as no parallel run.
   */
  hasParallelRun() {
    if (!this.route || !this.route.hvLine || !this.route.track) return false;
    try {
      return geometryUtils.hasParallelRun(
        this.route.hvLine,
        this.route.track,
        this.context.metadata.voltageKv > 24 ? 700 : 11,
        configV2.parallelLengthTolerance || 50
      );
    } catch (err) {
      return false;
    }
  }

  /**
   * Check the circuit configuration.  Returns an object with a status of
   * 'pass' or 'fail' and a human-readable message.
   * 
   * Step A.1 from RLN00398-V004:
   * - For cables: Must be single cable (3-phase) OR single core in trefoil
   * - For overhead lines: Must be delta formation (driehoek configuratie)
   */
  checkCircuitConfiguration() {
    const infrastructureType = this.context.metadata.infrastructureType || 'cable';
    
    // For cables: check if delta/multicore configuration is confirmed
    if (infrastructureType === 'cable') {
      const hasDeltaOrMulticore = this.context.metadata.hasDeltaOrMulticore;
      if (hasDeltaOrMulticore) {
        return { status: 'pass', message: 'Cable is single cable (3-phase) or single core in trefoil - A.1 complies' };
      }
      
      // Backward compatibility: check old circuitConfig field
      const circuitConfig = this.context.metadata.circuitConfig;
      if (circuitConfig === 'delta-bundled' || circuitConfig === 'multicore') {
        return { status: 'pass', message: `Cable with ${circuitConfig} configuration complies with A.1` };
      }
      
      return { status: 'fail', message: 'Cable must be single cable (3-phase) or single core in trefoil (A.1 requirement)' };
    }
    
    // For overhead lines: check if delta formation is confirmed
    if (infrastructureType === 'overhead') {
      const hasDeltaFormation = this.context.metadata.hasDeltaFormation;
      if (hasDeltaFormation) {
        return { status: 'pass', message: 'Overhead line with delta formation - A.1 complies' };
      }
      
      // Backward compatibility: check old circuitConfig field
      const circuitConfig = this.context.metadata.circuitConfig;
      if (circuitConfig === 'delta-formation') {
        return { status: 'pass', message: 'Overhead line with delta formation complies with A.1' };
      }
      
      return { status: 'fail', message: 'Overhead line must have delta formation (A.1 requirement)' };
    }
    
    // Fallback for old circuitType field (backward compatibility)
    const allowed = ['singleCore', 'threeCore', 'bundle'];
    if (allowed.includes(this.context.metadata.circuitType)) {
      return { status: 'pass', message: `Circuit type ${this.context.metadata.circuitType} allowed` };
    }
    
    return { status: 'fail', message: 'Circuit configuration not specified (A.1 requirement)' };
  }

  /**
   * Check whether homopolar currents are controlled via a grounded
   * neutral point (pad/homopolar current control).  If the voltage is
   * below or equal 24�kV and the HV connection is outside 11�m this
   * check is considered not applicable per the toelichting for step�A.
   */
  checkPadCurrentControl() {
    const voltage = this.context.metadata.voltageKv;
    const trackDistance = this.context.distances.track;
    if (voltage <= 24 && trackDistance > 11) {
      return { status: 'not_applicable', message: 'Low voltage outside 11�m � pad current control not required' };
    }
    // Check the new field name first, then fall back to old field
    const hasPadControl = this.context.metadata.hasPadCurrentControl ?? this.context.metadata.padCurrentControlled;
    if (hasPadControl) {
      return { status: 'pass', message: 'Homopolar current control present (single grounded star point) - A.2 complies' };
    }
    return { status: 'fail', message: 'Homopolar current control missing (A.2 requirement: enkel geaard sterpunt)' };
  }

  /**
   * Assess the risk of a single-phase earth fault near the railway.  The
   * RLN00398-V004 flowchart states that the risk is acceptable if no
   * joints (moffen) or earthing points lie within 31�m of the track.  If
   * the rated voltage is less than or equal to 24�kV this check is
   * required.  For higher voltages the presence of joints within 31�m
   * remains relevant but may be mitigated with protective measures.
   */
  checkSinglePhaseFaultRisk() {
    const voltage = this.context.metadata.voltageKv;
    const jointDistance = Math.min(this.context.distances.joints, this.context.distances.earthPoints);
    if (jointDistance === Infinity) {
      return { status: 'pass', message: 'No joints or earth points provided' };
    }
    if (jointDistance > 31) {
      return { status: 'pass', message: `Nearest joint/earth point is ${jointDistance.toFixed(2)}�m away (>31�m)` };
    }
    return { status: 'fail', message: `Joint/earth point only ${jointDistance.toFixed(2)}�m away (=31�m)` };
  }

  /**
   * Validate a unity study against RLN00398 criteria.  A unity study is
   * expected to provide a mapping from criterion names to the ratio of
   * the calculated value over the allowed limit.  Values =�1.0 pass.
   * The function returns a result object with a `passes` flag and the
   * maximum ratio.  If any criterion exceeds its limit the study fails.
   *
   * @param {Object} unityStudy
   */
  validateUnityStudy(unityStudy) {
    if (!unityStudy || typeof unityStudy !== 'object' || !unityStudy.criteria) {
      return {
        passes: false,
        message: 'Invalid unity study format � expected object with criteria'
      };
    }
    let maxRatio = 0;
    const failures = [];
    for (const [criterion, ratio] of Object.entries(unityStudy.criteria)) {
      if (typeof ratio !== 'number') continue;
      if (ratio > maxRatio) maxRatio = ratio;
      if (ratio > 0.2) { // G2: 20% threshold
        failures.push({ criterion, ratio });
      }
    }
    return {
      passes: failures.length === 0,
      details: {
        maxRatio,
        failures
      },
      message: failures.length === 0
        ? `Unity study passes: all criteria  20% (max ${(maxRatio * 100).toFixed(1)}%)`
        : `Unity study fails for ${failures.length} criteria`
    };
  }

  /**
   * Validate an EMC detailed study.  Like the unity study, a detailed
   * study is expected to provide ratio values for each relevant
   * criterion.  The function returns the pass ratio (percentage of
   * criteria passing) and the maximum ratio encountered.  Additional
   * fields may be included as needed.
   *
   * @param {Object} detailedStudy
   */
  validateDetailedStudy(detailedStudy) {
    if (!detailedStudy || typeof detailedStudy !== 'object' || !detailedStudy.criteria) {
      return { passRatio: 0, maxRatio: Infinity };
    }
    let passes = 0;
    let total = 0;
    let maxRatio = 0;
    for (const ratio of Object.values(detailedStudy.criteria)) {
      if (typeof ratio !== 'number') continue;
      total += 1;
      if (ratio <= 1.0) passes += 1;
      if (ratio > maxRatio) maxRatio = ratio;
    }
    const passRatio = total > 0 ? passes / total : 0;
    return { passRatio, maxRatio };
  }
}

/**
 * Wrapper function to evaluate a route with proper UI integration
 * Transforms FlowchartEvaluator results into UI-friendly format
 * 
 * @param {Object} route - Route object from drawing manager
 * @param {Object} options - Evaluation options including metadata and layers
 * @returns {Promise<Object>} Evaluation result with summary and rules
 */
export async function evaluateRouteV4(route, options = {}) {
  try {
    const metadata = options.metadata || route.metadata || {};
    
    // Import spatial queries utility
    const { performCompleteSpatialAnalysis } = await import('../spatialQueries.js');
    
    // Get route geometry
    const hvLineGeometry = route.graphic?.geometry;
    if (!hvLineGeometry) {
      throw new Error('Route geometry not available');
    }
    
    console.log('?? Performing spatial analysis for V004 evaluation...');
    console.log('   ?? Layers provided:', {
      railwayTracksLayer: !!options.layers?.railwayTracksLayer,
      trackSectionsLayer: !!options.layers?.trackSectionsLayer,
      technicalRoomsLayer: !!options.layers?.technicalRoomsLayer,
      earthingLayer: !!options.layers?.earthingLayer
    });
    
    // Perform spatial analysis to get nearby tracks and other features
    const spatialResults = await performCompleteSpatialAnalysis(hvLineGeometry, {
      tracksLayer: options.layers?.railwayTracksLayer,
      trackSectionsLayer: options.layers?.trackSectionsLayer,
      technicalRoomsLayer: options.layers?.technicalRoomsLayer,
      earthingLayer: options.layers?.earthingLayer
    });
    
    console.log('   ?? Spatial analysis results:', {
      tracksFound: spatialResults.tracks?.features?.length || 0,
      minTrackDistance: spatialResults.tracks?.minDistance,
      technicalRoomsFound: spatialResults.technicalRooms?.features?.length || 0,
      minTechDistance: spatialResults.technicalRooms?.minDistance
    });
    console.log(`   ?? Min distance to track: ${spatialResults.tracks.minDistance?.toFixed(1) || 'N/A'} m`);
    console.log(`   ?? Technical rooms found: ${spatialResults.technicalRooms.features.length}`);
    
    // Get the nearest track geometry for evaluation
    // Use the first track feature if available, otherwise null
    const nearestTrack = spatialResults.tracks.features?.[0]?.geometry || null;
    
    // Create geometry structure for evaluator
    const routeGeometry = {
      hvLine: hvLineGeometry,
      track: nearestTrack
    };
    
    // Prepare pre-calculated distances and crossing data
    const preCalculatedDistances = {
      trackDistance: spatialResults.tracks?.minDistance ?? Infinity,
      technicalRoomsDistance: spatialResults.technicalRooms?.minDistance ?? Infinity,
      crossing: spatialResults.crossing || { crossesTrack: false, primaryAngle: null, angles: [] }
    };
    
    console.log('   ?? Pre-calculated distances being passed to evaluator:', preCalculatedDistances);
    if (preCalculatedDistances.crossing?.crossesTrack) {
      console.log(`   ?? Crossing data included: ${preCalculatedDistances.crossing.angles.length} crossing(s), primary angle: ${preCalculatedDistances.crossing.primaryAngle?.toFixed(1)}°`);
    }
    
    // Create evaluator instance with spatial query results
    const evaluator = new FlowchartEvaluator(routeGeometry, {
      ratedVoltageKv: metadata.voltageKv || 0,
      circuitType: metadata.circuitType || 'singleCore',
      hasPadCurrentControl: metadata.hasPadCurrentControl || false,
      joints: options.joints || [],
      earthPoints: spatialResults.earthing?.features || [],
      technicalRooms: spatialResults.technicalRooms?.features || [],
      protectionTimeMs: metadata.faultClearingTimeMs || Infinity,
      unityStudy: null,
      detailedStudy: null,
      // Pass pre-calculated distances from spatial analysis
      preCalculatedDistances
    });
    
    // Run evaluation
    const flowchartResult = await evaluator.evaluate();
    
    // Transform to UI format with rules array
    const rules = buildRulesArray(evaluator.flowchartResults, metadata);
    const summary = buildSummary(rules, flowchartResult);
    
    return {
      summary,
      rules,
      flowchartResults: evaluator.flowchartResults,
      status: flowchartResult.status,
      message: flowchartResult.message,
      nextStep: flowchartResult.nextStep,
      crossing: evaluator.context?.crossing || { crossesTrack: false, angleDeg: null }
    };
    
  } catch (error) {
    console.error('Evaluation error:', error);
    return {
      summary: {
        status: 'fail',
        passCount: 0,
        failCount: 0,
        pendingCount: 1,
        evaluatedAt: new Date().toISOString()
      },
      rules: [{
        title: 'Evaluation Error',
        clause: 'System',
        status: 'fail',
        message: error.message || 'Unknown evaluation error'
      }],
      status: 'fail',
      message: 'Evaluation failed: ' + (error.message || 'Unknown error')
    };
  }
}

/**
 * Build rules array from flowchart results
 * Converts internal step results to UI-friendly rule format
 */
function buildRulesArray(flowchartResults, metadata) {
  const rules = [];
  
  // Initial distance check - Critical first step
  if (flowchartResults.initial) {
    const initial = flowchartResults.initial;
    const voltage = metadata.voltageKv || 0;
    const distance = initial.details.distance;
    
    let criterionText = '';
    let toelichtingText = '';
    
    if (voltage > 24) {
      criterionText = '>24 kV buiten 700m zone';
      toelichtingText = 'Verbinding bevindt zich buiten de 700 m van het hart van het buitenste spoor';
    } else {
      criterionText = '=24 kV buiten 31m zone';
      toelichtingText = 'Verbinding bevindt zich buiten de 31 m van het hart van het buitenste spoor';
    }
    
    rules.push({
      title: 'Initial - Bevindt de hoogspanningsverbinding zich buiten de zone',
      clause: 'Initial',
      status: initial.passes ? 'pass' : 'fail',
      message: initial.passes 
        ? `${criterionText} - Afstand: ${distance?.toFixed(1) || '?'} m - VOLDOET (geen modelstudies vereist)` 
        : `${criterionText} - Afstand: ${distance?.toFixed(1) || '?'} m - NIET VOLDAAN (verdere evaluatie nodig)`,
      reference: '[RLN00398-V004 Figuur 1 - Initi�le afstandscheck]',
      voldaan: initial.passes ? 'J' : 'N',
      toelichting: toelichtingText
    });
  }
  
  // Step A checks
  if (flowchartResults.stepA) {
    const stepA = flowchartResults.stepA;
    
    if (stepA.specialCase) {
      rules.push({
        title: 'Step A - Speciale situatie',
        clause: 'A',
        status: 'pass',
        message: stepA.specialCase,
        reference: 'Toelichting A'
      });
    } else if (stepA.checks) {
      // A.1 - Circuit configuration
      const circuitCheck = stepA.checks[0];
      rules.push({
        title: 'A.1 - (Lijn-)circuit in driehoek',
        clause: 'A.1',
        status: circuitCheck?.status || 'not_evaluated',
        message: circuitCheck?.message || 'Circuit configuratie',
        reference: '[specificatie/tekening]',
        voldaan: circuitCheck?.status === 'pass' ? 'J' : 'N',
        toelichting: 'bij kabel: driehoek gebundeld of multicore, bij lijn: in driehoek configuratie opgehangen'
      });
      
      // A.2 - Homopolar current control
      const padCheck = stepA.checks[1];
      rules.push({
        title: 'A.2 - Geen pad voor homopolaire stroom',
        clause: 'A.2',
        status: padCheck?.status || 'not_evaluated',
        message: padCheck?.message || 'Homopolaire stroombeheersing',
        reference: '[aantonen G3, in ieder geval met single-line van de verbinding, waarop de aarding inzichtelijk is]',
        voldaan: padCheck?.status === 'pass' ? 'J' : 'N',
        toelichting: ''
      });
      
      // A.3 - Single-phase fault risk
      const faultCheck = stepA.checks[2];
      rules.push({
        title: 'A.3 - Kans op 1 fase sluiting met aarde nabij spoor voldoende klein',
        clause: 'A.3',
        status: faultCheck?.status || 'not_evaluated',
        message: faultCheck?.message || 'Eenfase-sluitingsrisico',
        reference: '[tekening met moffen, aardpunten en/of mastfundaties in de maatvoering t.o.v. het buitenste spoor]',
        voldaan: faultCheck?.status === 'pass' ? 'J' : 'N',
        toelichting: ''
      });
    }
  }
  
  // Step B checks
  if (flowchartResults.stepB) {
    const stepB = flowchartResults.stepB;
    
    if (stepB.checks) {
      // B.4 - Penetration zone distance
      const zoneCheck = stepB.checks[0];
      rules.push({
        title: 'B.4 - Loopt midden/hoogspanning verbinding buiten zone',
        clause: 'B.4',
        status: zoneCheck?.status || 'not_evaluated',
        message: zoneCheck?.message || 'Zone afstand',
        reference: '[trac�tekening met parallelloop in de maatvoering t.o.v. het spoor]',
        voldaan: zoneCheck?.status === 'pass' || zoneCheck?.status === 'not_applicable' ? 'J' : 'N',
        toelichting: '>24 kV buiten 700 m zone, =24 kV buiten 11 m zone, of is er binnen deze zones geen parallelloop en wordt voldaan aan (5) en (6)'
      });
      
      // B.5 - Crossing angle
      const angleCheck = stepB.checks[1];
      if (angleCheck && angleCheck.status !== 'not_applicable') {
        rules.push({
          title: 'B.5 - Kruist de verbinding het spoor ongeveer haaks (80 tot 100 graden)',
          clause: 'B.5',
          status: angleCheck.status,
          message: angleCheck.message || 'Kruisingshoek',
          reference: '[trac�tekening in de maatvoering (kruisingshoek) t.o.v. het spoor]',
          voldaan: angleCheck.status === 'pass' ? 'J' : 'N',
          toelichting: ''
        });
      }
      
      // B.6 - Technical room distance
      const techCheck = stepB.checks[2];
      rules.push({
        title: 'B.6 - Bevindt de verbinding zich op een afstand >20m vanaf een dichtsbijzijnde technische ruimte',
        clause: 'B.6',
        status: techCheck?.status || 'not_evaluated',
        message: techCheck?.message || 'Technische ruimte afstand',
        reference: '[trac�tekening in de maatvoering t.o.v. spoorse gebouwen]',
        voldaan: techCheck?.status === 'pass' ? 'J' : 'N',
        toelichting: 'gebouw, geen kast'
      });
      
      // B.7 - Protection clearing time
      const protectionCheck = stepB.checks[3];
      rules.push({
        title: 'B.7 - Wordt een eerste orde lijnfout binnen 100ms afgeschakeld',
        clause: 'B.7',
        status: protectionCheck?.status || 'not_evaluated',
        message: protectionCheck?.message || 'Beveiligingsuitschakeltijd',
        reference: '[onderbouwing beveiligingsconcept en/of risicobeschouwing en onderbouwing van faalfrequentie]',
        voldaan: protectionCheck?.status === 'pass' ? 'J' : 'N',
        toelichting: ''
      });
    }
  }
  
  return rules;
}

/**
 * Build summary from rules array
 */
function buildSummary(rules, flowchartResult) {
  const passCount = rules.filter(r => r.status === 'pass').length;
  const failCount = rules.filter(r => r.status === 'fail').length;
  const pendingCount = rules.filter(r => r.status === 'not_evaluated' || r.status === 'pending').length;
  
  let status = 'not_evaluated';
  if (failCount > 0) {
    status = 'fail';
  } else if (pendingCount > 0) {
    status = 'incomplete';
  } else if (passCount > 0) {
    status = 'pass';
  }
  
  // Override with flowchart result status if more specific
  if (flowchartResult.status === 'compliant') {
    status = 'pass';
  } else if (flowchartResult.status === 'requires_further_study') {
    status = 'incomplete';
  }
  
  return {
    status,
    passCount,
    failCount,
    pendingCount,
    evaluatedAt: new Date().toISOString()
  };
}
