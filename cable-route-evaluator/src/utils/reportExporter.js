/**
 * Professional Engineering Report Exporter
 * Generates compliant Markdown reports aligned with RLN00398 v002 (01-12-2020)
 */

import { t } from '../i18n/translations.js';
import { formatDistance } from './drawingUtils.js';

/**
 * Generate a professional Markdown report for a single route evaluation
 * @param {Object} route - Route data with geometry, metadata, and compliance
 * @param {Object} options - Export options
 * @returns {string} Formatted Markdown report
 */
export function generateRouteReport(route, options = {}) {
  const {
    projectName = 'High Voltage Connection Route',
    projectNumber = '',
    authorName = '',
    organizationName = 'ProRail',
    includeAppendices = true
  } = options;

  const today = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  const routeName = route.name || `Route ${route.id}`;
  const routeLength = route.length ? formatDistance(route.length) : 'N/A';
  const metadata = route.metadata || {};
  const compliance = route.compliance || {};
  const summary = compliance.summary || {};

  // Build the report
  let report = '';

  // ==================== COVER PAGE ====================
  report += `# Preliminary Route Evaluation Report\n\n`;
  report += `## ${routeName}\n\n`;
  report += `---\n\n`;
  report += `**Project:** ${projectName}${projectNumber ? ` (${projectNumber})` : ''}\n\n`;
  report += `**Organization:** ${organizationName}\n\n`;
  report += `**Author:** ${authorName || '_[To be completed]_'}\n\n`;
  report += `**Date:** ${today}\n\n`;
  report += `**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)\n\n`;
  report += `---\n\n`;
  report += `\\pagebreak\n\n`;

  // ==================== EXECUTIVE SUMMARY ====================
  report += `## 1. Executive Summary\n\n`;
  
  const statusEmoji = getStatusEmoji(summary.status);
  const statusText = getStatusText(summary.status);
  
  report += `**Route Name:** ${routeName}\n\n`;
  report += `**Route Length:** ${routeLength}\n\n`;
  report += `**Infrastructure Type:** ${getInfrastructureTypeText(metadata.infrastructureType)}\n\n`;
  report += `**Nominal Voltage:** ${metadata.voltageKv || 'N/A'} kV\n\n`;
  report += `**Overall Compliance Status:** ${statusEmoji} **${statusText}**\n\n`;

  report += `### Evaluation Summary\n\n`;
  report += `| Criteria | Count |\n`;
  report += `|----------|-------|\n`;
  report += `| ✅ Pass | ${summary.passCount || 0} |\n`;
  report += `| ❌ Fail | ${summary.failCount || 0} |\n`;
  report += `| ⏳ Pending | ${summary.pendingCount || 0} |\n`;
  report += `| ➖ Not Applicable | ${summary.notApplicableCount || 0} |\n\n`;

  if (summary.failCount > 0) {
    report += `> **⚠️ ACTION REQUIRED:** This route has ${summary.failCount} failing criteria that must be addressed before proceeding with detailed design.\n\n`;
  } else if (summary.pendingCount > 0) {
    report += `> **ℹ️ INFORMATION REQUIRED:** ${summary.pendingCount} criteria require additional information or design details to complete the evaluation.\n\n`;
  } else if (summary.status === 'pass') {
    report += `> **✅ PRELIMINARY APPROVAL:** This route meets all evaluated EMC compliance criteria based on current information.\n\n`;
  }

  report += `\\pagebreak\n\n`;

  // ==================== REPORT & DATA DETAILS ====================
  report += `## 2. Report & Data Details\n\n`;
  report += `**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)\n\n`;
  report += `**Evaluation Tool:** ProRail Cable Route Evaluator (Web Application)\n\n`;
  report += `**Report Generated:** ${today}\n\n`;
  report += `**Spatial Reference System:** RD New (EPSG:28992)\n\n`;
  report += `**Data Sources:**\n`;
  report += `- ProRail Infrastructure Data (Railway Tracks, Track Sections, Switches)\n`;
  report += `- ProRail Energy Supply System Data\n`;
  report += `- ProRail Train Protection System Data\n`;
  report += `- Technical Rooms and Facilities Data\n\n`;
  
  report += `\\pagebreak\n\n`;

  // ==================== ROUTE OVERVIEW ====================
  report += `## 3. Route Overview\n\n`;
  report += `### 3.1 Route Geometry\n\n`;
  report += `**Route Identifier:** ${route.id}\n\n`;
  report += `**Route Name:** ${routeName}\n\n`;
  report += `**Total Length:** ${routeLength}\n\n`;
  report += `**Infrastructure Type:** ${getInfrastructureTypeText(metadata.infrastructureType)}\n\n`;
  
  if (route.geometry && route.geometry.paths && route.geometry.paths[0]) {
    const path = route.geometry.paths[0];
    report += `**Number of Vertices:** ${path.length}\n\n`;
    
    const startPoint = path[0];
    const endPoint = path[path.length - 1];
    report += `**Start Coordinates (RD):** X=${startPoint[0].toFixed(2)}, Y=${startPoint[1].toFixed(2)}\n\n`;
    report += `**End Coordinates (RD):** X=${endPoint[0].toFixed(2)}, Y=${endPoint[1].toFixed(2)}\n\n`;
  }

  report += `### 3.2 Design Parameters\n\n`;
  report += `| Parameter | Value |\n`;
  report += `|-----------|-------|\n`;
  report += `| Infrastructure Type | ${getInfrastructureTypeText(metadata.infrastructureType)} |\n`;
  report += `| Nominal Voltage | ${metadata.voltageKv || 'N/A'} kV |\n`;
  report += `| Electrified System | ${metadata.electrifiedSystem || 'Standard'} |\n`;
  report += `| Fault Clearing Time | ${metadata.faultClearingTimeMs || 'N/A'} ms |\n`;
  
  if (metadata.infrastructureType === 'overhead') {
    report += `| Double Guying | ${metadata.hasDoubleGuying === true ? 'Yes' : metadata.hasDoubleGuying === false ? 'No' : 'Not specified'} |\n`;
    report += `| Min. Mast Distance | ${metadata.minMastDistanceMeters ? metadata.minMastDistanceMeters + ' m' : 'N/A'} |\n`;
  } else {
    report += `| Bored Crossing | ${metadata.hasBoredCrossing === true ? 'Yes' : metadata.hasBoredCrossing === false ? 'No' : 'Not specified'} |\n`;
    report += `| Min. Joint Distance | ${metadata.minJointDistanceMeters ? metadata.minJointDistanceMeters + ' m' : 'N/A'} |\n`;
  }
  
  if (metadata.notes) {
    report += `\n**Design Notes:**\n\n${metadata.notes}\n\n`;
  }

  report += `\\pagebreak\n\n`;

  // ==================== DETAILED EVALUATION RESULTS ====================
  report += `## 4. Detailed EMC Compliance Evaluation\n\n`;
  report += `This section presents the results of the automated EMC compliance evaluation against ProRail RLN00398 v002.\n\n`;

  if (compliance.rules && compliance.rules.length > 0) {
    report += `### 4.1 Evaluation Results by Criterion\n\n`;
    
    compliance.rules.forEach((rule, index) => {
      const ruleNumber = index + 1;
      const statusIcon = getRuleStatusIcon(rule.status);
      
      report += `#### 4.1.${ruleNumber} ${rule.title}\n\n`;
      report += `**Status:** ${statusIcon} **${getRuleStatusText(rule.status)}**\n\n`;
      report += `**Standard Reference:** ${rule.clause || 'N/A'}\n\n`;
      
      if (rule.status === 'not_applicable') {
        report += `**Assessment:** Not applicable to this route configuration.\n\n`;
        if (rule.message) {
          report += `**Note:** ${rule.message}\n\n`;
        }
      } else {
        report += `**Assessment Result:**\n\n${rule.message || 'No detailed message available.'}\n\n`;
        
        if (rule.metrics) {
          report += `**Measured Values:**\n\n`;
          Object.entries(rule.metrics).forEach(([key, value]) => {
            const label = formatMetricLabel(key);
            const formattedValue = formatMetricValue(key, value);
            report += `- ${label}: ${formattedValue}\n`;
          });
          report += `\n`;
        }
        
        if (rule.status === 'fail') {
          report += `> **⚠️ NON-COMPLIANCE:** This criterion requires design modifications or further investigation.\n\n`;
        } else if (rule.status === 'not_evaluated' || rule.status === 'pending') {
          report += `> **ℹ️ ACTION REQUIRED:** Additional information or field verification needed to complete this evaluation.\n\n`;
        }
      }
      
      report += `---\n\n`;
    });
  } else {
    report += `*No evaluation results available. Please run the EMC evaluation for this route.*\n\n`;
  }

  // ==================== RECOMMENDATIONS ====================
  report += `\\pagebreak\n\n`;
  report += `## 5. Recommendations and Next Steps\n\n`;

  const failedRules = compliance.rules?.filter(r => r.status === 'fail') || [];
  const pendingRules = compliance.rules?.filter(r => r.status === 'not_evaluated' || r.status === 'pending') || [];

  if (failedRules.length > 0) {
    report += `### 5.1 Critical Issues\n\n`;
    report += `The following criteria do not meet the required standards and must be addressed:\n\n`;
    failedRules.forEach((rule, index) => {
      report += `${index + 1}. **${rule.title}** (${rule.clause})\n`;
      report += `   - Current Status: ${rule.message}\n`;
      report += `   - Recommended Action: _[To be completed by design engineer]_\n\n`;
    });
  }

  if (pendingRules.length > 0) {
    report += `### 5.2 Information Required\n\n`;
    report += `The following items require additional information or design details:\n\n`;
    pendingRules.forEach((rule, index) => {
      report += `${index + 1}. **${rule.title}** (${rule.clause})\n`;
      report += `   - Required Information: ${rule.message}\n`;
      report += `   - Responsible Party: _[To be completed]_\n`;
      report += `   - Target Date: _[To be completed]_\n\n`;
    });
  }

  if (failedRules.length === 0 && pendingRules.length === 0) {
    report += `### 5.1 Preliminary Approval\n\n`;
    report += `Based on the current evaluation, this route meets all applicable EMC compliance criteria. `;
    report += `The following next steps are recommended:\n\n`;
    report += `1. Complete the detailed system design parameters (Appendix B)\n`;
    report += `2. Conduct detailed EMC modeling using approved software (e.g., CDEGS, RailwaySafe)\n`;
    report += `3. Verify assumptions with field measurements where applicable\n`;
    report += `4. Obtain final approval from ProRail EMC specialists\n\n`;
  } else {
    report += `### 5.3 General Recommendations\n\n`;
    report += `1. Address all critical issues before proceeding with detailed design\n`;
    report += `2. Gather all required information for pending evaluations\n`;
    report += `3. Complete the system design parameters in Appendix B\n`;
    report += `4. Conduct site visit to verify assumptions and constraints\n`;
    report += `5. Engage ProRail EMC specialists for review and guidance\n\n`;
  }

  // ==================== APPENDICES ====================
  if (includeAppendices) {
    report += `\\pagebreak\n\n`;
    report += generateAppendices(route, metadata);
  }

  return report;
}

/**
 * Generate appendices with design parameter tables
 */
function generateAppendices(route, metadata) {
  let appendix = '';

  appendix += `## Appendix A: Glossary & Reference Information\n\n`;
  appendix += `### A.1 Abbreviations\n\n`;
  appendix += `- **EMC:** Electromagnetic Compatibility\n`;
  appendix += `- **HV:** High Voltage\n`;
  appendix += `- **OHL:** Overhead Line\n`;
  appendix += `- **RD New:** Rijksdriehoekscoördinaten (Dutch National Coordinate System)\n`;
  appendix += `- **RFI:** Request for Information\n`;
  appendix += `- **kV:** Kilovolt\n`;
  appendix += `- **kA:** Kiloampere\n`;
  appendix += `- **MVA:** Megavolt-ampere\n\n`;

  appendix += `### A.2 Route Geometry Details\n\n`;
  appendix += `**Coordinate System:** RD New (EPSG:28992)\n\n`;
  appendix += `**Projection:** Oblique Stereographic\n\n`;
  appendix += `**Unit:** Meters\n\n`;

  appendix += `\\pagebreak\n\n`;
  appendix += `## Appendix B: System Design & Modeling Parameters (RLN00398 v002)\n\n`;
  appendix += `**Instructions for the Design Engineer:** Please complete the "Final Design Value" column to define the parameters for the detailed EMC study. Assumptions are based on RLN00398 v002.\n\n`;

  // B.1 - General Cable System Parameters
  appendix += `### B.1 General Cable System Parameters\n\n`;
  appendix += `| Parameter | Assumed/Initial Value | Final Design Value |\n`;
  appendix += `|-----------|----------------------|--------------------|\n`;
  appendix += `| **Cable Type/Datasheet Ref.** | N/A | _[To be completed]_ |\n`;
  appendix += `| **Number of Circuits** | 2 (assumed) | _[To be completed]_ |\n`;
  appendix += `| **Cables per Circuit** | 3 (assumed) | _[To be completed]_ |\n`;
  appendix += `| **Cable Configuration/Layout** | N/A | _e.g., Trefoil, Flat, Spacing details_ |\n`;
  appendix += `| **Conductor Material & Size** | N/A | _e.g., Copper, 800mm²_ |\n`;
  appendix += `| **Screen/Sheath Material & Size** | N/A | _e.g., Copper Wire Screen, 80mm²_ |\n`;
  appendix += `| **Phase Sequence** | N/A | _e.g., (12-4-8) - (12-4-8)_ |\n\n`;

  // B.2 - Earthing, Bonding & Short Circuit Parameters
  appendix += `### B.2 Earthing, Bonding & Short Circuit Parameters\n\n`;
  appendix += `| Parameter | Assumed/Initial Value | Final Design Value |\n`;
  appendix += `|-----------|----------------------|--------------------|\n`;
  appendix += `| **Earthing Philosophy** | N/A | _e.g., Two-sided earthing at ends_ |\n`;
  appendix += `| **Cross-Bonding Applied?** | No (assumed) | _Yes/No, specify locations if yes_ |\n`;
  appendix += `| **Substation Earth Resistance (Ω)** | N/A | _e.g., 0.5 Ω_ |\n`;
  appendix += `| **3-Phase Short Circuit Level (kA)** | N/A | _e.g., 18 kA_ |\n`;
  appendix += `| **1-Phase Short Circuit Current (A)** | N/A | _e.g., 1500 A_ |\n`;
  appendix += `| **Primary Protection Clearance Time (ms)** | ${metadata.faultClearingTimeMs || 100} ms | _e.g., 80 ms_ |\n\n`;

  // B.3 - Operating Conditions
  appendix += `### B.3 Operating Conditions\n\n`;
  appendix += `| Parameter | Assumed/Initial Value | Final Design Value |\n`;
  appendix += `|-----------|----------------------|--------------------|\n`;
  appendix += `| **Nominal Voltage (kV)** | ${metadata.voltageKv || 'N/A'} kV | _[To be completed]_ |\n`;
  appendix += `| **Nominal Power (Normal Ops) (MVA)** | N/A | _e.g., 2x 35 MVA (808 A)_ |\n`;
  appendix += `| **Nominal Power (N-1 Contingency) (MVA)** | N/A | _e.g., 1x 70 MVA (1616 A)_ |\n`;
  appendix += `| **Maximum Operating Temperature (°C)** | N/A | _e.g., 90 °C_ |\n\n`;

  // B.4 - Civil & Environmental Parameters
  appendix += `### B.4 Civil & Environmental Parameters\n\n`;
  appendix += `| Parameter | Assumed/Initial Value | Final Design Value |\n`;
  appendix += `|-----------|----------------------|--------------------|\n`;
  appendix += `| **Soil Electrical Resistivity (Ωm)** | 70 Ωm (default per K1) | _[To be completed]_ |\n`;
  appendix += `| **Soil Thermal Resistivity (K.m/W)** | N/A | _[To be completed]_ |\n`;
  appendix += `| **Burial Depth (m)** | N/A | _[To be completed]_ |\n`;
  appendix += `| **Use of Thermal Backfill?** | N/A | _Yes/No, specify type_ |\n\n`;

  // B.5 - Key Modeling Assumptions
  appendix += `### B.5 Key Modeling Assumptions & Assessment Criteria (per RLN00398 v002)\n\n`;
  appendix += `| Parameter / Criterion | Default Assumption | Confirmation / Final Value |\n`;
  appendix += `|----------------------|-------------------|---------------------------|\n`;
  appendix += `| **Homopolar Current (T4)** | Assumed applicable (10% of max current) | _Is this assumption correct? Yes/No (If No, provide justification)_ |\n`;
  appendix += `| **Track Circuit Immunity (B1)** | Standard: Max 20 Vcm (continuous) | _Use length-based immunity (Bijlage 2)? If Yes, specify Track Circuit Length (m):_ |\n`;
  appendix += `| **50Hz in DC Traction (B5)** | Assessment Limit: 16V / 40V (>1s) | _Confirm use of this criterion_ |\n`;
  appendix += `| **Existing Infrastructure (G2)** | Contribution <20% assumed | _Is the <20% contribution met? Yes/No/Requires Study_ |\n\n`;

  appendix += `---\n\n`;
  appendix += `**Note:** The parameters in this appendix form the basis for detailed EMC modeling and must be completed in consultation with the electrical design team, civil engineering team, and ProRail specialists.\n\n`;

  return appendix;
}

/**
 * Export multiple routes as a comparative report
 */
export function generateComparativeReport(routes, options = {}) {
  const {
    projectName = 'High Voltage Connection Route Evaluation',
    projectNumber = '',
    authorName = '',
    organizationName = 'ProRail'
  } = options;

  const today = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  let report = '';

  // Cover page
  report += `# Comparative Route Evaluation Report\n\n`;
  report += `## ${projectName}\n\n`;
  report += `---\n\n`;
  report += `**Project:** ${projectName}${projectNumber ? ` (${projectNumber})` : ''}\n\n`;
  report += `**Organization:** ${organizationName}\n\n`;
  report += `**Author:** ${authorName || '_[To be completed]_'}\n\n`;
  report += `**Date:** ${today}\n\n`;
  report += `**Number of Routes Evaluated:** ${routes.length}\n\n`;
  report += `**Compliance Standard:** ProRail Richtlijn RLN00398 (Version 002, 01-12-2020)\n\n`;
  report += `---\n\n`;
  report += `\\pagebreak\n\n`;

  // Executive Summary
  report += `## 1. Executive Summary\n\n`;
  report += `This report presents a comparative evaluation of ${routes.length} alternative routes for the ${projectName}. `;
  report += `Each route has been evaluated against ProRail's EMC compliance standards (RLN00398 v002).\n\n`;

  // Comparative table
  report += `### 1.1 Route Comparison Summary\n\n`;
  report += `| Route | Length | Status | Pass | Fail | Pending | N/A |\n`;
  report += `|-------|--------|--------|------|------|---------|-----|\n`;
  
  routes.forEach(route => {
    const routeName = route.name || `Route ${route.id}`;
    const routeLength = route.length ? formatDistance(route.length) : 'N/A';
    const summary = route.compliance?.summary || {};
    const status = getStatusEmoji(summary.status);
    
    report += `| ${routeName} | ${routeLength} | ${status} | ${summary.passCount || 0} | ${summary.failCount || 0} | ${summary.pendingCount || 0} | ${summary.notApplicableCount || 0} |\n`;
  });
  
  report += `\n`;

  // Recommendation
  const passedRoutes = routes.filter(r => r.compliance?.summary?.status === 'pass');
  if (passedRoutes.length > 0) {
    report += `### 1.2 Recommended Route\n\n`;
    if (passedRoutes.length === 1) {
      const recommended = passedRoutes[0];
      report += `Based on the EMC compliance evaluation, **${recommended.name || `Route ${recommended.id}`}** is recommended for further detailed design.\n\n`;
    } else {
      report += `Multiple routes meet the EMC compliance criteria. Further evaluation based on cost, constructability, and other factors is recommended:\n\n`;
      passedRoutes.forEach(route => {
        report += `- ${route.name || `Route ${route.id}`}\n`;
      });
      report += `\n`;
    }
  } else {
    report += `### 1.2 Preliminary Findings\n\n`;
    report += `None of the evaluated routes currently meet all EMC compliance criteria. All routes require design modifications or additional information. See individual route reports for details.\n\n`;
  }

  report += `\\pagebreak\n\n`;

  // Individual route sections
  report += `## 2. Individual Route Evaluations\n\n`;
  routes.forEach((route, index) => {
    report += `### 2.${index + 1} ${route.name || `Route ${route.id}`}\n\n`;
    
    // Generate condensed version for comparative report
    const routeReport = generateRouteReport(route, { 
      ...options, 
      includeAppendices: false 
    });
    
    // Extract just the key sections (skip cover page)
    const sections = routeReport.split('\\pagebreak');
    if (sections.length > 1) {
      report += sections.slice(1).join('\n\n');
    }
    
    report += `\\pagebreak\n\n`;
  });

  return report;
}

/**
 * Download report as Markdown file
 */
export function downloadMarkdownReport(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==================== HELPER FUNCTIONS ====================

function getStatusEmoji(status) {
  switch (status) {
    case 'pass': return '✅';
    case 'fail': return '❌';
    case 'incomplete': return '⏳';
    case 'not_evaluated': return '➖';
    default: return '❓';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'pass': return 'COMPLIANT';
    case 'fail': return 'NON-COMPLIANT';
    case 'incomplete': return 'INCOMPLETE';
    case 'not_evaluated': return 'NOT EVALUATED';
    default: return 'UNKNOWN';
  }
}

function getRuleStatusIcon(status) {
  switch (status) {
    case 'pass': return '✅';
    case 'fail': return '❌';
    case 'not_applicable': return '➖';
    case 'not_evaluated':
    case 'pending':
    default: return '⏳';
  }
}

function getRuleStatusText(status) {
  switch (status) {
    case 'pass': return 'PASS';
    case 'fail': return 'FAIL';
    case 'not_applicable': return 'NOT APPLICABLE';
    case 'not_evaluated': return 'PENDING';
    case 'pending': return 'PENDING';
    default: return 'UNKNOWN';
  }
}

function getInfrastructureTypeText(type) {
  switch (type) {
    case 'cable': return 'Underground Cable';
    case 'overhead': return 'Overhead Line';
    default: return type || 'Not specified';
  }
}

function formatMetricLabel(key) {
  const labels = {
    angleDegrees: 'Crossing Angle',
    permittedMin: 'Minimum Permitted',
    permittedMax: 'Maximum Permitted',
    faultClearingTimeMs: 'Fault Clearing Time',
    limitMs: 'Maximum Limit',
    minimumDistanceMeters: 'Minimum Distance',
    requiredDistanceMeters: 'Required Distance',
    autoEvaluated: 'Auto-evaluated'
  };
  
  return labels[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

function formatMetricValue(key, value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (key.includes('Distance') || key.includes('Meters')) {
    return `${Number(value).toFixed(2)} m`;
  }
  
  if (key.includes('Angle') || key.includes('Degrees')) {
    return `${Number(value).toFixed(1)}°`;
  }
  
  if (key.includes('Time') || key.includes('Ms')) {
    return `${Number(value).toFixed(0)} ms`;
  }
  
  return value;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
