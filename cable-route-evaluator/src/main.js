/**
 * ProRail Cable Route Evaluator - Main Entry Point
 * 
 * This application helps cable engineers evaluate high-voltage cable routes
 * against ProRail's EMC standards (RLN00398).
 */

import EsriMap from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import esriConfig from "@arcgis/core/config";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";

import { config } from "./config.js";
import { 
  prorailLayers, 
  structuresBuildingsLayers, 
  energySupplyLayers,
  trainProtectionLayers,
  cableSituationLayers,
  otherTrackObjectsLayers,
  trackAssetDistancesLayers
} from "./layers/layerConfig.js";
import { createFeatureLayersWithHandling } from "./layers/layerFactory.js";
import { EnhancedDrawingManager } from "./utils/EnhancedDrawingManager.js";
import { getCurrentLanguage, setCurrentLanguage, t, updateTranslations } from "./i18n/translations.js";
import { evaluateRoute } from "./utils/emcEvaluator.js";
import {
  createBuffer,
  createBufferGraphic,
  calculateMinimumDistance
} from "./utils/bufferVisualizer.js";
import {
  performCompleteSpatialAnalysis,
  getLayerById
} from "./utils/spatialQueries.js";
import {
  calculateChainage,
  findNearestTrack,
  createPointData,
  addPoint,
  removePoint,
  getPointsForRoute,
  getMinimumDistanceForType,
  getComplianceSummaryForType,
  createPointGraphic,
  clearPointsForRoute,
  resnapPointsToRoute
} from "./utils/assetPointManager.js";
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
  // Load projection engine for coordinate transformations
  projectOperator.load().then(() => {
    console.log('✅ Projection engine loaded');
  }).catch(err => {
    console.warn('⚠️ Projection engine failed to load:', err);
  });
  
  // Create graphics layer for cable routes
  const cableRoutesLayer = new GraphicsLayer({
    id: "cable-routes",
    title: "📍 Cable Routes",
    listMode: "show"
  });

  // Create graphics layer for joints and earthing points
  const jointsLayer = new GraphicsLayer({
    id: "joints-earthing",
    title: "⚡ Joints & Earthing Points",
    listMode: "show",
    visible: true
  });

  // Create graphics layer for distance annotations
  const distanceAnnotationsLayer = new GraphicsLayer({
    id: "distance-annotations",
    title: "📏 Distance Annotations",
    listMode: "show",
    visible: true
  });

  // Create ProRail infrastructure layers from configuration
  const prorailFeatureLayers = createFeatureLayersWithHandling(
    prorailLayers,
    (layer, config) => {
      // Success callback - query feature count (only for FeatureLayers)
      if (layer.queryFeatureCount) {
        layer.queryFeatureCount().then(count => {
          console.log(`   📊 Total features in ${layer.title}: ${count}`);
        }).catch(err => {
          console.log(`   ⚠️ Could not count features:`, err.message);
        });
      }
    },
    (layer, config, error) => {
      // Error callback
      console.error(`Failed to load ${config.title}:`, error);
    }
  );

  // Create Structures & Buildings layers
  const structuresBuildingsFeatureLayers = createFeatureLayersWithHandling(
    structuresBuildingsLayers,
    (layer, config) => {
      if (layer.queryFeatureCount) {
        layer.queryFeatureCount().then(count => {
          console.log(`   📊 Total features in ${layer.title}: ${count}`);
        }).catch(err => {
          console.log(`   ⚠️ Could not count features:`, err.message);
        });
      }
    },
    (layer, config, error) => {
      console.error(`Failed to load ${config.title}:`, error);
    }
  );

  // Create Energy Supply System layers
  const energySupplyFeatureLayers = createFeatureLayersWithHandling(
    energySupplyLayers,
    (layer, config) => {
      if (layer.queryFeatureCount) {
        layer.queryFeatureCount().then(count => {
          console.log(`   📊 Total features in ${layer.title}: ${count}`);
        }).catch(err => {
          console.log(`   ⚠️ Could not count features:`, err.message);
        });
      }
    },
    (layer, config, error) => {
      console.error(`Failed to load ${config.title}:`, error);
    }
  );

  // Create Train Protection System layers
  const trainProtectionFeatureLayers = createFeatureLayersWithHandling(
    trainProtectionLayers,
    (layer, config) => {
      if (layer.queryFeatureCount) {
        layer.queryFeatureCount().then(count => {
          console.log(`   📊 Total features in ${layer.title}: ${count}`);
        }).catch(err => {
          console.log(`   ⚠️ Could not count features:`, err.message);
        });
      }
    },
    (layer, config, error) => {
      console.error(`Failed to load ${config.title}:`, error);
    }
  );

  // Create Cable Situation layers
  const cableSituationFeatureLayers = createFeatureLayersWithHandling(
    cableSituationLayers,
    (layer, config) => {
      if (layer.queryFeatureCount) {
        layer.queryFeatureCount().then(count => {
          console.log(`   📊 Total features in ${layer.title}: ${count}`);
        }).catch(err => {
          console.log(`   ⚠️ Could not count features:`, err.message);
        });
      }
    },
    (layer, config, error) => {
      console.error(`Failed to load ${config.title}:`, error);
    }
  );

  // Create Other Track Objects layers
  const otherTrackObjectsFeatureLayers = createFeatureLayersWithHandling(
    otherTrackObjectsLayers,
    (layer, config) => {
      if (layer.queryFeatureCount) {
        layer.queryFeatureCount().then(count => {
          console.log(`   📊 Total features in ${layer.title}: ${count}`);
        }).catch(err => {
          console.log(`   ⚠️ Could not count features:`, err.message);
        });
      }
    },
    (layer, config, error) => {
      console.error(`Failed to load ${config.title}:`, error);
    }
  );

  // Create Track Asset Distances layers
  const trackAssetDistancesFeatureLayers = createFeatureLayersWithHandling(
    trackAssetDistancesLayers,
    (layer, config) => {
      if (layer.queryFeatureCount) {
        layer.queryFeatureCount().then(count => {
          console.log(`   📊 Total features in ${layer.title}: ${count}`);
        }).catch(err => {
          console.log(`   ⚠️ Could not count features:`, err.message);
        });
      }
    },
    (layer, config, error) => {
      console.error(`Failed to load ${config.title}:`, error);
    }
  );

  // Extract specific layers for reference (optional)
  const railwayTracksLayer = prorailFeatureLayers.find(l => l.customId === 'prorail-tracks');
  const trackSectionsLayer = prorailFeatureLayers.find(l => l.customId === 'prorail-track-sections');
  const switchesLayer = prorailFeatureLayers.find(l => l.customId === 'prorail-switches');
  const stationsLayer = prorailFeatureLayers.find(l => l.customId === 'prorail-stations');

  // Create grouped layers for better organization
  const prorailGroup = new GroupLayer({
    title: "🚂 ProRail Base Infrastructure",
    layers: prorailFeatureLayers,
    visible: true,
    visibilityMode: "independent" // Each sublayer can be toggled independently
  });

  const structuresBuildingsGroup = new GroupLayer({
    title: "🏗️ Structures & Buildings",
    layers: structuresBuildingsFeatureLayers,
    visible: true,
    visibilityMode: "independent"
  });

  const energySupplyGroup = new GroupLayer({
    title: "⚡ Energy Supply System",
    layers: energySupplyFeatureLayers,
    visible: true,
    visibilityMode: "independent"
  });

  const trainProtectionGroup = new GroupLayer({
    title: "🚦 Train Protection System",
    layers: trainProtectionFeatureLayers,
    visible: true,
    visibilityMode: "independent"
  });

  const cableSituationGroup = new GroupLayer({
    title: "🔌 Cable Situation",
    layers: cableSituationFeatureLayers,
    visible: true,
    visibilityMode: "independent"
  });

  const otherTrackObjectsGroup = new GroupLayer({
    title: "🔧 Other Track Objects",
    layers: otherTrackObjectsFeatureLayers,
    visible: true,
    visibilityMode: "independent"
  });

  const trackAssetDistancesGroup = new GroupLayer({
    title: "📏 Track Asset Distances",
    layers: trackAssetDistancesFeatureLayers,
    visible: true,
    visibilityMode: "independent"
  });

  // Create the map - using streets basemap which works better globally
  const map = new EsriMap({
    basemap: "streets-vector",
    layers: [
      prorailGroup, // ProRail base infrastructure
      structuresBuildingsGroup, // Structures & Buildings
      energySupplyGroup, // Energy supply system
      trainProtectionGroup, // Train protection (EMI sensitive!)
      cableSituationGroup, // Existing cables
      otherTrackObjectsGroup, // Other track objects
      trackAssetDistancesGroup, // Track asset distances
      cableRoutesLayer, // User-drawn cable routes
      jointsLayer, // Joints and earthing points
      distanceAnnotationsLayer // Distance measurements on top
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
    console.log('✅ Route created callback:', routeData);
    addRouteToList(routeData);
    updateRouteCount();
    
    // Re-enable drawing buttons
    const startBtn = document.querySelector('#start-drawing');
    const cancelBtn = document.querySelector('#cancel-drawing');
    if (startBtn) startBtn.disabled = false;
    if (cancelBtn) cancelBtn.disabled = true;
    
    updateDrawingStatus(`✅ Route created: ${(routeData.length/1000).toFixed(2)} km`);
  };

  drawingManager.onRouteDeleted = (routeId) => {
    removeRouteFromList(routeId);
    updateRouteCount();
  };

  drawingManager.onRouteSelected = (routeData) => {
    selectRouteInList(routeData.id);
    showRouteDetails(routeData);
  };
  
  drawingManager.onRouteUpdated = async (routeData) => {
    console.log('🔄 Route updated callback:', routeData);
    
    // Clear the compliance data when geometry changes
    if (routeData.compliance) {
      drawingManager.setRouteCompliance(routeData.id, null);
    }
    
    // Re-snap asset points (joints/masts) to the new route geometry
    const points = getPointsForRoute(routeData.id);
    if (points.length > 0) {
      console.log(`🔄 Re-snapping ${points.length} asset point(s) to updated route...`);
      
      try {
        const updatedPoints = await resnapPointsToRoute(
          routeData.id,
          routeData.graphic.geometry,
          drawingManager.railwayTracksLayer
        );
        
        // Update graphics on the map
        const jointsLayer = window.app.jointsLayer;
        if (jointsLayer) {
          // Remove old point graphics for this route
          const oldGraphics = jointsLayer.graphics.filter(g => g.attributes?.routeId === routeData.id);
          jointsLayer.removeMany(oldGraphics.toArray());
          
          // Add updated point graphics
          const newGraphics = updatedPoints.map(point => {
            const graphic = createPointGraphic(point);
            graphic.attributes.routeId = routeData.id;
            return graphic;
          });
          jointsLayer.addMany(newGraphics);
          
          console.log(`✅ Updated ${updatedPoints.length} asset point graphic(s) on map`);
        }
      } catch (error) {
        console.error('❌ Error re-snapping asset points:', error);
      }
    }
    
    // Update route in list
    updateRouteInList(routeData);
    
    // Reset button states
    const startBtn = document.querySelector('#start-drawing');
    const cancelBtn = document.querySelector('#cancel-drawing');
    const finishEditBtn = document.querySelector('#finish-editing');
    const cancelEditBtn = document.querySelector('#cancel-editing');
    
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.style.display = '';
    }
    if (cancelBtn) {
      cancelBtn.disabled = true;
      cancelBtn.style.display = '';
    }
    if (finishEditBtn) finishEditBtn.style.display = 'none';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    
    updateDrawingStatus(`✅ Route updated: ${(routeData.length/1000).toFixed(2)} km`);
    
    // Note: Don't call showRouteDetails here - the auto-evaluation will update the UI
    
    // Auto-evaluate the route after geometry changes
    console.log('🔄 Triggering automatic re-evaluation after route update...');
    setTimeout(() => {
      evaluateRouteCompliance(routeData.id);
    }, 100);
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

      if (item.layer.fullExtent) {
        item.actionsSections = [
          [
            {
              title: "Zoom to layer",
              className: "esri-icon-zoom-in-magnifying-glass",
              id: "zoom-to-layer"
            }
          ]
        ];
      }
    }
  });

  const layerListExpand = new Expand({
    view: view,
    content: layerList,
    expanded: false, // Start collapsed
    expandTooltip: "Layer List - Toggle ProRail Layers"
  });

  view.ui.add(layerListExpand, "top-right");

  layerList.on("trigger-action", (event) => {
    if (event.action.id === "zoom-to-layer") {
      const layer = event.item.layer;
      if (layer.fullExtent) {
        view.goTo(layer.fullExtent.expand(1.2)).catch(err => {
          console.warn("Could not zoom to layer extent:", err);
        });
      }
    }
  });

  /**
   * TEST FUNCTION - Step 1: Buffer Visualization
   * This will create a 20m buffer around the map center for testing
   */
  async function testBufferVisualization(view) {
    console.log("🧪 TEST: Step 1 - Buffer Visualization");
    
    try {
      // Get map center point
      const centerPoint = view.center;
      console.log("📍 Map center:", {
        lon: centerPoint.longitude.toFixed(6),
        lat: centerPoint.latitude.toFixed(6)
      });

      // Create a 20m buffer around the center point
      const buffer = createBuffer(centerPoint, 20);
      
      if (buffer) {
        console.log("✅ Buffer created successfully");
        
        // Create a buffer graphic (warning type - yellow)
        const bufferGraphic = createBufferGraphic(buffer, {
          type: 'warning',
          label: 'Test 20m Buffer',
          attributes: {
            test: true,
            description: 'This is a test buffer at map center'
          }
        });
        
        // Add to cable routes layer (temporary for testing)
        cableRoutesLayer.add(bufferGraphic);
        console.log("✅ Buffer graphic added to map");
        console.log("👁️ You should see a yellow circle around the map center");
        
      } else {
        console.error("❌ Buffer creation failed");
      }
      
    } catch (error) {
      console.error("❌ Test failed:", error);
    }
  }

  /**
   * TEST FUNCTION - Step 2: Joint Marker Visualization
   * This will create test joint markers for visual verification
   */
  function testJointMarkers(view) {
    console.log("🧪 TEST: Step 2 - Joint Marker Visualization");
    
    try {
      // Get map center
      const centerPoint = view.center.clone();
      console.log("📍 Testing asset point markers near map center");
      console.log(`   Coordinates: ${centerPoint.longitude.toFixed(6)}, ${centerPoint.latitude.toFixed(6)}`);

      // Create test joint at center (chainage 0m)
      const pointData1 = createPointData({
        geometry: centerPoint.clone(),
        chainage: 0,
        type: "joint",
        routeId: "test-route",
        distanceToTrack: 45.2, // Simulated distance (compliant)
        nearestTrack: null
      });
      console.log("   ✅ Created joint 1");

      // Create test earthing point 500m east (simulated)
      const midPoint = centerPoint.clone();
      midPoint.longitude += 0.005; // Move east
      
      const pointData2 = createPointData({
        geometry: midPoint,
        chainage: 500,
        type: "earthing",
        routeId: "test-route",
        distanceToTrack: 28.5, // Simulated distance (violation)
        nearestTrack: null
      });
      console.log("   ✅ Created earthing point");

      // Create test mast 1000m east
      const endPoint = centerPoint.clone();
      endPoint.longitude += 0.01; // Move further east
      
      const pointData3 = createPointData({
        geometry: endPoint,
        chainage: 1000,
        type: "mast",
        routeId: "test-route",
        distanceToTrack: 52.0, // Simulated distance (compliant)
        nearestTrack: null
      });
      console.log("   ✅ Created mast");

      // Add points to storage
      addPoint("test-route", pointData1);
      addPoint("test-route", pointData2);
      addPoint("test-route", pointData3);
      console.log("   ✅ Added points to storage");

      // Create graphics and add to layer
      const graphic1 = createPointGraphic(pointData1);
      const graphic2 = createPointGraphic(pointData2);
      const graphic3 = createPointGraphic(pointData3);
      console.log("   ✅ Created graphics");

      jointsLayer.addMany([graphic1, graphic2, graphic3]);
      console.log("   ✅ Added graphics to jointsLayer");
      console.log(`   📊 JointsLayer now has ${jointsLayer.graphics.length} graphics`);

      console.log("✅ Test asset point markers added to map");
      console.log("👁️ You should see:");
      console.log("   🟢 Green joint marker (🔗) at center (0m, compliant)");
      console.log("   🔴 Red earthing marker (⚡) to the east (500m, violation)");
      console.log("   🟢 Green mast marker (🗼) further east (1000m, compliant)");

      // Get summary for joints
      const jointSummary = getComplianceSummaryForType("test-route", "joint");
      console.log("📊 Joint Compliance Summary:", jointSummary);
      
      // Get summary for masts
      const mastSummary = getComplianceSummaryForType("test-route", "mast");
      console.log("📊 Mast Compliance Summary:", mastSummary);

      // Verify layer is visible
      console.log(`   🔍 jointsLayer visible: ${jointsLayer.visible}`);
      console.log(`   🔍 jointsLayer in map: ${map.layers.includes(jointsLayer)}`);

    } catch (error) {
      console.error("❌ Test failed:", error);
      console.error("   Stack:", error.stack);
    }
  }

  // Set up initial extent to Netherlands
  view.when(() => {
    console.log('✅ Map view loaded');
    
    // Remove loading indicator
    const loadingIndicator = document.getElementById('map-loading');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
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
    
    // Show error to user
    const loadingIndicator = document.getElementById('map-loading');
    if (loadingIndicator) {
      loadingIndicator.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #d32f2f;">⚠️ Map Loading Error</h3>
        <p style="color: #666; margin-bottom: 10px;">${error.message || 'Unknown error'}</p>
        <button onclick="location.reload()" style="
          padding: 10px 20px;
          background: #0079c1;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Reload Page</button>
      `;
    }
  });

  // Handle errors
  view.on("error", (error) => {
    console.error('❌ Map error:', error);
  });

  return { 
    map, 
    view, 
    drawingManager,
    cableRoutesLayer,
    jointsLayer,
    distanceAnnotationsLayer,
    railwayTracksLayer,
    trackSectionsLayer,
    switchesLayer,
    stationsLayer
  };
}

/**
 * Create drawing controls widget
 */
/**
 * Update drawing status in UI
 */
function updateDrawingStatus(message) {
  const statusElement = document.querySelector('#drawing-status');
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/[&<>"']/g, (match) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[match] || match;
  });
}

/**
 * Handle new route creation - updated for enhanced drawing
 */
function addRouteToList(routeData) {
  const routesContainer = document.getElementById('routes');
  const routeId = routeData.id;
  
  // Hide "no routes" message
  const noRoutesMsg = document.getElementById('no-routes-message');
  if (noRoutesMsg) noRoutesMsg.style.display = 'none';
  
  // Prompt for route name
  let routeName = prompt('Enter a name for this route:', routeData.name);
  if (!routeName || routeName.trim() === '') {
    routeName = routeData.name;
  } else {
    // Update route data with new name
    routeData.name = routeName.trim();
    const route = window.app.drawingManager.getRoute(routeId);
    if (route) {
      route.name = routeName.trim();
      route.graphic.attributes.name = routeName.trim();
    }
  }
  
  // Get the current route color (default to red for active routes)
  const route = window.app.drawingManager.getRoute(routeId);
  const currentColor = route ? route.color : '#ff0000';
  const description = route ? route.description || '' : '';
  const metadata = route ? (route.metadata || {}) : {};
  const infrastructureType = metadata.infrastructureType || 'cable';
  const voltageValue = metadata.voltageKv !== null && metadata.voltageKv !== undefined ? metadata.voltageKv : '';
  const faultClearingValue = metadata.faultClearingTimeMs !== null && metadata.faultClearingTimeMs !== undefined ? metadata.faultClearingTimeMs : '';
  const electrifiedSystem = metadata.electrifiedSystem || 'standard';
  const minJointValue = metadata.minJointDistanceMeters !== null && metadata.minJointDistanceMeters !== undefined ? metadata.minJointDistanceMeters : '';
  
  // Get translations for visibility button
  const hideRouteText = t('hideRoute');
  const hideRouteTooltip = t('hideRouteTooltip');
  
  const routeItem = document.createElement('div');
  routeItem.className = 'route-item';
  routeItem.id = `route-${routeId}`;
  routeItem.innerHTML = `
    <div class="route-header" style="display: flex; align-items: center; gap: 12px; padding: 12px; cursor: pointer; border-radius: 8px; transition: background-color 0.2s;" 
         onclick="toggleRouteCollapse('${routeId}')"
         onmouseover="this.style.backgroundColor='#f8f9fa'"
         onmouseout="this.style.backgroundColor='transparent'">
      <div class="trace-indicator" 
           id="trace-${routeId}"
           style="width: 8px; height: 40px; border-radius: 4px; background: ${currentColor}; flex-shrink: 0;"
           title="Route color">
      </div>
      <div style="flex: 1; min-width: 0;">
        <input type="text" 
               id="name-${routeId}" 
               class="route-name-input"
               value="${routeName}"
               onclick="event.stopPropagation();"
               onblur="updateRouteName('${routeId}', this.value)"
               onkeypress="if(event.key === 'Enter') { this.blur(); }"
               style="font-weight: 600; font-size: 0.9375rem; color: #1a1a1a; border: none; background: transparent; width: 100%; padding: 4px 8px; border-radius: 4px; transition: all 0.2s; outline: none;"
               onfocus="this.style.background='white'; this.style.boxShadow='0 0 0 2px #e0e0e0';"
               onblur="this.style.background='transparent'; this.style.boxShadow='none'; updateRouteName('${routeId}', this.value);"
               title="Click to edit route name" />
        <div style="font-size: 0.75rem; color: #666; margin-top: 2px; padding-left: 8px;">
          <span id="route-length-${routeId}">${routeData.length ? `${(routeData.length/1000).toFixed(2)} km` : 'Unknown'}</span>
          <span style="margin: 0 6px; color: #ccc;">•</span>
          <span id="route-points-${routeId}">${routeData.points || 0} points</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="visibility-btn-${routeId}" 
                onclick="toggleRouteVisibility('${routeId}'); event.stopPropagation();" 
                style="background: none; border: none; cursor: pointer; font-size: 1.125rem; padding: 6px; display: flex; align-items: center; justify-content: center; color: #666; transition: all 0.2s; border-radius: 4px; width: 32px; height: 32px;"
                onmouseover="this.style.backgroundColor='#f0f0f0'; this.style.color='#000'"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='#666'"
                title="${hideRouteTooltip}">
          👁️
        </button>
        <span id="collapse-icon-${routeId}" style="font-size: 0.75rem; color: #999; transition: transform 0.2s; width: 16px; text-align: center;" title="Expand/Collapse">▼</span>
      </div>
    </div>
    
    <div id="route-collapsible-${routeId}" class="route-collapsible-content" style="padding: 0 12px 12px 12px;">
      
      <!-- Quick Info -->
      <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 0.8125rem;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div>
            <div style="color: #999; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Created</div>
            <div style="color: #1a1a1a; font-weight: 500;">${new Date(routeData.created).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</div>
          </div>
          <div>
            <div style="color: #999; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Type</div>
            <div style="color: #1a1a1a; font-weight: 500;">${infrastructureType === 'cable' ? 'Cable' : 'Overhead'}</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; color: #666; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; font-weight: 600;">Description</label>
        <textarea id="desc-${routeId}" 
                  class="route-desc-input"
                  placeholder="Add a description..."
                  style="width: 100%; min-height: 60px; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 0.8125rem; resize: vertical; font-family: inherit; background: white; color: #1a1a1a; transition: all 0.2s; line-height: 1.5; outline: none;"
                  onfocus="this.style.borderColor='#000'; this.style.boxShadow='0 0 0 3px rgba(0,0,0,0.05)'"
                  onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'"
                  onchange="updateRouteDescription('${routeId}', this.value)">${description}</textarea>
      </div>
    
      <!-- EMC Parameters -->
      <div style="margin-bottom: 16px;" onclick="event.stopPropagation();">
        <div style="color: #666; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; font-weight: 600;">EMC Parameters</div>
        <div style="display: grid; gap: 12px;">
          <label style="font-size: 0.8125rem; display: flex; flex-direction: column; gap: 6px;">
            <span style="font-weight: 500; color: #444; font-size: 0.75rem;">Infrastructure type</span>
            <select style="padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 0.8125rem; background: white; color: #1a1a1a; transition: all 0.2s; outline: none; cursor: pointer;"
                    onfocus="this.style.borderColor='#000'; this.style.boxShadow='0 0 0 3px rgba(0,0,0,0.05)'"
                    onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'"
                    onchange="updateRouteMetadataField('${routeId}', 'infrastructureType', this.value);"
                    onclick="event.stopPropagation();">
              <option value="cable" ${infrastructureType === 'cable' ? 'selected' : ''}>High-voltage cable</option>
              <option value="overhead" ${infrastructureType === 'overhead' ? 'selected' : ''}>Overhead line</option>
            </select>
          </label>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <label style="font-size: 0.8125rem; display: flex; flex-direction: column; gap: 6px;">
              <span style="font-weight: 500; color: #444; font-size: 0.75rem;">Voltage (kV)</span>
              <input type="number" min="0" step="1" value="${voltageValue !== '' ? voltageValue : ''}"
                     placeholder="110"
                     style="padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 0.8125rem; color: #1a1a1a; transition: all 0.2s; outline: none;"
                     onfocus="this.style.borderColor='#000'; this.style.boxShadow='0 0 0 3px rgba(0,0,0,0.05)'"
                     onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'"
                     onchange="updateRouteMetadataField('${routeId}', 'voltageKv', this.value);"
                     onclick="event.stopPropagation();" />
            </label>
            <label style="font-size: 0.8125rem; display: flex; flex-direction: column; gap: 6px;">
              <span style="font-weight: 500; color: #444; font-size: 0.75rem;">Clearing (ms)</span>
              <input type="number" min="0" step="1" value="${faultClearingValue !== '' ? faultClearingValue : ''}"
                     placeholder="100"
                     style="padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 0.8125rem; color: #1a1a1a; transition: all 0.2s; outline: none;"
                     onfocus="this.style.borderColor='#000'; this.style.boxShadow='0 0 0 3px rgba(0,0,0,0.05)'"
                     onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'"
                     onchange="updateRouteMetadataField('${routeId}', 'faultClearingTimeMs', this.value);"
                     onclick="event.stopPropagation();" />
            </label>
          </div>
          
          <label style="font-size: 0.8125rem; display: flex; flex-direction: column; gap: 6px;">
            <span style="font-weight: 500; color: #444; font-size: 0.75rem;">Electrified system</span>
            <select style="padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 0.8125rem; background: white; color: #1a1a1a; transition: all 0.2s; outline: none; cursor: pointer;"
                    onfocus="this.style.borderColor='#000'; this.style.boxShadow='0 0 0 3px rgba(0,0,0,0.05)'"
                    onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'"
                    onchange="updateRouteMetadataField('${routeId}', 'electrifiedSystem', this.value);"
                    onclick="event.stopPropagation();">
              <option value="standard" ${electrifiedSystem === 'standard' ? 'selected' : ''}>Standard</option>
              <option value="25kv_50hz" ${electrifiedSystem === '25kv_50hz' ? 'selected' : ''}>25 kV / 50 Hz</option>
            </select>
          </label>
          
          <label style="font-size: 0.8125rem; display: flex; flex-direction: column; gap: 6px;">
            <span style="font-weight: 500; color: #444; font-size: 0.75rem;">Min. joint distance (m)</span>
            <input type="number" min="0" step="1" value="${minJointValue !== '' ? minJointValue : ''}"
                   placeholder="31"
                   style="padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 0.8125rem; color: #1a1a1a; transition: all 0.2s; outline: none;"
                   onfocus="this.style.borderColor='#000'; this.style.boxShadow='0 0 0 3px rgba(0,0,0,0.05)'"
                   onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'"
                   onchange="updateRouteMetadataField('${routeId}', 'minJointDistanceMeters', this.value);"
                   onclick="event.stopPropagation();" />
          </label>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.8125rem; color: #444; padding: 6px; border-radius: 4px; transition: background 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'"
                 onmouseout="this.style.backgroundColor='transparent'">
            <input type="checkbox" ${metadata.hasDoubleGuying ? 'checked' : ''}
                   style="width: 18px; height: 18px; cursor: pointer; accent-color: #000;"
                   onchange="updateRouteMetadataField('${routeId}', 'hasDoubleGuying', this.checked);"
                   onclick="event.stopPropagation();" />
            <span>Double guying confirmed</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.8125rem; color: #444; padding: 6px; border-radius: 4px; transition: background 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'"
                 onmouseout="this.style.backgroundColor='transparent'">
            <input type="checkbox" ${metadata.hasBoredCrossing ? 'checked' : ''}
                   style="width: 18px; height: 18px; cursor: pointer; accent-color: #000;"
                   onchange="updateRouteMetadataField('${routeId}', 'hasBoredCrossing', this.checked);"
                   onclick="event.stopPropagation();" />
            <span>Insulated conduit (bored crossing)</span>
          </label>
        </div>
      </div>

      <!-- Compliance Panel -->
      <div id="route-compliance-${routeId}" class="route-compliance-panel" style="margin-bottom: 16px;"></div>

      <!-- Action Buttons -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <button onclick="evaluateRouteCompliance('${routeId}'); event.stopPropagation();" 
                class="route-action-btn" 
                style="grid-column: span 2; background: #000; color: white; padding: 12px; border-radius: 6px; border: none; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" 
                onmouseover="this.style.background='#333'"
                onmouseout="this.style.background='#000'"
                title="Run EMC evaluation">
          ⚡ Evaluate Compliance
        </button>
        <button onclick="toggleRouteEditMenu('${routeId}'); event.stopPropagation();" 
                class="route-action-btn" 
                style="background: white; color: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s;" 
                onmouseover="this.style.background='#f8f9fa'; this.style.borderColor='#000'"
                onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'"
                title="Edit route">
          ✏️ Edit
        </button>
        <button onclick="changeRouteColor('${routeId}'); event.stopPropagation();" 
                class="route-action-btn" 
                style="background: white; color: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s;" 
                onmouseover="this.style.background='#f8f9fa'; this.style.borderColor='#000'"
                onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'"
                title="Change color">
          🎨 Style
        </button>
      </div>
      
      <button onclick="deleteRoute('${routeId}'); event.stopPropagation();" 
              class="route-action-btn route-delete" 
              style="width: 100%; background: white; color: #dc2626; padding: 10px; border-radius: 6px; border: 1px solid #fee2e2; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s;" 
              onmouseover="this.style.background='#fef2f2'; this.style.borderColor='#dc2626'"
              onmouseout="this.style.background='white'; this.style.borderColor='#fee2e2'"
              title="Delete this route">
        🗑️ Delete Route
      </button>
      
      <!-- Edit Menu (Hidden by default) -->
      <div id="edit-menu-${routeId}" class="route-edit-menu" style="display: none; margin-top: 12px; padding: 12px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e0e0e0;">
        <div style="font-size: 0.6875rem; font-weight: 600; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Edit Options</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <button onclick="editRoute('${routeId}')" 
                  class="route-action-btn" 
                  style="background: white; color: #1a1a1a; padding: 10px 12px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.8125rem; text-align: left; cursor: pointer; transition: all 0.2s;" 
                  onmouseover="this.style.background='#fff'; this.style.borderColor='#000'"
                  onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'"
                  title="Edit waypoints">
            ✏️ Edit Waypoints
          </button>
          <button onclick="extendRouteStart('${routeId}')" 
                  class="route-action-btn" 
                  style="background: white; color: #1a1a1a; padding: 10px 12px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.8125rem; text-align: left; cursor: pointer; transition: all 0.2s;" 
                  onmouseover="this.style.background='#fff'; this.style.borderColor='#000'"
                  onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'"
                  title="Add points to start">
            ⬅️ Extend from Start
          </button>
          <button onclick="extendRouteEnd('${routeId}')" 
                  class="route-action-btn" 
                  style="background: white; color: #1a1a1a; padding: 10px 12px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.8125rem; text-align: left; cursor: pointer; transition: all 0.2s;" 
                  onmouseover="this.style.background='#fff'; this.style.borderColor='#000'"
                  onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'"
                  title="Add points to end">
            ➡️ Extend from End
          </button>
          <button id="mark-joints-btn-${routeId}" 
                  onclick="toggleJointMarking('${routeId}')" 
                  class="route-action-btn" 
                  style="background: #2196f3; color: white; padding: 10px 12px; border-radius: 6px; border: none; font-size: 0.8125rem; text-align: left; cursor: pointer; transition: all 0.2s; font-weight: 500;" 
                  onmouseover="this.style.background='#1976d2'"
                  onmouseout="this.style.background='#2196f3'"
                  title="Mark joints and earthing points">
            ⚡ Mark Joints/Earthing
          </button>
        </div>
      </div>
    </div>
  `;
  
  routesContainer.appendChild(routeItem);
  updateRouteComplianceUI(routeId);
  evaluationUIState.runningRouteIds.delete(routeId);
  ensureEvaluationErrorsMap().delete(routeId);
  evaluationUIState.expandedRouteIds.delete(routeId);
  renderEvaluationReports();
}

/**
 * Update route in the list after editing
 */
function updateRouteInList(routeData) {
  const routeElement = document.getElementById(`route-${routeData.id}`);
  if (!routeElement) {
    console.warn('Route element not found for update:', routeData.id);
    return;
  }
  
  // Remove editing controls if they exist
  const editingControls = routeElement.querySelector('.editing-controls');
  if (editingControls) {
    editingControls.remove();
  }
  
  // Close edit menu if open
  const editMenu = routeElement.querySelector('.route-edit-menu');
  if (editMenu) {
    editMenu.style.display = 'none';
  }
  
  // Update length display
  const lengthDisplay = document.getElementById(`route-length-${routeData.id}`);
  if (lengthDisplay) {
    lengthDisplay.textContent = routeData.length ? `${(routeData.length/1000).toFixed(2)} km` : 'Unknown';
  }
  
  // Update points display
  const pointsDisplay = document.getElementById(`route-points-${routeData.id}`);
  if (pointsDisplay) {
    pointsDisplay.textContent = routeData.points || 0;
  }
  
  // Update trace indicator color if it exists
  const traceIndicator = routeElement.querySelector('.trace-indicator');
  if (traceIndicator && routeData.color) {
    traceIndicator.style.background = routeData.color;
  }
  
  // Update compliance UI - this will show "not evaluated" if compliance was cleared
  updateRouteComplianceUI(routeData.id);
  
  // Note: renderEvaluationReports will be called after auto-evaluation completes
  
  // Add a subtle flash effect to show it was updated
  routeElement.style.transition = 'background-color 0.3s ease';
  routeElement.style.backgroundColor = '#fafafa';
  setTimeout(() => {
    routeElement.style.backgroundColor = '';
  }, 1000);
}

/**
 * Handle route deletion
 */
function removeRouteFromList(routeId) {
  const routeElement = document.getElementById(`route-${routeId}`);
  if (routeElement) {
    routeElement.remove();
  }
  
  // Show "no routes" message if no routes remain
  const routesContainer = document.getElementById('routes');
  const noRoutesMsg = document.getElementById('no-routes-message');
  if (routesContainer && noRoutesMsg && routesContainer.children.length === 0) {
    noRoutesMsg.style.display = 'block';
  }

  evaluationUIState.expandedRouteIds.delete(routeId);
  evaluationUIState.runningRouteIds.delete(routeId);
  ensureEvaluationErrorsMap().delete(routeId);
  renderEvaluationReports();
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

const evaluationUIState = {
  expandedRouteIds: new Set(),
  runningRouteIds: new Set(),
  errors: new Map()
};

// Joint marking state
const jointMarkingState = {
  isActive: false,
  activeRouteId: null,
  clickHandler: null,
  selectedType: 'joint' // 'joint' or 'earthing'
};

function ensureEvaluationErrorsMap() {
  if (!(evaluationUIState.errors instanceof Map) || typeof evaluationUIState.errors.clear !== 'function' || typeof evaluationUIState.errors.delete !== 'function') {
    evaluationUIState.errors = new Map();
  }
  return evaluationUIState.errors;
}

function renderComplianceStatusBadge(status) {
  const styles = {
    pass: {
      text: 'Compliant',
      icon: '✅',
      color: '#2e7d32',
      background: '#e8f5e9',
      border: '#2e7d32'
    },
    fail: {
      text: 'Non-compliant',
      icon: '❌',
      color: '#c62828',
      background: '#ffebee',
      border: '#c62828'
    },
    incomplete: {
      text: 'Partial',
      icon: '⚠️',
      color: '#f57c00',
      background: '#fff3e0',
      border: '#f57c00'
    },
    not_evaluated: {
      text: 'Not evaluated',
      icon: '⏳',
      color: '#616161',
      background: '#f5f5f5',
      border: '#bdbdbd'
    }
  };

  const style = styles[status] || styles.not_evaluated;
  return `
    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; padding: 4px 10px; border-radius: 999px; color: ${style.color}; background: ${style.background}; border: 1px solid ${style.border};">
      ${style.icon} ${style.text}
    </span>
  `;
}

function buildEvaluationDetailHtml(route) {
  if (!route) {
    return '';
  }

  const metadata = route.metadata || {};
  const compliance = route.compliance || null;
  const summary = compliance?.summary || null;
  const status = summary?.status || 'not_evaluated';
  const countsText = summary
    ? `Pass ${summary.passCount ?? 0} · Fail ${summary.failCount ?? 0} · Pending ${summary.pendingCount ?? 0}`
    : 'Compliance has not been evaluated yet.';
  const evaluatedText = summary?.evaluatedAt
    ? new Date(summary.evaluatedAt).toLocaleString('nl-NL')
    : null;

  const lengthText = route.length ? `${(route.length/1000).toFixed(2)} km` : 'Unknown';
  const pointsText = route.points ?? 0;
  const createdText = route.created ? new Date(route.created).toLocaleString('nl-NL') : 'Unknown';
  const infrastructureLabel = metadata.infrastructureType
    ? metadata.infrastructureType.charAt(0).toUpperCase() + metadata.infrastructureType.slice(1)
    : 'Unknown';
  const voltageText = metadata.voltageKv !== undefined && metadata.voltageKv !== null
    ? `${metadata.voltageKv} kV`
    : 'Unknown';
  const faultClearingText = metadata.faultClearingTimeMs !== undefined && metadata.faultClearingTimeMs !== null
    ? `${metadata.faultClearingTimeMs} ms`
    : 'Not documented';
  const jointDistanceText = metadata.minJointDistanceMeters !== undefined && metadata.minJointDistanceMeters !== null
    ? `${metadata.minJointDistanceMeters} m`
    : 'Not documented';
  const boolToText = (value) => (value === true ? 'Yes' : value === false ? 'No' : 'Not provided');

  const rules = compliance?.rules || [];
  const ruleStatusStyles = {
    pass: { label: 'Pass', color: '#2e7d32', icon: '✅' },
    fail: { label: 'Fail', color: '#c62828', icon: '❌' },
    not_evaluated: { label: 'Pending', color: '#f57c00', icon: '⏳' },
    not_applicable: { label: 'N/A', color: '#616161', icon: '•' }
  };

  let rulesTable = `
    <p style="margin: 0; font-size: 0.8rem; color: #666;">Run the evaluator to generate rule-by-rule results.</p>
  `;

  if (summary) {
    if (rules.length) {
      rulesTable = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.78rem;">
          <thead>
            <tr style="text-align: left; color: #666;">
              <th style="padding: 8px 6px; border-bottom: 1px solid #e5e5e5;">Rule</th>
              <th style="padding: 8px 6px; border-bottom: 1px solid #e5e5e5; width: 110px;">Status</th>
              <th style="padding: 8px 6px; border-bottom: 1px solid #e5e5e5;">Details</th>
            </tr>
          </thead>
          <tbody>
            ${rules.map(rule => {
              const style = ruleStatusStyles[rule.status] || ruleStatusStyles.not_evaluated;
              return `
                <tr>
                  <td style="padding: 8px 6px; border-bottom: 1px solid #f0f0f0; color: #000;">
                    <div style="font-weight: 500;">${escapeHtml(rule.title)}</div>
                    <div style="color: #888; font-size: 0.7rem;">${escapeHtml(rule.clause || '')}</div>
                  </td>
                  <td style="padding: 8px 6px; border-bottom: 1px solid #f0f0f0; color: ${style.color}; font-weight: 600; white-space: nowrap;">${style.icon} ${style.label}</td>
                  <td style="padding: 8px 6px; border-bottom: 1px solid #f0f0f0; color: #555;">${escapeHtml(rule.message || '')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      rulesTable = `
        <p style="margin: 0; font-size: 0.8rem; color: #666;">No rule evaluations are available for this route.</p>
      `;
    }
  }

  const notesSection = metadata.notes
    ? `<div style="margin-top: 12px; font-size: 0.78rem; color: #555; line-height: 1.45;"><span style="font-weight: 600; color: #000;">Notes:</span> ${escapeHtml(metadata.notes)}</div>`
    : '';

  return `
    <div style="padding: 18px 20px 24px 20px; display: grid; gap: 16px;">
      <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 18px;">
        <div style="font-size: 0.85rem; font-weight: 600; color: #000000; margin-bottom: 12px;">Route snapshot</div>
        <div style="display: grid; gap: 10px; font-size: 0.8rem; color: #444;">
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Length</span><span style="color: #000;">${escapeHtml(lengthText)}</span></div>
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Points</span><span style="color: #000;">${escapeHtml(pointsText)}</span></div>
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Created</span><span style="color: #555;">${escapeHtml(createdText)}</span></div>
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Infrastructure type</span><span style="color: #000;">${escapeHtml(infrastructureLabel)}</span></div>
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Nominal voltage</span><span style="color: #000;">${escapeHtml(voltageText)}</span></div>
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Fault clearing time</span><span style="color: #000;">${escapeHtml(faultClearingText)}</span></div>
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Min. joint distance</span><span style="color: #000;">${escapeHtml(jointDistanceText)}</span></div>
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Double guying</span><span style="color: #000;">${escapeHtml(boolToText(metadata.hasDoubleGuying))}</span></div>
          <div style="display: flex; justify-content: space-between; gap: 16px;"><span style="color: #666;">Insulated conduit</span><span style="color: #000;">${escapeHtml(boolToText(metadata.hasBoredCrossing))}</span></div>
        </div>
        ${notesSection}
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="font-size: 0.85rem; font-weight: 600; color: #000000;">Rule breakdown</div>
          ${renderComplianceStatusBadge(status)}
        </div>
        <div style="margin-top: 8px; font-size: 0.78rem; color: #555555;">${escapeHtml(countsText)}</div>
        ${evaluatedText ? `<div style="font-size: 0.72rem; color: #999999; margin-top: 4px;">Last run: ${escapeHtml(evaluatedText)}</div>` : ''}
        <div style="margin-top: 16px;">${rulesTable}</div>
      </div>
    </div>
  `;
}

function renderEvaluationReports(focusRouteId = null) {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) {
    return;
  }

  const drawingManager = window.app?.drawingManager;
  if (!drawingManager) {
    resultsContainer.innerHTML = `
      <div style="padding: 24px; text-align: center; color: #666; line-height: 1.6;">
        <p style="margin-bottom: 10px; font-size: 0.9rem;">Preparing evaluation workspace…</p>
        <p style="font-size: 0.8rem;">Map is loading; reports will appear here once routes are available.</p>
      </div>
    `;
    return;
  }

  if (focusRouteId) {
    evaluationUIState.expandedRouteIds.add(focusRouteId);
  }

  const routes = drawingManager.getAllRoutes ? [...drawingManager.getAllRoutes()] : [];

  if (!routes.length) {
    evaluationUIState.expandedRouteIds.clear();
    evaluationUIState.runningRouteIds.clear();
    ensureEvaluationErrorsMap().clear();
    resultsContainer.innerHTML = `
      <div style="padding: 24px; text-align: center; color: #666; line-height: 1.6;">
        <p style="margin-bottom: 10px; font-size: 0.9rem;">👋 Welcome!</p>
        <p style="font-size: 0.85rem;">Draw a route and run the EMC evaluator to see reports in this panel.</p>
      </div>
    `;
    return;
  }

  const availableIds = new Set(routes.map(route => route.id));
  evaluationUIState.expandedRouteIds.forEach((id) => {
    if (!availableIds.has(id)) {
      evaluationUIState.expandedRouteIds.delete(id);
    }
  });
  evaluationUIState.runningRouteIds.forEach((id) => {
    if (!availableIds.has(id)) {
      evaluationUIState.runningRouteIds.delete(id);
    }
  });
  const errorsMap = ensureEvaluationErrorsMap();
  for (const id of errorsMap.keys()) {
    if (!availableIds.has(id)) {
      errorsMap.delete(id);
    }
  }

  routes.sort((a, b) => {
    const nameA = (a.name || a.id || '').toLocaleLowerCase('nl-NL');
    const nameB = (b.name || b.id || '').toLocaleLowerCase('nl-NL');
    return nameA.localeCompare(nameB);
  });

  const activeRouteId = drawingManager.activeRouteId || null;

  const itemsHtml = routes.map((route) => {
    if (focusRouteId === route.id) {
      evaluationUIState.expandedRouteIds.add(route.id);
    }

    const metadata = route.metadata || {};
    const summary = route.compliance?.summary || null;
    const status = summary?.status || 'not_evaluated';
    const badgeHtml = renderComplianceStatusBadge(status);
    const lengthText = route.length ? `${(route.length/1000).toFixed(2)} km` : '—';
    const voltageText = metadata.voltageKv !== undefined && metadata.voltageKv !== null ? `${metadata.voltageKv} kV` : 'Unknown voltage';
    const infrastructureLabel = metadata.infrastructureType
      ? metadata.infrastructureType.charAt(0).toUpperCase() + metadata.infrastructureType.slice(1)
      : 'Unknown type';
    const descriptiveLine = `${infrastructureLabel} • ${voltageText} • Length ${lengthText}`;
    const evaluatedText = summary?.evaluatedAt
      ? new Date(summary.evaluatedAt).toLocaleString('nl-NL')
      : null;
    const countsText = summary
      ? `Pass ${summary.passCount ?? 0} · Fail ${summary.failCount ?? 0} · Pending ${summary.pendingCount ?? 0}`
      : 'Not evaluated yet. Run the EMC checks to generate a report.';
    const isExpanded = evaluationUIState.expandedRouteIds.has(route.id);
    const isActive = activeRouteId === route.id;
    const isRunning = evaluationUIState.runningRouteIds.has(route.id);
  const errorMessage = ensureEvaluationErrorsMap().get(route.id) || null;
    const containerBorder = errorMessage ? '#c62828' : isActive ? '#0079c1' : '#e5e5e5';
    const containerBackground = isActive ? '#f4f8ff' : '#ffffff';
    const buttonLabel = isRunning ? 'Evaluating…' : (summary ? 'Re-run evaluation' : 'Evaluate compliance');
    const buttonDisabledAttr = isRunning ? 'disabled' : '';

    let summaryLine = countsText;
    let secondaryLine = evaluatedText ? `Last run: ${evaluatedText}` : 'No evaluation recorded yet.';
    let helperLine = isExpanded 
      ? (summary ? 'Click to collapse the detailed EMC report.' : 'Click to collapse requirements.')
      : (summary ? 'Click to expand and view the full EMC report.' : 'Click to expand and review requirements.');

    if (isRunning) {
      summaryLine = 'Running EMC checks…';
      secondaryLine = 'Spatial queries may take a few seconds to complete.';
      helperLine = 'Evaluation in progress. You can continue editing metadata while this runs.';
    }

    const errorBlock = errorMessage
      ? `<div style="font-size: 0.72rem; color: #c62828; line-height: 1.5;">${escapeHtml(errorMessage)}</div>`
      : '';

    const detailHtml = isExpanded ? buildEvaluationDetailHtml(route) : '';

    const chevronIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 6L8 10L4 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    return `
      <div id="evaluation-${route.id}" class="evaluation-item${isExpanded ? ' expanded' : ''}" style="border: 1px solid ${containerBorder}; border-radius: 10px; background: ${containerBackground}; overflow: hidden; transition: all 0.2s ease;">
        <div class="evaluation-summary" onclick="toggleEvaluationDetails('${route.id}')" style="padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; position: relative;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <div style="color: #666; display: flex; align-items: center; flex-shrink: 0;" title="${isExpanded ? 'Click to collapse' : 'Click to expand'}">${chevronIcon}</div>
              <div style="flex: 1;">
                <div style="font-size: 0.92rem; font-weight: 600; color: #000000;">${escapeHtml(route.name || route.id)}</div>
                <div style="font-size: 0.75rem; color: #666666;">${escapeHtml(descriptiveLine)}</div>
              </div>
            </div>
            ${badgeHtml}
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
            <div style="font-size: 0.78rem; color: ${isRunning ? '#0079c1' : '#444444'};">${escapeHtml(summaryLine)}</div>
            <div style="font-size: 0.72rem; color: ${isRunning ? '#0079c1' : '#999999'};">${escapeHtml(secondaryLine)}</div>
            <div style="margin-left: auto;">
              <button class="route-action-btn" onclick="evaluateRouteCompliance('${route.id}'); event.stopPropagation();" ${buttonDisabledAttr} style="padding: 6px 12px; font-size: 0.75rem;${isRunning ? ' opacity: 0.65; cursor: not-allowed;' : ''}">${buttonLabel}</button>
            </div>
          </div>
          ${errorBlock}
          <div style="font-size: 0.7rem; color: #888888;">${escapeHtml(helperLine)}</div>
        </div>
        ${isExpanded ? `<div style="border-top: 1px solid #e5e5e5; background: #f7f9fb;">${detailHtml}</div>` : ''}
      </div>
    `;
  }).join('');

  resultsContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      ${itemsHtml}
    </div>
  `;
}

function toggleEvaluationDetails(routeId) {
  if (!routeId) {
    return;
  }

  if (evaluationUIState.expandedRouteIds.has(routeId)) {
    evaluationUIState.expandedRouteIds.delete(routeId);
  } else {
    evaluationUIState.expandedRouteIds.add(routeId);
  }

  renderEvaluationReports();
}

function expandEvaluationDetails(routeId) {
  if (!routeId) {
    return;
  }

  evaluationUIState.expandedRouteIds.add(routeId);
  renderEvaluationReports(routeId);
}

function updateRouteComplianceUI(routeId) {
  const container = document.getElementById(`route-compliance-${routeId}`);
  if (!container) {
    return;
  }

  const { drawingManager } = window.app;
  const route = drawingManager.getRoute(routeId);

  if (!route) {
    container.innerHTML = `<div style="font-size: 0.8rem; color: #999;">Route not available.</div>`;
    return;
  }

  const summary = route.compliance?.summary;
  const status = summary?.status || 'not_evaluated';
  const badgeHtml = renderComplianceStatusBadge(status);
  const countsText = summary
    ? `Pass ${summary.passCount || 0} · Fail ${summary.failCount || 0} · Pending ${summary.pendingCount || 0}`
    : 'Run the EMC evaluator to compute compliance.';
  const evaluatedText = summary?.evaluatedAt
    ? `<div style="font-size: 0.7rem; color: #999;">Last run: ${escapeHtml(new Date(summary.evaluatedAt).toLocaleString('nl-NL'))}</div>`
    : '';

  const rules = route.compliance?.rules || [];
  const failing = rules.filter(rule => rule.status === 'fail');
  const pending = rules.filter(rule => rule.status === 'not_evaluated');

  let ruleListHtml = '';
  if (failing.length) {
    ruleListHtml += `
      <div style="margin-top: 10px;">
        <div style="font-size: 0.75rem; color: #c62828; margin-bottom: 4px;">Issues detected</div>
        <ul style="margin: 0; padding-left: 18px; font-size: 0.75rem; color: #c62828; line-height: 1.5;">
          ${failing.map(rule => `<li>${escapeHtml(rule.title)} – ${escapeHtml(rule.message || 'Requirement not met')}</li>`).join('')}
        </ul>
      </div>
    `;
  } else if (pending.length) {
    ruleListHtml += `
      <div style="margin-top: 10px;">
        <div style="font-size: 0.75rem; color: #666; margin-bottom: 4px;">Pending checks</div>
        <ul style="margin: 0; padding-left: 18px; font-size: 0.75rem; color: #666; line-height: 1.5;">
          ${pending.slice(0, 4).map(rule => `<li>${escapeHtml(rule.title)} – ${escapeHtml(rule.message || 'Provide additional data')}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  const statusMessage = summary
    ? summary.status === 'pass'
      ? 'All mandatory checks passed.'
      : summary.status === 'fail'
      ? 'At least one requirement is not met.'
      : 'Evaluation is incomplete.'
    : 'Compliance has not been evaluated yet.';

  container.innerHTML = `
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        ${badgeHtml}
        <div>
          <div style="font-size: 0.8rem; color: #000;">${escapeHtml(statusMessage)}</div>
          <div style="font-size: 0.7rem; color: #666;">${escapeHtml(countsText)}</div>
          ${evaluatedText}
        </div>
      </div>
      <button id="eval-btn-${routeId}" class="route-action-btn" style="flex-shrink: 0;" onclick="evaluateRouteCompliance('${routeId}'); event.stopPropagation();">
        ${summary ? 'Re-run evaluation' : 'Evaluate compliance'}
      </button>
    </div>
    ${ruleListHtml}
  `;
}

function normalizeMetadataValue(field, rawValue) {
  if (rawValue === undefined) {
    return null;
  }

  const numericFields = ['voltageKv', 'faultClearingTimeMs', 'minJointDistanceMeters'];
  const booleanFields = ['hasDoubleGuying', 'hasBoredCrossing'];

  if (booleanFields.includes(field)) {
    return Boolean(rawValue);
  }

  if (numericFields.includes(field)) {
    if (rawValue === '' || rawValue === null) {
      return null;
    }
    const numeric = Number(rawValue);
    return Number.isFinite(numeric) ? numeric : null;
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    return trimmed === '' ? null : trimmed;
  }

  return rawValue ?? null;
}

function updateRouteMetadataField(routeId, field, rawValue) {
  const { drawingManager } = window.app || {};
  if (!drawingManager) {
    console.warn('Drawing manager not available when updating metadata');
    return;
  }

  const route = drawingManager.getRoute(routeId);
  if (!route) {
    console.warn('Route not found for metadata update:', routeId);
    return;
  }

  const value = normalizeMetadataValue(field, rawValue);
  const updatedMetadata = drawingManager.updateRouteMetadata(routeId, { [field]: value });

  console.log('📝 Updated route metadata', {
    routeId,
    field,
    value: updatedMetadata ? updatedMetadata[field] : value
  });

  if (route.compliance) {
    drawingManager.setRouteCompliance(routeId, null);
  }

  ensureEvaluationErrorsMap().delete(routeId);
  evaluationUIState.runningRouteIds.delete(routeId);

  updateRouteComplianceUI(routeId);
  renderEvaluationReports(routeId);

  const routeElement = document.getElementById(`route-${routeId}`);
  const isSelected = routeElement?.classList.contains('active');
  if (isSelected) {
    const refreshedRoute = drawingManager.getRoute(routeId) || route;
    showRouteDetails(refreshedRoute);
  }
}

function resolveTechnicalRoomsLayer(map) {
  if (!map) {
    return null;
  }

  if (window.app?.technicalRoomsLayer) {
    return window.app.technicalRoomsLayer;
  }

  // First try to find the EV Gebouwen layer by ID (most reliable)
  const evGebouwenLayer = getLayerById(map, 'ev-gebouwen');
  if (evGebouwenLayer) {
    console.log('✅ Found EV Gebouwen (Technical Rooms) layer by ID');
    window.app.technicalRoomsLayer = evGebouwenLayer;
    return evGebouwenLayer;
  }

  // Fallback: search by title/id keywords
  const searchTerms = ['ev-gebouwen', 'ev gebouwen', 'technical room', 'technische ruimte'];
  const stack = [];

  map.layers?.forEach(layer => stack.push(layer));

  while (stack.length) {
    const layer = stack.shift();
    if (!layer) continue;

    const title = (layer.title || '').toLowerCase();
    const id = (layer.id || '').toString().toLowerCase();

    const matches = searchTerms.some(term => title.includes(term) || id.includes(term));

    if (matches) {
      console.log(`✅ Found technical rooms layer: ${layer.title} (${layer.id})`);
      window.app.technicalRoomsLayer = layer;
      return layer;
    }

    if (matches && typeof layer.createFeatureLayer === 'function') {
      try {
        const featureLayer = layer.createFeatureLayer();
        window.app.technicalRoomsLayer = featureLayer;
        return featureLayer;
      } catch (error) {
        console.warn('Failed to create feature layer for technical rooms', error);
      }
    }

    if (layer.layers?.forEach) {
      layer.layers.forEach(child => stack.push(child));
    }

    if (layer.allSublayers?.forEach) {
      layer.allSublayers.forEach(sublayer => stack.push(sublayer));
    }
  }

  return null;
}

/**
 * Add distance annotations to the map showing measurements to railway infrastructure
 */
async function addDistanceAnnotations(routeId, evaluationResult) {
  const { distanceAnnotationsLayer, drawingManager, map } = window.app || {};
  if (!distanceAnnotationsLayer || !drawingManager) {
    return;
  }

  // Clear existing annotations for this route
  const existingAnnotations = distanceAnnotationsLayer.graphics.filter(
    g => g.attributes?.routeId === routeId
  );
  distanceAnnotationsLayer.removeMany(existingAnnotations.toArray());

  const route = drawingManager.getRoute(routeId);
  if (!route || !route.geometry) {
    return;
  }

  const routeGeometry = route.geometry;
  
  // Find the railway tracks layer
  const prorailGroup = map?.layers?.find(l => 
    l.title?.includes("ProRail") || l.title?.includes("Railway")
  );
  
  const railwayTracksLayer = prorailGroup?.layers?.find(l => l.customId === 'prorail-tracks');

  if (!railwayTracksLayer) {
    console.warn("⚠️ Railway tracks layer not found for distance annotations");
    return;
  }

  // Sample points along the route (every ~200m or at least 5 points)
  const routeLength = geometryEngine.geodesicLength(routeGeometry, "meters");
  const numSamples = Math.max(5, Math.min(20, Math.floor(routeLength / 200)));
  
  // Extract all vertices from the route geometry
  const allPoints = [];
  if (routeGeometry && routeGeometry.paths) {
    for (const path of routeGeometry.paths) {
      for (const coord of path) {
        allPoints.push(new Point({
          x: coord[0],
          y: coord[1],
          spatialReference: routeGeometry.spatialReference
        }));
      }
    }
  }
  
  // If we don't have enough points, just use what we have
  if (allPoints.length === 0) {
    console.warn("⚠️ No points found in route geometry");
    return;
  }

  console.log(`📏 Creating distance annotations for route ${routeId} (${allPoints.length} points, ${numSamples} samples)...`);
  
  const annotations = [];
  
  // Sample points evenly from the collected points
  const actualSamples = Math.min(numSamples, allPoints.length - 1);
  
  // Process annotations in batches to avoid blocking
  for (let i = 0; i <= actualSamples; i++) {
    try {
      const fraction = actualSamples > 0 ? i / actualSamples : 0;
      const pointIndex = Math.floor(fraction * (allPoints.length - 1));
      const pointOnRoute = allPoints[pointIndex];
      
      if (!pointOnRoute) continue;

      // Project point to RD New for accurate querying
      const pointRd = projectOperator.execute(pointOnRoute, { wkid: 28992 });
      if (!pointRd) continue;

      // Query nearby tracks (within 10km) in RD coordinates
      const searchBuffer = geometryEngine.buffer(pointRd, 10000, "meters");
      
      // Query ALL track layers (Railway Tracks, Track Sections, Switches)
      const { drawingManager, map, trackSectionsLayer, switchesLayer } = window.app || {};
      const allTrackFeatures = [];
      
      // Query Railway Tracks layer
      try {
        const query1 = railwayTracksLayer.createQuery();
        query1.geometry = searchBuffer;
        query1.spatialRelationship = "intersects";
        query1.outFields = ["*"];
        query1.returnGeometry = true;
        query1.outSpatialReference = { wkid: 28992 };
        const results1 = await railwayTracksLayer.queryFeatures(query1);
        allTrackFeatures.push(...results1.features);
      } catch (err) {
        console.warn("Failed to query railway tracks:", err);
      }
      
      // Query Track Sections layer
      if (trackSectionsLayer) {
        try {
          const query2 = trackSectionsLayer.createQuery();
          query2.geometry = searchBuffer;
          query2.spatialRelationship = "intersects";
          query2.outFields = ["*"];
          query2.returnGeometry = true;
          query2.outSpatialReference = { wkid: 28992 };
          const results2 = await trackSectionsLayer.queryFeatures(query2);
          allTrackFeatures.push(...results2.features);
        } catch (err) {
          console.warn("Failed to query track sections:", err);
        }
      }
      
      // Query Switches layer
      if (switchesLayer) {
        try {
          const query3 = switchesLayer.createQuery();
          query3.geometry = searchBuffer;
          query3.spatialRelationship = "intersects";
          query3.outFields = ["*"];
          query3.returnGeometry = true;
          query3.outSpatialReference = { wkid: 28992 };
          const results3 = await switchesLayer.queryFeatures(query3);
          allTrackFeatures.push(...results3.features);
        } catch (err) {
          console.warn("Failed to query switches:", err);
        }
      }
      
      if (allTrackFeatures.length === 0) {
        console.log(`   ⚠️ Point ${i}: No tracks found within 10km`);
        continue;
      }

      // Find nearest track and calculate distance in RD meters
      let minDistance = Infinity;
      let nearestTrackPoint = null;
      let nearestTrackGeometry = null;
      
      allTrackFeatures.forEach(trackFeature => {
        if (!trackFeature.geometry) return;
        
        // Calculate distance in RD coordinates (meters)
        const distance = geometryEngine.distance(pointRd, trackFeature.geometry, "meters");
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestTrackGeometry = trackFeature.geometry;
          
          // Find the nearest coordinate on the track
          const nearestCoord = geometryEngine.nearestCoordinate(trackFeature.geometry, pointRd);
          if (nearestCoord && nearestCoord.coordinate) {
            nearestTrackPoint = nearestCoord.coordinate;
          }
        }
      });
      
      if (!nearestTrackPoint || minDistance === Infinity) {
        console.log(`   ⚠️ Point ${i}: Could not determine nearest track point`);
        continue;
      }

      // Adjust for track width (subtract 1.5m for half of standard track width)
      const adjustedDistance = Math.max(0, minDistance - 1.5);

      // Project points back to map view SR for display
      const nearestTrackPointView = projectOperator.execute(nearestTrackPoint, pointOnRoute.spatialReference);
      if (!nearestTrackPointView) continue;

      // Create distance line from route point to nearest track point (in view SR)
      const distanceLine = new Polyline({
        paths: [[
          [pointOnRoute.x, pointOnRoute.y],
          [nearestTrackPointView.x, nearestTrackPointView.y]
        ]],
        spatialReference: pointOnRoute.spatialReference
      });

      // Create line graphic
      const lineGraphic = new Graphic({
        geometry: distanceLine,
        symbol: {
          type: "simple-line",
          color: [100, 100, 100, 0.6],
          width: 1.5,
          style: "short-dash"
        },
        attributes: {
          routeId: routeId,
          distance: adjustedDistance
        }
      });

      // Create text label at midpoint
      const midpoint = new Point({
        x: (pointOnRoute.x + nearestTrackPointView.x) / 2,
        y: (pointOnRoute.y + nearestTrackPointView.y) / 2,
        spatialReference: pointOnRoute.spatialReference
      });
      
      const textGraphic = new Graphic({
        geometry: midpoint,
        symbol: {
          type: "text",
          color: [50, 50, 50, 1],
          text: `${adjustedDistance.toFixed(1)}m`,
          font: {
            size: 10,
            family: "Arial",
            weight: "bold"
          },
          haloColor: [255, 255, 255, 0.9],
          haloSize: 2
        },
        attributes: {
          routeId: routeId,
          distance: adjustedDistance
        }
      });

      annotations.push(lineGraphic, textGraphic);
      
    } catch (error) {
      console.warn(`⚠️ Failed to create annotation at point ${i}:`, error);
    }
  }

  if (annotations.length > 0) {
    distanceAnnotationsLayer.addMany(annotations);
    console.log(`✅ Added ${annotations.length / 2} distance annotations for route ${routeId}`);
  } else {
    console.warn(`⚠️ No distance annotations created for route ${routeId}`);
  }
}

async function evaluateRouteCompliance(routeId) {
  const { drawingManager, map, trackSectionsLayer, switchesLayer } = window.app || {};
  if (!drawingManager) {
    console.warn('Drawing manager not available for compliance evaluation');
    return;
  }

  const route = drawingManager.getRoute(routeId);
  if (!route) {
    console.warn('Route not found for compliance evaluation:', routeId);
    return;
  }

  if (evaluationUIState.runningRouteIds.has(routeId)) {
    console.info(`⏭️ Evaluation already running for route ${routeId}, skipping duplicate request`);
    return;
  }

  console.log(`🔄 Starting evaluation for route ${routeId}...`);
  evaluationUIState.runningRouteIds.add(routeId);
  ensureEvaluationErrorsMap().delete(routeId);

  const complianceContainer = document.getElementById(`route-compliance-${routeId}`);
  if (complianceContainer) {
    complianceContainer.innerHTML = `
      <div style="font-size: 0.8rem; color: #666; line-height: 1.4;">
        <div>🔄 Evaluating EMC compliance…</div>
        <div style="font-size: 0.72rem; color: #999;">Spatial queries may take a few seconds.</div>
      </div>
    `;
  }

  const routeElement = document.getElementById(`route-${routeId}`);
  const isSelected = routeElement?.classList.contains('active');

  // Update UI to show "running" state - but debounce to prevent multiple renders
  clearTimeout(window._renderDebounceTimer);
  window._renderDebounceTimer = setTimeout(() => {
    renderEvaluationReports(routeId);
  }, 50);

  try {
    const evaluationLayers = {
      railwayTracksLayer: drawingManager.railwayTracksLayer || null,
      trackSectionsLayer: trackSectionsLayer || null,  // Now properly scoped from window.app
      switchesLayer: switchesLayer || null,  // Include switches layer
      technicalRoomsLayer: resolveTechnicalRoomsLayer(map)
    };

    const result = await evaluateRoute(route, {
      metadata: route.metadata,
      layers: evaluationLayers
    });

    drawingManager.setRouteCompliance(routeId, result);
    ensureEvaluationErrorsMap().delete(routeId);
    
    console.log(`✅ EMC evaluation complete for route ${routeId}`, result.summary);
    console.log(`   📊 Status: ${result.summary?.status}`);
    console.log(`   ✅ Pass: ${result.summary?.passCount}, ❌ Fail: ${result.summary?.failCount}, ⏳ Pending: ${result.summary?.pendingCount}`);
    
    // Log any pending rules
    if (result.rules) {
      const pendingRules = result.rules.filter(r => r.status === 'not_evaluated' || r.status === 'pending');
      if (pendingRules.length > 0) {
        console.log(`   ⏳ Pending rules:`, pendingRules.map(r => r.title).join(', '));
      }
    }
    
    // Update UI components in order
    updateRouteComplianceUI(routeId);
    
    // Add distance annotations to the map (async but don't wait for it)
    addDistanceAnnotations(routeId, result).catch(err => {
      console.warn('⚠️ Failed to add distance annotations:', err);
    });
    
    // Debounce the final render to prevent multiple quick re-renders
    clearTimeout(window._renderDebounceTimer);
    window._renderDebounceTimer = setTimeout(() => {
      renderEvaluationReports(routeId);
    }, 50);

    if (isSelected) {
      const refreshedRoute = drawingManager.getRoute(routeId) || route;
      showRouteDetails(refreshedRoute);
    }
  } catch (error) {
    console.error(`❌ EMC evaluation failed for route ${routeId}`, error);

    ensureEvaluationErrorsMap().set(routeId, error?.message || 'Unknown error occurred.');

    if (complianceContainer) {
      complianceContainer.innerHTML = `
        <div style="font-size: 0.8rem; color: #c62828; line-height: 1.5;">
          <div><strong>Evaluation failed.</strong></div>
          <div>${escapeHtml(error?.message || 'Unknown error occurred.')}</div>
        </div>
      `;
    }
  } finally {
    evaluationUIState.runningRouteIds.delete(routeId);
    renderEvaluationReports(routeId);
  }
}

/**
 * Highlight and expand the selected route's evaluation card.
 */
function showRouteDetails(routeData) {
  if (!routeData || !routeData.id) {
    return;
  }

  expandEvaluationDetails(routeData.id);
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
  // Initialize language
  const currentLang = getCurrentLanguage();
  updateTranslations(currentLang);
  
  // Language toggle button
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    // Set initial button text
    langToggle.textContent = currentLang === 'en' ? '🇳🇱 NL' : '🇬🇧 EN';
    
    langToggle.addEventListener('click', () => {
      const newLang = getCurrentLanguage() === 'en' ? 'nl' : 'en';
      setCurrentLanguage(newLang);
      updateTranslations(newLang);
      
      // Update button text
      langToggle.textContent = newLang === 'en' ? '🇳🇱 NL' : '🇬🇧 EN';
      
      // Update document language
      document.documentElement.lang = newLang;
      
      // Update visibility button texts for all routes
      updateVisibilityButtonTexts();
      
      console.log(`🌐 Language changed to: ${newLang.toUpperCase()}`);
    });
  }
  
  // Drawing buttons in left panel
  const startBtn = document.getElementById('start-drawing');
  const cancelBtn = document.getElementById('cancel-drawing');
  
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      console.log('🖊️ Starting new route drawing...');
      drawingManager.startDrawing();
      startBtn.disabled = true;
      cancelBtn.disabled = false;
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      console.log('❌ Cancelling drawing...');
      drawingManager.cancelDrawing();
      startBtn.disabled = false;
      cancelBtn.disabled = true;
    });
  }
  
  // Welcome message close button
  const closeWelcomeBtn = document.getElementById('close-welcome');
  const welcomeMessage = document.getElementById('welcome-message');
  
  if (closeWelcomeBtn && welcomeMessage) {
    closeWelcomeBtn.addEventListener('click', () => {
      welcomeMessage.style.opacity = '0';
      welcomeMessage.style.transform = 'translate(-50%, -50%) scale(0.95)';
      welcomeMessage.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        welcomeMessage.style.display = 'none';
      }, 300);
    });
  }
  
  console.log('✅ UI setup complete - Drawing controls in left panel');
}

// Global functions for route management (called from HTML)
window.selectRoute = function(routeId) {
  const { drawingManager } = window.app;
  drawingManager.selectRoute(routeId);
};

window.editRoute = function(routeId) {
  // Deactivate joint/mast marking mode if active
  if (jointMarkingState.isActive) {
    deactivateJointMarking();
  }
  
  const { drawingManager } = window.app;
  drawingManager.startEditing(routeId);
};

window.extendRouteStart = function(routeId) {
  const { drawingManager } = window.app;
  drawingManager.extendRoute(routeId, false);
};

window.extendRouteEnd = function(routeId) {
  const { drawingManager } = window.app;
  drawingManager.extendRoute(routeId, true);
};

window.saveRouteEdits = function(routeId) {
  const { drawingManager } = window.app;
  drawingManager.finishEditing();
};

window.cancelRouteEdits = function(routeId) {
  const { drawingManager } = window.app;
  drawingManager.cancelEditing();
};

window.deleteRoute = function(routeId) {
  if (confirm('Are you sure you want to delete this route?')) {
    const { drawingManager, jointsLayer, distanceAnnotationsLayer } = window.app;
    drawingManager.deleteRoute(routeId);
    
    // Clear asset points (joints/masts) for this route
    clearPointsForRoute(routeId);
    
    // Remove point graphics from map
    if (jointsLayer) {
      const graphicsToRemove = jointsLayer.graphics.filter(g => 
        g.attributes && g.attributes.routeId === routeId
      );
      jointsLayer.removeMany(graphicsToRemove.toArray());
    }
    
    // Remove distance annotations for this route
    if (distanceAnnotationsLayer) {
      const annotationsToRemove = distanceAnnotationsLayer.graphics.filter(g =>
        g.attributes && g.attributes.routeId === routeId
      );
      distanceAnnotationsLayer.removeMany(annotationsToRemove.toArray());
    }
  }
};

/**
 * Toggle route visibility on the map
 */
window.toggleRouteVisibility = function(routeId) {
  const { drawingManager, jointsLayer, distanceAnnotationsLayer } = window.app;
  const route = drawingManager.getRoute(routeId);
  
  if (!route) {
    console.warn('Route not found:', routeId);
    return;
  }
  
  // Toggle visibility state
  const isCurrentlyVisible = route.visible !== false; // default to true if not set
  route.visible = !isCurrentlyVisible;
  
  // Update route graphic visibility
  if (route.graphic) {
    route.graphic.visible = route.visible;
  }
  
  // Update buffer graphic visibility if it exists
  if (route.bufferGraphic) {
    route.bufferGraphic.visible = route.visible;
  }
  
  // Update distance annotations visibility
  if (distanceAnnotationsLayer) {
    distanceAnnotationsLayer.graphics.forEach(g => {
      if (g.attributes && g.attributes.routeId === routeId) {
        g.visible = route.visible;
      }
    });
  }
  
  // Update joint/mast markers visibility
  if (jointsLayer) {
    jointsLayer.graphics.forEach(g => {
      if (g.attributes && g.attributes.routeId === routeId) {
        g.visible = route.visible;
      }
    });
  }
  
  // Update button text and icon
  updateVisibilityButton(routeId, route.visible);
  
  console.log(`👁️ Route ${routeId} visibility toggled to:`, route.visible);
};

/**
 * Update a single visibility button's icon and tooltip
 */
function updateVisibilityButton(routeId, isVisible) {
  const button = document.getElementById(`visibility-btn-${routeId}`);
  if (button) {
    if (isVisible) {
      button.innerHTML = '👁️';
      button.title = t('hideRouteTooltip');
    } else {
      button.innerHTML = '👁️‍🗨️';
      button.title = t('showRouteTooltip');
    }
  }
}

/**
 * Update all visibility button texts (called when language changes)
 */
function updateVisibilityButtonTexts() {
  const { drawingManager } = window.app;
  if (!drawingManager) return;
  
  drawingManager.routes.forEach((route, routeId) => {
    const isVisible = route.visible !== false;
    updateVisibilityButton(routeId, isVisible);
  });
}

/**
 * Toggle joint marking mode for a route
 */
window.toggleJointMarking = async function(routeId) {
  console.log(`⚡ Toggling joint marking for route ${routeId}`);
  
  const { drawingManager, view, jointsLayer, map } = window.app;
  const route = drawingManager.getRoute(routeId);
  
  if (!route) {
    console.error('❌ Route not found:', routeId);
    return;
  }
  
  const button = document.getElementById(`mark-joints-btn-${routeId}`);
  
  // If already active, deactivate
  if (jointMarkingState.isActive && jointMarkingState.activeRouteId === routeId) {
    deactivateJointMarking();
    if (button) {
      button.textContent = '⚡ Mark Joints/Earthing';
      button.style.background = '#2196f3';
    }
    return;
  }
  
  // Deactivate any previous marking mode
  if (jointMarkingState.isActive) {
    deactivateJointMarking();
  }
  
  // Activate marking mode
  jointMarkingState.isActive = true;
  jointMarkingState.activeRouteId = routeId;
  
  if (button) {
    button.textContent = '❌ Cancel Marking';
    button.style.background = '#f44336';
  }
  
  console.log(`✅ Joint marking active for route ${routeId}`);
  console.log('   👆 Click on the route to place joints/earthing points');
  
  // Get tracks layer for distance calculations
  // Use the railway tracks layer from the drawing manager
  const tracksLayer = drawingManager.railwayTracksLayer;
  
  if (tracksLayer) {
    console.log(`   ✅ Tracks layer available: ${tracksLayer.title} (${tracksLayer.id})`);
  } else {
    console.warn('   ⚠️ Tracks layer not found - joint distances will not be calculated');
  }
  
  // Create click handler
  jointMarkingState.clickHandler = view.on('click', async (event) => {
    try {
      // Get the route graphic
      const routeGraphic = route.graphic;
      if (!routeGraphic || !routeGraphic.geometry) {
        console.warn('⚠️ Route geometry not available');
        return;
      }
      
      console.log('📍 Map clicked - placing joint...');
      
      // Always use RD New (28992) for spatial calculations
      const rdNewSR = new SpatialReference({ wkid: 28992 });
      
      // Project click point to RD New
      let clickPoint = event.mapPoint;
      if (clickPoint.spatialReference.wkid !== 28992) {
        console.log(`   🔄 Projecting click point from ${clickPoint.spatialReference.wkid} to 28992 (RD New)...`);
        clickPoint = projectOperator.execute(clickPoint, rdNewSR);
      }
      
      // Project route geometry to RD New if needed
      let routeGeometry = routeGraphic.geometry;
      if (routeGeometry.spatialReference.wkid !== 28992) {
        console.log(`   🔄 Projecting route geometry from ${routeGeometry.spatialReference.wkid} to 28992 (RD New)...`);
        routeGeometry = projectOperator.execute(routeGeometry, rdNewSR);
      }
      
      const distanceToRoute = geometryEngine.distance(clickPoint, routeGeometry, "meters");
      
      console.log(`   📏 Distance from click to route: ${distanceToRoute.toFixed(2)}m`);
      console.log('   ✅ Snapping to nearest point on route...');
      
      // Calculate chainage (this also snaps to route)
      const chainageResult = calculateChainage(routeGeometry, clickPoint);
      
      if (!chainageResult) {
        console.error('❌ Failed to calculate chainage');
        return;
      }
      
      console.log(`   📏 Chainage: ${chainageResult.chainage.toFixed(2)}m from route start`);
      
      // Find nearest track and calculate distance
      let trackDistance = null;
      let nearestTrack = null;
      
      if (tracksLayer) {
        console.log('   🛤️ Querying nearest track...');
        const trackResult = await findNearestTrack(chainageResult.snappedPoint, tracksLayer, 200);
        trackDistance = trackResult.distance;
        nearestTrack = trackResult.trackFeature;
        
        if (trackDistance !== null) {
          const status = trackDistance >= 31 ? '✅' : '❌';
          console.log(`   ${status} Distance to track: ${trackDistance.toFixed(2)}m`);
        } else {
          console.log('   ℹ️ No tracks found within 200m');
        }
      } else {
        console.warn('   ⚠️ Tracks layer not available');
      }
      
      // Determine point type based on infrastructure type
      const infrastructureType = route.metadata?.infrastructureType?.toLowerCase() || 'cable';
      const pointType = infrastructureType === 'overhead' ? 'mast' : jointMarkingState.selectedType;
      
      console.log(`   🏗️ Infrastructure type: ${infrastructureType} → Point type: ${pointType}`);
      
      // Create point data
      const pointData = createPointData({
        geometry: chainageResult.snappedPoint,
        chainage: chainageResult.chainage,
        type: pointType,
        routeId: routeId,
        distanceToTrack: trackDistance,
        nearestTrack: nearestTrack
      });
      
      // Add to storage
      addPoint(routeId, pointData);
      
      // Create graphic
      const graphic = createPointGraphic(pointData);
      graphic.attributes.routeId = routeId; // Add route ID for filtering
      
      // Add to map
      jointsLayer.add(graphic);
      
      const complianceStatus = pointData.compliant ? '✅ Compliant' : '❌ Violation';
      console.log(`✅ ${pointData.type} added at ${pointData.chainageMeters.toFixed(1)}m - ${complianceStatus}`);
      
      // Update route metadata with minimum distance for the appropriate type
      if (pointType === 'mast') {
        const minDistance = getMinimumDistanceForType(routeId, 'mast');
        if (minDistance !== null) {
          route.metadata.minMastDistanceMeters = minDistance;
          console.log(`   📊 Updated route minimum mast distance: ${minDistance.toFixed(2)}m`);
          
          // Trigger re-evaluation after updating mast distance
          console.log(`   🔄 Triggering re-evaluation after mast placement...`);
          setTimeout(() => {
            evaluateRouteCompliance(routeId);
          }, 100);
        }
      } else {
        const minDistance = getMinimumDistanceForType(routeId, 'joint');
        if (minDistance !== null) {
          route.metadata.minJointDistanceMeters = minDistance;
          console.log(`   📊 Updated route minimum joint distance: ${minDistance.toFixed(2)}m`);
          
          // Trigger re-evaluation after updating joint distance
          console.log(`   🔄 Triggering re-evaluation after joint placement...`);
          setTimeout(() => {
            evaluateRouteCompliance(routeId);
          }, 100);
        }
      }
      
      // Show summary
      const summary = getComplianceSummaryForType(routeId, pointType);
      console.log(`📊 Route ${routeId}: ${summary.total} ${pointType}(s), ${summary.compliant} compliant, ${summary.violations} violations`);
      
    } catch (error) {
      console.error('❌ Error placing joint:', error);
    }
  });
  
  console.log('✅ Click handler registered');
};

/**
 * Deactivate joint marking mode
 */
function deactivateJointMarking() {
  if (jointMarkingState.clickHandler) {
    jointMarkingState.clickHandler.remove();
    jointMarkingState.clickHandler = null;
  }
  
  const previousRouteId = jointMarkingState.activeRouteId;
  
  jointMarkingState.isActive = false;
  jointMarkingState.activeRouteId = null;
  
  console.log('❌ Joint marking deactivated');
  
  // Reset button if it exists
  if (previousRouteId) {
    const button = document.getElementById(`mark-joints-btn-${previousRouteId}`);
    if (button) {
      button.textContent = '⚡ Mark Joints/Earthing';
      button.style.background = '#2196f3';
    }
    
    // Note: Re-evaluation already triggered when joints are added, no need to trigger again here
  }
}

window.toggleRouteCollapse = function(routeId) {
  const content = document.getElementById(`route-collapsible-${routeId}`);
  const icon = document.getElementById(`collapse-icon-${routeId}`);
  
  if (content && icon) {
    const isCollapsed = content.style.display === 'none';
    content.style.display = isCollapsed ? 'block' : 'none';
    icon.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)';
    icon.textContent = isCollapsed ? '▼' : '▶';
  }
};

window.toggleRouteEditMenu = function(routeId) {
  const menu = document.getElementById(`edit-menu-${routeId}`);
  if (menu) {
    const isVisible = menu.style.display !== 'none';
    // Close all other edit menus
    document.querySelectorAll('.route-edit-menu').forEach(m => m.style.display = 'none');
    // Toggle this menu
    menu.style.display = isVisible ? 'none' : 'block';
  }
};

window.updateRouteDescription = function(routeId, description) {
  const { drawingManager } = window.app;
  const route = drawingManager.getRoute(routeId);
  if (route) {
    route.description = description;
    console.log(`📝 Updated description for ${routeId}:`, description);
  }
};

window.updateRouteName = function(routeId, newName) {
  const { drawingManager } = window.app;
  const route = drawingManager.getRoute(routeId);
  
  if (!route) {
    console.error('Route not found:', routeId);
    return;
  }
  
  // Validate name
  const trimmedName = newName.trim();
  if (!trimmedName) {
    // Revert to original name if empty
    const nameInput = document.getElementById(`name-${routeId}`);
    if (nameInput) {
      nameInput.value = route.name;
    }
    console.warn('⚠️ Route name cannot be empty, reverted to:', route.name);
    return;
  }
  
  // Update route name
  route.name = trimmedName;
  console.log(`✏️ Updated route name for ${routeId}: "${trimmedName}"`);
  
  // Update the graphic's attributes if it exists
  const graphic = route.graphic;
  if (graphic && graphic.attributes) {
    graphic.attributes.name = trimmedName;
  }
};

window.changeRouteColor = function(routeId) {
  const { drawingManager } = window.app;
  const route = drawingManager.getRoute(routeId);
  
  if (!route) {
    console.error('Route not found:', routeId);
    return;
  }
  
  // Get current route style
  const currentColor = route.color || '#ff0000';
  const currentWidth = route.lineWidth || 4;
  const currentStyle = route.lineStyle || 'solid';
  
  // Predefined trace colors for different routes
  const traceColors = [
    { name: 'Red', value: '#ff0000' },
    { name: 'Blue', value: '#0066ff' },
    { name: 'Green', value: '#00cc00' },
    { name: 'Orange', value: '#ff8800' },
    { name: 'Purple', value: '#9933ff' },
    { name: 'Yellow', value: '#ffcc00' },
    { name: 'Pink', value: '#ff00ff' },
    { name: 'Cyan', value: '#00ffff' },
    { name: 'Brown', value: '#996633' },
    { name: 'Gray', value: '#808080' }
  ];
  
  // Line widths
  const lineWidths = [
    { name: 'Thin', value: 2 },
    { name: 'Normal', value: 4 },
    { name: 'Medium', value: 6 },
    { name: 'Thick', value: 8 },
    { name: 'Very Thick', value: 10 }
  ];
  
  // Line styles
  const lineStyles = [
    { name: 'Solid', value: 'solid', pattern: '━━━━━━━' },
    { name: 'Dashed', value: 'dash', pattern: '━ ━ ━ ━' },
    { name: 'Dotted', value: 'dot', pattern: '• • • • • •' },
    { name: 'Dash-Dot', value: 'dash-dot', pattern: '━ • ━ •' },
    { name: 'Long Dash', value: 'long-dash', pattern: '━━ ━━ ━━' }
  ];
  
  // Create color options
  const colorOptions = traceColors.map((color) => 
    `<div style="display: inline-block; width: 40px; height: 40px; background: ${color.value}; margin: 5px; cursor: pointer; border: 2px solid ${color.value === currentColor ? '#000' : '#999'}; border-radius: 4px; box-shadow: ${color.value === currentColor ? '0 0 0 2px #0079c1' : 'none'};" 
          class="color-option"
          data-color="${color.value}" 
          title="${color.name}"></div>`
  ).join('');
  
  // Create width options
  const widthOptions = lineWidths.map((width) => 
    `<div style="display: flex; align-items: center; padding: 8px; margin: 4px 0; cursor: pointer; border: 2px solid ${width.value === currentWidth ? '#0079c1' : '#ddd'}; border-radius: 4px; background: ${width.value === currentWidth ? '#e3f2fd' : 'white'};"
          class="width-option"
          data-width="${width.value}">
      <div style="flex: 1; font-size: 13px;">${width.name}</div>
      <div style="width: 60px; height: ${width.value * 2}px; background: #333; border-radius: 2px;"></div>
    </div>`
  ).join('');
  
  // Create style options
  const styleOptions = lineStyles.map((style) => 
    `<div style="display: flex; align-items: center; padding: 8px; margin: 4px 0; cursor: pointer; border: 2px solid ${style.value === currentStyle ? '#0079c1' : '#ddd'}; border-radius: 4px; background: ${style.value === currentStyle ? '#e3f2fd' : 'white'};"
          class="style-option"
          data-style="${style.value}">
      <div style="flex: 1; font-size: 13px;">${style.name}</div>
      <div style="font-size: 14px; color: #666; letter-spacing: 1px;">${style.pattern}</div>
    </div>`
  ).join('');
  
  const dialogHTML = `
    <div style="padding: 20px; min-width: 380px;">
      <h3 style="margin-top: 0; color: #0079c1;">Customize Route Style</h3>
      
      <!-- Color Section -->
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 10px 0 8px; font-size: 14px; color: #333;">Trace Color</h4>
        <div id="color-picker" style="display: flex; flex-wrap: wrap; max-width: 320px;">
          ${colorOptions}
        </div>
      </div>
      
      <!-- Line Width Section -->
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 10px 0 8px; font-size: 14px; color: #333;">Line Thickness</h4>
        <div id="width-picker">
          ${widthOptions}
        </div>
      </div>
      
      <!-- Line Style Section -->
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 10px 0 8px; font-size: 14px; color: #333;">Line Style</h4>
        <div id="style-picker">
          ${styleOptions}
        </div>
      </div>
      
      <!-- Preview Section -->
      <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px;">
        <h4 style="margin: 0 0 10px; font-size: 13px; color: #666;">Preview</h4>
        <div style="height: 40px; display: flex; align-items: center; background: white; padding: 10px; border-radius: 4px;">
          <svg id="preview-line" width="100%" height="20" style="display: block;">
            <line x1="0" y1="10" x2="100%" y2="10" stroke="${currentColor}" stroke-width="${currentWidth}" stroke-dasharray="${getStrokeDashArray(currentStyle)}" />
          </svg>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button id="apply-style" style="flex: 1; padding: 10px 20px; background: #0079c1; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
          Apply
        </button>
        <button id="cancel-style" style="padding: 10px 20px; background: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
          Cancel
        </button>
      </div>
    </div>
  `;
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
  
  const dialog = document.createElement('div');
  dialog.style.cssText = 'background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto;';
  dialog.innerHTML = dialogHTML;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Track selected values
  let selectedColor = currentColor;
  let selectedWidth = currentWidth;
  let selectedStyle = currentStyle;
  
  // Update preview
  function updatePreview() {
    const previewLine = dialog.querySelector('#preview-line line');
    if (previewLine) {
      previewLine.setAttribute('stroke', selectedColor);
      previewLine.setAttribute('stroke-width', selectedWidth);
      previewLine.setAttribute('stroke-dasharray', getStrokeDashArray(selectedStyle));
    }
  }
  
  // Helper function for stroke dash array
  function getStrokeDashArray(style) {
    const dashPatterns = {
      'solid': '',
      'dash': '8 4',
      'dot': '2 4',
      'dash-dot': '8 4 2 4',
      'long-dash': '16 8'
    };
    return dashPatterns[style] || '';
  }
  
  // Handle color selection
  dialog.querySelectorAll('.color-option').forEach(colorDiv => {
    colorDiv.addEventListener('click', function() {
      selectedColor = this.getAttribute('data-color');
      
      // Update selection visual
      dialog.querySelectorAll('.color-option').forEach(opt => {
        opt.style.border = '2px solid #999';
        opt.style.boxShadow = 'none';
      });
      this.style.border = '2px solid #000';
      this.style.boxShadow = '0 0 0 2px #0079c1';
      
      updatePreview();
    });
  });
  
  // Handle width selection
  dialog.querySelectorAll('.width-option').forEach(widthDiv => {
    widthDiv.addEventListener('click', function() {
      selectedWidth = parseInt(this.getAttribute('data-width'));
      
      // Update selection visual
      dialog.querySelectorAll('.width-option').forEach(opt => {
        opt.style.border = '2px solid #ddd';
        opt.style.background = 'white';
      });
      this.style.border = '2px solid #0079c1';
      this.style.background = '#e3f2fd';
      
      updatePreview();
    });
  });
  
  // Handle style selection
  dialog.querySelectorAll('.style-option').forEach(styleDiv => {
    styleDiv.addEventListener('click', function() {
      selectedStyle = this.getAttribute('data-style');
      
      // Update selection visual
      dialog.querySelectorAll('.style-option').forEach(opt => {
        opt.style.border = '2px solid #ddd';
        opt.style.background = 'white';
      });
      this.style.border = '2px solid #0079c1';
      this.style.background = '#e3f2fd';
      
      updatePreview();
    });
  });
  
  // Handle apply
  dialog.querySelector('#apply-style').addEventListener('click', () => {
    drawingManager.updateRouteStyle(routeId, {
      color: selectedColor,
      width: selectedWidth,
      style: selectedStyle
    });
    
    // Update the trace indicator in the UI
    const traceIndicator = document.getElementById(`trace-${routeId}`);
    if (traceIndicator) {
      traceIndicator.style.background = selectedColor;
    }
    
    document.body.removeChild(overlay);
  });
  
  // Handle cancel
  dialog.querySelector('#cancel-style').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
};

// Initialize the application
console.log('🚀 Initializing application...');

const { map, view, drawingManager, cableRoutesLayer, jointsLayer, distanceAnnotationsLayer, railwayTracksLayer, trackSectionsLayer, switchesLayer, stationsLayer } = initializeMap();
setupUI(drawingManager);

console.log('✅ Application ready');

// Export for debugging
window.app = { 
  map, 
  view, 
  drawingManager, 
  cableRoutesLayer, 
  jointsLayer, 
  distanceAnnotationsLayer, 
  railwayTracksLayer,
  trackSectionsLayer,
  switchesLayer,
  stationsLayer,
  config 
};
window.updateRouteMetadataField = updateRouteMetadataField;
window.evaluateRouteCompliance = evaluateRouteCompliance;
window.toggleEvaluationDetails = toggleEvaluationDetails;
renderEvaluationReports();
