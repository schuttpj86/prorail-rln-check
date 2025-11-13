/**
 * RD New Import Modal Component
 * 
 * Multi-step wizard for importing Dutch cadastral survey data:
 * 1. File upload
 * 2. Segment preview
 * 3. Segment configuration (merge or separate)
 * 4. Metadata input
 * 5. Import confirmation
 */

import { 
  readRdNewFile, 
  createRouteFromSegment, 
  mergeSegments 
} from './routeImporterRDNew.js';
import Polyline from "@arcgis/core/geometry/Polyline";
import Graphic from "@arcgis/core/Graphic";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";

export class RdNewImportModal {
  constructor(mapView) {
    this.mapView = mapView;
    this.currentStep = 1;
    this.parsedData = null;
    this.selectedSegments = [];
    this.previewGraphics = [];
    this.segmentMetadata = {};
    this.mergeMode = false;
    
    this.createModal();
  }

  /**
   * Create the modal DOM structure
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'rdnew-import-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h2>Import Dutch Cadastral Data (RD New)</h2>
          <button class="close-btn" title="Close">&times;</button>
        </div>
        
        <div class="modal-progress">
          <div class="progress-step active" data-step="1">
            <div class="step-number">1</div>
            <div class="step-label">Upload</div>
          </div>
          <div class="progress-step" data-step="2">
            <div class="step-number">2</div>
            <div class="step-label">Preview</div>
          </div>
          <div class="progress-step" data-step="3">
            <div class="step-number">3</div>
            <div class="step-label">Configure</div>
          </div>
          <div class="progress-step" data-step="4">
            <div class="step-number">4</div>
            <div class="step-label">Metadata</div>
          </div>
          <div class="progress-step" data-step="5">
            <div class="step-number">5</div>
            <div class="step-label">Confirm</div>
          </div>
        </div>
        
        <div class="modal-body">
          <!-- Step 1: File Upload -->
          <div class="step-content" data-step="1">
            <h3>Upload RD New GeoJSON File</h3>
            <p>Select a GeoJSON file in EPSG:28992 (RD New) coordinate system from your cadastral survey.</p>
            
            <div class="file-upload-area">
              <input type="file" id="rdnew-file-input" accept=".json,.geojson" />
              <label for="rdnew-file-input" class="file-upload-label">
                <span class="upload-icon">📁</span>
                <span class="upload-text">Click to select file or drag and drop</span>
                <span class="upload-hint">Supports .json and .geojson files</span>
              </label>
            </div>
            
            <div class="file-info" style="display: none;">
              <h4>File Information</h4>
              <div class="info-content"></div>
            </div>
          </div>
          
          <!-- Step 2: Preview Segments -->
          <div class="step-content" data-step="2" style="display: none;">
            <h3>Preview Route Segments</h3>
            <p>Your file contains multiple segments. Review them on the map.</p>
            
            <div class="segments-list"></div>
            
            <div class="preview-controls">
              <button class="btn-secondary" id="zoom-to-all">Zoom to All Segments</button>
            </div>
          </div>
          
          <!-- Step 3: Configure Segments -->
          <div class="step-content" data-step="3" style="display: none;">
            <h3>Configure Import Strategy</h3>
            <p>Choose how to import the segments:</p>
            
            <div class="import-strategy">
              <label class="radio-option">
                <input type="radio" name="import-strategy" value="separate" checked />
                <div class="option-content">
                  <strong>Import as Separate Routes</strong>
                  <p>Each segment becomes an independent route with its own evaluation</p>
                </div>
              </label>
              
              <label class="radio-option">
                <input type="radio" name="import-strategy" value="merge" />
                <div class="option-content">
                  <strong>Merge into Single Route</strong>
                  <p>Combine all segments into one continuous route</p>
                </div>
              </label>
            </div>
            
            <div class="segment-selection">
              <h4>Select Segments to Import</h4>
              <div class="segment-checkboxes"></div>
            </div>
          </div>
          
          <!-- Step 4: Metadata Input -->
          <div class="step-content" data-step="4" style="display: none;">
            <h3>Route Metadata</h3>
            <p class="metadata-description">Provide technical specifications for the route(s)</p>
            
            <div class="metadata-form"></div>
          </div>
          
          <!-- Step 5: Confirmation -->
          <div class="step-content" data-step="5" style="display: none;">
            <h3>Confirm Import</h3>
            <p>Review your configuration before importing:</p>
            
            <div class="import-summary"></div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" id="btn-back" style="display: none;">Back</button>
          <button class="btn-secondary" id="btn-cancel">Cancel</button>
          <button class="btn-primary" id="btn-next" disabled>Next</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    
    this.attachEventListeners();
    this.addStyles();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    this.modal.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.modal.querySelector('#btn-cancel').addEventListener('click', () => this.close());
    
    // Navigation buttons
    this.modal.querySelector('#btn-back').addEventListener('click', () => this.previousStep());
    this.modal.querySelector('#btn-next').addEventListener('click', () => this.nextStep());
    
    // File input
    const fileInput = this.modal.querySelector('#rdnew-file-input');
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    
    // Drag and drop
    const uploadArea = this.modal.querySelector('.file-upload-area');
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        this.handleFileSelect({ target: fileInput });
      }
    });
  }

  /**
   * Handle file selection
   */
  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const nextBtn = this.modal.querySelector('#btn-next');
    nextBtn.disabled = true;
    nextBtn.textContent = 'Processing...';
    
    try {
      // Parse the file
      this.parsedData = await readRdNewFile(file);
      
      // Display file info
      this.displayFileInfo(file, this.parsedData);
      
      // Enable next button
      nextBtn.disabled = false;
      nextBtn.textContent = 'Next';
      
    } catch (error) {
      alert(`Failed to import file:\n\n${error.message}`);
      nextBtn.textContent = 'Next';
    }
  }

  /**
   * Display file information
   */
  displayFileInfo(file, data) {
    const fileInfoDiv = this.modal.querySelector('.file-info');
    const infoContent = fileInfoDiv.querySelector('.info-content');
    
    const info = data.metadata;
    const validation = data.validation;
    
    let html = `
      <p><strong>File:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
      <p><strong>Format:</strong> ${info.sourceFormat}</p>
      <p><strong>Features:</strong> ${info.featureCount}</p>
      <p><strong>Total Segments:</strong> ${info.totalSegments}</p>
    `;
    
    if (validation.warnings.length > 0) {
      html += `<div class="warnings">
        <strong>⚠️ Warnings:</strong>
        <ul>${validation.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>`;
    }
    
    infoContent.innerHTML = html;
    fileInfoDiv.style.display = 'block';
  }

  /**
   * Show preview of segments
   */
  showSegmentPreview() {
    if (!this.parsedData || !this.parsedData.routes[0]) return;
    
    const segments = this.parsedData.routes[0].segments;
    const listDiv = this.modal.querySelector('.segments-list');
    
    // Clear previous preview
    this.clearPreview();
    
    // Colors for different segments
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    
    let html = '<div class="segment-cards">';
    
    segments.forEach((segment, index) => {
      const color = colors[index % colors.length];
      
      html += `
        <div class="segment-card" data-segment-index="${index}">
          <div class="segment-color" style="background-color: ${color};"></div>
          <div class="segment-info">
            <h4>${segment.name}</h4>
            <p><strong>Points:</strong> ${segment.pointCount}</p>
            <p><strong>Length:</strong> ~${(segment.lengthMeters / 1000).toFixed(2)} km</p>
          </div>
          <div class="segment-actions">
            <button class="btn-icon" onclick="rdNewImportModal.zoomToSegment(${index})" title="Zoom to segment">🔍</button>
            <button class="btn-icon" onclick="rdNewImportModal.toggleSegmentVisibility(${index})" title="Toggle visibility">👁️</button>
          </div>
        </div>
      `;
      
      // Add to map
      this.addSegmentToMap(segment, color);
    });
    
    html += '</div>';
    listDiv.innerHTML = html;
    
    // Zoom to all segments
    this.zoomToAllSegments();
    
    // Setup zoom button
    this.modal.querySelector('#zoom-to-all').addEventListener('click', () => this.zoomToAllSegments());
  }

  /**
   * Add segment to map as preview
   */
  addSegmentToMap(segment, color) {
    const polyline = new Polyline({
      paths: [segment.wgs84Coords],
      spatialReference: { wkid: 4326 }
    });
    
    const symbol = new SimpleLineSymbol({
      color: color,
      width: 3,
      style: 'solid'
    });
    
    const graphic = new Graphic({
      geometry: polyline,
      symbol: symbol,
      attributes: {
        segmentId: segment.id,
        segmentIndex: segment.index
      }
    });
    
    this.mapView.graphics.add(graphic);
    this.previewGraphics.push(graphic);
  }

  /**
   * Clear preview graphics from map
   */
  clearPreview() {
    this.previewGraphics.forEach(graphic => {
      this.mapView.graphics.remove(graphic);
    });
    this.previewGraphics = [];
  }

  /**
   * Zoom to all segments
   */
  zoomToAllSegments() {
    if (this.previewGraphics.length === 0) return;
    
    const geometries = this.previewGraphics.map(g => g.geometry);
    this.mapView.goTo(geometries, { duration: 1000 });
  }

  /**
   * Zoom to specific segment
   */
  zoomToSegment(index) {
    const graphic = this.previewGraphics[index];
    if (graphic) {
      this.mapView.goTo(graphic.geometry, { duration: 800, zoom: 14 });
    }
  }

  /**
   * Toggle segment visibility
   */
  toggleSegmentVisibility(index) {
    const graphic = this.previewGraphics[index];
    if (graphic) {
      graphic.visible = !graphic.visible;
    }
  }

  /**
   * Show configure step
   */
  showConfigureStep() {
    const segments = this.parsedData.routes[0].segments;
    const checkboxesDiv = this.modal.querySelector('.segment-checkboxes');
    
    let html = '';
    segments.forEach((segment, index) => {
      html += `
        <label class="checkbox-option">
          <input type="checkbox" name="segment-${index}" value="${index}" checked />
          <span>${segment.name} (${segment.pointCount} points, ~${(segment.lengthMeters / 1000).toFixed(2)} km)</span>
        </label>
      `;
    });
    
    checkboxesDiv.innerHTML = html;
    
    // Listen to strategy radio changes
    const radios = this.modal.querySelectorAll('input[name="import-strategy"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.mergeMode = e.target.value === 'merge';
      });
    });
  }

  /**
   * Show metadata form
   */
  showMetadataForm() {
    const formDiv = this.modal.querySelector('.metadata-form');
    const segments = this.parsedData.routes[0].segments;
    const selectedIndices = this.getSelectedSegmentIndices();
    
    let html = '';
    
    if (this.mergeMode) {
      // Single form for merged route
      html = this.createMetadataFormHTML('merged', 'Merged Route');
    } else {
      // Form for each selected segment
      selectedIndices.forEach(index => {
        const segment = segments[index];
        html += `<div class="metadata-section">
          <h4>${segment.name}</h4>
          ${this.createMetadataFormHTML(index, segment.name)}
        </div>`;
      });
    }
    
    formDiv.innerHTML = html;
  }

  /**
   * Create metadata form HTML
   */
  createMetadataFormHTML(id, name) {
    return `
      <div class="form-group">
        <label>Route Name</label>
        <input type="text" class="form-control" name="name-${id}" value="${name}" />
      </div>
      
      <div class="form-group">
        <label>Description</label>
        <textarea class="form-control" name="description-${id}" rows="2"></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Voltage (kV)</label>
          <input type="number" class="form-control" name="voltage-${id}" placeholder="e.g., 110" />
        </div>
        
        <div class="form-group">
          <label>Infrastructure Type</label>
          <select class="form-control" name="infra-type-${id}">
            <option value="cable">Cable</option>
            <option value="overhead">Overhead Line</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Fault Clearing Time (ms)</label>
          <input type="number" class="form-control" name="fault-time-${id}" placeholder="e.g., 120" />
        </div>
        
        <div class="form-group">
          <label>Min Joint Distance (m)</label>
          <input type="number" class="form-control" name="joint-dist-${id}" placeholder="e.g., 500" />
        </div>
      </div>
      
      <div class="form-group">
        <label>Configuration</label>
        <label class="checkbox-inline">
          <input type="checkbox" name="delta-${id}" /> Delta or Multicore
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" name="pad-control-${id}" /> PAD Current Control
        </label>
      </div>
      
      <div class="form-group">
        <label>Notes</label>
        <textarea class="form-control" name="notes-${id}" rows="2"></textarea>
      </div>
    `;
  }

  /**
   * Get selected segment indices
   */
  getSelectedSegmentIndices() {
    const checkboxes = this.modal.querySelectorAll('.segment-checkboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
  }

  /**
   * Collect metadata from form
   */
  collectMetadata(id) {
    return {
      name: this.modal.querySelector(`[name="name-${id}"]`).value,
      description: this.modal.querySelector(`[name="description-${id}"]`).value,
      voltageKv: parseFloat(this.modal.querySelector(`[name="voltage-${id}"]`).value) || null,
      infrastructureType: this.modal.querySelector(`[name="infra-type-${id}"]`).value,
      faultClearingTimeMs: parseFloat(this.modal.querySelector(`[name="fault-time-${id}"]`).value) || null,
      minJointDistanceMeters: parseFloat(this.modal.querySelector(`[name="joint-dist-${id}"]`).value) || null,
      hasDeltaOrMulticore: this.modal.querySelector(`[name="delta-${id}"]`).checked,
      hasPadCurrentControl: this.modal.querySelector(`[name="pad-control-${id}"]`).checked,
      notes: this.modal.querySelector(`[name="notes-${id}"]`).value
    };
  }

  /**
   * Show confirmation summary
   */
  showConfirmation() {
    const summaryDiv = this.modal.querySelector('.import-summary');
    const segments = this.parsedData.routes[0].segments;
    const selectedIndices = this.getSelectedSegmentIndices();
    
    let html = '<div class="summary-content">';
    
    if (this.mergeMode) {
      const metadata = this.collectMetadata('merged');
      html += `
        <h4>Merged Route</h4>
        <p><strong>Name:</strong> ${metadata.name}</p>
        <p><strong>Segments:</strong> ${selectedIndices.length} segments merged</p>
        <p><strong>Voltage:</strong> ${metadata.voltageKv || 'Not specified'} kV</p>
        <p><strong>Infrastructure:</strong> ${metadata.infrastructureType}</p>
      `;
    } else {
      html += `<h4>Importing ${selectedIndices.length} Route(s)</h4>`;
      selectedIndices.forEach(index => {
        const metadata = this.collectMetadata(index);
        const segment = segments[index];
        html += `
          <div class="route-summary">
            <p><strong>${metadata.name}</strong></p>
            <p>${segment.pointCount} points, ~${(segment.lengthMeters / 1000).toFixed(2)} km</p>
            <p>Voltage: ${metadata.voltageKv || 'Not specified'} kV</p>
          </div>
        `;
      });
    }
    
    html += '</div>';
    summaryDiv.innerHTML = html;
  }

  /**
   * Navigate to next step
   */
  async nextStep() {
    if (this.currentStep === 5) {
      // Final step - perform import
      await this.performImport();
      return;
    }
    
    this.currentStep++;
    this.updateUI();
    
    // Load content for new step
    if (this.currentStep === 2) {
      this.showSegmentPreview();
    } else if (this.currentStep === 3) {
      this.showConfigureStep();
    } else if (this.currentStep === 4) {
      this.showMetadataForm();
    } else if (this.currentStep === 5) {
      this.showConfirmation();
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateUI();
    }
  }

  /**
   * Update UI for current step
   */
  updateUI() {
    // Update progress indicators
    this.modal.querySelectorAll('.progress-step').forEach(step => {
      const stepNum = parseInt(step.dataset.step);
      step.classList.toggle('active', stepNum === this.currentStep);
      step.classList.toggle('completed', stepNum < this.currentStep);
    });
    
    // Show/hide step content
    this.modal.querySelectorAll('.step-content').forEach(content => {
      const stepNum = parseInt(content.dataset.step);
      content.style.display = stepNum === this.currentStep ? 'block' : 'none';
    });
    
    // Update buttons
    const backBtn = this.modal.querySelector('#btn-back');
    const nextBtn = this.modal.querySelector('#btn-next');
    
    backBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
    nextBtn.textContent = this.currentStep === 5 ? 'Import' : 'Next';
    nextBtn.disabled = false;
  }

  /**
   * Perform the actual import
   */
  async performImport() {
    const segments = this.parsedData.routes[0].segments;
    const selectedIndices = this.getSelectedSegmentIndices();
    const routesToCreate = [];
    
    try {
      if (this.mergeMode) {
        // Merge segments
        const selectedSegments = selectedIndices.map(i => segments[i]);
        const metadata = this.collectMetadata('merged');
        const routeConfig = mergeSegments(selectedSegments, metadata);
        routesToCreate.push(routeConfig);
      } else {
        // Create separate routes
        selectedIndices.forEach(index => {
          const segment = segments[index];
          const metadata = this.collectMetadata(index);
          const routeConfig = createRouteFromSegment(segment, metadata);
          routesToCreate.push(routeConfig);
        });
      }
      
      // Trigger import event with routes data
      const event = new CustomEvent('rdnew-import-complete', {
        detail: { routes: routesToCreate }
      });
      window.dispatchEvent(event);
      
      // Close modal
      this.close();
      
      console.log('✅ RD New import successful:', routesToCreate.length, 'route(s)');
      
    } catch (error) {
      alert(`Import failed:\n\n${error.message}`);
      console.error('❌ Import error:', error);
    }
  }

  /**
   * Close modal
   */
  close() {
    this.clearPreview();
    if (this.modal) {
      this.modal.remove();
    }
  }

  /**
   * Show modal
   */
  show() {
    this.modal.style.display = 'block';
  }

  /**
   * Add modal styles
   */
  addStyles() {
    if (document.getElementById('rdnew-import-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'rdnew-import-styles';
    style.textContent = `
      .rdnew-import-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
      }
      
      .modal-container {
        position: relative;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }
      
      .modal-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .modal-header h2 {
        margin: 0;
        font-size: 1.5em;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 2em;
        cursor: pointer;
        color: #666;
      }
      
      .modal-progress {
        display: flex;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
      }
      
      .progress-step {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity: 0.5;
        position: relative;
      }
      
      .progress-step.active {
        opacity: 1;
      }
      
      .progress-step.completed .step-number {
        background: #4CAF50;
        color: white;
      }
      
      .step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      .progress-step.active .step-number {
        background: #2196F3;
        color: white;
      }
      
      .step-label {
        font-size: 0.85em;
        text-align: center;
      }
      
      .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }
      
      .file-upload-area {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .file-upload-area:hover,
      .file-upload-area.drag-over {
        border-color: #2196F3;
        background: #f0f8ff;
      }
      
      #rdnew-file-input {
        display: none;
      }
      
      .file-upload-label {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .upload-icon {
        font-size: 3em;
      }
      
      .upload-text {
        font-size: 1.1em;
        font-weight: 500;
      }
      
      .upload-hint {
        font-size: 0.9em;
        color: #666;
      }
      
      .file-info {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 4px;
      }
      
      .segments-list {
        margin: 20px 0;
      }
      
      .segment-cards {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .segment-card {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background: white;
      }
      
      .segment-color {
        width: 40px;
        height: 40px;
        border-radius: 4px;
      }
      
      .segment-info {
        flex: 1;
      }
      
      .segment-info h4 {
        margin: 0 0 5px 0;
      }
      
      .segment-info p {
        margin: 2px 0;
        font-size: 0.9em;
        color: #666;
      }
      
      .segment-actions {
        display: flex;
        gap: 5px;
      }
      
      .btn-icon {
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 1.2em;
      }
      
      .btn-icon:hover {
        background: #f0f0f0;
      }
      
      .import-strategy {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin: 20px 0;
      }
      
      .radio-option {
        display: flex;
        align-items: start;
        gap: 15px;
        padding: 15px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .radio-option:hover {
        border-color: #2196F3;
        background: #f0f8ff;
      }
      
      .radio-option input[type="radio"] {
        margin-top: 3px;
      }
      
      .option-content strong {
        display: block;
        margin-bottom: 5px;
      }
      
      .option-content p {
        margin: 0;
        color: #666;
        font-size: 0.9em;
      }
      
      .segment-selection {
        margin-top: 30px;
      }
      
      .segment-checkboxes {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
      }
      
      .checkbox-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .metadata-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .metadata-section {
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .metadata-section h4 {
        margin-top: 0;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
      }
      
      .form-control {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1em;
      }
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      
      .checkbox-inline {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-right: 20px;
      }
      
      .import-summary {
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .route-summary {
        padding: 10px;
        background: white;
        border-radius: 4px;
        margin-bottom: 10px;
      }
      
      .route-summary p {
        margin: 5px 0;
      }
      
      .modal-footer {
        padding: 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      
      .btn-primary,
      .btn-secondary {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 1em;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .btn-primary {
        background: #2196F3;
        color: white;
      }
      
      .btn-primary:hover:not(:disabled) {
        background: #1976D2;
      }
      
      .btn-primary:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      
      .btn-secondary {
        background: #f0f0f0;
        color: #333;
      }
      
      .btn-secondary:hover {
        background: #e0e0e0;
      }
      
      .warnings {
        margin-top: 15px;
        padding: 10px;
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        border-radius: 4px;
      }
      
      .warnings ul {
        margin: 5px 0 0 20px;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Global variable for access from inline event handlers
window.rdNewImportModal = null;
