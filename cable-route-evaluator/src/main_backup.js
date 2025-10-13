/**
 * ProRail Cable Route Evaluator - Main Entry Point
 * 
 * This application helps cable engineers evaluate high-voltage cable routes
 * against ProRail's EMC standards (RLN00398).
 */

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import esriConfig from "@arcgis/core/config";

import { config } from "./config.js";
import { prorailLayers } from "./layers/layerConfig.js";
import { createFeatureLayersWithHandling } from "./layers/layerFactory.js";
import { EnhancedDrawingManager } from "./utils/EnhancedDrawingManager.js";
import "./style.css";

// Configure ArcGIS API Key
esriConfig.apiKey = config.arcgis.apiKey;

// Log configuration status
console.log('🗺️ ProRail Cable Route Evaluator');
console.log('📍 Spatial Reference:', config.spatialReference.wkid);
console.log('🔑 API Key configured:', !!config.arcgis.apiKey);
console.log('🚂 ProRail Base URL:', config.prorail.baseUrl);

/**
 * Initialize the map with ProRail base layers
 */
function initializeMap() {
  // Create graphics layer for cable routes
  const cableRoutesLayer = new GraphicsLayer({
    id: "cable-routes",
    title: "📍 Cable Routes",
    listMode: "show"
  });

  // Create ProRail infrastructure layers from configuration
  const prorailFeatureLayers = createFeatureLayersWithHandling(
    prorailLayers,
    (layer, config) => {
      // Success callback - query feature count
      layer.queryFeatureCount().then(count => {
        console.log(`   📊 Total features in ${layer.title}: ${count}`);
      }).catch(err => {
        console.log(`   ⚠️ Could not count features:`, err.message);
      });
    },
    (layer, config, error) => {
      // Error callback
      console.error(`Failed to load ${config.title}:`, error);
    }
  );

  // Extract specific layers for reference (optional)
  const railwayTracksLayer = prorailFeatureLayers.find(l => l.customId === 'prorail-tracks');
  const trackSectionsLayer = prorailFeatureLayers.find(l => l.customId === 'prorail-track-sections');
  const stationsLayer = prorailFeatureLayers.find(l => l.customId === 'prorail-stations');

  // Create the map - using streets basemap which works better globally
  const map = new Map({
    basemap: "streets-vector",
    layers: [
      ...prorailFeatureLayers, // Add all ProRail layers
      cableRoutesLayer // Cable routes on top
    ]
  });

  // Create the map view with WGS84 (standard web mercator)
  // This ensures basemap tiles load properly
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [5.2913, 52.1326], // WGS84 coordinates [lon, lat] for Utrecht
    zoom: 12, // Closer zoom to see railway details
    constraints: {
      rotationEnabled: false
    }
  });

  // Add sketch widget for drawing cable routes
  const drawingManager = new EnhancedDrawingManager(
    view, 
    cableRoutesLayer, 
    railwayTracksLayer
  );

  // Override drawing manager callbacks for UI integration
  drawingManager.updateDrawingUI = (message) => {
    updateDrawingStatus(message);
  };

  drawingManager.onRouteCreated = (routeData) => {
    addRouteToList(routeData);
    updateRouteCount();
  };

  drawingManager.onRouteDeleted = (routeId) => {
    removeRouteFromList(routeId);
    updateRouteCount();
  };

  drawingManager.onRouteSelected = (routeData) => {
    selectRouteInList(routeData.id);
    showRouteDetails(routeData);
  };

  // Add layer list widget (expanded by default for visibility)
  const layerList = new LayerList({
    view: view,
    listItemCreatedFunction: (event) => {
      const item = event.item;
      // Don't show legend for graphics layer
      if (item.layer.type !== "graphics") {
        item.panel = {
          content: "legend",
          open: false
        };
      }
    }
  });

  const layerListExpand = new Expand({
    view: view,
    content: layerList,
    expanded: true, // Open by default so it's visible
    expandTooltip: "Layer List - Toggle ProRail Layers"
  });

  view.ui.add(layerListExpand, "top-right");

  // Add drawing controls widget
  const drawingControls = createDrawingControlsWidget(drawingManager);
  const drawingExpand = new Expand({
    view: view,
    content: drawingControls,
    expanded: false,
    expandTooltip: "Drawing Tools"
  });

  view.ui.add(drawingExpand, "top-right");

  // Set up initial extent to Netherlands
  view.when(() => {
    console.log('✅ Map view loaded');
    console.log('📐 View spatial reference:', view.spatialReference.wkid);
    console.log('📍 View center:', `Lon: ${view.center.longitude.toFixed(4)}, Lat: ${view.center.latitude.toFixed(4)}`);
    console.log('🔍 View zoom:', view.zoom);
    console.log('🗺️ View extent:', {
      xmin: view.extent.xmin.toFixed(2),
      ymin: view.extent.ymin.toFixed(2),
      xmax: view.extent.xmax.toFixed(2),
      ymax: view.extent.ymax.toFixed(2)
    });
    
    // Check if basemap loaded
    if (map.basemap) {
      console.log('✅ Basemap loaded:', map.basemap.title);
      console.log('🎨 Basemap layers:', map.basemap.baseLayers.length);
    }
    
    // Check all ProRail layers
    console.log('🚂 Loading ProRail layers...');
    const prorailLayers = map.layers.filter(l => l.url && l.url.includes('ProRail_basiskaart'));
    console.log(`📊 Found ${prorailLayers.length} ProRail layers`);
    
    prorailLayers.forEach(layer => {
      layer.when(() => {
        console.log(`✅ ${layer.title} loaded - visible: ${layer.visible}`);
        
        // Query to count features in view extent
        layer.queryFeatureCount({
          geometry: view.extent,
          spatialRelationship: "intersects"
        }).then(count => {
          console.log(`   📍 Features in view: ${count}`);
        }).catch(err => {
          console.log(`   ⚠️ Could not count features:`, err.message);
        });
      }).catch(error => {
        console.error(`❌ ${layer.title} error:`, error);
      });
    });
  }).catch((error) => {
    console.error('❌ Map view initialization error:', error);
  });

  // Handle sketch events
  sketch.on("create", (event) => {
    if (event.state === "complete") {
      console.log('✏️ Route created:', event.graphic);
      handleNewRoute(event.graphic);
    }
  });

  sketch.on("update", (event) => {
    if (event.state === "complete") {
      console.log('🔄 Route updated:', event.graphics);
      event.graphics.forEach(graphic => handleRouteUpdate(graphic));
    }
  });

  // Handle errors
  view.on("error", (error) => {
    console.error('❌ Map error:', error);
  });

  return { 
    map, 
    view, 
    sketch, 
    cableRoutesLayer,
    railwayTracksLayer,
    trackSectionsLayer,
    stationsLayer
  };
}

/**
 * Create drawing controls widget
 */
function createDrawingControlsWidget(drawingManager) {
  const container = document.createElement('div');
  container.className = 'drawing-controls';
  container.innerHTML = `
    <div style="padding: 15px; background: white; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h4 style="margin: 0 0 10px 0; color: #0079c1;">🎨 Drawing Tools</h4>
      
      <button id="start-drawing" class="draw-btn draw-btn-primary" title="Start drawing a new route">
        ✏️ Draw New Route
      </button>
      
      <button id="cancel-drawing" class="draw-btn draw-btn-secondary" disabled title="Cancel current drawing">
        ❌ Cancel
      </button>
      
      <hr style="margin: 12px 0; border: none; border-top: 1px solid #eee;">
      
      <div class="drawing-options">
        <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
          <input type="checkbox" id="enable-snapping" checked style="margin-right: 8px;">
          <span style="font-size: 14px;">📍 Snap to railway tracks</span>
        </label>
        
        <div style="margin-bottom: 8px;">
          <label style="font-size: 12px; color: #666; display: block; margin-bottom: 4px;">Snap tolerance:</label>
          <input type="range" id="snap-tolerance" min="5" max="100" value="25" 
                 style="width: 100%;" title="Snap tolerance in meters">
          <span id="tolerance-value" style="font-size: 11px; color: #888;">25m</span>
        </div>
      </div>
      
      <div id="drawing-status" style="
        margin-top: 12px; 
        padding: 8px; 
        background: #f5f5f5; 
        border-radius: 4px; 
        font-size: 12px; 
        color: #666;
        min-height: 20px;
      ">
        Ready to draw
      </div>
    </div>
  `;
  
  // Event handlers
  const startBtn = container.querySelector('#start-drawing');
  const cancelBtn = container.querySelector('#cancel-drawing');
  const snapCheckbox = container.querySelector('#enable-snapping');
  const toleranceSlider = container.querySelector('#snap-tolerance');
  const toleranceValue = container.querySelector('#tolerance-value');
  
  startBtn.addEventListener('click', () => {
    drawingManager.startDrawing();
    startBtn.disabled = true;
    cancelBtn.disabled = false;
  });
  
  cancelBtn.addEventListener('click', () => {
    drawingManager.cancelDrawing();
    startBtn.disabled = false;
    cancelBtn.disabled = true;
  });
  
  snapCheckbox.addEventListener('change', () => {
    drawingManager.toggleSnapping();
  });
  
  toleranceSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    drawingManager.setSnapTolerance(parseInt(value));
    toleranceValue.textContent = `${value}m`;
  });
  
  return container;
}

/**
 * Update drawing status in UI
 */
function updateDrawingStatus(message) {
  const statusElement = document.querySelector('#drawing-status');
  if (statusElement) {
    statusElement.textContent = message;
  }
}

/**
 * Handle new route creation - updated for enhanced drawing
 */
function addRouteToList(routeData) {
  const routesContainer = document.getElementById('routes');
  const routeId = routeData.id;
  const routeName = routeData.name || "Unnamed Route";
  
  const routeItem = document.createElement('div');
  routeItem.className = 'route-item';
  routeItem.id = `route-${routeId}`;
  routeItem.innerHTML = `
    <div class="route-name">${routeName}</div>
    <div class="route-meta" style="font-size: 0.8rem; color: #666; margin-top: 4px;">
      Length: ${routeData.length ? `${(routeData.length/1000).toFixed(2)} km` : 'Unknown'}<br>
      Created: ${new Date(routeData.created).toLocaleString('nl-NL')}
    </div>
    <div class="route-actions" style="margin-top: 6px;">
      <button onclick="selectRoute('${routeId}')" class="route-action-btn">Select</button>
      <button onclick="deleteRoute('${routeId}')" class="route-action-btn route-delete">Delete</button>
    </div>
  `;
  
  routeItem.addEventListener('click', (e) => {
    if (!e.target.classList.contains('route-action-btn')) {
      selectRoute(routeId);
    }
  });
  
  routesContainer.appendChild(routeItem);
}

/**
 * Handle route deletion
 */
function removeRouteFromList(routeId) {
  const routeElement = document.getElementById(`route-${routeId}`);
  if (routeElement) {
    routeElement.remove();
  }
}

/**
 * Select a route in the UI
 */
function selectRouteInList(routeId) {
  // Remove active class from all routes
  document.querySelectorAll('.route-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to selected route
  const routeElement = document.getElementById(`route-${routeId}`);
  if (routeElement) {
    routeElement.classList.add('active');
  }
}

/**
 * Show route details in results panel
 */
function showRouteDetails(routeData) {
  const resultsPanel = document.getElementById('results');
  resultsPanel.innerHTML = `
    <div style="padding: 15px;">
      <h4 style="margin: 0 0 10px 0; color: #0079c1;">${routeData.name}</h4>
      <div class="route-detail">
        <strong>Length:</strong> ${(routeData.length/1000).toFixed(2)} km
      </div>
      <div class="route-detail">
        <strong>Points:</strong> ${routeData.points}
      </div>
      <div class="route-detail">
        <strong>Created:</strong> ${new Date(routeData.created).toLocaleString('nl-NL')}
      </div>
      <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
        <em>Compliance evaluation will be available in Phase 5</em>
      </div>
    </div>
  `;
}

/**
 * Update route count in UI
 */
function updateRouteCount() {
  const routesContainer = document.getElementById('routes');
  const count = routesContainer.children.length;
  // Update could be shown in header or status bar
}

/**
 * Set up UI event listeners
 */
function setupUI(drawingManager) {
  const drawBtn = document.getElementById('drawBtn');
  const importBtn = document.getElementById('importBtn');
  
  drawBtn.addEventListener('click', () => {
    console.log('🖊️ Starting route drawing via UI button...');
    drawingManager.startDrawing();
  });
  
  importBtn.addEventListener('click', () => {
    console.log('📁 Import route (not yet implemented)');
    alert('Import functionality coming in Phase 3.4!');
  });
}

// Global functions for route management (called from HTML)
window.selectRoute = function(routeId) {
  const { drawingManager } = window.app;
  drawingManager.selectRoute(routeId);
};

window.deleteRoute = function(routeId) {
  if (confirm('Are you sure you want to delete this route?')) {
    const { drawingManager } = window.app;
    drawingManager.deleteRoute(routeId);
  }
};

/**
 * Display initial instructions
 */
function showWelcomeMessage() {
  const resultsPanel = document.getElementById('results');
  resultsPanel.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #666;">
      <p style="margin-bottom: 10px;">👋 Welcome!</p>
      <p style="font-size: 0.9rem;">
        Click "Draw New Route" to start evaluating cable routes against ProRail EMC standards.
      </p>
    </div>
  `;
}

// Initialize the application
console.log('🚀 Initializing application...');

const { map, view, drawingManager, cableRoutesLayer } = initializeMap();
setupUI(drawingManager);
showWelcomeMessage();

console.log('✅ Application ready');

// Export for debugging
window.app = { map, view, drawingManager, cableRoutesLayer, config };
