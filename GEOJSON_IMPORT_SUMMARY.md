# GeoJSON Import Enhancement - Summary

## Current Status ✅

Your application **already has excellent import functionality** in `routeImporter.js` and it has now been **enhanced with standard GeoJSON support**.

---

## What Was Done

### 1. Enhanced Import Support (routeImporter.js)
Added support for **standard GeoJSON formats**:

#### New Formats Supported:
- ✅ **GeoJSON Feature** - Single route as `{"type": "Feature", "geometry": {...}}`
- ✅ **GeoJSON FeatureCollection** - Multiple routes as `{"type": "FeatureCollection", "features": [...]}`
- ✅ **LineString geometry** - Standard line representation
- ✅ **MultiLineString geometry** - Multiple connected segments (automatically flattened)

#### Coordinate Reference Systems:
- ✅ WGS84 (EPSG:4326) - GPS coordinates
- ✅ RD New (EPSG:28992) - Dutch national grid
- ✅ Web Mercator (EPSG:3857) - Web mapping
- ✅ Auto-detection from GeoJSON `crs` property

### 2. Example Files Created
- ✅ `example-geojson-single-route.json` - Single route example
- ✅ `example-geojson-multiple-routes.json` - Multiple routes example
- ✅ `CUSTOMER_DATA_REQUEST.md` - Comprehensive guide for customers

---

## Supported Import Formats

### Format 1: GeoJSON Feature (Standard) ⭐ NEW
```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [[lon, lat], [lon, lat], ...]
  },
  "properties": {
    "name": "Route Name",
    "voltageKv": 110,
    "infrastructureType": "cable"
  }
}
```

### Format 2: GeoJSON FeatureCollection ⭐ NEW
```json
{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "geometry": {...}, "properties": {...} },
    { "type": "Feature", "geometry": {...}, "properties": {...} }
  ]
}
```

### Format 3: Minimal JSON (Already Supported)
```json
{
  "name": "Route",
  "coordinates": [[lon, lat], [lon, lat], ...],
  "voltageKv": 110
}
```

### Format 4: ProRail Export (Already Supported)
Your app's native export format (like `New_110_kV_Cable.json`)

---

## Property Mapping

The importer automatically maps various property names from CAD/GIS systems:

### Basic Properties:
| GeoJSON Property | Alternative Names | Internal Field |
|-----------------|-------------------|----------------|
| `name` | `Name`, `routeName`, `id` | `name` |
| `description` | `desc`, `notes`, `remarks` | `description` |
| `type` | `infrastructureType`, `category` | `metadata.infrastructureType` |

### Technical Properties:
| GeoJSON Property | Alternative Names | Internal Field |
|-----------------|-------------------|----------------|
| `voltageKv` | `voltage`, `kV`, `voltage_kv` | `metadata.voltageKv` |
| `faultClearingTimeMs` | `clearingTime`, `fault_time` | `metadata.faultClearingTimeMs` |
| `minJointDistanceMeters` | `jointDistance`, `joint_spacing` | `metadata.minJointDistanceMeters` |
| `hasDeltaOrMulticore` | `deltaConfig` | `metadata.hasDeltaOrMulticore` |
| `hasPadCurrentControl` | `currentControl` | `metadata.hasPadCurrentControl` |

### Visual Properties:
| GeoJSON Property | Alternative Names | Internal Field |
|-----------------|-------------------|----------------|
| `color` | `routeColor`, `stroke` | `color` |

---

## What to Request from Customer

### Recommendation Hierarchy:

#### 🥇 **Best Option: Standard GeoJSON**
- **Format**: GeoJSON (RFC 7946)
- **Geometry**: LineString or MultiLineString
- **CRS**: WGS84 (EPSG:4326) preferred, or RD New (EPSG:28992)
- **Why**: Universal standard, works with all GIS tools
- **Export from**: QGIS, ArcGIS, AutoCAD Map 3D, FME

#### 🥈 **Good Option: Shapefile**
- **Format**: .shp + .shx + .dbf + .prj files
- **Why**: Industry standard, easily converted to GeoJSON
- **Export from**: Any GIS software
- **Note**: Requires conversion (you or they can use QGIS)

#### 🥉 **Acceptable Option: CAD Native**
- **Formats**: DXF, DWG (AutoCAD), DGN (MicroStation)
- **Why**: Common in infrastructure projects
- **Note**: Requires conversion using FME or QGIS
- **Must include**: Coordinate system definition

#### ❌ **Avoid**: 
- PDF drawings (cannot extract accurate coordinates)
- Image files (raster, not vector)
- Proprietary formats without converters

---

## CAD Export Instructions

### From AutoCAD / Civil 3D:
```
1. Select cable polyline(s)
2. Type: MAPEXPORT
3. Format: GeoJSON or SHP
4. CRS: WGS84 (EPSG:4326) or RD New (EPSG:28992)
5. Save file
```

### From QGIS:
```
1. Right-click layer → Export → Save Features As
2. Format: GeoJSON
3. CRS: EPSG:4326 (WGS84)
4. Geometry: LineString
5. Save
```

### From ArcGIS Pro:
```
1. Right-click layer → Data → Export Features
2. Output: GeoJSON
3. Coordinate System: WGS84 or RD New
4. Export
```

---

## Data Quality Requirements

### Minimum Requirements:
- ✅ At least **2 points** per route
- ✅ Valid coordinate ranges:
  - WGS84: lon 3-8°, lat 50-54° (Netherlands region)
  - RD New: x 0-300km, y 300-625km
- ✅ Continuous path (no gaps)

### Recommended Quality:
- 🎯 **Point density**: 
  - Curves: 10-50m spacing
  - Straight sections: up to 500m spacing
- 🎯 **Coordinate precision**: 6 decimal places (≈0.1m accuracy)
- 🎯 **Follow actual route**: Not straight lines between endpoints

---

## Testing Process

### Step 1: Customer Exports Data
Customer uses their CAD/GIS tool to export cable route as GeoJSON

### Step 2: Validate GeoJSON
Test on [geojson.io](https://geojson.io) or [GeoJSONLint](https://geojsonlint.com)

### Step 3: Import to Your App
- Click "Import Route" button
- Select GeoJSON file
- Route appears on map with metadata

### Step 4: Verify Import
- ✅ Route displays correctly on map
- ✅ Length calculation is accurate
- ✅ Metadata fields populated (if provided)
- ✅ Can run EMC evaluation

---

## Implementation Details

### Code Changes:
**File**: `cable-route-evaluator/src/utils/routeImporter.js`

**New Functions**:
- `importGeoJSONFeature()` - Handles GeoJSON Feature objects
- Enhanced `validateImportData()` - Detects GeoJSON format
- Enhanced `importRoutes()` - Routes GeoJSON to new handler

**Key Features**:
- Auto-detects GeoJSON vs other formats
- Supports multiple CRS (coordinate systems)
- Flexible property mapping (handles CAD naming variations)
- MultiLineString support (flattens to single route)
- Comprehensive error handling

---

## Next Steps

### For You:
1. ✅ Share `CUSTOMER_DATA_REQUEST.md` with customer
2. ✅ Provide example files for reference
3. ⏳ Test import with example files in your app
4. ⏳ Request sample data from customer
5. ⏳ Validate and test customer data

### For Customer:
1. Choose export format (GeoJSON recommended)
2. Export cable route(s) from their CAD/GIS system
3. Include metadata in properties:
   - Route name
   - Voltage level
   - Infrastructure type (cable/overhead)
   - Any EMC parameters if known
4. Provide coordinate system specification
5. Send file(s) for testing

---

## Benefits of This Approach

### ✅ No Manual Plotting
- Import 100s of points instantly
- No clicking on map required
- Accurate coordinates from CAD system

### ✅ Industry Standard
- GeoJSON is universally supported
- Easy to validate and share
- Future-proof format

### ✅ Preserves Accuracy
- No loss of precision
- Maintains coordinate system
- Includes metadata

### ✅ Supports Multiple Routes
- Import entire project at once
- FeatureCollection for batches
- Consistent metadata

### ✅ Flexible
- Multiple naming conventions
- Various coordinate systems
- Backward compatible with existing exports

---

## Example Use Cases

### Use Case 1: New Cable Design
**Scenario**: Engineering firm designs new 110 kV cable route in AutoCAD

**Process**:
1. Draw cable route as polyline in AutoCAD (RD New coordinates)
2. Export as GeoJSON with metadata (voltage, type)
3. Import to your app
4. Run EMC evaluation
5. Generate Bijlage 3 report
6. Submit to ProRail

### Use Case 2: Existing Infrastructure
**Scenario**: Update analysis for existing cable route

**Process**:
1. Extract route from GIS database (WGS84)
2. Export FeatureCollection with all parallel routes
3. Import all routes simultaneously
4. Evaluate and compare alternatives
5. Export results

### Use Case 3: Multiple Alternatives
**Scenario**: Compare 3 different route options

**Process**:
1. Designer creates 3 route variants in QGIS
2. Exports single GeoJSON FeatureCollection
3. Import creates 3 routes with different colors
4. Evaluate each route
5. Generate comparative report

---

## Troubleshooting

### Common Issues:

**Issue**: "Invalid coordinate format"
- **Cause**: Wrong coordinate order [lat, lon] instead of [lon, lat]
- **Fix**: GeoJSON standard is [longitude, latitude]

**Issue**: "Route appears in wrong location"
- **Cause**: Coordinate system mismatch
- **Fix**: Specify correct CRS in GeoJSON or convert to WGS84

**Issue**: "Route is too short/long"
- **Cause**: Wrong units (degrees vs meters)
- **Fix**: Use WGS84 (degrees) or ensure RD New is in meters

**Issue**: "Missing metadata"
- **Cause**: Properties not included in export
- **Fix**: Add properties to GeoJSON features

---

## Files Created

1. ✅ `CUSTOMER_DATA_REQUEST.md` - Customer-facing guide
2. ✅ `example-geojson-single-route.json` - Single route example
3. ✅ `example-geojson-multiple-routes.json` - Multiple routes example
4. ✅ `GEOJSON_IMPORT_SUMMARY.md` - This technical summary
5. ✅ Enhanced `routeImporter.js` - Code implementation

---

## Questions?

If you need:
- Sample conversion scripts
- QGIS automation
- FME workbench for CAD conversion
- Additional coordinate system support
- Custom property mappings

Let me know!
