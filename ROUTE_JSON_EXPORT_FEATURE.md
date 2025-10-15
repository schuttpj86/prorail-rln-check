# Route JSON Export Feature

## Overview

The ProRail Cable Route Evaluator now includes a comprehensive JSON export functionality that allows users to export individual routes or all routes to JSON files. This feature captures all route information including coordinates, metadata, EMC parameters, and configurations.

## Features

### 1. Individual Route Export
- **Location**: Each route card has an "💾 Export JSON" button
- **Action**: Exports a single route with all its data
- **File naming**: Uses the route name (sanitized for file systems)
- **Format**: Pretty-printed JSON for readability

### 2. Export All Routes
- **Location**: "💾 Export All" button in the routes panel header
- **Action**: Exports all routes into a single JSON file
- **File naming**: `prorail-routes-YYYY-MM-DD.json`
- **Format**: Collection format with metadata about the export

## Exported Data Structure

### Single Route Export Schema

```json
{
  "id": "route-12345",
  "name": "High Voltage Connection Route 1",
  "description": "Route description text",
  "created": "2025-10-15T10:30:00.000Z",
  "lastModified": "2025-10-15T11:45:00.000Z",
  
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [4.8951, 52.3676],
      [4.8965, 52.3682],
      ...
    ],
    "spatialReference": {
      "wkid": 4326,
      "latestWkid": 4326
    }
  },
  
  "waypoints": [
    {
      "longitude": 4.8951,
      "latitude": 52.3676,
      "x": 4.8951,
      "y": 52.3676
    },
    ...
  ],
  
  "measurements": {
    "totalLength": 1523.456,
    "totalLengthKm": "1.523",
    "pointCount": 5,
    "segmentCount": 4
  },
  
  "style": {
    "color": "#ff0000",
    "width": 3,
    "visible": true
  },
  
  "metadata": {
    "infrastructureType": "cable",
    "voltageKv": 110,
    "faultClearingTimeMs": 120,
    "electrifiedSystem": "standard",
    "minJointDistanceMeters": 31,
    "hasDoubleGuying": null,
    "hasBoredCrossing": null,
    "hasIsolatedNeutral": null,
    "notes": ""
  },
  
  "attributes": {
    "name": "High Voltage Connection Route 1",
    "id": "route-12345"
  },
  
  "exportInfo": {
    "version": "1.0.0",
    "exportDate": "2025-10-15T11:45:00.000Z",
    "application": "ProRail Cable Route Evaluator",
    "schema": "prorail-route-v1"
  }
}
```

### Multiple Routes Export Schema

```json
{
  "exportInfo": {
    "version": "1.0.0",
    "exportDate": "2025-10-15T11:45:00.000Z",
    "application": "ProRail Cable Route Evaluator",
    "schema": "prorail-routes-collection-v1",
    "routeCount": 3
  },
  "routes": [
    { /* route 1 data */ },
    { /* route 2 data */ },
    { /* route 3 data */ }
  ]
}
```

## Data Fields Explained

### Basic Information
- **id**: Unique identifier for the route
- **name**: User-defined route name
- **description**: Optional route description
- **created**: ISO 8601 timestamp of route creation
- **lastModified**: ISO 8601 timestamp of last modification

### Geometry
- **type**: Always "LineString" for routes
- **coordinates**: Array of [longitude, latitude] pairs
- **spatialReference**: Coordinate system information (typically WGS84 - WKID 4326)

### Waypoints
Detailed coordinate information for each point in the route:
- **longitude**: X coordinate (degrees)
- **latitude**: Y coordinate (degrees)
- **x/y**: Alternative notation for the same coordinates

### Measurements
- **totalLength**: Total route length in meters
- **totalLengthKm**: Total length formatted as kilometers (string)
- **pointCount**: Number of waypoints in the route
- **segmentCount**: Number of line segments (pointCount - 1)

### Style
- **color**: Route color as hex code (e.g., "#ff0000")
- **width**: Line width in pixels (default: 3)
- **visible**: Boolean indicating if route is currently visible on map

### EMC Metadata
Electromagnetic Compatibility parameters according to RLN00398 V002:

- **infrastructureType**: "cable" or "overhead"
- **voltageKv**: Operating voltage in kilovolts (e.g., 110, 150, 220)
- **faultClearingTimeMs**: Fault clearing time in milliseconds (e.g., 120, 200)
- **electrifiedSystem**: "standard" or "25kv_50hz"
- **minJointDistanceMeters**: Minimum distance between joints/earthing points
- **hasDoubleGuying**: Boolean or null - double guying confirmation for overhead lines
- **hasBoredCrossing**: Boolean or null - insulated conduit for bored crossings
- **hasIsolatedNeutral**: Boolean or null - isolated neutral (IT earthing system)
- **notes**: Additional text notes

### Export Info
- **version**: Export schema version (currently 1.0.0)
- **exportDate**: When the export was created
- **application**: Source application name
- **schema**: Schema identifier for validation
  - `prorail-route-v1`: Single route
  - `prorail-routes-collection-v1`: Multiple routes

## Use Cases

### 1. Data Backup
Export routes regularly to maintain backups of your work.

### 2. Data Sharing
Share route configurations with colleagues by sending the JSON file.

### 3. Documentation
Include exported route data in project documentation or reports.

### 4. Future Import Feature
The export format is designed to support a future import feature that will allow:
- Loading previously exported routes back into the application
- Sharing routes between users
- Migrating data between systems

### 5. External Processing
Use exported data in external tools or scripts for:
- Statistical analysis
- Report generation
- Integration with other GIS systems
- Custom visualizations

## Technical Details

### File Format
- **Encoding**: UTF-8
- **MIME Type**: application/json
- **Pretty Print**: 2-space indentation for readability

### Filename Sanitization
Special characters in route names are replaced with underscores for safe file system usage.

### Coordinate System
All coordinates are exported in WGS84 (EPSG:4326) format with longitude/latitude in decimal degrees.

### Null vs Empty Values
- Null values indicate fields that are explicitly unset
- Empty strings indicate fields that are set but empty
- Missing fields are not included in the export

## Future Enhancements

### Planned Features
1. **Import Functionality**: Load routes from exported JSON files
2. **Batch Import**: Import multiple routes from a collection file
3. **Copy to Clipboard**: Copy route JSON directly to clipboard
4. **Export with Evaluation Results**: Include compliance evaluation results
5. **Export Selected Routes**: Choose specific routes to export
6. **Custom Export Templates**: Define custom export formats

### Import Validation
When the import feature is implemented, it will validate:
- JSON structure and schema version
- Coordinate validity
- Required field presence
- Data type correctness
- Spatial reference compatibility

## API Documentation

### Functions Available

#### `exportRouteToJSON(route)`
Converts a single route object to JSON-serializable format.

**Parameters:**
- `route` (Object): Route data from EnhancedDrawingManager

**Returns:** Object with route data

**Throws:** Error if route data is invalid

#### `exportAllRoutesToJSON(routes)`
Converts all routes to a collection format.

**Parameters:**
- `routes` (Map): Map of all routes from EnhancedDrawingManager

**Returns:** Object with routes collection

#### `exportAndDownloadRoute(route, routeName)`
Exports a route and triggers browser download.

**Parameters:**
- `route` (Object): Route data
- `routeName` (String, optional): Custom filename

**Returns:** Boolean success status

#### `exportAndDownloadAllRoutes(routes, filename)`
Exports all routes and triggers browser download.

**Parameters:**
- `routes` (Map): Map of all routes
- `filename` (String, optional): Custom filename

**Returns:** Boolean success status

#### `validateRouteData(data)`
Validates imported route data structure.

**Parameters:**
- `data` (Object): Parsed JSON data

**Returns:** Boolean indicating validity

#### `generateRouteSummary(route)`
Generates human-readable summary of route.

**Parameters:**
- `route` (Object): Route data

**Returns:** String with formatted summary

## Error Handling

The export functions include comprehensive error handling:
- Missing or invalid route data
- Geometry extraction failures
- File system errors
- Browser compatibility issues

Errors are logged to console and shown to user via alert dialogs.

## Browser Compatibility

The export feature uses modern browser APIs:
- **Blob API**: For creating file content
- **URL.createObjectURL**: For generating download links
- **File Download**: Via programmatic link click

Supported in all modern browsers (Chrome, Firefox, Edge, Safari).

## Examples

### Example 1: Export Single Route
```javascript
// From a button click
window.exportRouteJSON('route-12345');
```

### Example 2: Export All Routes
```javascript
// From the export all button
window.exportAllRoutesJSON();
```

### Example 3: Programmatic Export
```javascript
const { drawingManager } = window.app;
const route = drawingManager.getRoute('route-12345');
exportAndDownloadRoute(route, 'my-custom-filename');
```

## Summary

The JSON export feature provides a complete data export solution that:
- ✅ Captures all route information
- ✅ Preserves EMC parameters
- ✅ Includes geometry and coordinates
- ✅ Maintains metadata and styling
- ✅ Supports single and batch export
- ✅ Uses standard JSON format
- ✅ Prepares for future import capability

This foundation enables data portability, backup, sharing, and future integration capabilities.
