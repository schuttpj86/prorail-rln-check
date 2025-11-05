/**
 * RLN00398-V002 Configuration
 * Effective Date: 01-12-2020
 * 
 * This configuration implements the flowchart-based assessment approach
 * introduced in Version 002 of the ProRail EMC standard.
 * 
 * Key Changes from V001:
 * - Flowchart-based sequential filtering (Steps A-F)
 * - 25kV AC electrification special handling
 * - HVDC connection requirements
 * - Unity study integration
 * - New reporting templates (Bijlage 3 & 4)
 */

export const configV2 = {
  // ============================================================================
  // STANDARD IDENTIFICATION
  // ============================================================================
  
  standard: {
    name: 'RLN00398',
    version: '002',
    title: 'Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hoofdspoorweginfrastructuur',
    effectiveDate: '2020-12-01',
    managingEntity: 'ProRail AM Techniek'
  },

  // ============================================================================
  // FLOWCHART ASSESSMENT THRESHOLDS
  // ============================================================================
  
  flowchart: {
    /**
     * Step A: Basic Requirements (§5.2 Flowchart A)
     * Initial filtering based on voltage, clearance, and fault risks
     */
    stepA: {
      // Voltage thresholds
      voltage: {
        lowVoltageThreshold_kV: 24, // ≤24kV has special simplified rules
        highVoltageThreshold_kV: 35  // ≥35kV requires stricter rules
      },
      
      // Clearance distances
      clearance: {
        simplifiedDistance_m: 11,  // ≤24kV outside 11m = automatic pass
        trackClearance_m: 31,       // General clearance requirement
        moffenClearance_m: 31,      // Cable joints must be >31m from track
        aardingClearance_m: 31,     // Earthing points must be >31m from track
        moffenProtection_m: 5       // Additional isolation zone before/after moffen
      },
      
      // Single-phase earth fault criteria (eenfase sluiting)
      eenfaseSluiting: {
        enabled: true,
        requiresPotentiaalTrechter: true // If moffen/aarding within 31m
      }
    },

    /**
     * Step B: Distance and Parallel Run Checks (§5.2 Flowchart B)
     */
    stepB: {
      // Parallel run distance thresholds
      parallelDistance: {
        default_m: 700,           // General case: 700m from outermost track
        electrified25kV_m: 11,    // Exception for 25kV AC: only 11m required
        lowVoltageCable_m: 11,    // <35kV cables: 11m required
        nonElectrified_m: 700     // Non-electrified tracks: 700m
      },
      
      // Crossing requirements
      crossing: {
        angleMin_deg: 80,
        angleMax_deg: 100,
        faultClearingTimeMax_ms: 100,
        
        // Overhead line specific
        overheadLine: {
          doubleGuyingRequired: true,
          clearanceStandard: 'NEN-EN-50341', // Reference to §5.1(2)
          minIsolators: 2  // Minimum 2 isolators per suspension (§5.1 note)
        },
        
        // Cable specific
        cable: {
          boredCrossingRequired: true,
          insulatedConduitRequired: true
        }
      },
      
      // Technical rooms
      technicalRooms: {
        minimumDistance_m: 20
      },
      
      // Mast distance (overhead lines)
      mastDistance: {
        minimum_m: 31  // §5.1(6) - was §5.1(7) in V001
      }
    },

    /**
     * Step C: Unity Study Requirements (§5.2 Flowchart C)
     * Checks whether unity study is needed and validates results
     */
    stepC: {
      thresholds: {
        maxContribution_percent: 20,  // G2: Max 20% of assessment criterion
        indringdiepte_m: 700           // Influence depth for existing connections
      },
      
      criteria: {
        requiresUnityStudy: true,
        validationRequired: true,
        referenceStandard: 'NEN3654_BijlageD'  // §6.1 G2
      }
    },

    /**
     * Step D: EMC Detail Study Requirements (§5.2 Flowchart D)
     * Final detailed assessment thresholds
     */
    stepD: {
      criteria: {
        requiresDetailStudy: true,
        validationMethod: 'unity_study',
        reportTemplate: 'bijlage_4'  // Checklist voor EMC-detailstudies
      },
      
      // Validation thresholds for determining "net niet" vs "ruim niet"
      validation: {
        closeToLimit_percent: 50,   // <50% = "net niet"
        significantExcess_percent: 80, // >80% = "ruim niet"
        requiresSecondBureau_percent: 50 // 50-80% requires second opinion
      }
    },

    /**
     * Steps E/F: Mitigation Decision Tree
     */
    stepEF: {
      netNiet: {
        action: 'detailed_calculation',
        description: 'Results close to limits - more detailed EMC study may demonstrate compliance'
      },
      
      ruimNiet: {
        action: 'mitigation_required',
        description: 'Results significantly exceed limits - maatregelen needed',
        options: [
          'trace_wijziging',
          'verhogen_immuniteit',
          'shielding',
          'aarding_improvements'
        ]
      }
    }
  },

  // ============================================================================
  // ELECTRIFICATION TYPES (NEW IN V002)
  // ============================================================================
  
  electrification: {
    types: {
      DC_1500V: {
        id: '1500V_DC',
        voltage: 1500,
        frequency: 0, // DC
        standard: 'default',
        parallelDistance_m: 700
      },
      
      AC_25KV_50HZ: {
        id: '25kV_50Hz',
        voltage: 25000,
        frequency: 50,
        standard: 'special', // NEW: Requires special handling per §5.4
        parallelDistance_m: 11  // Exception: only 11m required!
      },
      
      AC_25KV_75HZ: {
        id: '25kV_75Hz',
        voltage: 25000,
        frequency: 75,
        standard: 'default', // Not mentioned in V002, assume default
        parallelDistance_m: 700
      },
      
      NON_ELECTRIFIED: {
        id: 'non_electrified',
        voltage: 0,
        frequency: 0,
        standard: 'default',
        parallelDistance_m: 700
      }
    }
  },

  // ============================================================================
  // HVDC CONNECTIONS (§5.3 - NEW IN V002)
  // ============================================================================
  
  hvdc: {
    enabled: true,
    requiresSpecialAssessment: true,
    note: 'Voor potentiële beïnvloeding vanuit HVDC-verbindingen van de netbeheerder geldt het gestelde in paragraaf 5.3'
    // TODO: Add specific HVDC criteria once §5.3 is fully mapped
  },

  // ============================================================================
  // SPATIAL REFERENCE & QUERY SETTINGS
  // ============================================================================
  
  spatial: {
    referenceSystem: {
      wkid: 28992,  // RD New / Amersfoort
      name: 'Amersfoort / RD New'
    },
    
    queryBuffers: {
      tracks_m: 10000,
      technicalRooms_m: 10000,
      earthing_m: 50,
      moffen_m: 50
    },
    
    trackGeometry: {
      standardGauge_m: 1.435,
      trackWidth_m: 3.0,      // Physical width including ballast
      perTrack_m: 1.5         // Half-width per track
    }
  },

  // ============================================================================
  // INFRASTRUCTURE TYPES
  // ============================================================================
  
  infrastructure: {
    types: {
      OVERHEAD_LINE: 'overhead',
      CABLE: 'cable'
    },
    
    voltageCategories: {
      LOW: { max: 24, label: '≤24kV' },
      MEDIUM: { min: 24, max: 35, label: '24-35kV' },
      HIGH: { min: 35, label: '≥35kV' }
    }
  },

  // ============================================================================
  // REPORTING TEMPLATES (NEW IN V002)
  // ============================================================================
  
  reporting: {
    templates: {
      basic: {
        name: 'Template tbv basisrapportage EMC',
        reference: 'Bijlage 3',
        applicableSteps: ['A', 'B'],
        description: 'Voor eenvoudigere beschouwingen (flowchart A/B)'
      },
      
      detailed: {
        name: 'Checklist tbv RLN00398 EMC-detailstudies',
        reference: 'Bijlage 4',
        applicableSteps: ['C', 'D'],
        description: 'Voor unity studies en EMC-detailstudies'
      }
    },
    
    requirements: {
      onderbouwingRequired: true,
      flowchartDocumentationRequired: true,
      templateComplianceRequired: true
    }
  },

  // ============================================================================
  // VALIDATION & COMPLIANCE CRITERIA (Chapter 7)
  // ============================================================================
  
  beoordelingsCriteria: {
    // Common mode voltage - enkelbenige spoorstroomlopen
    commonMode_enkelbenig: {
      continuous: {
        voltage_V: 20,
        current_A: 58
      },
      shortCircuit: {
        voltage_V: 65,
        current_A: 58,
        duration_ms: { min: 100, max: 500 }
      }
    },
    
    // Common mode voltage - dubbelbenige spoorstroomlopen
    commonMode_dubbelbenig: {
      voltage_V: 65,
      current_A: 250,
      duration_ms: { min: 100 }
    },
    
    // Cable sheath voltage
    cableSheath: {
      continuous_V: 150,
      transient_V: 650,
      transient_duration_ms: 100
    },
    
    // Magnetic fields
    magneticFields: {
      maxExposure_uT: 100,  // At 1m above ground
      heightAboveGround_m: 1.0,
      standard: 'NEN-EN-50341-3'
    },
    
    // Electric fields
    electricFields: {
      maxField_kV_per_m: 10,  // At 1m above track
      heightAboveTrack_m: 1.0,
      voltageMargin_percent: 10  // Nominal + 10% (highest system voltage)
    }
  },

  // ============================================================================
  // MODELING ASSUMPTIONS (Chapter 6)
  // ============================================================================
  
  modeling: {
    // Ground resistivity
    ground: {
      deepLayer_ohm_m: 70,      // From 30m depth (G1)
      topLayer_ohm_m: { min: 10, max: 1000 },  // 0-30m depth (K2)
      homogeneousModel: true
    },
    
    // Fault scenarios
    faults: {
      types: ['single_phase', 'three_phase'],
      clearingTime_ms: 100,
      voltageDeviation_percent: 10,  // ±10% of nominal (T3)
      homopolarCurrent_percent: 10   // 10% of max current (T4)
    },
    
    // Track modeling
    track: {
      afleidweerstand_ohm_per_km: [2.5, 10, 100],  // Rail-to-earth (P4)
      spoorstaafImpedance_ohm_per_km: 0.044,       // Per rail (P5)
      returnPathImpedance_50Hz: {
        real: 0.050,
        imaginary: 0.880
      }
    }
  },

  // ============================================================================
  // LEGACY COMPATIBILITY
  // ============================================================================
  
  legacy: {
    v001CompatibilityMode: false,
    preserveOldRuleIds: true,
    allowDirectRuleEvaluation: false  // V002 requires flowchart approach
  }
};

export default configV2;
