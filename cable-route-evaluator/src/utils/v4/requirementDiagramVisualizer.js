/**
 * RLN00398-V004 Requirement Diagram Visualizer using Mermaid.js
 * 
 * Interactive visualization of the compliance requirements showing:
 * - Initial checks (beschouwde situatie)
 * - Check A (Circuit/cable conditions 1-3)
 * - Check B (High voltage connection conditions 4-7)
 * - Decision paths and outcomes
 * 
 * Uses Mermaid Requirement Diagrams for a structured view of compliance checks.
 */

import mermaid from 'mermaid';

// Initialize Mermaid with our custom theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#e0f2fe',
    primaryTextColor: '#1f2937',
    primaryBorderColor: '#0284c7',
    lineColor: '#6b7280',
    secondaryColor: '#fef3c7',
    tertiaryColor: '#dcfce7',
    fontSize: '13px',
    fontFamily: 'Segoe UI, Arial, sans-serif'
  },
  requirement: {
    useWidth: 2000,
    useMaxWidth: false
  },
  securityLevel: 'loose'
});

/**
 * Generate Mermaid requirement diagram definition based on evaluation results
 */
function generateRequirementDiagram(evaluationResult) {
  const results = evaluationResult?.flowchartResults || {};
  
  // Determine outcomes for each check
  const initialCheckPassed = results.initial?.passes === true;
  
  // Check A is evaluated if initial check failed
  const checkAEvaluated = !initialCheckPassed && results.stepA !== null;
  const checkAPassed = checkAEvaluated && results.stepA?.passes === true;
  const checkAFailed = checkAEvaluated && results.stepA?.passes === false;
  
  // Check B is evaluated if Check A failed
  const checkBEvaluated = checkAFailed && results.stepB !== null;
  const checkBPassed = checkBEvaluated && results.stepB?.passes === true;
  const checkBFailed = checkBEvaluated && results.stepB?.passes === false;
  
  // Helper to get status emoji
  const getStatusEmoji = (passed) => {
    if (passed === undefined || passed === null) return '⚪'; // Not evaluated
    return passed ? '✅' : '❌';
  };
  
  // Get individual check statuses if available
  const getCheckStatus = (stepName, checkIndex) => {
    const step = results[stepName];
    if (!step || !step.checks || !step.checks[checkIndex]) return null;
    const checkResult = step.checks[checkIndex];
    // Treat 'pass' and 'not_applicable' as passing
    return checkResult.status === 'pass' || checkResult.status === 'not_applicable';
  };
  
  // Build requirement diagram
  let diagram = `requirementDiagram\n\n`;
  diagram += `direction LR\n\n`;
  
  // Define Initial Situation requirement
  diagram += `requirement init_situation {\n`;
  diagram += `  id: 0\n`;
  diagram += `  text: "**Beschouwde situatie:** Hoogspanningsverbinding bij spoor"\n`;
  diagram += `  risk: High\n`;
  diagram += `  verifymethod: Analysis\n`;
  diagram += `}\n\n`;
  
  // Initial Check requirement
  const initCheckEmoji = getStatusEmoji(initialCheckPassed);
  diagram += `requirement initial_check {\n`;
  diagram += `  id: 0.1\n`;
  diagram += `  text: "${initCheckEmoji} **Initiële Check:** >24kV buiten 700m OF ≤24kV buiten 31m uit hart buitenste spoor"\n`;
  diagram += `  risk: ${initialCheckPassed ? 'Low' : 'High'}\n`;
  diagram += `  verifymethod: ${initialCheckPassed ? 'Inspection' : 'Analysis'}\n`;
  diagram += `}\n\n`;
  
  // Check A - Sub-requirements
  const checkA1Status = getCheckStatus('stepA', 0);
  const check1Emoji = getStatusEmoji(checkA1Status);
  diagram += `functionalRequirement check_a1 {\n`;
  diagram += `  id: 1.1\n`;
  diagram += `  text: "${check1Emoji} **Check A.1:** Circuit in 1 kabel of driehoek gekabelde single cores"\n`;
  diagram += `  risk: ${checkA1Status === true ? 'Low' : checkA1Status === false ? 'High' : 'Medium'}\n`;
  diagram += `  verifymethod: Inspection\n`;
  diagram += `}\n\n`;
  
  const checkA2Status = getCheckStatus('stepA', 1);
  const check2Emoji = getStatusEmoji(checkA2Status);
  diagram += `functionalRequirement check_a2 {\n`;
  diagram += `  id: 1.2\n`;
  diagram += `  text: "${check2Emoji} **Check A.2:** Geen pad voor homopolaire stroom (enkel geaard sterpunt)"\n`;
  diagram += `  risk: ${checkA2Status === true ? 'Low' : checkA2Status === false ? 'High' : 'Medium'}\n`;
  diagram += `  verifymethod: Analysis\n`;
  diagram += `}\n\n`;
  
  const checkA3Status = getCheckStatus('stepA', 2);
  const check3Emoji = getStatusEmoji(checkA3Status);
  diagram += `functionalRequirement check_a3 {\n`;
  diagram += `  id: 1.3\n`;
  diagram += `  text: "${check3Emoji} **Check A.3:** Kans op 1 fase sluiting met aarde nabij spoor voldoende klein (geen moffen of aardpunten binnen 31m)"\n`;
  diagram += `  risk: ${checkA3Status === true ? 'Low' : checkA3Status === false ? 'High' : 'Medium'}\n`;
  diagram += `  verifymethod: Analysis\n`;
  diagram += `}\n\n`;
  
  // Check B - Sub-requirements
  const checkB4Status = getCheckStatus('stepB', 0);
  const check4Emoji = getStatusEmoji(checkB4Status);
  diagram += `performanceRequirement check_b4 {\n`;
  diagram += `  id: 2.1\n`;
  diagram += `  text: "${check4Emoji} **Check B.4:** Loopt hoogspanningsverbinding buiten zones (>24kV: 700m, ≤24kV: 11m) of binnen zones geen parallelloop"\n`;
  diagram += `  risk: ${checkB4Status === true ? 'Low' : checkB4Status === false ? 'High' : 'Medium'}\n`;
  diagram += `  verifymethod: Analysis\n`;
  diagram += `}\n\n`;
  
  const checkB5Status = getCheckStatus('stepB', 1);
  const check5Emoji = getStatusEmoji(checkB5Status);
  diagram += `performanceRequirement check_b5 {\n`;
  diagram += `  id: 2.2\n`;
  diagram += `  text: "${check5Emoji} **Check B.5:** Kruist de verbinding het spoor ongeveer haaks (80 tot 100 graden)"\n`;
  diagram += `  risk: ${checkB5Status === true ? 'Low' : checkB5Status === false ? 'High' : 'Medium'}\n`;
  diagram += `  verifymethod: Analysis\n`;
  diagram += `}\n\n`;
  
  const checkB6Status = getCheckStatus('stepB', 2);
  const check6Emoji = getStatusEmoji(checkB6Status);
  diagram += `performanceRequirement check_b6 {\n`;
  diagram += `  id: 2.3\n`;
  diagram += `  text: "${check6Emoji} **Check B.6:** Bevindt de verbinding zich op een afstand >20m vanaf dichtsbijzijnde technische ruimte (gebouw)"\n`;
  diagram += `  risk: ${checkB6Status === true ? 'Low' : checkB6Status === false ? 'High' : 'Medium'}\n`;
  diagram += `  verifymethod: Analysis\n`;
  diagram += `}\n\n`;
  
  const checkB7Status = getCheckStatus('stepB', 3);
  const check7Emoji = getStatusEmoji(checkB7Status);
  diagram += `performanceRequirement check_b7 {\n`;
  diagram += `  id: 2.4\n`;
  diagram += `  text: "${check7Emoji} **Check B.7:** Eerste orde lijnfout binnen 100ms afgeschakeld"\n`;
  diagram += `  risk: ${checkB7Status === true ? 'Low' : checkB7Status === false ? 'High' : 'Medium'}\n`;
  diagram += `  verifymethod: Test\n`;
  diagram += `}\n\n`;
  
  // Outcome elements
  if (initialCheckPassed) {
    diagram += `element outcome_init {\n`;
    diagram += `  type: "✅ Geen ontoelaatbare beïnvloeding"\n`;
    diagram += `  docRef: "Initiële check voldaan - Geen modelstudie vereist"\n`;
    diagram += `}\n\n`;
  } else if (checkAPassed) {
    diagram += `element outcome_a {\n`;
    diagram += `  type: "✅ Geen ontoelaatbare beïnvloeding"\n`;
    diagram += `  docRef: "Check A voldaan - Geen modelstudie vereist"\n`;
    diagram += `}\n\n`;
  } else if (checkBPassed) {
    diagram += `element outcome_b {\n`;
    diagram += `  type: "✅ Geen ontoelaatbare beïnvloeding"\n`;
    diagram += `  docRef: "Check B voldaan - Geen modelstudie vereist"\n`;
    diagram += `}\n\n`;
  } else {
    diagram += `element outcome_detailed {\n`;
    diagram += `  type: "⚠️ Gedetailleerde EMC-studie vereist"\n`;
    diagram += `  docRef: "Check C & D volgens RLN00398-V004"\n`;
    diagram += `}\n\n`;
  }
  
  // Final report element
  diagram += `element final_report {\n`;
  diagram += `  type: "📄 Rapportage"\n`;
  diagram += `  docRef: "RLN00398-V004 Compliance Report"\n`;
  diagram += `}\n\n`;
  
  // Define relationships
  diagram += `init_situation - contains -> initial_check\n`;
  
  if (initialCheckPassed) {
    // Passed initial check - direct to outcome
    diagram += `initial_check - satisfies -> outcome_init\n`;
    diagram += `outcome_init - satisfies -> final_report\n`;
  } else {
    // Failed initial check, need to do Check A
    diagram += `initial_check - derives -> check_a1\n`;
    diagram += `initial_check - derives -> check_a2\n`;
    diagram += `initial_check - derives -> check_a3\n`;
    
    if (checkAPassed) {
      // Passed Check A - all checks satisfied
      diagram += `check_a1 - satisfies -> outcome_a\n`;
      diagram += `check_a2 - satisfies -> outcome_a\n`;
      diagram += `check_a3 - satisfies -> outcome_a\n`;
      diagram += `outcome_a - satisfies -> final_report\n`;
    } else if (checkAEvaluated) {
      // Check A was evaluated but failed, need to do Check B
      diagram += `check_a1 - derives -> check_b4\n`;
      diagram += `check_a2 - derives -> check_b5\n`;
      diagram += `check_a3 - derives -> check_b6\n`;
      diagram += `check_a3 - derives -> check_b7\n`;
      
      if (checkBPassed) {
        // Passed Check B - all checks satisfied
        diagram += `check_b4 - satisfies -> outcome_b\n`;
        diagram += `check_b5 - satisfies -> outcome_b\n`;
        diagram += `check_b6 - satisfies -> outcome_b\n`;
        diagram += `check_b7 - satisfies -> outcome_b\n`;
        diagram += `outcome_b - satisfies -> final_report\n`;
      } else if (checkBEvaluated) {
        // Failed Check B - needs detailed study
        diagram += `check_b4 - traces -> outcome_detailed\n`;
        diagram += `check_b5 - traces -> outcome_detailed\n`;
        diagram += `check_b6 - traces -> outcome_detailed\n`;
        diagram += `check_b7 - traces -> outcome_detailed\n`;
        diagram += `outcome_detailed - satisfies -> final_report\n`;
      }
    }
  }
  
  // Apply styling based on results
  diagram += `\nclassDef passed fill:#dcfce7,stroke:#16a34a,stroke-width:3px,color:#166534\n`;
  diagram += `classDef failed fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b\n`;
  diagram += `classDef neutral fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,color:#374151\n`;
  diagram += `classDef outcome fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f\n`;
  diagram += `classDef report fill:#dbeafe,stroke:#2563eb,stroke-width:3px,color:#1e40af\n\n`;
  
  // Apply classes based on evaluation
  if (initialCheckPassed) {
    diagram += `class initial_check passed\n`;
    diagram += `class outcome_init outcome\n`;
  } else {
    diagram += `class initial_check failed\n`;
    
    // Apply classes to Check A
    if (checkA1Status === true) diagram += `class check_a1 passed\n`;
    else if (checkA1Status === false) diagram += `class check_a1 failed\n`;
    else diagram += `class check_a1 neutral\n`;
    
    if (checkA2Status === true) diagram += `class check_a2 passed\n`;
    else if (checkA2Status === false) diagram += `class check_a2 failed\n`;
    else diagram += `class check_a2 neutral\n`;
    
    if (checkA3Status === true) diagram += `class check_a3 passed\n`;
    else if (checkA3Status === false) diagram += `class check_a3 failed\n`;
    else diagram += `class check_a3 neutral\n`;
    
    if (checkAPassed) {
      diagram += `class outcome_a outcome\n`;
    } else {
      // Apply classes to Check B
      if (checkB4Status === true) diagram += `class check_b4 passed\n`;
      else if (checkB4Status === false) diagram += `class check_b4 failed\n`;
      else diagram += `class check_b4 neutral\n`;
      
      if (checkB5Status === true) diagram += `class check_b5 passed\n`;
      else if (checkB5Status === false) diagram += `class check_b5 failed\n`;
      else diagram += `class check_b5 neutral\n`;
      
      if (checkB6Status === true) diagram += `class check_b6 passed\n`;
      else if (checkB6Status === false) diagram += `class check_b6 failed\n`;
      else diagram += `class check_b6 neutral\n`;
      
      if (checkB7Status === true) diagram += `class check_b7 passed\n`;
      else if (checkB7Status === false) diagram += `class check_b7 failed\n`;
      else diagram += `class check_b7 neutral\n`;
      
      if (checkBPassed) {
        diagram += `class outcome_b outcome\n`;
      } else {
        diagram += `class outcome_detailed outcome\n`;
      }
    }
  }
  
  diagram += `class final_report report\n`;
  
  return diagram;
}

/**
 * Open requirement diagram visualizer modal with Mermaid rendering
 */
export async function openRequirementDiagramModal(routeName, evaluationResult) {
  const modal = document.createElement('div');
  modal.className = 'requirement-modal';
  modal.innerHTML = `
    <div class="requirement-modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="requirement-modal-content">
      <div class="requirement-modal-header">
        <h2>📋 Compliance Requirements: ${escapeHtml(routeName)}</h2>
        <button class="requirement-modal-close" onclick="this.closest('.requirement-modal').remove()">✕</button>
      </div>
      <div class="requirement-modal-body">
        <div class="requirement-legend">
          <div><span class="legend-box" style="background: #dcfce7; border-color: #16a34a;"></span> ✅ Voldaan</div>
          <div><span class="legend-box" style="background: #fee2e2; border-color: #dc2626;"></span> ❌ Niet voldaan</div>
          <div><span class="legend-box" style="background: #f3f4f6; border-color: #6b7280;"></span> ⚪ Niet geëvalueerd</div>
        </div>
        <div class="requirement-controls">
          <button class="zoom-btn" onclick="window.zoomRequirement(1.2)">🔍+ Zoom In</button>
          <button class="zoom-btn" onclick="window.zoomRequirement(0.8)">🔍− Zoom Out</button>
          <button class="zoom-btn" onclick="window.resetRequirementZoom()">↺ Reset</button>
          <button class="zoom-btn" onclick="window.toggleRequirementFullscreen()" id="fullscreen-btn">⛶ Fullscreen</button>
        </div>
        <div class="requirement-container" id="mermaid-requirement">
          <div class="loading">Requirement diagram wordt geladen...</div>
        </div>
        <div class="requirement-footer">
          <p><strong>Let op:</strong> Dit diagram toont de compliance checks als gestructureerde requirements.</p>
          <p>Elke check heeft een ID, status, risico-niveau en verificatiemethode.</p>
        </div>
      </div>
      <div class="resize-handle resize-handle-right"></div>
      <div class="resize-handle resize-handle-bottom"></div>
      <div class="resize-handle resize-handle-corner"></div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .requirement-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .requirement-modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
    }
    
    .requirement-modal-content {
      position: absolute;
      background: white;
      border-radius: 0;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      resize: both;
      overflow: hidden;
    }
    
    .requirement-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
      border-radius: 0;
      flex-shrink: 0;
      cursor: move;
      user-select: none;
    }
    
    .requirement-modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #1f2937;
      pointer-events: none;
    }
    
    .requirement-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #ef4444;
      border: none;
      font-size: 1.5rem;
      color: white;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 10;
    }
    
    .requirement-modal-close:hover {
      background: #dc2626;
      transform: scale(1.1);
    }
    
    .requirement-modal-body {
      flex: 1;
      overflow: hidden;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    
    .requirement-legend {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 8px;
      font-size: 0.875rem;
      flex-wrap: wrap;
      border: 1px solid #e5e7eb;
      flex-shrink: 0;
    }
    
    .requirement-legend > div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .legend-box {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: inline-block;
      border: 2px solid;
    }
    
    .requirement-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
      flex-shrink: 0;
    }
    
    .zoom-btn {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .zoom-btn:hover {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .zoom-btn:active {
      transform: translateY(0);
    }
    
    .requirement-container {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      overflow: auto;
      cursor: grab;
      user-select: none;
      flex: 1;
      position: relative;
    }
    
    .requirement-container:active {
      cursor: grabbing;
    }
    
    .requirement-container .loading {
      color: #6b7280;
      font-size: 1rem;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    .requirement-container svg {
      display: block;
      transition: transform 0.2s ease-out;
    }
    
    .requirement-footer {
      margin-top: 12px;
      padding: 12px 16px;
      background: #dbeafe;
      border-left: 4px solid #2563eb;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #1e40af;
      flex-shrink: 0;
    }
    
    .requirement-footer p {
      margin: 4px 0;
    }
    
    .requirement-footer strong {
      color: #1e3a8a;
    }
    
    .resize-handle {
      position: absolute;
      background: transparent;
      z-index: 100;
    }
    
    .resize-handle-right {
      top: 0;
      right: 0;
      width: 8px;
      height: 100%;
      cursor: ew-resize;
    }
    
    .resize-handle-right:hover {
      background: rgba(59, 130, 246, 0.3);
    }
    
    .resize-handle-bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      height: 8px;
      cursor: ns-resize;
    }
    
    .resize-handle-bottom:hover {
      background: rgba(59, 130, 246, 0.3);
    }
    
    .resize-handle-corner {
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, rgba(59, 130, 246, 0.5) 50%);
    }
    
    .resize-handle-corner:hover {
      background: linear-gradient(135deg, transparent 50%, rgba(59, 130, 246, 0.7) 50%);
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(modal);
  
  // Add drag and resize functionality
  const modalContent = modal.querySelector('.requirement-modal-content');
  const header = modal.querySelector('.requirement-modal-header');
  const resizeRight = modal.querySelector('.resize-handle-right');
  const resizeBottom = modal.querySelector('.resize-handle-bottom');
  const resizeCorner = modal.querySelector('.resize-handle-corner');
  
  let isDragging = false;
  let isResizing = false;
  let resizeDirection = null;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startLeft = 0;
  let startTop = 0;
  let isFullscreen = true;
  
  // Fullscreen toggle
  window.toggleRequirementFullscreen = () => {
    if (isFullscreen) {
      // Exit fullscreen - set to 90% centered
      modalContent.style.width = '90vw';
      modalContent.style.height = '90vh';
      modalContent.style.left = '5vw';
      modalContent.style.top = '5vh';
      modalContent.style.right = 'auto';
      modalContent.style.bottom = 'auto';
      isFullscreen = false;
      document.getElementById('fullscreen-btn').textContent = '⛶ Fullscreen';
    } else {
      // Enter fullscreen
      modalContent.style.width = '100%';
      modalContent.style.height = '100%';
      modalContent.style.left = '0';
      modalContent.style.top = '0';
      modalContent.style.right = '0';
      modalContent.style.bottom = '0';
      isFullscreen = true;
      document.getElementById('fullscreen-btn').textContent = '⛶ Exit Fullscreen';
    }
  };
  
  // Header drag to move
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.requirement-modal-close')) return;
    if (isFullscreen) return; // Can't drag in fullscreen
    
    isDragging = true;
    startX = e.clientX - modalContent.offsetLeft;
    startY = e.clientY - modalContent.offsetTop;
    e.preventDefault();
  });
  
  // Right edge resize
  resizeRight.addEventListener('mousedown', (e) => {
    if (isFullscreen) return;
    isResizing = true;
    resizeDirection = 'right';
    startX = e.clientX;
    startWidth = modalContent.offsetWidth;
    e.preventDefault();
    e.stopPropagation();
  });
  
  // Bottom edge resize
  resizeBottom.addEventListener('mousedown', (e) => {
    if (isFullscreen) return;
    isResizing = true;
    resizeDirection = 'bottom';
    startY = e.clientY;
    startHeight = modalContent.offsetHeight;
    e.preventDefault();
    e.stopPropagation();
  });
  
  // Corner resize (both directions)
  resizeCorner.addEventListener('mousedown', (e) => {
    if (isFullscreen) return;
    isResizing = true;
    resizeDirection = 'corner';
    startX = e.clientX;
    startY = e.clientY;
    startWidth = modalContent.offsetWidth;
    startHeight = modalContent.offsetHeight;
    e.preventDefault();
    e.stopPropagation();
  });
  
  // Mouse move handler
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const newLeft = e.clientX - startX;
      const newTop = e.clientY - startY;
      
      // Keep within viewport
      const maxLeft = window.innerWidth - modalContent.offsetWidth;
      const maxTop = window.innerHeight - modalContent.offsetHeight;
      
      modalContent.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
      modalContent.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
      modalContent.style.right = 'auto';
      modalContent.style.bottom = 'auto';
    } else if (isResizing) {
      if (resizeDirection === 'right' || resizeDirection === 'corner') {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(400, Math.min(startWidth + deltaX, window.innerWidth - modalContent.offsetLeft));
        modalContent.style.width = newWidth + 'px';
        modalContent.style.right = 'auto';
      }
      
      if (resizeDirection === 'bottom' || resizeDirection === 'corner') {
        const deltaY = e.clientY - startY;
        const newHeight = Math.max(300, Math.min(startHeight + deltaY, window.innerHeight - modalContent.offsetTop));
        modalContent.style.height = newHeight + 'px';
        modalContent.style.bottom = 'auto';
      }
    }
  });
  
  // Mouse up handler
  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    resizeDirection = null;
  });
  
  // Generate and render Mermaid diagram
  try {
    const mermaidDef = generateRequirementDiagram(evaluationResult);
    console.log('Requirement Diagram Definition:', mermaidDef);
    const container = document.getElementById('mermaid-requirement');
    
    const { svg } = await mermaid.render('requirement-svg', mermaidDef);
    container.innerHTML = svg;
    
    // Add zoom and pan functionality
    const svgElement = container.querySelector('svg');
    if (svgElement) {
      let scale = 1;
      let isPanning = false;
      let startX = 0;
      let startY = 0;
      let translateX = 0;
      let translateY = 0;
      
      // Set up zoom functions
      window.zoomRequirement = (factor) => {
        scale *= factor;
        scale = Math.max(0.3, Math.min(scale, 3)); // Limit zoom between 30% and 300%
        svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      };
      
      window.resetRequirementZoom = () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        svgElement.style.transform = `translate(0px, 0px) scale(1)`;
      };
      
      // Mouse wheel zoom
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        window.zoomRequirement(delta);
      });
      
      // Pan functionality
      container.addEventListener('mousedown', (e) => {
        isPanning = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        container.style.cursor = 'grabbing';
      });
      
      container.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      });
      
      container.addEventListener('mouseup', () => {
        isPanning = false;
        container.style.cursor = 'grab';
      });
      
      container.addEventListener('mouseleave', () => {
        isPanning = false;
        container.style.cursor = 'grab';
      });
      
      // Set initial transform origin
      svgElement.style.transformOrigin = 'center center';
    }
  } catch (error) {
    console.error('Failed to render Mermaid requirement diagram:', error);
    const container = document.getElementById('mermaid-requirement');
    container.innerHTML = `<div style="color: #dc2626; padding: 20px;">
      <p><strong>Failed to render requirement diagram:</strong></p>
      <p>${escapeHtml(error.message)}</p>
      <p style="margin-top: 10px; font-size: 0.875rem; color: #6b7280;">Check console for more details.</p>
    </div>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

console.log('✅ Requirement Diagram Visualizer (Mermaid.js) loaded');
