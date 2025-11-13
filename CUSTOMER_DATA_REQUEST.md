# Cable Trace Data Request - ProRail RLN Project

## Recommended Data Format

### Option 1: GeoJSON (Preferred) ⭐

Please provide cable trace data in **GeoJSON format (RFC 7946)** with the following specifications:

#### Format Requirements:
- **Geometry Type**: `LineString` or `MultiLineString`
- **Coordinate System**: WGS84 (EPSG:4326) or RD New (EPSG:28992)
- **Coordinate Order**: [longitude, latitude] or [x, y]

#### Minimal Required Format:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [5.6662414719642715, 51.92637888663293],
      [5.684265916544325, 51.92704050065143],
      [5.7113025834144056, 51.927569784844174],
      [5.731043641763987, 51.934449911357675],
      [5.750140969949997, 51.94079986115607]
    ]
  },
  "properties": {
    "name": "Cable Route Name",
    "description": "Route description (optional)",
    "voltageKv": 110,
    "type": "cable"
  }
}
```

#### Multiple Routes (FeatureCollection):
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[...]]
      },
      "properties": {
        "name": "Route 1",
        "voltageKv": 110
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[...]]
      },
      "properties": {
        "name": "Route 2",
        "voltageKv": 20
      }
    }
  ]
}
```

---

### Option 2: Simplified JSON (Also Supported) ✅

If GeoJSON is not available, a simplified format is also acceptable:

```json
{
  "name": "Cable Route Name",
  "coordinates": [
    [5.666241, 51.926378],
    [5.684265, 51.927040],
    [5.711302, 51.927569]
  ],
  "voltageKv": 110,
  "infrastructureType": "cable",
  "description": "Optional description"
}
```

**Alternative coordinate formats supported:**
```json
{
  "waypoints": [
    {"x": 5.666241, "y": 51.926378},
    {"x": 5.684265, "y": 51.927040}
  ]
}
```

Or:
```json
{
  "points": [
    {"longitude": 5.666241, "latitude": 51.926378},
    {"longitude": 5.684265, "latitude": 51.927040}
  ]
}
```

---

### Option 3: CAD File Formats (Requires Conversion)

If you only have CAD files, we can work with:

1. **AutoCAD DXF/DWG** → Export polylines to GeoJSON
2. **Bentley MicroStation DGN** → Export to GeoJSON
3. **Shapefile (.shp)** → Can be converted to GeoJSON
4. **KML/KMZ** → Can be converted to GeoJSON

**Note:** These require preprocessing/conversion before import.

---

## Coordinate Systems

Our application supports multiple coordinate systems:

- **WGS84 (EPSG:4326)** - Global GPS coordinates [longitude, latitude]
- **RD New (EPSG:28992)** - Dutch national grid [x, y]
- **Web Mercator (EPSG:3857)** - Web mapping standard

Please specify which coordinate system your data uses.

---

## Optional Metadata (Highly Recommended)

Including the following metadata will enable automatic EMC evaluation:

### For All Routes:
- `name` - Route identifier
- `voltageKv` - Voltage level (e.g., 20, 110, 150)
- `infrastructureType` - "cable" or "overhead"
- `description` - Project notes

### For Cable Routes:
- `faultClearingTimeMs` - Fault clearing time in milliseconds
- `minJointDistanceMeters` - Minimum joint spacing
- `hasDeltaOrMulticore` - Circuit configuration (true/false)
- `hasPadCurrentControl` - Homopolar current control (true/false)

### For Overhead Lines:
- `hasDeltaFormation` - Delta formation (true/false)
- `faultClearingTimeMs` - Fault clearing time

---

## Export from Common CAD Software

### AutoCAD / AutoCAD Civil 3D:
1. Select polyline(s)
2. Type: `MAPEXPORT`
3. Choose format: **GeoJSON** or **SHP** (Shapefile)
4. Specify coordinate system: WGS84 or RD New

### QGIS:
1. Right-click layer → Export → Save Features As
2. Format: **GeoJSON**
3. CRS: **EPSG:4326** (WGS84) or **EPSG:28992** (RD New)
4. Geometry type: **LineString**

### ArcGIS / ArcGIS Pro:
1. Right-click layer → Data → Export Features
2. Output format: **GeoJSON** or **Feature Class**
3. Coordinate system: WGS84 or RD New

### Bentley MicroStation:
1. Use FME (Feature Manipulation Engine) or
2. Export to Shapefile, then convert to GeoJSON using QGIS

---

## Data Quality Requirements

### Minimum Requirements:
- ✅ At least **2 coordinate points** per route
- ✅ Coordinates in **decimal degrees** (for WGS84) or **meters** (for RD New)
- ✅ Valid coordinate ranges:
  - WGS84: longitude 3° to 8°, latitude 50° to 54° (Netherlands)
  - RD New: x 0-300,000m, y 300,000-625,000m

### Recommended Quality:
- 🎯 Point spacing: **10-50 meters** for curves, **up to 500m** for straight sections
- 🎯 Coordinate precision: **6 decimal places** (≈0.1m accuracy)
- 🎯 Single continuous path (no gaps)
- 🎯 Follow actual cable route (not straight lines between endpoints)

---

## Testing Your Data

You can validate your GeoJSON using:
- **[geojson.io](https://geojson.io)** - Visual validator and editor
- **[GeoJSONLint](https://geojsonlint.com)** - Schema validator

---

## Example Files

See attached example files:
- ✅ `New_110_kV_Cable.json` - Full format (exported from our app)
- ✅ `example-geojson-import.json` - Minimal GeoJSON format (see below)

---

## Questions?

If you have questions about:
- Converting your CAD format → GeoJSON
- Coordinate system transformations
- Required metadata fields
- Data quality issues

Please contact: [Your contact information]

---

## Summary: What to Provide

**Minimum deliverable:**
```
☐ GeoJSON file(s) with LineString geometry
☐ Coordinate system specification (WGS84 or RD New)
☐ Route name(s)
```

**Ideal deliverable:**
```
☐ GeoJSON FeatureCollection with all routes
☐ WGS84 coordinates (EPSG:4326)
☐ Voltage levels for each route
☐ Infrastructure type (cable/overhead)
☐ Fault clearing times
☐ Circuit configuration details
```
