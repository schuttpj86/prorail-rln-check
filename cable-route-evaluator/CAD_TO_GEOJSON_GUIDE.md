# QGIS: Converting DWG/DXF to GeoJSON for ProRail Cable Route Evaluator

## 📋 Overview

This guide walks you through converting AutoCAD DWG/DXF files containing cable routes into GeoJSON format that can be imported into the ProRail Cable Route Evaluator.

**Time Required**: 10-15 minutes  
**QGIS Version**: 3.28 or newer (recommended: 3.34 LTS)  
**Output Format**: GeoJSON with WGS84 (EPSG:4326) coordinates

---

## 🔧 Prerequisites

### 1. Install QGIS
- Download from: https://qgis.org/download/
- Install **QGIS Long Term Release (LTR)** for stability
- Windows users: Use the standalone installer

### 2. Prepare Your DWG/DXF File
- Ensure you have the CAD file with cable route polylines
- Know which layers contain the cable routes (e.g., "CABLES_110KV", "CABLES_380KV")
- Know the coordinate system used in the CAD file (common: RD New / EPSG:28992 for Netherlands)

---

## 📖 Step-by-Step Conversion Process

### Step 1: Open QGIS and Load the CAD File

1. **Launch QGIS Desktop**

2. **Add the DWG/DXF file**:
   - Method A: Drag and drop the `.dwg` or `.dxf` file into QGIS
   - Method B: Menu → `Layer` → `Add Layer` → `Add Vector Layer`
   - Browse to your file and click `Add`

3. **QGIS will show a layer selection dialog**:
   ```
   Select layers to add:
   ☑ polyline (cable routes - LINE/POLYLINE entities)
   ☐ point (markers, joints)
   ☐ polygon (buildings, zones)
   ☐ annotation (text labels)
   ```
   - **Select**: `polyline` (this contains your cable routes)
   - Click `OK`

4. **Result**: You'll see lines appear on the map canvas

---

### Step 2: Check and Set the Coordinate Reference System (CRS)

**CRITICAL**: CAD files often use local coordinate systems. You must transform them to geographic coordinates.

#### 2A. Check Current CRS

1. **Right-click** the layer in the Layers Panel → `Properties`
2. Go to the **`Source`** tab
3. Look at **Assigned Coordinate Reference System (CRS)**:
   - If it says "Unknown" or shows local coordinates → Need to set it
   - If it shows "EPSG:28992" (RD New) → Good for Netherlands
   - If it shows "EPSG:4326" (WGS84) → Already correct (rare)

#### 2B. Set the Source CRS (if needed)

If the CRS is unknown or wrong:

1. In Layer Properties → **`Source`** tab
2. Click the **CRS selector** button (globe icon)
3. **Search for**: `28992` (for Netherlands - RD New / Amersfoort)
   - Or search for your country/region's standard CRS
4. Select `EPSG:28992 - Amersfoort / RD New`
5. Click `OK` → `OK`

**Common CRS by Country**:
- 🇳🇱 Netherlands: EPSG:28992 (RD New)
- 🇧🇪 Belgium: EPSG:31370 (Belgian Lambert 72)
- 🇩🇪 Germany: EPSG:25832 (ETRS89 / UTM zone 32N)
- 🇫🇷 France: EPSG:2154 (Lambert-93)

---

### Step 3: Filter by Layer (Extract Cable Routes)

CAD files contain many layers. You need to extract only the cable route layers.

#### Option A: Filter in QGIS (Recommended)

1. **Right-click** the polyline layer → `Filter...`

2. **Build a filter expression**:
   ```sql
   "Layer" = 'CABLES_110KV' OR "Layer" = 'CABLES_380KV'
   ```
   
   Or to see what layers exist first:
   - Click `Expression` button
   - Type: `"Layer"`
   - Click `All Unique` to see all layer names
   - Then build your filter

3. Click `OK`

4. **Result**: Only polylines from selected layers are visible

#### Option B: Split Layers for Separate Export

If you want each CAD layer as a separate file:

1. **Open Processing Toolbox**: Menu → `Processing` → `Toolbox`

2. **Search for**: `Split Vector Layer`

3. **Parameters**:
   - Input layer: Your polyline layer
   - Unique ID field: **`Layer`**
   - Output directory: Choose a folder

4. **Run**

5. **Result**: Creates separate layers per CAD layer (e.g., CABLES_110KV, CABLES_380KV)

---

### Step 4: Transform to WGS84 (Web-Compatible Coordinates)

Your web app uses WGS84 (EPSG:4326) - latitude/longitude coordinates.

1. **Right-click** the layer → `Export` → `Save Features As...`

2. **Export Settings**:
   ```
   Format: GeoJSON
   File name: [Browse] → Save as "cables_110kv.geojson"
   CRS: EPSG:4326 - WGS 84 (IMPORTANT!)
   ```

3. **Geometry Settings**:
   - Geometry type: Automatic (or LineString)
   - Select fields to export:
     ☑ Layer (CAD layer name)
     ☑ Any other attributes you need
     ☐ Uncheck unnecessary fields (like CAD handles, colors)

4. **Advanced Options** (expand):
   ```
   Coordinate precision: 8 decimal places (sufficient for mm accuracy)
   ```

5. Click `OK`

---

### Step 5: Create Multi-Layer Export (For App Import)

To import multiple layers at once into the app, create a structured JSON:

#### Manual Method:

1. **Export each cable layer separately** (repeat Step 4):
   - `cables_110kv.geojson`
   - `cables_380kv.geojson`

2. **Open each file in a text editor** (VS Code, Notepad++)

3. **Combine into this structure**:

```json
{
  "source": "CAD",
  "sourceFile": "Project_XYZ.dwg",
  "coordinateSystem": "EPSG:4326",
  "exportedBy": "QGIS 3.34",
  "exportDate": "2025-10-16",
  "layers": [
    {
      "layerName": "CABLES_110KV",
      "layerType": "cable",
      "voltage": 110,
      "features": [
        // Paste "features" array from cables_110kv.geojson here
      ]
    },
    {
      "layerName": "CABLES_380KV",
      "layerType": "cable",
      "voltage": 380,
      "features": [
        // Paste "features" array from cables_380kv.geojson here
      ]
    }
  ]
}
```

4. **Save as**: `project_cables_import.json`

---

## 🎯 Quick Reference: Complete Workflow

```
┌─────────────────┐
│  DWG/DXF File   │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│  1. Open in QGIS                │
│  2. Set CRS (EPSG:28992)       │
│  3. Filter by layer name        │
│  4. Export to GeoJSON           │
│     - CRS: EPSG:4326 (WGS84)   │
│     - Format: GeoJSON           │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  GeoJSON File(s)                │
│  - cables_110kv.geojson         │
│  - cables_380kv.geojson         │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Import to ProRail App          │
└─────────────────────────────────┘
```

---

## 🔍 Verification Checklist

Before importing to the web app, verify:

- [ ] **File format**: `.geojson` or `.json`
- [ ] **CRS**: EPSG:4326 (WGS84) - check coordinates are ~4-7° longitude, ~50-53° latitude for Netherlands
- [ ] **Geometry type**: LineString (cables are lines, not points or polygons)
- [ ] **Layer names preserved**: Check that CAD layer names are in the exported attributes
- [ ] **No empty geometries**: Remove features with null/empty coordinates
- [ ] **File size reasonable**: < 10 MB for smooth web loading

---

## 📊 Example: Verify Coordinates are Correct

Open your exported GeoJSON in a text editor:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [5.262853, 52.136787],  // ✅ Correct: [longitude, latitude]
          [5.280448, 52.136918]   // ~5° E, ~52° N = Netherlands
        ]
      },
      "properties": {
        "Layer": "CABLES_110KV",
        "length": 1250.5
      }
    }
  ]
}
```

**Common Issues**:
- ❌ `[152853, 362787]` → Wrong CRS (RD New, not WGS84)
- ❌ `[52.136787, 5.262853]` → Coordinates swapped (lat, lon instead of lon, lat)

---

## 🛠️ Troubleshooting

### Issue: Lines appear in the wrong location

**Cause**: Incorrect source CRS  
**Solution**: 
1. Re-import the DWG
2. Set the correct source CRS (EPSG:28992 for Netherlands)
3. Re-export to EPSG:4326

### Issue: No polylines visible after import

**Cause**: Wrong entity type selected  
**Solution**: 
1. Re-import DWG
2. Select **polyline** or **line** entity type
3. If still empty, check if cables are stored as different entity types (blocks, hatches)

### Issue: Coordinates are huge numbers (150000, 450000)

**Cause**: Exported in RD New (EPSG:28992), not WGS84  
**Solution**: 
1. Ensure export CRS is set to **EPSG:4326**
2. Look for the globe icon in export dialog and select WGS84

### Issue: Too many features (thousands of lines)

**Cause**: CAD file contains all drawing elements  
**Solution**: 
1. Use layer filter to select only cable layers
2. Or use attribute filter: `"Layer" LIKE 'CABLE%'`

---

## 💡 Pro Tips

1. **Batch Processing**: If you have many DWG files:
   - Use QGIS **Batch Processing** (Processing Toolbox → Search "Batch")
   - Or create a Python script using PyQGIS

2. **Preserve Attributes**: Export useful CAD attributes:
   - Layer name (for grouping)
   - LineType (solid, dashed)
   - Color (can map to voltage levels)
   - Custom properties from CAD

3. **Simplify Geometry**: For web performance:
   - Processing Toolbox → `Simplify` (Douglas-Peucker algorithm)
   - Tolerance: 0.5-1 meter (balance detail vs. file size)

4. **Validate Geometry**: Before export:
   - Vector → Geometry Tools → `Check Validity`
   - Fix any invalid geometries

---

## 📝 Next Steps

Once you have the GeoJSON file(s):

1. **Test in a GeoJSON viewer**: http://geojson.io
   - Drag and drop your file
   - Verify lines appear in the correct location

2. **Import to ProRail App**:
   - Use the existing import function
   - Select your exported GeoJSON file
   - Verify routes appear correctly

3. **Save as template**: Keep the export settings for future conversions

---

## 📞 Need Help?

- **QGIS Documentation**: https://docs.qgis.org/
- **GIS Stack Exchange**: https://gis.stackexchange.com/
- **Coordinate System Lookup**: https://epsg.io/

---

**Created**: 2025-10-16  
**For**: ProRail Cable Route Evaluator  
**Version**: 1.0
