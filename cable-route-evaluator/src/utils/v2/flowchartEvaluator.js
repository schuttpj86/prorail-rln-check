/**
 * RLN00398-V002 Flowchart Evaluator
 * 
 * Implements the sequential filtering approach from Figure 1 (flowchart)
 * Steps: A → B → C → D → E/F
 * 
 * This is a complete rewrite of the EMC evaluation logic to match the
 * new standard's flowchart-based decision tree.
 */

import { geometryUtils } from '../shared/geometryUtils.js';
import { configV2 } from '../../config.v2.js';
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator";

/**
 * Main Flowchart Evaluator Class
 * Orchestrates the sequential assessment process
 */
export class FlowchartEvaluator {
  constructor(route, options = {}) {
    this.route = route;
    this.options = options;
    this.metadata = this.normalizeMetadata(route.metadata, options.metadata);
    
    // Evaluation context (populated during assessment)
    this.context = {
      route: null,
      routeRd: null,
      geometry: null,
      metadata: this.metadata,
      routeType: this.determineRouteType(),
      electrificationType: null,
      distances: {},
      crossing: {},
      layers: options.layers || {}
    };
    
    // Flowchart step results
    this.flowchartResults = {
      stepA: { status: 'pending', checks: [] },
      stepB: { status: 'pending', checks: [] },
      stepC: { status: 'pending', checks: [] },
      stepD: { status: 'pending', checks: [] },
      stepEF: { status: 'pending', decision: null }
    };
    
    // Final assessment result
    this.result = null;
  }

  /**
   * Normalize and validate metadata
   */
  normalizeMetadata(routeMetadata = {}, optionsMetadata = {}) {
    const metadata = {
      ...this.getDefaultMetadata(),
      ...routeMetadata,
      ...optionsMetadata
    };
    
    // Convert numeric fields
    metadata.voltageKv = geometryUtils.toNumber(metadata.voltageKv) ?? 110;
    metadata.faultClearingTimeMs = geometryUtils.toNumber(metadata.faultClearingTimeMs);
    metadata.minJointDistanceMeters = geometryUtils.toNumber(metadata.minJointDistanceMeters);
    metadata.minMastDistanceMeters = geometryUtils.toNumber(metadata.minMastDistanceMeters);
    
    return metadata;
  }

  /**
   * Default metadata values
   */
  getDefaultMetadata() {
    return {
      infrastructureType: 'cable',
      voltageKv: 110,
      electrifiedSystem: 'standard',
      faultClearingTimeMs: 120,
      hasDoubleGuying: null,
      hasBoredCrossing: null,
      minJointDistanceMeters: null,
      minMastDistanceMeters: null,
      hasMoffenWithin31m: null,
      hasAardingWithin31m: null,
      notes: ''
    };
  }

  /**
   * Determine infrastructure type from metadata
   */
  determineRouteType() {
    const type = (this.metadata.infrastructureType || 'cable').toLowerCase();
    return type === 'overhead' ? 'overhead' : 'cable';
  }

  // ==========================================================================
  // MAIN EVALUATION ORCHESTRATOR
  // ==========================================================================

  /**
   * Main entry point: Execute flowchart-based evaluation
   * @returns {Promise<Object>} Complete evaluation result
   */
  async evaluate() {
    try {
      console.log('\n🔄 Starting RLN00398-V002 Flowchart Evaluation');
      console.log('═══════════════════════════════════════════════════');
      
      // Build evaluation context
      await this.buildEvaluationContext();
      
      // Execute flowchart steps sequentially
      const stepA = await this.evaluateStepA();
      if (!stepA.passes) {
        return this.exitWithRequirement('Step A', stepA);
      }
      
      const stepB = await this.evaluateStepB();
      if (!stepB.passes) {
        return this.exitWithRequirement('Step B', stepB);
      }
      
      const stepC = await this.evaluateStepC();
      if (!stepC.passes) {
        return this.exitWithRequirement('Step C (Unity Study)', stepC);
      }
      
      const stepD = await this.evaluateStepD();
      if (!stepD.passes) {
        return this.exitWithRequirement('Step D (EMC Detail Study)', stepD);
      }
      
      // All steps passed - route is compliant!
      return this.buildCompliantResult();
      
    } catch (error) {
      console.error('❌ Flowchart evaluation failed:', error);
      return this.buildErrorResult(error);
    }
  }

  /**
   * Build evaluation context with geometry, distances, crossings
   */
  async buildEvaluationContext() {
    console.log('\n📊 Building Evaluation Context...');
    
    if (!this.route || !this.route.geometry) {
      throw new Error('Route geometry is required');
    }
    
    // Ensure projection is ready
    await geometryUtils.ensureProjectionLoaded();
    
    // Project route to RD New
    const routeRd = projectOperator.execute(
      this.route.geometry, 
      geometryUtils.RD_SPATIAL_REFERENCE
    );
    
    if (!routeRd) {
      throw new Error('Failed to project route to RD New (EPSG:28992)');
    }
    
    // Populate context
    this.context.route = this.route;
    this.context.routeRd = routeRd;
    this.context.geometry = this.route.geometry;
    
    // Fetch track geometries
    console.log('   🔍 Fetching track geometries...');
    const trackGeometries = await geometryUtils.fetchTrackGeometries(
      this.route.geometry,
      this.context.layers
    );
    
    // Analyze crossings
    console.log('   📐 Analyzing crossings...');
    this.context.crossing = geometryUtils.analyzeCrossings(routeRd, trackGeometries);
    
    // Calculate distances
    console.log('   📏 Calculating distances...');
    const trackWidthAdjustment = configV2.spatial.trackGeometry.perTrack_m;
    this.context.distances.track = geometryUtils.computeMinimumDistance(
      routeRd, 
      trackGeometries, 
      trackWidthAdjustment
    );
    
    // Technical room distance
    this.context.distances.technicalRoom = await geometryUtils.computeTechnicalRoomDistance(
      this.route.geometry,
      routeRd,
      this.context.layers.technicalRoomsLayer
    );
    
    // Determine electrification type (TODO: query from layer)
    this.context.electrificationType = this.determineElectrificationType();
    
    console.log('   ✅ Context built successfully');
    console.log(`      - Route type: ${this.context.routeType}`);
    console.log(`      - Voltage: ${this.metadata.voltageKv} kV`);
    console.log(`      - Crosses track: ${this.context.crossing.crossesTrack}`);
    console.log(`      - Distance to track: ${this.context.distances.track?.toFixed(1) ?? 'unknown'} m`);
  }

  /**
   * Determine electrification type of nearby tracks
   * TODO: Query from ProRail electrification layer
   */
  determineElectrificationType() {
    // For now, use metadata or default to 1500V DC
    const systemType = this.metadata.electrifiedSystem || 'standard';
    
    if (systemType === '25kv_50hz') {
      return configV2.electrification.types.AC_25KV_50HZ;
    } else if (systemType === '25kv_75hz') {
      return configV2.electrification.types.AC_25KV_75HZ;
    } else if (systemType === 'non_electrified') {
      return configV2.electrification.types.NON_ELECTRIFIED;
    } else {
      return configV2.electrification.types.DC_1500V;
    }
  }

  // ==========================================================================
  // FLOWCHART STEP A: BASIC REQUIREMENTS
  // ==========================================================================

  /**
   * Step A: Basic voltage, clearance, and eenfase sluiting checks
   * Items 1-3 from flowchart
   */
  async evaluateStepA() {
    console.log('\n📋 Evaluating Step A: Basic Requirements');
    console.log('─────────────────────────────────────────');
    
    const stepA = {
      status: 'evaluated',
      passes: true,
      checks: []
    };
    
    // TODO: Implement actual checks based on your flowchart mapping
    // Placeholder structure:
    
    // Check A.1: Voltage and circuit configuration
    const check1 = {
      id: 'A1_voltage_config',
      title: 'Circuit in 1 kabel of driefase gebalanceerde single core',
      status: 'not_implemented',
      message: 'Awaiting flowchart logic mapping'
    };
    stepA.checks.push(check1);
    
    // Check A.2: Pad/homopolar current controls
    const check2 = {
      id: 'A2_current_control',
      title: 'Geen pad voor homopolaire stroom',
      status: 'not_implemented',
      message: 'Awaiting flowchart logic mapping'
    };
    stepA.checks.push(check2);
    
    // Check A.3: Eenfase sluiting risk (moffen/aarding)
    const check3 = await this.checkEenfaseSluiting();
    stepA.checks.push(check3);
    
    // Special case: ≤24kV buiten 11m = automatic pass
    if (this.metadata.voltageKv <= 24 && 
        this.context.distances.track !== null &&
        this.context.distances.track > 11) {
      stepA.specialCase = '≤24kV outside 11m - automatic compliance per §5.2(A)';
      console.log('   ✅ SPECIAL CASE: ≤24kV outside 11m → Step A PASS');
      stepA.passes = true;
    } else {
      stepA.passes = stepA.checks.every(c => 
        c.status === 'pass' || c.status === 'not_applicable'
      );
    }
    
    this.flowchartResults.stepA = stepA;
    console.log(`   ${stepA.passes ? '✅' : '❌'} Step A Result: ${stepA.passes ? 'PASS' : 'FAIL'}`);
    return stepA;
  }

  /**
   * Check for eenfase sluiting risk (moffen/aarding within 31m)
   */
  async checkEenfaseSluiting() {
    const cfg = configV2.flowchart.stepA.clearance;
    const trackDist = this.context.distances.track;
    
    // If entire route is >31m from tracks, automatic pass
    if (trackDist !== null && trackDist >= cfg.moffenClearance_m) {
      return {
        id: 'A3_eenfase_sluiting',
        title: 'Geen eenfase sluiting risico nabij spoor',
        status: 'pass',
        message: `Entire route is ${trackDist.toFixed(1)}m from tracks (>${cfg.moffenClearance_m}m required)`,
        autoEvaluated: true
      };
    }
    
    // Route comes within 31m - need user confirmation
    const hasMoffen = this.metadata.hasMoffenWithin31m;
    const hasAarding = this.metadata.hasAardingWithin31m;
    
    if (hasMoffen === null || hasAarding === null) {
      return {
        id: 'A3_eenfase_sluiting',
        title: 'Geen eenfase sluiting risico nabij spoor',
        status: 'not_evaluated',
        message: `Route comes within ${trackDist?.toFixed(1) ?? '?'}m of tracks. Confirm: No moffen or aarding points within ${cfg.moffenClearance_m}m?`,
        requiresInput: true
      };
    }
    
    // User confirmed presence/absence
    if (!hasMoffen && !hasAarding) {
      return {
        id: 'A3_eenfase_sluiting',
        title: 'Geen eenfase sluiting risico nabij spoor',
        status: 'pass',
        message: 'No moffen or aarding points within 31m of tracks'
      };
    } else {
      return {
        id: 'A3_eenfase_sluiting',
        title: 'Eenfase sluiting risico nabij spoor',
        status: 'fail',
        message: 'Moffen or aarding points found within 31m - requires potentiaaltrechterbepaling',
        requiresPotentiaalTrechter: true
      };
    }
  }

  // ==========================================================================
  // FLOWCHART STEP B: DISTANCE & PARALLEL CHECKS
  // ==========================================================================

  /**
   * Step B: Parallel run and crossing distance checks
   * Items 4-7 from flowchart
   */
  async evaluateStepB() {
    console.log('\n📋 Evaluating Step B: Distance & Parallel Checks');
    console.log('─────────────────────────────────────────────────');
    
    const stepB = {
      status: 'evaluated',
      passes: true,
      checks: []
    };
    
    // TODO: Implement actual checks based on your flowchart mapping
    // Placeholder structure:
    
    stepB.checks.push({
      id: 'B4_parallel_distance',
      title: 'Parallel distance check',
      status: 'not_implemented',
      message: 'Awaiting flowchart logic mapping'
    });
    
    stepB.passes = stepB.checks.every(c => 
      c.status === 'pass' || c.status === 'not_applicable'
    );
    
    this.flowchartResults.stepB = stepB;
    console.log(`   ${stepB.passes ? '✅' : '❌'} Step B Result: ${stepB.passes ? 'PASS' : 'FAIL'}`);
    return stepB;
  }

  // ==========================================================================
  // FLOWCHART STEP C: UNITY STUDY
  // ==========================================================================

  /**
   * Step C: Unity study requirements and validation
   * Items 8-9 from flowchart
   */
  async evaluateStepC() {
    console.log('\n📋 Evaluating Step C: Unity Study Requirements');
    console.log('───────────────────────────────────────────────');
    
    const stepC = {
      status: 'evaluated',
      passes: true,
      checks: []
    };
    
    // TODO: Implement unity study validation
    stepC.checks.push({
      id: 'C8_unity_study',
      title: 'Unity study voldoet aan criteria (G2)',
      status: 'not_implemented',
      message: 'Unity study validation awaiting implementation'
    });
    
    stepC.passes = stepC.checks.every(c => 
      c.status === 'pass' || c.status === 'not_applicable'
    );
    
    this.flowchartResults.stepC = stepC;
    console.log(`   ${stepC.passes ? '✅' : '❌'} Step C Result: ${stepC.passes ? 'PASS' : 'FAIL'}`);
    return stepC;
  }

  // ==========================================================================
  // FLOWCHART STEP D: EMC DETAIL STUDY
  // ==========================================================================

  /**
   * Step D: EMC detail study requirements and validation
   * Items 10-12 from flowchart
   */
  async evaluateStepD() {
    console.log('\n📋 Evaluating Step D: EMC Detail Study');
    console.log('──────────────────────────────────────');
    
    const stepD = {
      status: 'evaluated',
      passes: true,
      checks: []
    };
    
    // TODO: Implement EMC detail study validation
    stepD.checks.push({
      id: 'D10_emc_detail',
      title: 'EMC detailstudie voldoet aan criteria',
      status: 'not_implemented',
      message: 'EMC detail study validation awaiting implementation'
    });
    
    stepD.passes = stepD.checks.every(c => 
      c.status === 'pass' || c.status === 'not_applicable'
    );
    
    this.flowchartResults.stepD = stepD;
    console.log(`   ${stepD.passes ? '✅' : '❌'} Step D Result: ${stepD.passes ? 'PASS' : 'FAIL'}`);
    return stepD;
  }

  // ==========================================================================
  // RESULT BUILDERS
  // ==========================================================================

  /**
   * Exit with requirement for further study
   */
  exitWithRequirement(stepName, stepResult) {
    console.log(`\n⚠️ Flowchart exited at ${stepName}`);
    
    return {
      status: 'requires_study',
      version: configV2.standard.version,
      evaluatedAt: new Date().toISOString(),
      exitStep: stepName,
      stepResult: stepResult,
      flowchartResults: this.flowchartResults,
      message: `Route requires additional assessment at ${stepName}`,
      context: this.context
    };
  }

  /**
   * Build compliant result (all steps passed)
   */
  buildCompliantResult() {
    console.log('\n✅ Route is COMPLIANT with RLN00398-V002!');
    console.log('═══════════════════════════════════════════');
    
    return {
      status: 'compliant',
      version: configV2.standard.version,
      evaluatedAt: new Date().toISOString(),
      flowchartResults: this.flowchartResults,
      message: 'Route complies with RLN00398-V002 without requiring detailed EMC study',
      summary: {
        passCount: Object.values(this.flowchartResults)
          .filter(s => s.passes === true).length,
        totalSteps: 4
      },
      context: this.context
    };
  }

  /**
   * Build error result
   */
  buildErrorResult(error) {
    console.error('\n❌ Evaluation Error');
    
    return {
      status: 'error',
      version: configV2.standard.version,
      evaluatedAt: new Date().toISOString(),
      error: error.message,
      flowchartResults: this.flowchartResults,
      context: this.context
    };
  }
}

// ==========================================================================
// PUBLIC API
// ==========================================================================

/**
 * Main evaluation function (V2)
 * Entry point for RLN00398-V002 flowchart-based assessment
 * 
 * @param {Object} route - Route object with geometry and metadata
 * @param {Object} options - Evaluation options (layers, unityStudy, etc.)
 * @returns {Promise<Object>} Evaluation result
 */
export async function evaluateRouteV2(route, options = {}) {
  const evaluator = new FlowchartEvaluator(route, options);
  return await evaluator.evaluate();
}

export default {
  FlowchartEvaluator,
  evaluateRouteV2
};
