/**
 * Integration Guide for RD New Import Tool
 * 
 * How to add the RD New import functionality to main.js
 */

// ============================================================================
// STEP 1: Add import statements at the top of main.js
// ============================================================================

import { RdNewImportModal } from './utils/rdNewImportModal.js';

// ============================================================================
// STEP 2: Add button to toolbar (in initializeUI function or similar)
// ============================================================================

function addRdNewImportButton() {
  const toolbar = document.querySelector('.toolbar'); // Adjust selector as needed
  
  const rdnewButton = document.createElement('button');
  rdnewButton.className = 'toolbar-button';
  rdnewButton.innerHTML = `
    <span class="button-icon">🇳🇱</span>
    <span class="button-label">Import RD New</span>
  `;
  rdnewButton.title = 'Import Dutch Cadastral Data (EPSG:28992)';
  rdnewButton.addEventListener('click', openRdNewImporter);
  
  toolbar.appendChild(rdnewButton);
}

// ============================================================================
// STEP 3: Create modal instance and handler
// ============================================================================

let rdNewModal = null;

function openRdNewImporter() {
  if (rdNewModal) {
    rdNewModal.close();
  }
  
  rdNewModal = new RdNewImportModal(view); // 'view' is your MapView
  window.rdNewImportModal = rdNewModal; // For inline event handlers
  rdNewModal.show();
}

// ============================================================================
// STEP 4: Listen for import completion event
// ============================================================================

window.addEventListener('rdnew-import-complete', async (event) => {
  const routes = event.detail.routes;
  
  console.log(`📥 Importing ${routes.length} route(s) from RD New data`);
  
  // Create each route using your existing route creation function
  for (const routeConfig of routes) {
    try {
      // Example: Assuming you have a createRoute function
      const route = await createRoute({
        name: routeConfig.name,
        description: routeConfig.description,
        coordinates: routeConfig.coordinates,
        metadata: routeConfig.metadata,
        color: routeConfig.color,
        spatialReference: routeConfig.spatialReference
      });
      
      console.log(`✅ Created route: ${route.name}`);
      
      // Optionally store import metadata
      route.importInfo = routeConfig.importInfo;
      
    } catch (error) {
      console.error(`❌ Failed to create route ${routeConfig.name}:`, error);
      alert(`Failed to create route: ${routeConfig.name}\n\n${error.message}`);
    }
  }
  
  // Refresh UI, zoom to new routes, etc.
  refreshRouteList();
  zoomToActiveRoutes();
  
  // Show success message
  showNotification(`Successfully imported ${routes.length} route(s)`, 'success');
});

// ============================================================================
// STEP 5: Call initialization in your main initialization function
// ============================================================================

async function initialize() {
  // ... existing initialization code ...
  
  // Add RD New import button
  addRdNewImportButton();
  
  // ... rest of initialization ...
}

// ============================================================================
// OPTIONAL: Add keyboard shortcut
// ============================================================================

document.addEventListener('keydown', (event) => {
  // Ctrl+Shift+R for RD New import
  if (event.ctrlKey && event.shiftKey && event.key === 'R') {
    event.preventDefault();
    openRdNewImporter();
  }
});

// ============================================================================
// OPTIONAL: Add to file menu if you have one
// ============================================================================

function createFileMenu() {
  return `
    <div class="menu">
      <button onclick="openStandardImport()">Import GeoJSON...</button>
      <button onclick="openRdNewImporter()">Import RD New (Dutch)...</button>
      <button onclick="exportRoute()">Export Route...</button>
    </div>
  `;
}

// ============================================================================
// EVALUATION INTEGRATION
// ============================================================================

/**
 * When evaluating routes that came from RD New import:
 * - Check if route has importInfo.originalSegmentId
 * - If merged route, segment boundaries are in importInfo.mergedSegments
 * - Can optionally evaluate per-segment and combine results
 */

function evaluateRoute(route) {
  if (route.importInfo?.source === 'RD New Import') {
    console.log('📊 Evaluating RD New imported route');
    
    if (route.importInfo.mergedSegments) {
      // This was a merged route - consider segment-by-segment evaluation
      console.log(`   ℹ️ Route contains ${route.importInfo.mergedSegments.length} merged segments`);
      
      // TODO: Implement segment-aware evaluation
      // For now, evaluate as single route
    }
  }
  
  // Continue with normal evaluation
  return performStandardEvaluation(route);
}

// ============================================================================
// REPORT GENERATION ENHANCEMENT
// ============================================================================

/**
 * Add segment information to reports for RD New imported routes
 */

function generateReport(route, evaluationResults) {
  let report = generateStandardReport(route, evaluationResults);
  
  // Add import info section if available
  if (route.importInfo?.source === 'RD New Import') {
    report += `
      <div class="import-info-section">
        <h3>Import Information</h3>
        <p><strong>Source:</strong> ${route.importInfo.source}</p>
        <p><strong>Original CRS:</strong> ${route.importInfo.transformedFrom}</p>
        <p><strong>Import Date:</strong> ${new Date(route.importInfo.importDate).toLocaleString()}</p>
        
        ${route.importInfo.originalSegmentId ? 
          `<p><strong>Original Segment:</strong> ${route.importInfo.originalSegmentId}</p>` : ''}
        
        ${route.importInfo.mergedSegments ? 
          `<p><strong>Merged from:</strong> ${route.importInfo.mergedSegments.length} segments</p>` : ''}
      </div>
    `;
  }
  
  return report;
}

// ============================================================================
// CSS ADDITIONS (add to your styles)
// ============================================================================

const rdNewStyles = `
  .toolbar-button .button-icon {
    font-size: 1.5em;
    margin-right: 8px;
  }
  
  .import-info-section {
    margin-top: 20px;
    padding: 15px;
    background: #f0f8ff;
    border-left: 4px solid #2196F3;
    border-radius: 4px;
  }
  
  .import-info-section h3 {
    margin-top: 0;
    color: #1976D2;
  }
  
  .import-info-section p {
    margin: 5px 0;
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = rdNewStyles;
document.head.appendChild(styleSheet);

// ============================================================================
// TESTING EXAMPLE
// ============================================================================

/**
 * To test with customer's TRACÉ.json:
 * 
 * 1. Click "Import RD New" button (or press Ctrl+Shift+R)
 * 2. Select TRACÉ.json file
 * 3. In Step 2, you should see 3 segments with colors:
 *    - Segment 1: Red (~several km)
 *    - Segment 2: Cyan
 *    - Segment 3: Blue
 * 4. In Step 3, choose:
 *    - "Import as Separate Routes" for individual analysis
 *    - OR "Merge into Single Route" for combined route
 * 5. In Step 4, fill in metadata:
 *    - Name: e.g., "110 kV Cable - Section A"
 *    - Voltage: 110
 *    - Infrastructure: cable
 *    - Fault Clearing Time: 120
 *    - Check "Delta or Multicore" if applicable
 * 6. Confirm and import
 * 
 * Expected result:
 * - Routes appear on map in correct WGS84 coordinates
 * - Ready for evaluation with Bijlage 3 flowchart
 * - Import metadata preserved for audit trail
 */
