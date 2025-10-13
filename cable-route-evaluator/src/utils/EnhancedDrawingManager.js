/**
 * Enhanced Drawing Manager
 * 
 * Manages route drawing with snapping, real-time feedback, and professional tools.
 * Replaces the basic Sketch widget with advanced functionality.
 */

import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

import {
  calculateRouteLength,
  formatDistance,
  snapToRailway,
  createRouteSymbol,
  createWaypointSymbol,
  generateRouteId,
  createRoutePopupContent
} from './drawingUtils.js';

const DEFAULT_ROUTE_METADATA = {
  infrastructureType: 'cable',
  voltageKv: 110,
  electrifiedSystem: 'standard',
  faultClearingTimeMs: 120,
  hasDoubleGuying: null,
  hasBoredCrossing: null,
  minJointDistanceMeters: null,
  notes: ''
};

export class EnhancedDrawingManager {
  constructor(view, cableRoutesLayer, railwayTracksLayer) {
    this.view = view;
    this.cableRoutesLayer = cableRoutesLayer;
    this.railwayTracksLayer = railwayTracksLayer;
    
    // Drawing state
    this.isDrawing = false;
    this.isEditing = false;
    this.editingRouteId = null;
    this.currentPoints = [];
    this.currentGraphic = null;
    this.snapTolerance = 25; // meters
    this.enableSnapping = true;
    
    // Dragging state
    this.isDragging = false;
    this.draggedPointIndex = null;
    this.isMovingPoint = false;
    this.movingPointIndex = null;
    
    // Temporary graphics for visual feedback
    this.tempLayer = new GraphicsLayer({
      title: "Drawing Feedback",
      listMode: "hide"
    });
    this.view.map.add(this.tempLayer);
    
    // Event handlers
    this.setupEventHandlers();
    
    // Active route management
    this.routes = new Map(); // routeId -> route data
    this.activeRouteId = null;
    
    console.log('✏️ Enhanced Drawing Manager initialized');
  }

  /**
   * Setup map click and pointer event handlers
   */
  setupEventHandlers() {
    // Click handler for adding points (only in drawing mode) or selecting/placing waypoints in edit mode
    this.clickHandler = this.view.on("click", (event) => {
      if (this.isEditing) {
        this.handleEditClick(event);
      } else if (this.isDrawing) {
        this.addPoint(event.mapPoint);
      }
    });
    
    // Pointer move for moving selected point or drawing preview
    this.pointerMoveHandler = this.view.on("pointer-move", (event) => {
      if (this.isMovingPoint) {
        this.updateMovingPoint(event);
      } else if (this.isDrawing && !this.isEditing) {
        this.updateDrawingPreview(event);
      }
    });

    // Double-click to finish drawing (not in edit mode)
    this.doubleClickHandler = this.view.on("double-click", (event) => {
      if (this.isDrawing && !this.isEditing) {
        event.stopPropagation();
        this.finishDrawing();
      }
    });

    // Escape key to cancel
    this.keyHandler = this.view.on("key-down", (event) => {
      if (event.key === "Escape") {
        if (this.isMovingPoint) {
          this.cancelMovingPoint();
        } else if (this.isEditing) {
          this.cancelEditing();
        } else if (this.isDrawing) {
          this.cancelDrawing();
        }
      }
    });
  }

  /**
   * Start drawing a new route
   */
  startDrawing() {
    if (this.isDrawing) {
      this.cancelDrawing();
    }

    this.isDrawing = true;
    this.currentPoints = [];
    this.currentGraphic = null;
    
    // Clear any temporary graphics
    this.tempLayer.removeAll();
    
    // Update cursor
    this.view.surface.style.cursor = "crosshair";
    
    // Update UI feedback
    this.updateDrawingUI("Click to start route, double-click to finish");
    
    console.log('🖊️ Started drawing new route');
  }

  /**
   * Handle click in edit mode - select waypoint or place selected waypoint
   */
  handleEditClick(event) {
    const screenPoint = { x: event.x, y: event.y };
    
    if (this.isMovingPoint) {
      // Second click - place the waypoint at new location
      this.placeMovingPoint(event.mapPoint);
    } else {
      // First click - select a waypoint to move
      this.selectWaypointToMove(event);
    }
  }
  
  /**
   * Select a waypoint to move
   */
  selectWaypointToMove(event) {
    const screenPoint = { x: event.x, y: event.y };
    
    // Find which waypoint was clicked (within 25 pixels)
    let closestIndex = -1;
    let minDistance = 25; // 25 pixel tolerance
    
    this.currentPoints.forEach((pointArray, index) => {
      const point = new Point({
        longitude: pointArray[0],
        latitude: pointArray[1],
        spatialReference: { wkid: 4326 }
      });
      
      const screenPt = this.view.toScreen(point);
      const distance = Math.sqrt(
        Math.pow(screenPt.x - event.x, 2) + 
        Math.pow(screenPt.y - event.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    if (closestIndex >= 0) {
      this.isMovingPoint = true;
      this.movingPointIndex = closestIndex;
      this.view.surface.style.cursor = "move";
      
      console.log(`� Selected point ${closestIndex + 1} - Click to place at new location`);
      this.updateDrawingUI(`Moving point ${closestIndex + 1} - Click to place, ESC to cancel`);
    }
  }
  
  /**
   * Update position of moving waypoint (follows cursor)
   */
  async updateMovingPoint(event) {
    if (!this.isMovingPoint || this.movingPointIndex === null) return;
    
    const mapPoint = this.view.toMap({ x: event.x, y: event.y });
    let newPoint = mapPoint;
    
    // Try to snap if enabled
    if (this.enableSnapping && this.railwayTracksLayer) {
      const snapped = await snapToRailway(mapPoint, this.railwayTracksLayer, this.snapTolerance);
      if (snapped) {
        newPoint = snapped;
      }
    }
    
    // Temporarily update the point for preview
    this.currentPoints[this.movingPointIndex] = [newPoint.longitude, newPoint.latitude];
    
    // Update visuals
    this.showEditableWaypoints();
  }
  
  /**
   * Place the moving waypoint at new location
   */
  async placeMovingPoint(mapPoint) {
    if (!this.isMovingPoint || this.movingPointIndex === null) return;
    
    let newPoint = mapPoint;
    
    // Try to snap if enabled
    if (this.enableSnapping && this.railwayTracksLayer) {
      const snapped = await snapToRailway(mapPoint, this.railwayTracksLayer, this.snapTolerance);
      if (snapped) {
        newPoint = snapped;
      }
    }
    
    // Update the point permanently
    this.currentPoints[this.movingPointIndex] = [newPoint.longitude, newPoint.latitude];
    
    // Calculate new length
    const polyline = new Polyline({
      paths: [this.currentPoints],
      spatialReference: { wkid: 4326 }
    });
    const length = calculateRouteLength(polyline);
    
    console.log(`✅ Placed point ${this.movingPointIndex + 1}, new length: ${(length/1000).toFixed(2)}km`);
    
    // Reset moving state
    this.isMovingPoint = false;
    this.movingPointIndex = null;
    this.view.surface.style.cursor = "pointer";
    
    // Update visuals and UI
    this.showEditableWaypoints();
    this.updateDrawingUI(`Route length: ${formatDistance(length)} - Click waypoint to move it`);
  }
  
  /**
   * Cancel moving a waypoint
   */
  cancelMovingPoint() {
    if (!this.isMovingPoint) return;
    
    console.log(`❌ Cancelled moving point ${this.movingPointIndex + 1}`);
    
    this.isMovingPoint = false;
    this.movingPointIndex = null;
    this.view.surface.style.cursor = "pointer";
    
    // Restore original waypoints
    this.showEditableWaypoints();
    
    this.updateDrawingUI('Point movement cancelled - Click waypoint to move it');
  }

  /**
   * Start dragging a waypoint (DEPRECATED - replaced by click-to-move)
   */
  startDragging(event) {
    // This method is no longer used - kept for compatibility
  }
  
  /**
   * Drag a waypoint to new position (DEPRECATED - replaced by click-to-move)
   */
  async dragPoint(event) {
    // This method is no longer used - kept for compatibility
  }
  
  /**
   * Finish dragging a waypoint (DEPRECATED - replaced by click-to-move)
   */
  finishDragging() {
    // This method is no longer used - kept for compatibility
  }

  /**
   * Add a point to the current route
   */
  async addPoint(mapPoint) {
    console.log(`📍 Adding point ${this.currentPoints.length + 1}:`, {
      lon: mapPoint.longitude.toFixed(6),
      lat: mapPoint.latitude.toFixed(6)
    });
    
    let pointToAdd = mapPoint;

    // Try to snap to railway if enabled
    if (this.enableSnapping && this.railwayTracksLayer) {
      const snappedPoint = await snapToRailway(mapPoint, this.railwayTracksLayer, this.snapTolerance);
      if (snappedPoint) {
        pointToAdd = snappedPoint;
        console.log('🧲 Snapped to railway track');
      }
    }

    // Add point to current route
    this.currentPoints.push([pointToAdd.longitude, pointToAdd.latitude]);
    console.log(`   - Total points: ${this.currentPoints.length}`);
    
    // Update visual feedback
    this.updateRoutePreview();
    
    // Add waypoint marker with number
    const waypointType = this.currentPoints.length === 1 ? 'start' : 'waypoint';
    this.addWaypointMarker(pointToAdd, waypointType, this.currentPoints.length);
    
    // Update UI with current length
    if (this.currentPoints.length > 1) {
      const tempPolyline = new Polyline({
        paths: [this.currentPoints],
        spatialReference: { wkid: 4326 } // WGS84 - lon/lat in degrees
      });
      const length = calculateRouteLength(tempPolyline);
      console.log(`   - Current length: ${(length/1000).toFixed(2)}km`);
      this.updateDrawingUI(`Route length: ${formatDistance(length)} - Double-click to finish`);
    } else {
      this.updateDrawingUI('Click to add next point, double-click to finish');
    }
  }

  /**
   * Update drawing preview while moving mouse
   */
  async updateDrawingPreview(event) {
    if (this.currentPoints.length === 0) return;

    const mapPoint = this.view.toMap(event);
    let previewPoint = mapPoint;

    // Try to snap for preview
    if (this.enableSnapping && this.railwayTracksLayer) {
      const snapped = await snapToRailway(mapPoint, this.railwayTracksLayer, this.snapTolerance);
      if (snapped) {
        previewPoint = snapped;
      }
    }

    // Create preview line from last point to cursor
    const lastPoint = this.currentPoints[this.currentPoints.length - 1];
    const previewPath = [
      lastPoint,
      [previewPoint.longitude, previewPoint.latitude]
    ];

    const previewLine = new Polyline({
      paths: [previewPath],
      spatialReference: this.view.spatialReference
    });

    // Update preview graphic
    this.updatePreviewGraphic(previewLine, 'preview');
  }

  /**
   * Update the route preview graphic
   */
  updateRoutePreview() {
    if (this.currentPoints.length < 2) return;

    const polyline = new Polyline({
      paths: [this.currentPoints],
      spatialReference: this.view.spatialReference
    });

    this.updatePreviewGraphic(polyline, 'drawing');
  }

  /**
   * Update or create preview graphic
   */
  updatePreviewGraphic(geometry, type) {
    // Remove existing preview
    const existingPreview = this.tempLayer.graphics.find(g => g.getAttribute('type') === type);
    if (existingPreview) {
      this.tempLayer.remove(existingPreview);
    }

    // Create new preview
    const symbol = type === 'preview' 
      ? { ...createRouteSymbol('drawing'), color: [0, 150, 255, 0.4] }
      : createRouteSymbol('drawing');

    const graphic = new Graphic({
      geometry: geometry,
      symbol: symbol,
      attributes: { type: type }
    });

    this.tempLayer.add(graphic);
  }

  /**
   * Add waypoint marker with number
   */
  addWaypointMarker(point, type, number) {
    const symbol = type === 'start' 
      ? createWaypointSymbol('start')
      : type === 'end'
      ? createWaypointSymbol('end')
      : createWaypointSymbol('waypoint');
    
    const graphic = new Graphic({
      geometry: point,
      symbol: symbol,
      attributes: { 
        type: 'waypoint', 
        waypointType: type,
        waypointNumber: number
      }
    });

    this.tempLayer.add(graphic);
    
    // Add text label with number
    if (number !== undefined) {
      const textGraphic = new Graphic({
        geometry: point,
        symbol: {
          type: "text",
          color: [255, 255, 255, 1], // White text
          text: String(number),
          font: {
            size: 11,
            weight: "bold",
            family: "Arial"
          },
          yoffset: 0,
          haloColor: [0, 0, 0, 0.5],
          haloSize: 1
        },
        attributes: { type: 'waypoint-label' }
      });
      this.tempLayer.add(textGraphic);
    }
  }

  /**
   * Finish drawing the current route
   */
  finishDrawing() {
    if (this.currentPoints.length < 2) {
      this.updateDrawingUI("Route must have at least 2 points");
      console.warn('⚠️ Cannot finish drawing: need at least 2 points');
      return;
    }

    console.log('🏁 Finishing route with', this.currentPoints.length, 'points');
    
    // Check if we're extending an existing route
    if (this.editingRouteId) {
      this.finishExtending();
      return;
    }

    // Create final polyline with WGS84 spatial reference for accurate geodesic calculations
    const polyline = new Polyline({
      paths: [this.currentPoints],
      spatialReference: { wkid: 4326 } // WGS84 - coordinates are in degrees
    });

    console.log('🗺️ Created polyline:', polyline);
    console.log('   - Paths:', polyline.paths);
    console.log('   - Extent:', polyline.extent);

    // Calculate route data
    const routeId = generateRouteId();
    const length = calculateRouteLength(polyline);
    
    console.log(`📏 Route length: ${length}m (${(length/1000).toFixed(2)}km)`);
    
    const routeData = {
      id: routeId,
      name: `Route ${this.routes.size + 1}`,
      geometry: polyline,
      length: length,
      created: new Date().toISOString(),
      points: this.currentPoints.length,
      description: '',
      compliant: undefined, // Will be evaluated later
      color: '#ff0000', // Default red color
      lineWidth: 4, // Default width
      lineStyle: 'solid', // Default style
      metadata: { ...DEFAULT_ROUTE_METADATA },
      compliance: null,
      customStyle: false
    };

    // Create final graphic with VERY VISIBLE symbol
    const routeSymbol = createRouteSymbol('active');
    console.log('🎨 Using symbol:', routeSymbol);
    
    const routeGraphic = new Graphic({
      geometry: polyline,
      symbol: routeSymbol,
      attributes: {
        routeId: routeId,
        name: routeData.name,
        length: length,
        created: routeData.created
      },
      popupTemplate: {
        title: "{name}",
        content: () => {
          const latestRoute = this.getRoute(routeId) || routeData;
          return createRoutePopupContent(latestRoute);
        }
      }
    });

    console.log('🖼️ Created graphic:', routeGraphic);
    console.log('   - Geometry:', routeGraphic.geometry);
    console.log('   - Symbol:', routeGraphic.symbol);
    console.log('   - Attributes:', routeGraphic.attributes);

    // Add to map
    console.log('🗺️ Adding graphic to layer:', this.cableRoutesLayer.title);
    console.log('   - Layer ID:', this.cableRoutesLayer.id);
    console.log('   - Layer visible:', this.cableRoutesLayer.visible);
    console.log('   - Layer opacity:', this.cableRoutesLayer.opacity);
    console.log('   - Current graphics count:', this.cableRoutesLayer.graphics.length);
    
    this.cableRoutesLayer.add(routeGraphic);
    
    console.log('   - Graphics count after add:', this.cableRoutesLayer.graphics.length);
    console.log('   - Graphic visible:', routeGraphic.visible);
    console.log('   - Graphic geometry extent:', routeGraphic.geometry.extent);
    console.log('✅ Graphic added to layer');

    // Store route data with default style properties
    this.routes.set(routeId, {
      ...routeData,
      graphic: routeGraphic
    });
    this.activeRouteId = routeId;
    
    console.log('💾 Stored route data, total routes:', this.routes.size);

    // Clean up drawing state
    this.cleanup();

    // Update UI
    this.updateDrawingUI(`✅ Route created: ${formatDistance(length)}`);
    this.onRouteCreated(routeData);

    console.log('✅ Route creation complete:', routeData);
    
    // Optionally zoom to the route (disabled to prevent unexpected map movement)
    // Uncomment if you want automatic zoom after creating a route:
    // this.view.goTo(routeGraphic.geometry).catch(err => {
    //   console.warn('⚠️ Could not zoom to route:', err);
    // });
  }

  /**
   * Cancel current drawing
   */
  cancelDrawing() {
    this.cleanup();
    this.updateDrawingUI("Drawing cancelled");
    console.log('❌ Drawing cancelled');
  }

  /**
   * Clean up drawing state
   */
  cleanup() {
    this.isDrawing = false;
    this.currentPoints = [];
    this.currentGraphic = null;
    
    // Clear temporary graphics
    this.tempLayer.removeAll();
    
    // Reset cursor
    this.view.surface.style.cursor = "default";
  }

  /**
   * Show editing buttons in UI
   */
  showEditingButtons(routeId) {
    // Add editing buttons to the route item in the list
    const routeElement = document.getElementById(`route-${routeId}`);
    if (routeElement) {
      // Check if editing buttons already exist
      let editingControls = routeElement.querySelector('.editing-controls');
      if (!editingControls) {
        editingControls = document.createElement('div');
        editingControls.className = 'editing-controls';
        editingControls.innerHTML = `
          <hr style="margin: 10px 0; border: none; border-top: 1px solid #e0e0e0;">
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <button onclick="saveRouteEdits('${routeId}')" class="route-action-btn" style="background: #4caf50; border-color: #4caf50; color: white; flex: 1;" title="Save changes to this route">
              💾 Save Changes
            </button>
            <button onclick="cancelRouteEdits('${routeId}')" class="route-action-btn" style="background: #f44336; border-color: #f44336; color: white; flex: 1;" title="Discard changes">
              🚫 Discard
            </button>
          </div>
        `;
        routeElement.appendChild(editingControls);
      }
    }
    
    // Also update the drawing tools widget
    const startBtn = document.querySelector('#start-drawing');
    const cancelBtn = document.querySelector('#cancel-drawing');
    const finishEditBtn = document.querySelector('#finish-editing');
    const cancelEditBtn = document.querySelector('#cancel-editing');
    
    if (startBtn) startBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (finishEditBtn) finishEditBtn.style.display = 'none';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
  }

  /**
   * Hide editing buttons in UI
   */
  hideEditingButtons(routeId) {
    // Remove editing buttons from route item
    if (routeId) {
      const routeElement = document.getElementById(`route-${routeId}`);
      if (routeElement) {
        const editingControls = routeElement.querySelector('.editing-controls');
        if (editingControls) {
          editingControls.remove();
        }
      }
    }
    
    const startBtn = document.querySelector('#start-drawing');
    const cancelBtn = document.querySelector('#cancel-drawing');
    const finishEditBtn = document.querySelector('#finish-editing');
    const cancelEditBtn = document.querySelector('#cancel-editing');
    
    if (startBtn) {
      startBtn.style.display = '';
      startBtn.disabled = false;
    }
    if (cancelBtn) {
      cancelBtn.style.display = '';
      cancelBtn.disabled = true;
    }
    if (finishEditBtn) finishEditBtn.style.display = 'none';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
  }

  /**
   * Toggle snapping on/off
   */
  toggleSnapping() {
    this.enableSnapping = !this.enableSnapping;
    console.log(`📍 Snapping ${this.enableSnapping ? 'enabled' : 'disabled'}`);
    return this.enableSnapping;
  }

  /**
   * Set snap tolerance
   */
  setSnapTolerance(meters) {
    this.snapTolerance = Math.max(5, Math.min(100, meters));
    console.log(`📏 Snap tolerance set to ${this.snapTolerance}m`);
  }

  /**
   * Get all routes
   */
  getAllRoutes() {
    return Array.from(this.routes.values());
  }

  /**
   * Get route by ID
   */
  getRoute(routeId) {
    return this.routes.get(routeId);
  }

  updateRouteMetadata(routeId, updates) {
    const route = this.routes.get(routeId);
    if (!route) {
      console.warn('Route not found for metadata update:', routeId);
      return null;
    }

    const currentMetadata = route.metadata || { ...DEFAULT_ROUTE_METADATA };
    route.metadata = {
      ...currentMetadata,
      ...updates
    };

    this.routes.set(routeId, route);
    return route.metadata;
  }

  setRouteCompliance(routeId, complianceResult) {
    const route = this.routes.get(routeId);
    if (!route) {
      console.warn('Route not found for compliance update:', routeId);
      return;
    }

    route.compliance = complianceResult || null;
    route.compliant = complianceResult?.summary?.status === 'pass';

    if (!route.customStyle) {
      let symbolKey = 'inactive';
      const summaryStatus = complianceResult?.summary?.status;

      if (summaryStatus === 'pass') {
        symbolKey = 'compliant';
      } else if (summaryStatus === 'fail') {
        symbolKey = 'non-compliant';
      }

      route.graphic.symbol = createRouteSymbol(symbolKey);
    }

    route.graphic.popupTemplate = {
      title: "{name}",
      content: () => {
        const latestRoute = this.getRoute(routeId) || route;
        return createRoutePopupContent(latestRoute);
      }
    };

    this.routes.set(routeId, route);
  }

  /**
   * Delete route
   */
  deleteRoute(routeId) {
    const route = this.routes.get(routeId);
    if (route) {
      // Remove graphic from map
      this.cableRoutesLayer.remove(route.graphic);
      
      // Remove from storage
      this.routes.delete(routeId);
      
      // Update active route if needed
      if (this.activeRouteId === routeId) {
        this.activeRouteId = null;
      }
      
      console.log('🗑️ Route deleted:', routeId);
      this.onRouteDeleted(routeId);
    }
  }

  /**
   * Finish extending a route
   */
  finishExtending() {
    const route = this.routes.get(this.editingRouteId);
    if (!route) {
      console.error('Route not found during finish extending');
      return;
    }
    
    console.log('🏁 Finishing route extension');
    
    // Create updated polyline
    const updatedPolyline = new Polyline({
      paths: [this.currentPoints],
      spatialReference: { wkid: 4326 }
    });

    // Calculate new length
    const newLength = calculateRouteLength(updatedPolyline);
    
    console.log(`📏 New route length: ${newLength}m (${(newLength/1000).toFixed(2)}km)`);
    
    // Update route data
    route.geometry = updatedPolyline;
    route.length = newLength;
    route.points = this.currentPoints.length;
    
    // Update graphic
    route.graphic.geometry = updatedPolyline;
    route.graphic.attributes.length = newLength;
    route.graphic.visible = true;
    
    // Update stored route
    this.routes.set(this.editingRouteId, route);
    
    // Cleanup
    const routeId = this.editingRouteId;
    this.cleanup();
    this.editingRouteId = null;
    this.extendingFromEnd = null;
    this.originalPointCount = null;
    
    console.log('✅ Finished extending route:', route);
    this.updateDrawingUI(`✅ Route extended: ${formatDistance(newLength)}`);
    
    // Reset button states
    const startBtn = document.querySelector('#start-drawing');
    const cancelBtn = document.querySelector('#cancel-drawing');
    if (startBtn) startBtn.disabled = false;
    if (cancelBtn) cancelBtn.disabled = true;
    
    // Notify UI
    this.onRouteUpdated(route);
  }

  /**
   * Start editing an existing route
   */
  startEditing(routeId) {
    const route = this.routes.get(routeId);
    if (!route) {
      console.error('Route not found:', routeId);
      return;
    }

    // Cancel any current drawing
    if (this.isDrawing) {
      this.cancelDrawing();
    }

    this.isEditing = true;
    this.editingRouteId = routeId;
    this.currentPoints = [...route.geometry.paths[0]];
    
    // Hide the main route graphic while editing
    route.graphic.visible = false;
    
    // Show editable waypoints
    this.showEditableWaypoints();
    
    // Update cursor
    this.view.surface.style.cursor = "pointer";
    
    // Show editing buttons in UI
    this.showEditingButtons(routeId);
    
    console.log('✏️ Started editing route:', routeId);
    this.updateDrawingUI(`Editing ${route.name} - Click waypoint to move it`);
  }

  /**
   * Show editable waypoints with numbers
   */
  showEditableWaypoints() {
    this.tempLayer.removeAll();
    
    this.currentPoints.forEach((pointArray, index) => {
      const point = new Point({
        longitude: pointArray[0],
        latitude: pointArray[1],
        spatialReference: { wkid: 4326 }
      });
      
      const isFirst = index === 0;
      const isLast = index === this.currentPoints.length - 1;
      const type = isFirst ? 'start' : isLast ? 'end' : 'waypoint';
      
      this.addWaypointMarker(point, type, index + 1);
    });
    
    // Show preview of route
    this.updateRoutePreview();
  }

  /**
   * Finish editing and update the route
   */
  finishEditing() {
    if (!this.isEditing || !this.editingRouteId) {
      return;
    }

    const route = this.routes.get(this.editingRouteId);
    if (!route) {
      console.error('Route not found during finish editing');
      return;
    }

    // Create updated polyline
    const updatedPolyline = new Polyline({
      paths: [this.currentPoints],
      spatialReference: { wkid: 4326 }
    });

    // Calculate new length
    const newLength = calculateRouteLength(updatedPolyline);
    
    // Update route data
    route.geometry = updatedPolyline;
    route.length = newLength;
    route.points = this.currentPoints.length;
    
    // Update graphic
    route.graphic.geometry = updatedPolyline;
    route.graphic.attributes.length = newLength;
    route.graphic.visible = true;
    
    // Update stored route
    this.routes.set(this.editingRouteId, route);
    
    // Cleanup
    const routeId = this.editingRouteId;
    this.isEditing = false;
    this.editingRouteId = null;
    this.currentPoints = [];
    this.tempLayer.removeAll();
    this.view.surface.style.cursor = "default";
    
    // Hide editing buttons
    this.hideEditingButtons(routeId);
    
    console.log('✅ Finished editing route:', route);
    this.updateDrawingUI(`✅ Route updated: ${formatDistance(newLength)}`);
    
    // Notify UI
    this.onRouteUpdated(route);
  }

  /**
   * Cancel editing
   */
  cancelEditing() {
    if (!this.isEditing || !this.editingRouteId) {
      return;
    }

    const route = this.routes.get(this.editingRouteId);
    if (route) {
      route.graphic.visible = true;
    }
    
    const routeId = this.editingRouteId;
    this.isEditing = false;
    this.editingRouteId = null;
    this.currentPoints = [];
    this.tempLayer.removeAll();
    this.view.surface.style.cursor = "default";
    
    // Hide editing buttons
    this.hideEditingButtons(routeId);
    
    console.log('❌ Cancelled editing');
    this.updateDrawingUI('Editing cancelled');
  }

  /**
   * Extend route from start or end
   */
  extendRoute(routeId, fromEnd = true) {
    const route = this.routes.get(routeId);
    if (!route) {
      console.error('Route not found:', routeId);
      return;
    }

    // Start in drawing mode but with existing points
    this.isDrawing = true;
    this.isEditing = false;
    this.editingRouteId = routeId;
    this.extendingFromEnd = fromEnd;
    
    if (fromEnd) {
      // Extend from end - keep all points in order
      this.currentPoints = [...route.geometry.paths[0]];
    } else {
      // Extend from start - we'll add to beginning, so keep points as-is
      // When finishing, we'll prepend the new points
      this.currentPoints = [...route.geometry.paths[0]];
      this.originalPointCount = this.currentPoints.length;
    }
    
    // Hide original graphic
    route.graphic.visible = false;
    
    // Show waypoints
    this.showEditableWaypoints();
    
    this.view.surface.style.cursor = "crosshair";
    
    console.log(`➡️ Extending route from ${fromEnd ? 'end' : 'start'}`);
    this.updateDrawingUI(`Extending ${route.name} from ${fromEnd ? 'END' : 'START'} - Click to add points, double-click to finish`);
    
    // Show cancel button (extending acts like drawing, not editing)
    const startBtn = document.querySelector('#start-drawing');
    const cancelBtn = document.querySelector('#cancel-drawing');
    if (startBtn) startBtn.disabled = true;
    if (cancelBtn) cancelBtn.disabled = false;
  }
  selectRoute(routeId) {
    // Deselect current route
    if (this.activeRouteId) {
      const currentRoute = this.routes.get(this.activeRouteId);
      if (currentRoute) {
        currentRoute.graphic.symbol = createRouteSymbol('inactive');
      }
    }

    // Select new route
    const newRoute = this.routes.get(routeId);
    if (newRoute) {
      newRoute.graphic.symbol = createRouteSymbol('active');
      this.activeRouteId = routeId;
      
      // Zoom to route
      this.view.goTo(newRoute.geometry);
      
      console.log('🎯 Route selected:', routeId);
      this.onRouteSelected(newRoute);
    }
  }

  /**
   * Update the color of a route's trace on the map
   * @param {string} routeId - The ID of the route to update
   * @param {string} hexColor - The hex color value (e.g., '#ff0000')
   */
  updateRouteColor(routeId, hexColor) {
    const route = this.routes.get(routeId);
    if (!route) {
      console.warn('Route not found:', routeId);
      return;
    }

    // Convert hex to RGB array
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Store the color in the route data
    route.color = hexColor;
    
    // Create a custom symbol with the selected color
    const customSymbol = {
      type: "simple-line",
      color: [r, g, b, 1],
      width: this.activeRouteId === routeId ? 8 : 4, // Thicker if active
      style: "solid",
      cap: "round",
      join: "round"
    };
    
    // Update the graphic's symbol
    route.graphic.symbol = customSymbol;
  route.customStyle = true;
  route.customStyle = true;
    
    console.log(`🎨 Updated route ${routeId} color to ${hexColor}`);
    
    // Notify that route was updated
    const routeData = {
      id: routeId,
      name: route.name,
      length: route.length,
      points: route.points,
      created: route.created,
      color: hexColor
    };
    
    this.onRouteUpdated(routeData);
  }

  /**
   * Update the complete style of a route (color, width, and line style)
   * @param {string} routeId - The ID of the route to update
   * @param {Object} style - Style object with color, width, and style properties
   */
  updateRouteStyle(routeId, style) {
    const route = this.routes.get(routeId);
    if (!route) {
      console.warn('Route not found:', routeId);
      return;
    }

    const { color, width, style: lineStyle } = style;
    
    // Convert hex to RGB array
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Store the style in the route data
    route.color = color;
    route.lineWidth = width;
    route.lineStyle = lineStyle;
    
    // Map line styles to ArcGIS line styles
    const arcgisStyles = {
      'solid': 'solid',
      'dash': 'dash',
      'dot': 'dot',
      'dash-dot': 'dash-dot',
      'long-dash': 'long-dash'
    };
    
    // Create a custom symbol with the selected style
    const customSymbol = {
      type: "simple-line",
      color: [r, g, b, 1],
      width: this.activeRouteId === routeId ? width + 2 : width, // Slightly thicker if active
      style: arcgisStyles[lineStyle] || 'solid',
      cap: "round",
      join: "round"
    };
    
    // Update the graphic's symbol
    route.graphic.symbol = customSymbol;
    
    console.log(`🎨 Updated route ${routeId} style:`, { color, width, lineStyle });
    
    // Notify that route was updated
    const routeData = {
      id: routeId,
      name: route.name,
      length: route.length,
      points: route.points,
      created: route.created,
      color: color,
      lineWidth: width,
      lineStyle: lineStyle
    };
    
    this.onRouteUpdated(routeData);
  }

  /**
   * Update drawing UI feedback - override in implementation
   */
  updateDrawingUI(message) {
    // This will be overridden when integrated with main UI
    console.log('📝 Drawing UI:', message);
  }

  /**
   * Route created callback - override in implementation
   */
  onRouteCreated(routeData) {
    // Override this in main application
  }

  /**
   * Route deleted callback - override in implementation
   */
  onRouteDeleted(routeId) {
    // Override this in main application
  }

  /**
   * Route updated callback - override in implementation
   */
  onRouteUpdated(routeData) {
    // Override this in main application
  }

  /**
   * Route selected callback - override in implementation
   */
  onRouteSelected(routeData) {
    // Override this in main application
  }

  /**
   * Cleanup when manager is destroyed
   */
  destroy() {
    // Remove event handlers
    this.clickHandler?.remove();
    this.pointerMoveHandler?.remove();
    this.doubleClickHandler?.remove();
    this.keyHandler?.remove();
    
    // Remove temp layer
    this.view.map.remove(this.tempLayer);
    
    console.log('🧹 Enhanced Drawing Manager destroyed');
  }
}