/**
 * Report Generator for RLN00398-V004
 * 
 * Generates compliance reports according to:
 * - Bijlage 3: Template tbv basisrapportage EMC (for Steps A/B)
 * - Bijlage 4: Checklist tbv RLN00398 EMC-detailstudies (for Steps C/D)
 * 
 * This module automatically selects the correct report template based on the
 * evaluation results and delegates to specialized generators:
 * - Bijlage3ReportGenerator: For basic EMC reports (Steps A/B satisfied)
 * - Bijlage4ReportGenerator: For detailed EMC studies (Steps C/D required)
 */

import { configV4 } from '../../config.v4.js';
import { generateBijlage3Report, Bijlage3ReportGenerator } from './bijlage3ReportGenerator.js';

/**
 * Report Generator Class
 */
export class ReportGenerator {
  constructor(evaluationResult) {
    this.result = evaluationResult;
    this.reportType = this.determineReportType();
  }

  /**
   * Determine which report template to use
   */
  determineReportType() {
    const exitStep = this.result.exitStep;
    
    if (!exitStep || exitStep === 'compliant') {
      return 'basic'; // Bijlage 3
    }
    
    if (exitStep.includes('Step A') || exitStep.includes('Step B')) {
      return 'basic'; // Bijlage 3
    }
    
    return 'detailed'; // Bijlage 4
  }

  /**
   * Generate report in specified format
   * @param {string} format - 'json', 'html', 'markdown', 'pdf'
   * @param {Object} routeData - Route geometry and metadata
   * @param {Object} projectInfo - Project-specific information
   * @returns {Object|string} Report data
   */
  generate(format = 'json', routeData = null, projectInfo = {}) {
    // Use Bijlage 3 generator for basic reports (Steps A/B)
    if (this.reportType === 'basic' && routeData) {
      if (format === 'markdown') {
        return generateBijlage3Report(this.result, routeData, projectInfo, 'markdown');
      }
      if (format === 'json') {
        return generateBijlage3Report(this.result, routeData, projectInfo, 'json');
      }
    }
    
    // Fallback to legacy methods for other formats
    switch (format) {
      case 'json':
        return this.generateJSON();
      case 'html':
        return this.generateHTML();
      case 'markdown':
        return this.generateMarkdown(routeData, projectInfo);
      case 'pdf':
        return this.generatePDF();
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  }
  
  /**
   * Generate Markdown report (delegates to appropriate template generator)
   */
  generateMarkdown(routeData, projectInfo) {
    if (this.reportType === 'basic' && routeData) {
      return generateBijlage3Report(this.result, routeData, projectInfo, 'markdown');
    }
    
    // TODO: Implement Bijlage 4 markdown generator for detailed studies
    return '# EMC Detailed Study Report\n\nBijlage 4 template to be implemented for Steps C/D.';
  }

  /**
   * Generate JSON report
   */
  generateJSON() {
    const template = configV4.reporting.templates[this.reportType];
    
    return {
      standard: configV4.standard,
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        template: template.name,
        reference: template.reference,
        version: configV2.standard.version
      },
      evaluationResult: this.result,
      onderbouwing: this.generateOnderbouwing(),
      flowchartDocumentation: this.documentFlowchart(),
      compliance: this.summarizeCompliance()
    };
  }

  /**
   * Generate onderbouwing (justification) section
   * Required per §5.2: "Per eis dient een onderbouwing aangeleverd te worden"
   */
  generateOnderbouwing() {
    // TODO: Implement based on flowchart results
    return {
      stepA: this.justifyStepA(),
      stepB: this.justifyStepB(),
      stepC: this.justifyStepC(),
      stepD: this.justifyStepD()
    };
  }

  justifyStepA() {
    return { placeholder: 'Awaiting flowchart logic implementation' };
  }

  justifyStepB() {
    return { placeholder: 'Awaiting flowchart logic implementation' };
  }

  justifyStepC() {
    return { placeholder: 'Awaiting flowchart logic implementation' };
  }

  justifyStepD() {
    return { placeholder: 'Awaiting flowchart logic implementation' };
  }

  /**
   * Document flowchart progression
   */
  documentFlowchart() {
    return {
      stepsCompleted: Object.keys(this.result.flowchartResults || {}),
      exitPoint: this.result.exitStep,
      flowchartPath: this.generateFlowchartPath()
    };
  }

  /**
   * Generate ASCII flowchart path visualization
   */
  generateFlowchartPath() {
    // TODO: Create visual representation of which path was taken
    return 'Flowchart visualization to be implemented';
  }

  /**
   * Summarize compliance status
   */
  summarizeCompliance() {
    return {
      status: this.result.status,
      compliant: this.result.status === 'compliant',
      requiresStudy: this.result.status === 'requires_study',
      nextSteps: this.determineNextSteps()
    };
  }

  /**
   * Determine recommended next steps
   */
  determineNextSteps() {
    if (this.result.status === 'compliant') {
      return ['No further action required', 'Proceed with construction'];
    }
    
    if (this.result.exitStep?.includes('Step C')) {
      return ['Perform unity study', 'Submit results for validation'];
    }
    
    if (this.result.exitStep?.includes('Step D')) {
      return ['Perform EMC detailstudie', 'Evaluate mitigation measures'];
    }
    
    return ['Contact ProRail for guidance'];
  }

  /**
   * Generate HTML report
   */
  generateHTML() {
    // TODO: Implement HTML template
    return '<html><body>HTML report to be implemented</body></html>';
  }

  /**
   * Generate PDF report
   */
  generatePDF() {
    // TODO: Implement PDF generation
    throw new Error('PDF generation not yet implemented');
  }
}

/**
 * Generate report from evaluation result
 * @param {Object} evaluationResult - Flowchart evaluation results
 * @param {string} format - Output format ('json', 'markdown', 'html', 'pdf')
 * @param {Object} routeData - Route geometry and metadata
 * @param {Object} projectInfo - Project-specific information
 * @returns {Object|string}
 */
export function generateReport(evaluationResult, format = 'json', routeData = null, projectInfo = {}) {
  const generator = new ReportGenerator(evaluationResult);
  return generator.generate(format, routeData, projectInfo);
}

/**
 * Generate per-trace Bijlage 3 report for a high voltage connection
 * This is the primary export function for generating compliant ProRail reports
 * 
 * @param {Object} trace - The high voltage connection trace/route
 * @param {Object} evaluationResult - Result from FlowchartEvaluator
 * @param {Object} projectInfo - Project details (description, location, etc.)
 * @returns {string} Markdown report content aligned with Bijlage 3 template
 */
export function generateTraceReport(trace, evaluationResult, projectInfo = {}) {
  // Prepare route data
  const routeData = {
    id: trace.id,
    name: trace.name || `Trace ${trace.id}`,
    geometry: trace.graphic?.geometry,
    length: trace.length,
    metadata: trace.metadata || {}
  };
  
  // Generate using Bijlage 3 template
  return generateBijlage3Report(evaluationResult, routeData, projectInfo, 'markdown');
}

/**
 * Download a Bijlage 3 report as a Markdown file
 * @param {string} content - The report content (Markdown)
 * @param {string} routeName - Name of the route (for filename)
 */
export function downloadBijlage3Report(content, routeName) {
  const safeName = routeName.replace(/[^a-zA-Z0-9-_]/g, '-');
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `ProRail-RLN00398-V004-Bijlage3-${safeName}-${timestamp}.md`;
  
  // Create a blob with the content
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return filename;
}

export default {
  ReportGenerator,
  generateReport
};
