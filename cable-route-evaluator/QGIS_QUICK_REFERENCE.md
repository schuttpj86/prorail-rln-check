# QGIS CAD Conversion - Quick Reference Card

## 🎯 Goal
Convert DWG/DXF → GeoJSON for ProRail Cable Route Evaluator

---

## ⚡ Quick Steps (5 Minutes)

### 1️⃣ **Open CAD File**
```
Drag & Drop .dwg/.dxf into QGIS
→ Select "polyline" layer
→ Click OK
```

### 2️⃣ **Set Source CRS** ⚠️ CRITICAL
```
Right-click layer → Properties → Source
→ Set CRS: EPSG:28992 (RD New - Netherlands)
→ OK
```

### 3️⃣ **Filter Cable Layers**
```
Right-click layer → Filter...
→ "Layer" = 'CABLES_110KV' OR "Layer" = 'CABLES_380KV'
→ OK
```

### 4️⃣ **Export to GeoJSON**
```
Right-click layer → Export → Save Features As...
→ Format: GeoJSON
→ CRS: EPSG:4326 (WGS 84) ⚠️ CRITICAL
→ Save as: cables_export.geojson
→ OK
```

---

## 🔍 Verify Output

Open in text editor - coordinates should look like:
```json
[5.262853, 52.136787]  ✅ ~5°E, ~52°N = Netherlands
```

NOT like:
```json
[152853, 362787]  ❌ Wrong CRS!
```

---

## 📊 Common CRS Settings

| Country | Source CRS | Code |
|---------|------------|------|
| 🇳🇱 Netherlands | RD New | EPSG:28992 |
| 🇧🇪 Belgium | Lambert 72 | EPSG:31370 |
| 🇩🇪 Germany | UTM 32N | EPSG:25832 |

**Export CRS**: Always **EPSG:4326** (WGS84)

---

## 🎨 Color Coding Suggestion

After export, assign voltage colors:
- 🔴 380kV → Red (#FF0000)
- 🟠 150kV → Orange (#FF8800)
- 🟡 110kV → Yellow (#FFDD00)
- 🟢 50kV → Green (#00AA00)
- 🔵 10kV → Blue (#0055FF)

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Lines in ocean/wrong place | Wrong source CRS - set to EPSG:28992 |
| No features exported | Use layer filter or check entity type |
| Huge coordinates (150000+) | Export CRS not WGS84 - use EPSG:4326 |
| File too large (>10MB) | Simplify geometry or split by layer |

---

## 📁 File Structure

```
project_name/
├── cables_110kv.geojson      ← Export from QGIS
├── cables_380kv.geojson      ← Export from QGIS
└── combined_import.json      ← Combine for app import
```

---

## ✅ Pre-Import Checklist

- [ ] CRS is EPSG:4326 (WGS84)
- [ ] Coordinates are ~4-7° lon, ~50-53° lat (Netherlands)
- [ ] Geometry type is LineString
- [ ] File size < 10 MB
- [ ] Test at http://geojson.io

---

## 🚀 Import to App

1. Open ProRail Cable Route Evaluator
2. Click "Import Route" or "Import CAD"
3. Select your `.geojson` file
4. Choose layers to import
5. Verify routes appear correctly

---

**Last Updated**: 2025-10-16  
**See Full Guide**: `CAD_TO_GEOJSON_GUIDE.md`
