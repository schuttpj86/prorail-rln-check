# Spatial Reference Projection Fix

## Problem
When clicking to place joints/earthing points, the application crashed with this error:
```
❌ Chainage calculation failed: Error: The input unit and the spatial reference unit are not of the same unit type.ie Linear vs.Angular
```

## Root Cause
- **Map View**: Uses Web Mercator projection (WKID 102100)
- **Route Geometry**: When drawn by user, created in **WGS84 Geographic** (WKID 4326) - uses degrees!
- **Target System**: ProRail data uses **RD New** (Dutch National Grid, WKID 28992) - uses meters
- **Click Point**: Captured in Web Mercator (102100)
- **Distance Calculation**: Tried to calculate distance between geometries in incompatible spatial references

The problem was trying to project to the route's spatial reference (4326 - degrees), when we should project **both** the click point AND route geometry to RD New (28992 - meters) for accurate distance calculations.

Key insight: **WGS84 (4326) uses angular units (degrees), not linear units (meters)**, so `geometryEngine.distance()` with "meters" parameter fails.

## Solution
1. **Import Projection Module and SpatialReference**:
   ```javascript
   import * as projection from "@arcgis/core/geometry/projection";
   import SpatialReference from "@arcgis/core/geometry/SpatialReference";
   ```

2. **Load Projection Engine on Startup**:
   ```javascript
   function initializeMap() {
     // Load projection engine for coordinate transformations
     projection.load().then(() => {
       console.log('✅ Projection engine loaded');
     });
     // ... rest of initialization
   }
   ```

3. **Always Use RD New (28992) for All Spatial Calculations**:
   ```javascript
   // Always use RD New (28992) for spatial calculations
   const rdNewSR = new SpatialReference({ wkid: 28992 });
   
   // Project click point to RD New
   let clickPoint = event.mapPoint;
   if (clickPoint.spatialReference.wkid !== 28992) {
     console.log(`🔄 Projecting click point from ${clickPoint.spatialReference.wkid} to 28992 (RD New)...`);
     clickPoint = projection.project(clickPoint, rdNewSR);
   }
   
   // Project route geometry to RD New if needed
   let routeGeometry = routeGraphic.geometry;
   if (routeGeometry.spatialReference.wkid !== 28992) {
     console.log(`🔄 Projecting route geometry from ${routeGeometry.spatialReference.wkid} to 28992 (RD New)...`);
     routeGeometry = projection.project(routeGeometry, rdNewSR);
   }
   
   // Now both are in RD New - safe to calculate distance
   const distanceToRoute = geometryEngine.distance(clickPoint, routeGeometry, "meters");
   ```

## Technical Details

### Spatial Reference Systems
- **WKID 102100 (Web Mercator)**: 
  - Used by most web maps (map view)
  - Units: meters (linear)
  - Good for visualization
  
- **WKID 4326 (WGS84 Geographic)**:
  - Standard GPS coordinate system
  - Units: **degrees (angular)** ⚠️
  - Cannot use with meter-based distance calculations
  - Routes created by drawing tools use this by default
  
- **WKID 28992 (RD New)**:
  - Dutch National Grid (Rijksdriehoekscoördinaten)
  - Units: meters (linear)
  - Used by ProRail infrastructure data
  - More accurate for Dutch geography
  - **Required for all spatial calculations in this app**

### Why Projection is Needed
Different spatial reference systems represent the same location with different coordinates:
- Web Mercator (102100): Map display coordinates
- WGS84 (4326): GPS-style lat/lon in **degrees** (angular units)
- RD New (28992): Dutch grid coordinates in **meters** (linear units)

The critical issue: **You cannot calculate distances in meters using WGS84 (4326)** because it uses degrees. The error "Linear vs Angular" occurs when trying to mix unit types.

**Solution**: Convert ALL geometries to RD New (28992) before any spatial operations. This ensures:
1. All coordinates are in the same coordinate system
2. All units are linear (meters)
3. Distance calculations are accurate for Dutch geography

### Projection Performance
- Projection is a one-time operation per click
- The projection engine is loaded once at startup
- Small performance impact (~few milliseconds per click)
- Essential for accurate spatial calculations

## Files Modified
1. `src/main.js`:
   - Added `projection` import
   - Added `projection.load()` in `initializeMap()`
   - Added coordinate projection logic in click handler (around line 1695)

## Testing
After refresh, the joint marking should work:
1. Draw or select a route
2. Click "⚡ Mark Joints/Earthing" button
3. Click anywhere on the map
4. System should:
   - ✅ Project click point to RD New (28992)
   - ✅ Calculate distance to route correctly
   - ✅ Snap to nearest point on route
   - ✅ Calculate chainage along route
   - ✅ Query nearest track
   - ✅ Place color-coded marker

Console should show:
```
📍 Map clicked - placing joint...
   🔄 Projecting click point from 102100 to 28992 (RD New)...
   � Projecting route geometry from 4326 to 28992 (RD New)...
   �📏 Distance from click to route: X.XXm
   ✅ Snapping to nearest point on route...
   📏 Chainage: X.XXm from route start
   �️ Querying nearest track...
   ✅ Distance to track: X.XXm
```

## Lessons Learned
- **Always check spatial references** when working with multiple geometry sources
- **Load projection engine early** if mixing coordinate systems
- **NEVER use WGS84 (4326) for distance calculations** - it uses degrees, not meters
- **Always project to a common LINEAR coordinate system** (like RD New 28992) before spatial operations
- **Web maps (102100) ≠ GPS coords (4326) ≠ Local grids (28992)** - all three are different!
- **Routes drawn by users may be in WGS84 (4326)** - always project them before calculations

## Related Documentation
- [ArcGIS Projection Documentation](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-projection.html)
- [Spatial References](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-SpatialReference.html)
- [GeometryEngine Distance](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-geometryEngine.html#distance)
