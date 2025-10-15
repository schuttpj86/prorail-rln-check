# Route Import/Export Feature - Complete Implementation

## Summary

Successfully implemented comprehensive JSON import/export functionality for the ProRail Cable Route Evaluator. This feature enables users to export routes to JSON files and import routes from both minimal (CAD-converted) and full (previously exported) formats.

## Changes Made

### 1. Export Functionality

#### Files Created:
- `src/utils/routeExporter.js` - Complete export utility with all functions
- `ROUTE_JSON_EXPORT_FEATURE.md` - Comprehensive documentation

#### Features:
- **Individual Route Export**: Export single routes with all metadata
- **Bulk Export**: Export all routes to a single collection file
- **Export Button in Route Card**: Quick export from collapsed route view
- **Export All Button**: Top-level button to export all routes at once

#### UI Integration:
- Added export icon button (💾 download icon) to each route header
- Added "Export All" button in routes panel header
- Visual feedback on successful export (green checkmark for 2 seconds)

### 2. Import Functionality

#### Files Created:
- `src/utils/routeImporter.js` - Complete import utility supporting multiple formats
- `examples/minimal-import-example.json` - Example minimal format
- `examples/cad-import-example.json` - Example CAD conversion format
- `examples/overhead-import-example.json` - Example overhead line format

#### Supported Import Formats:

**Minimal Format** (from CAD/DWG):
```json
{
  "name": "Route Name",
  "coordinates": [[lon, lat], [lon, lat], ...],
  "voltageKv": 110,
  "infrastructureType": "cable"
}
```

**Full Format** (from previous export):
- Complete route data with all metadata
- EMC parameters
- Style information
- Original creation date

**Collection Format**:
- Multiple routes in single file
- Batch import capability

#### Features:
- Validates import data structure
- Supports multiple coordinate formats:
  - `[[x, y], [x, y]]`
  - `[{x: ..., y: ...}]`
  - `[{longitude: ..., latitude: ...}]`
  - `[{lon: ..., lat: ...}]`
- Automatic route length calculation
- **Random color assignment** for each imported route
- Preserves imported metadata when available
- Provides sensible defaults for missing fields
- Error handling and validation
- Success/failure summary after import

#### UI Integration:
- Added "📂 Import" button in routes panel header
- Hidden file input for JSON file selection
- Import progress feedback
- Success/failure alert with statistics

### 3. Additional Features

#### Zoom to Route:
- Click route name to zoom to its location on map
- Smooth animation (800ms ease-in-out)
- Visual flash effect to indicate the route
- Route name changes color on hover to indicate clickability

### 4. Bug Fixes

- Fixed imported routes not having `geometry` property for EMC evaluation
- Routes now have both `graphic.geometry` and direct `geometry` reference
- Imported routes now use `getNextRouteColor()` for random color assignment
- Each imported route gets a unique color from the palette

## Data Structure

### Export Schema (Single Route):
```json
{
  "id": "route-xxx",
  "name": "Route Name",
  "description": "",
  "created": "2025-10-15T...",
  "lastModified": "2025-10-15T...",
  "geometry": {
    "type": "LineString",
    "coordinates": [[lon, lat], ...],
    "spatialReference": {"wkid": 4326}
  },
  "waypoints": [{longitude, latitude, x, y}, ...],
  "measurements": {
    "totalLength": 4090.24,
    "totalLengthKm": "4.090",
    "pointCount": 4,
    "segmentCount": 3
  },
  "style": {
    "color": "#2563eb",
    "width": 3,
    "visible": true
  },
  "metadata": {
    "infrastructureType": "cable",
    "voltageKv": 110,
    "faultClearingTimeMs": 120,
    "electrifiedSystem": "standard",
    "minJointDistanceMeters": null,
    "hasDoubleGuying": null,
    "hasBoredCrossing": null,
    "hasIsolatedNeutral": null,
    "notes": ""
  },
  "attributes": {...},
  "exportInfo": {
    "version": "1.0.0",
    "exportDate": "2025-10-15T...",
    "application": "ProRail Cable Route Evaluator",
    "schema": "prorail-route-v1"
  }
}
```

## Use Cases

1. **Data Backup**: Regular exports for project backups
2. **CAD Integration**: Import routes from AutoCAD/DWG conversions
3. **Data Sharing**: Share route configurations between engineers
4. **Project Documentation**: Include route data in reports
5. **External Processing**: Use exported data in other tools
6. **Migration**: Transfer data between systems

## Files Modified

1. `src/main.js`:
   - Added import statements for export/import utilities
   - Added `exportRouteJSON()` function
   - Added `exportAllRoutesJSON()` function
   - Added `handleImportFile()` function
   - Added `createRouteFromImport()` function
   - Added `zoomToRoute()` function
   - Modified route header to make name clickable
   - Added export button to route cards
   - Fixed geometry reference for imported routes
   - Imported `getNextRouteColor` from drawingUtils

2. `index.html`:
   - Added "Import" button
   - Added "Export All" button
   - Added hidden file input element
   - Reorganized button layout with flexbox wrap

## User Interface

### Routes Panel Header:
```
[➕ Route] [📂 Import] [💾 Export All] [0 routes]
```

### Route Card (Collapsed):
```
[Color Bar] Route Name                    [👁️] [🔍] [💾] [▶]
            4.09 km • 4 pts
```

### Buttons:
- **➕ Route**: Create new route by drawing
- **📂 Import**: Import routes from JSON file
- **💾 Export All**: Export all routes to single file
- **👁️**: Toggle route visibility
- **🔍**: Evaluate route compliance
- **💾**: Export individual route
- **▶**: Expand/collapse route details

## Testing

Tested with:
1. ✅ Export individual route (Route_1.json)
2. ✅ Export all routes (collection format)
3. ✅ Import minimal format (cad-import-example.json)
4. ✅ Import with different coordinate formats
5. ✅ Import overhead line (overhead-import-example.json)
6. ✅ Imported routes get unique colors
7. ✅ Imported routes can be evaluated
8. ✅ Click route name to zoom
9. ✅ Visual feedback on all actions

## Language Settings

**Default Language**: English (en)
- Application defaults to English on first load
- Language preference saved in localStorage: `prorail-language`
- If seeing Dutch, clear browser localStorage or switch language using language toggle button

To reset language to English:
```javascript
localStorage.setItem('prorail-language', 'en');
location.reload();
```

## Next Steps

Future enhancements could include:
1. Drag-and-drop import
2. Import from other formats (GPX, KML, Shapefile)
3. Export with evaluation results included
4. Batch operations (export selected routes)
5. Import validation preview before creating routes
6. Custom export templates
7. Import history/undo

## Technical Notes

- All coordinates in WGS84 (EPSG:4326)
- Route length calculated using geodesic distance
- File naming automatically sanitizes special characters
- Pretty-printed JSON for readability (2-space indent)
- Comprehensive error handling with user feedback
- Import validation catches malformed data
- Routes get unique IDs to prevent conflicts

## Commit Message

```
feat: Add comprehensive route import/export functionality

- Add routeExporter.js with full export utilities
- Add routeImporter.js supporting minimal and full formats
- Add export button to each route card header
- Add import/export buttons to routes panel
- Add click-to-zoom functionality on route names
- Support multiple coordinate formats for import
- Generate random colors for imported routes
- Include example JSON files for CAD import
- Fix geometry reference for imported routes
- Add comprehensive documentation
- Visual feedback for all operations
```
