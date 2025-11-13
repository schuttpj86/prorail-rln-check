# GeoJSON Import - Quick Reference Card

## 📥 Supported Formats

| Format | Structure | Use Case |
|--------|-----------|----------|
| **GeoJSON Feature** | Single route | One cable/line route |
| **GeoJSON FeatureCollection** | Multiple routes | Project with alternatives |
| **Minimal JSON** | Simplified | CAD export, quick testing |
| **ProRail Export** | Full metadata | Re-import from this app |

---

## 🎯 Recommended Format

### Ask Customer For:
```
Format: GeoJSON (RFC 7946)
Geometry: LineString
CRS: EPSG:4326 (WGS84) or EPSG:28992 (RD New)
File extension: .json or .geojson
```

---

## 📐 Coordinate Systems

| EPSG | Name | When to Use | Coordinates |
|------|------|-------------|-------------|
| 4326 | WGS84 | GPS, Global | [lon, lat] degrees |
| 28992 | RD New | Dutch grid | [x, y] meters |
| 3857 | Web Mercator | Web maps | [x, y] meters |

**Auto-detected** from GeoJSON `crs` property!

---

## 🏗️ Basic GeoJSON Template

### Single Route:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [5.666241, 51.926378],
      [5.684265, 51.927040],
      [5.711302, 51.927569]
    ]
  },
  "properties": {
    "name": "Cable Route Name",
    "voltageKv": 110,
    "infrastructureType": "cable"
  }
}
```

### Multiple Routes:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [[...]] },
      "properties": { "name": "Route 1", "voltageKv": 110 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [[...]] },
      "properties": { "name": "Route 2", "voltageKv": 20 }
    }
  ]
}
```

---

## 🏷️ Property Mapping

### Required:
```json
{
  "name": "Route identifier"
}
```

### Recommended:
```json
{
  "name": "110 kV Cable - Alternative 1",
  "voltageKv": 110,
  "infrastructureType": "cable",
  "description": "Main route option"
}
```

### Complete EMC Metadata:
```json
{
  "name": "110 kV Cable",
  "voltageKv": 110,
  "infrastructureType": "cable",
  "faultClearingTimeMs": 120,
  "hasDeltaOrMulticore": true,
  "hasPadCurrentControl": true,
  "minJointDistanceMeters": 500
}
```

---

## 🔧 CAD Export Quick Commands

### AutoCAD:
```
Command: MAPEXPORT
Format: GeoJSON
CRS: EPSG:4326
```

### QGIS:
```
Right-click layer → Export → Save Features As...
Format: GeoJSON
CRS: EPSG:4326
```

### ArcGIS Pro:
```
Right-click layer → Data → Export Features
Format: GeoJSON
CRS: WGS 1984
```

---

## ✅ Data Quality Checklist

### Before Import:
- [ ] LineString or MultiLineString geometry
- [ ] At least 2 coordinate points
- [ ] Coordinates in correct order [lon, lat]
- [ ] Valid coordinate ranges (Netherlands region)
- [ ] Properties include `name` at minimum

### Validation Tools:
- [geojson.io](https://geojson.io) - Visual validator
- [GeoJSONLint](https://geojsonlint.com) - Schema validator

---

## 🚫 Common Mistakes

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `[lat, lon]` | `[lon, lat]` |
| `"type": "Point"` | `"type": "LineString"` |
| Single coordinate | Array of coordinates |
| PDF/Image file | Vector GeoJSON |
| No CRS specified | Include `crs` property |

---

## 📊 Import Process

```
1. Customer exports cable route from CAD/GIS
   ↓
2. Validate on geojson.io (optional but recommended)
   ↓
3. Import to ProRail EMC Evaluator
   ↓
4. Route appears on map with metadata
   ↓
5. Run EMC evaluation
   ↓
6. Generate Bijlage 3 report
```

---

## 🎨 Property Name Variants

The importer automatically recognizes these variations:

| Standard | Alternatives Accepted |
|----------|----------------------|
| `name` | `Name`, `routeName`, `id` |
| `voltageKv` | `voltage`, `kV`, `voltage_kv` |
| `infrastructureType` | `type`, `category` |
| `description` | `desc`, `notes`, `remarks` |
| `faultClearingTimeMs` | `clearingTime`, `fault_time` |

---

## 📁 File Examples Location

```
📁 Prorail-RLN/
├── example-geojson-single-route.json       ← Single route
├── example-geojson-multiple-routes.json    ← Multiple routes
├── New_110_kV_Cable.json                   ← App's native format
├── CUSTOMER_DATA_REQUEST.md                ← Full customer guide
└── GEOJSON_IMPORT_SUMMARY.md               ← Technical details
```

---

## 🔍 Troubleshooting

### "Invalid coordinate format"
→ Check coordinate order: [lon, lat] not [lat, lon]

### "Route in wrong location"
→ Verify CRS matches data (WGS84 vs RD New)

### "Missing properties"
→ Add at minimum: `"name": "Route Name"`

### "File too large"
→ Simplify geometry or split into multiple routes

---

## 💡 Pro Tips

1. **Point Density**: 10-50m for curves, up to 500m for straight sections
2. **Coordinate Precision**: 6 decimal places (≈0.1m accuracy)
3. **Batch Import**: Use FeatureCollection for multiple routes
4. **Metadata**: More properties = better automatic evaluation
5. **Validation**: Always test on geojson.io first

---

## 📞 Support

Questions about:
- Format conversion? → Check CUSTOMER_DATA_REQUEST.md
- Technical details? → Check GEOJSON_IMPORT_SUMMARY.md
- Code implementation? → See cable-route-evaluator/src/utils/routeImporter.js

---

## ⚡ Quick Start

**For Customers:**
```
1. Export cable route as GeoJSON from your CAD system
2. Include voltage and type in properties
3. Send .json file
```

**For You:**
```
1. Share CUSTOMER_DATA_REQUEST.md with customer
2. Receive GeoJSON file
3. Click Import button in app
4. Select file → Routes load automatically
```

Done! 🎉
