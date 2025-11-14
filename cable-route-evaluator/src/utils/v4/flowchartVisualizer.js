/**
 * RLN00398-V004 Flowchart Visualizer using Mermaid.js
 * 
 * Interactive visualization of the compliance flowchart showing:
 * - Initial checks (beschouwde situatie)
 * - Check A (Circuit/cable conditions 1-3)
 * - Check B (High voltage connection conditions 4-7)
 * - Decision paths and outcomes
 * 
 * Highlights the actual evaluation path taken for a specific route.
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
    fontSize: '14px',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    // Make decision diamonds more prominent
    nodeBorder: '#0284c7',
    mainBkg: '#ffffff',
    nodeTextColor: '#1f2937'
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 20,
    nodeSpacing: 100,
    rankSpacing: 120,
    useMaxWidth: false,
    width: 1800,  // Wider flowchart
    diagramPadding: 20
  },
  securityLevel: 'loose'
});

/**
 * Generate Mermaid flowchart definition based on evaluation results
 * Fixed layout - all nodes always visible, color-coded based on evaluation path
 */
function generateMermaidFlowchart(evaluationResult) {
  const results = evaluationResult?.flowchartResults || {};
  
  // Determine path through flowchart
  const initialCheckPassed = results.initial?.passes === true;
  const initialCheckFailed = results.initial?.passes === false;
  
  const checkAEvaluated = results.stepA !== null;
  const checkAPassed = checkAEvaluated && results.stepA?.passes === true;
  const checkAFailed = checkAEvaluated && results.stepA?.passes === false;
  
  const checkBEvaluated = results.stepB !== null;
  const checkBPassed = checkBEvaluated && results.stepB?.passes === true;
  const checkBFailed = checkBEvaluated && results.stepB?.passes === false;
  
  // Build Mermaid flowchart - FIXED LAYOUT with LR (Left to Right) direction
  let diagram = `%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%\n`;
  diagram += `flowchart LR\n`;
  diagram += `\n`;
  
  // === NODES - Always visible ===
  
  // Start node
  diagram += `  Start["<b>Beschouwde situatie</b><br/>hoogspanningsverbinding nabij spoor"]\n`;
  diagram += `\n`;
  
  // Initial Check Box - Exact text from standard
  const initCheck1Style = (initialCheckFailed) ? 'color:#dc2626;font-weight:bold' : '';
  const initCheck2Style = (initialCheckFailed) ? 'color:#dc2626;font-weight:bold' : '';
  diagram += `  InitCheck["<b>Initiële Check:</b><br/>Bevindt de hoogspanningsverbinding zich:<br/><span style='${initCheck1Style}'>>24 kV buiten de 700 m uit het hart van het buitenste spoor</span><br/><span style='${initCheck2Style}'>≤24 kV buiten de 31 m uit het hart van het buitenste spoor</span>"]\n`;
  diagram += `\n`;
  
  // === DECISION DIAMOND 1 - After Initial Check ===
  diagram += `  Dec1{"<b>VOLDAAN?</b><br/>(Pass/Fail)"}\n`;
  diagram += `\n`;
  
  // Outcome 1 - Compliant via initial check
  diagram += `  Out1(["<b>✓ GEEN ONTOELAATBARE<br/>BEÏNVLOEDING</b><br/>Geen modelstudie nodig"])\n`;
  diagram += `\n`;
  
  // Check A Box - Exact text from standard with color markers for failures
  let checkA1Text = '1) Circuit in 1 kabel of in driehoek gebundelde single cores';
  let checkA2Text = '2) geen pad voor homopolaire stroom enkel geaard sterpunt (Zie ook G3)';
  let checkA3Text = '3) kans op 1 fase sluiting met aarde nabij spoor voldoende klein (bij verbindingen ≤24 kV betekent dit: geen moffen binnen 31m zone)';
  
  if (checkAFailed && results.stepA?.checks) {
    results.stepA.checks.forEach(check => {
      if (check.status !== 'pass') {
        if (check.message && check.message.includes('Circuit')) checkA1Text = '❌ <b>' + checkA1Text + '</b>';
        if (check.message && check.message.includes('PAD')) checkA2Text = '❌ <b>' + checkA2Text + '</b>';
        if (check.message && check.message.includes('fase')) checkA3Text = '❌ <b>' + checkA3Text + '</b>';
      }
    });
  }
  
  diagram += `  CheckA["<b>(A) Voorwaarden 1-3</b><br/>${checkA1Text}<br/>${checkA2Text}<br/>${checkA3Text}"]\n`;
  diagram += `\n`;
  
  // === DECISION DIAMOND 2 - After Check A ===
  diagram += `  Dec2{"<b>ALLE VOORWAARDEN<br/>A VOLDAAN?</b><br/>(Pass/Fail)"}\n`;
  diagram += `\n`;
  
  // Outcome 2 - Compliant via Check A
  diagram += `  Out2(["<b>✓ GEEN ONTOELAATBARE<br/>BEÏNVLOEDING</b><br/>Geen modelstudie nodig"])\n`;
  diagram += `\n`;
  
  // Check B Box - Exact text from standard with color markers for failures
  let checkB4Text = '4) loopt hoogspanningsverbinding: >24kV buiten 700m zone (indringdiepte) ≤24kV buiten 11m zone of is er binnen deze zones geen parallelloop en wordt voldaan aan (5) en (6)';
  let checkB5Text = '5) kruist de verbinding het spoor ongeveer haaks (80 tot 100 graden)';
  let checkB6Text = '6) bevindt de verbinding zich op een afstand >20m vanaf een dichtsbijzijnde technische ruimte (gebouw, geen kast)';
  let checkB7Text = '7) wordt een eerste orde lijnfout binnen 100ms afgeschakeld';
  
  if (checkBFailed && results.stepB?.checks) {
    results.stepB.checks.forEach(check => {
      if (check.status !== 'pass') {
        if (check.message && check.message.includes('loopt') || check.message.includes('distance') || check.message.includes('afstand')) checkB4Text = '❌ <b>' + checkB4Text + '</b>';
        if (check.message && check.message.includes('kruist') || check.message.includes('angle') || check.message.includes('crossing')) checkB5Text = '❌ <b>' + checkB5Text + '</b>';
        if (check.message && check.message.includes('bevindt') || check.message.includes('technical') || check.message.includes('technische')) checkB6Text = '❌ <b>' + checkB6Text + '</b>';
        if (check.message && check.message.includes('eerste orde') || check.message.includes('protection') || check.message.includes('lijnfout')) checkB7Text = '❌ <b>' + checkB7Text + '</b>';
      }
    });
  }
  
  diagram += `  CheckB["<b>(B) Voorwaarden 4-7</b><br/>${checkB4Text}<br/>${checkB5Text}<br/>${checkB6Text}<br/>${checkB7Text}"]\n`;
  diagram += `\n`;
  
  // === DECISION DIAMOND 3 - After Check B ===
  diagram += `  Dec3{"<b>ALLE VOORWAARDEN<br/>B VOLDAAN?</b><br/>(Pass/Fail)"}\n`;
  diagram += `\n`;
  
  // Outcome 3 - Compliant via Check B
  diagram += `  Out3(["<b>✓ GEEN ONTOELAATBARE<br/>BEÏNVLOEDING</b><br/>Geen modelstudie nodig"])\n`;
  diagram += `\n`;
  
  // Outcome 4 - Requires detailed study with recommendation
  diagram += `  DetailedStudy(["<b>⚠ GEDETAILLEERDE EMC-STUDIE VEREIST</b><br/>Aanbeveling: Volg RLN00398-V004<br/>Ga naar Check C & D voor gedetailleerde analyse"])\n`;
  diagram += `\n`;
  
  // Final Report - Make it meaningful
  diagram += `  Report(["<b>📄 RAPPORTAGE COMPLEET</b><br/>RLN00398-V004 Evaluatie<br/>Conclusie gedocumenteerd"])\n`;
  diagram += `\n`;
  
  // === CONNECTIONS - Always the same structure ===
  diagram += `  Start --> InitCheck\n`;
  diagram += `  InitCheck --> Dec1\n`;
  diagram += `  Dec1 -->|"<b>Ja</b>"| Out1\n`;
  diagram += `  Dec1 -->|"<b>Nee</b>"| CheckA\n`;
  diagram += `  Out1 --> Report\n`;
  diagram += `  CheckA --> Dec2\n`;
  diagram += `  Dec2 -->|"<b>Ja</b>"| Out2\n`;
  diagram += `  Dec2 -->|"<b>Nee</b>"| CheckB\n`;
  diagram += `  Out2 --> Report\n`;
  diagram += `  CheckB --> Dec3\n`;
  diagram += `  Dec3 -->|"<b>Ja</b>"| Out3\n`;
  diagram += `  Dec3 -->|"<b>Nee</b>"| DetailedStudy\n`;
  diagram += `  Out3 --> Report\n`;
  diagram += `  DetailedStudy --> Report\n`;
  diagram += `\n`;
  
  // === STYLING - Color code based on evaluation path ===
  
  // Start - always active
  diagram += `  style Start fill:#e0f2fe,stroke:#0284c7,stroke-width:3px\n`;
  
  // Initial Check - always evaluated
  diagram += `  style InitCheck fill:#e0f2fe,stroke:#0284c7,stroke-width:2px\n`;
  
  // Decision 1 styling - LARGE AND PROMINENT
  if (initialCheckPassed) {
    diagram += `  style Dec1 fill:#dcfce7,stroke:#16a34a,stroke-width:4px,font-size:16px\n`;
    diagram += `  linkStyle 2 stroke:#16a34a,stroke-width:5px\n`;  // Yes path
    diagram += `  linkStyle 4 stroke:#16a34a,stroke-width:5px\n`;  // To Report
    diagram += `  style Out1 fill:#dcfce7,stroke:#16a34a,stroke-width:3px\n`;
  } else if (initialCheckFailed) {
    diagram += `  style Dec1 fill:#fee2e2,stroke:#dc2626,stroke-width:4px,font-size:16px\n`;
    diagram += `  linkStyle 3 stroke:#dc2626,stroke-width:5px\n`;  // No path
  } else {
    diagram += `  style Dec1 fill:#fef3c7,stroke:#d97706,stroke-width:3px,font-size:16px\n`;
  }
  
  // Check A styling
  if (checkAEvaluated) {
    if (checkAPassed) {
      diagram += `  style CheckA fill:#dcfce7,stroke:#16a34a,stroke-width:2px\n`;
      diagram += `  style Dec2 fill:#dcfce7,stroke:#16a34a,stroke-width:4px,font-size:16px\n`;
      diagram += `  linkStyle 5 stroke:#16a34a,stroke-width:5px\n`;  // CheckA to Dec2
      diagram += `  linkStyle 6 stroke:#16a34a,stroke-width:5px\n`;  // Yes path
      diagram += `  linkStyle 8 stroke:#16a34a,stroke-width:5px\n`;  // To Report
      diagram += `  style Out2 fill:#dcfce7,stroke:#16a34a,stroke-width:3px\n`;
    } else if (checkAFailed) {
      diagram += `  style CheckA fill:#fee2e2,stroke:#dc2626,stroke-width:2px\n`;
      diagram += `  style Dec2 fill:#fee2e2,stroke:#dc2626,stroke-width:4px,font-size:16px\n`;
      diagram += `  linkStyle 5 stroke:#dc2626,stroke-width:5px\n`;  // CheckA to Dec2
      diagram += `  linkStyle 7 stroke:#dc2626,stroke-width:5px\n`;  // No path
    }
  } else {
    // Not evaluated - gray
    diagram += `  style CheckA fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px\n`;
    diagram += `  style Dec2 fill:#f3f4f6,stroke:#9ca3af,stroke-width:3px,font-size:16px\n`;
    diagram += `  style Out2 fill:#f9fafb,stroke:#d1d5db,stroke-width:1px\n`;
  }
  
  // Check B styling
  if (checkBEvaluated) {
    if (checkBPassed) {
      diagram += `  style CheckB fill:#dcfce7,stroke:#16a34a,stroke-width:2px\n`;
      diagram += `  style Dec3 fill:#dcfce7,stroke:#16a34a,stroke-width:4px,font-size:16px\n`;
      diagram += `  linkStyle 9 stroke:#16a34a,stroke-width:5px\n`;  // CheckB to Dec3
      diagram += `  linkStyle 10 stroke:#16a34a,stroke-width:5px\n`; // Yes path
      diagram += `  linkStyle 12 stroke:#16a34a,stroke-width:5px\n`; // To Report
      diagram += `  style Out3 fill:#dcfce7,stroke:#16a34a,stroke-width:3px\n`;
    } else if (checkBFailed) {
      diagram += `  style CheckB fill:#fee2e2,stroke:#dc2626,stroke-width:2px\n`;
      diagram += `  style Dec3 fill:#fee2e2,stroke:#dc2626,stroke-width:4px,font-size:16px\n`;
      diagram += `  linkStyle 9 stroke:#dc2626,stroke-width:5px\n`;  // CheckB to Dec3
      diagram += `  linkStyle 11 stroke:#dc2626,stroke-width:5px\n`; // No path
      diagram += `  linkStyle 13 stroke:#dc2626,stroke-width:5px\n`; // To Report
      diagram += `  style DetailedStudy fill:#fef3c7,stroke:#ca8a04,stroke-width:3px\n`;
    }
  } else {
    // Not evaluated - gray
    diagram += `  style CheckB fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px\n`;
    diagram += `  style Dec3 fill:#f3f4f6,stroke:#9ca3af,stroke-width:3px,font-size:16px\n`;
    diagram += `  style Out3 fill:#f9fafb,stroke:#d1d5db,stroke-width:1px\n`;
    diagram += `  style DetailedStudy fill:#f9fafb,stroke:#d1d5db,stroke-width:1px\n`;
  }
  
  // Report - always shown
  diagram += `  style Report fill:#dbeafe,stroke:#2563eb,stroke-width:3px\n`;
  
  return diagram;
}

/**
 * Open flowchart visualizer modal with Mermaid rendering
 */
export async function openFlowchartModal(routeName, evaluationResult) {
  // Determine exit point
  const results = evaluationResult?.flowchartResults || {};
  let exitPoint = 'UNKNOWN';
  let exitStatus = 'unknown';
  let exitMessage = '';
  let exitIcon = '❓';
  
  if (results.initial?.passes === true) {
    exitPoint = 'STEP 0';
    exitStatus = 'compliant';
    exitMessage = 'Route voldoet al na initiële afstandscontrole';
    exitIcon = '✅';
  } else if (results.stepA?.passes === true) {
    exitPoint = 'STEP A';
    exitStatus = 'compliant';
    exitMessage = 'Route voldoet na Check A (voorwaarden 1-3)';
    exitIcon = '✅';
  } else if (results.stepB?.passes === true) {
    exitPoint = 'STEP B';
    exitStatus = 'compliant';
    exitMessage = 'Route voldoet na Check B (voorwaarden 4-7)';
    exitIcon = '✅';
  } else if (results.stepB?.passes === false) {
    exitPoint = 'AFTER STEP B';
    exitStatus = 'requires-study';
    exitMessage = 'Gedetailleerde EMC-studie vereist (ga naar Check C & D)';
    exitIcon = '⚠️';
  }
  
  const modal = document.createElement('div');
  modal.className = 'flowchart-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'flowchart-modal-title');
  modal.innerHTML = `
    <div class="flowchart-modal-overlay"></div>
    <div class="flowchart-modal-content">
      <div class="flowchart-modal-header">
        <h2 id="flowchart-modal-title">🔄 Evaluatiestroom: ${escapeHtml(routeName)}</h2>
        <button class="flowchart-modal-close" aria-label="Sluit flowchart dialoog">✕</button>
      </div>
      
      <!-- EXIT POINT BANNER -->
      <div class="flowchart-exit-banner exit-${exitStatus}" role="status" aria-live="polite">
        <div class="exit-icon" aria-hidden="true">${exitIcon}</div>
        <div class="exit-info">
          <div class="exit-point">UITGANG: <strong>${exitPoint}</strong></div>
          <div class="exit-message">${exitMessage}</div>
        </div>
      </div>
      
      <div class="flowchart-modal-body">
        <div class="flowchart-legend" role="note" aria-label="Legenda">
          <div><span class="legend-box" style="background: #16a34a;" aria-hidden="true"></span> Voldaan (pad gevolgd)</div>
          <div><span class="legend-box" style="background: #dc2626;" aria-hidden="true"></span> Niet voldaan (pad gevolgd)</div>
          <div><span class="legend-box" style="background: #e5e7eb;" aria-hidden="true"></span> Niet geëvalueerd</div>
        </div>
        <div class="flowchart-controls" role="toolbar" aria-label="Flowchart besturing">
          <button class="zoom-btn zoom-in" aria-label="Zoom in">🔍+ Zoom In</button>
          <button class="zoom-btn zoom-out" aria-label="Zoom uit">🔍− Zoom Out</button>
          <button class="zoom-btn zoom-reset" aria-label="Reset zoom">↺ Reset</button>
          <button class="zoom-btn fullscreen-toggle" aria-label="Schakel fullscreen">⛶ Fullscreen</button>
        </div>
        <div class="flowchart-container" id="mermaid-flowchart" role="img" aria-label="RLN00398 evaluatie flowchart">
          <div class="loading">Flowchart wordt geladen...</div>
        </div>
        <div class="flowchart-footer" role="note">
          <p><strong>Let op:</strong> Dit hulpmiddel evalueert alleen de <em>Initiële check</em>, <em>Check A</em> (1-3), en <em>Check B</em> (4-7).</p>
          <p>Checks C en D vereisen een gedetailleerde studie en vallen buiten de scope van deze tool.</p>
        </div>
      </div>
      <div class="resize-handle resize-handle-right" aria-hidden="true"></div>
      <div class="resize-handle resize-handle-bottom" aria-hidden="true"></div>
      <div class="resize-handle resize-handle-corner" aria-hidden="true"></div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .flowchart-modal {
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
    
    .flowchart-modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
    }
    
    .flowchart-modal-content {
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
      overflow: hidden;
    }
    
    .flowchart-modal-header {
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
    
    .flowchart-modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #1f2937;
      pointer-events: none;
    }
    
    /* EXIT POINT BANNER */
    .flowchart-exit-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      border-bottom: 3px solid;
      flex-shrink: 0;
      animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .flowchart-exit-banner.exit-compliant {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      border-color: #16a34a;
    }
    
    .flowchart-exit-banner.exit-requires-study {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-color: #ca8a04;
    }
    
    .flowchart-exit-banner.exit-unknown {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      border-color: #9ca3af;
    }
    
    .exit-icon {
      font-size: 3rem;
      line-height: 1;
      flex-shrink: 0;
    }
    
    .exit-info {
      flex: 1;
    }
    
    .exit-point {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    
    .exit-point strong {
      font-size: 1.3rem;
      color: #000;
    }
    
    .exit-message {
      font-size: 0.95rem;
      color: #4b5563;
    }
    
    .flowchart-modal-close {
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
    
    .flowchart-modal-close:hover {
      background: #dc2626;
      transform: scale(1.1);
    }
    
    .flowchart-modal-body {
      flex: 1;
      overflow: hidden;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    
    .flowchart-legend {
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
    
    .flowchart-legend > div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .legend-box {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      display: inline-block;
      border: 1px solid rgba(0,0,0,0.1);
    }
    
    .flowchart-controls {
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
    
    .flowchart-container {
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
    
    .flowchart-container:active {
      cursor: grabbing;
    }
    
    .flowchart-container .loading {
      color: #6b7280;
      font-size: 1rem;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    .flowchart-container svg {
      display: block;
      transition: transform 0.2s ease-out;
    }
    
    /* Make text boxes wider and wrap text properly */
    .flowchart-container .node rect,
    .flowchart-container .node polygon,
    .flowchart-container .node circle,
    .flowchart-container .node ellipse {
      min-width: 200px !important;
    }
    
    .flowchart-container .nodeLabel {
      white-space: normal !important;
      word-wrap: break-word !important;
      max-width: 400px !important;
      padding: 8px 12px !important;
    }
    
    .flowchart-footer {
      margin-top: 12px;
      padding: 12px 16px;
      background: #fef3c7;
      border-left: 4px solid #d97706;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #78350f;
      flex-shrink: 0;
    }
    
    .flowchart-footer p {
      margin: 4px 0;
    }
    
    .flowchart-footer strong {
      color: #92400e;
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
      background: rgba(139, 92, 246, 0.3);
    }
    
    .resize-handle-bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      height: 8px;
      cursor: ns-resize;
    }
    
    .resize-handle-bottom:hover {
      background: rgba(139, 92, 246, 0.3);
    }
    
    .resize-handle-corner {
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, rgba(139, 92, 246, 0.5) 50%);
    }
    
    .resize-handle-corner:hover {
      background: linear-gradient(135deg, transparent 50%, rgba(139, 92, 246, 0.7) 50%);
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(modal);
  
  // Get references to interactive elements
  const modalContent = modal.querySelector('.flowchart-modal-content');
  const overlay = modal.querySelector('.flowchart-modal-overlay');
  const closeButton = modal.querySelector('.flowchart-modal-close');
  const header = modal.querySelector('.flowchart-modal-header');
  const zoomInBtn = modal.querySelector('.zoom-in');
  const zoomOutBtn = modal.querySelector('.zoom-out');
  const resetBtn = modal.querySelector('.zoom-reset');
  const fullscreenBtn = modal.querySelector('.fullscreen-toggle');
  const container = modal.querySelector('#mermaid-flowchart');
  const resizeRight = modal.querySelector('.resize-handle-right');
  const resizeBottom = modal.querySelector('.resize-handle-bottom');
  const resizeCorner = modal.querySelector('.resize-handle-corner');
  
  // Focus trap - get all focusable elements
  const getFocusableElements = () => {
    return modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  };
  
  // Store the element that had focus before opening modal
  const previouslyFocusedElement = document.activeElement;
  
  // Close modal function
  const closeModal = () => {
    modal.remove();
    // Restore focus to previously focused element
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  };
  
  // Close on overlay click
  overlay.addEventListener('click', closeModal);
  
  // Close on close button click
  closeButton.addEventListener('click', closeModal);
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  modal.addEventListener('keydown', handleEscape);
  
  // Focus trap - handle Tab key
  const handleTab = (e) => {
    if (e.key !== 'Tab') return;
    
    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  modal.addEventListener('keydown', handleTab);
  
  // Set initial focus to close button
  setTimeout(() => {
    closeButton.focus();
  }, 100);
  
  // Zoom and fullscreen state
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isFullscreen = true;
  
  // Drag and resize state
  let isDragging = false;
  let isResizing = false;
  let resizeDirection = null;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  
  // Fullscreen toggle function (local, not global)
  const toggleFullscreen = () => {
    if (isFullscreen) {
      // Exit fullscreen - set to 90% centered
      modalContent.style.width = '90vw';
      modalContent.style.height = '90vh';
      modalContent.style.left = '5vw';
      modalContent.style.top = '5vh';
      modalContent.style.right = 'auto';
      modalContent.style.bottom = 'auto';
      isFullscreen = false;
      fullscreenBtn.textContent = '⛶ Fullscreen';
    } else {
      // Enter fullscreen
      modalContent.style.width = '100%';
      modalContent.style.height = '100%';
      modalContent.style.left = '0';
      modalContent.style.top = '0';
      modalContent.style.right = '0';
      modalContent.style.bottom = '0';
      isFullscreen = true;
      fullscreenBtn.textContent = '⛶ Exit Fullscreen';
    }
  };
  
  // Attach fullscreen button event
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  
  // Header drag to move
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.flowchart-modal-close')) return;
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
    const mermaidDef = generateMermaidFlowchart(evaluationResult);
    
    const { svg } = await mermaid.render('flowchart-svg', mermaidDef);
    container.innerHTML = svg;
    
    // Add zoom and pan functionality
    const svgElement = container.querySelector('svg');
    if (svgElement) {
      // Zoom functions (local, not global)
      const zoomFlowchart = (factor) => {
        scale *= factor;
        scale = Math.max(0.3, Math.min(scale, 3)); // Limit zoom between 30% and 300%
        svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      };
      
      const resetZoom = () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        svgElement.style.transform = `translate(0px, 0px) scale(1)`;
      };
      
      // Attach zoom button events
      zoomInBtn.addEventListener('click', () => zoomFlowchart(1.2));
      zoomOutBtn.addEventListener('click', () => zoomFlowchart(0.8));
      resetBtn.addEventListener('click', resetZoom);
      
      // Mouse wheel zoom
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoomFlowchart(delta);
      });
      
      // Pan functionality
      let isPanning = false;
      let panStartX = 0;
      let panStartY = 0;
      
      container.addEventListener('mousedown', (e) => {
        isPanning = true;
        panStartX = e.clientX - translateX;
        panStartY = e.clientY - translateY;
        container.style.cursor = 'grabbing';
      });
      
      container.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        translateX = e.clientX - panStartX;
        translateY = e.clientY - panStartY;
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
    console.error('Failed to render Mermaid flowchart:', error);
    const container = document.getElementById('mermaid-flowchart');
    container.innerHTML = `<div style="color: #dc2626;">Failed to render flowchart: ${escapeHtml(error.message)}</div>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

console.log('✅ Flowchart Visualizer (Mermaid.js) loaded');

