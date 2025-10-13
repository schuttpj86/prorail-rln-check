# ProRail Datasets - Complete Reference

## Overview

This document lists all ProRail FeatureServer datasets now integrated into the Cable Route Evaluator application. Each dataset is organized into its own category group in the Layer List.

---

## 📊 Available Datasets

### 1. 🚂 ProRail Base Infrastructure
**Service:** ProRail_basiskaart (base map)  
**URL:** `https://maps.prorail.nl/arcgis/rest/services/ProRail_basiskaart/FeatureServer`

**Description:**  
The basemap can be used as a background layer and includes:
- Railway Tracks (Spoorbaanhartlijn) - Main track centerlines
- Track Sections (Spoortakdeel) - Detailed track sections
- Stations - Railway stations
- Switches (Wissel) - Railway switches
- Level Crossings (Overweg) - Railway level crossings
- Control points
- Hectometre markers
- Crossings and track branches

**Default Visibility:** Most layers ON (basic infrastructure visible)

---

### 2. 🏗️ Structures & Buildings
**Service:** Kunstwerken_gebouwen_002  
**URL:** `https://mapservices.prorail.nl/arcgis/rest/services/Kunstwerken_gebouwen_002/FeatureServer`

**Description:**  
Contains layers for structures and buildings:
- Bridges (Bruggen)
- Viaducts
- Aqueducts (Aquaducten)
- Tunnels
- Buildings (Gebouwen)
- Related civil engineering works

**Default Visibility:** OFF (toggle on when needed)  
**Best Scale:** < 1:100,000

**Use Case:**  
Reference for cable route planning around structures, understanding clearances, and identifying potential mounting points or obstacles.

---

### 3. ⚡ Energy Supply System
**Service:** Energievoorzieningsysteem_005  
**URL:** `https://mapservices.prorail.nl/arcgis/rest/services/Energievoorzieningsysteem_005/FeatureServer`

**Description:**  
Provides overhead-line components and electrical installations:
- **Overhead Line Components:**
  - Poles (Masten)
  - Arms (Armen)
  - Crossbars (Dwarsdragers)
- **Installations:**
  - Tank installations
  - EV-buildings (substations)
  - Switching stations (Schakelstations)
  - Autotransformer stations (Autotransformatorstations)

**Default Visibility:** OFF  
**Best Scale:** < 1:100,000

**Use Case:**  
Critical for EMC analysis - identify existing high-voltage infrastructure that may interact with planned cable routes. Understand power distribution network.

---

### 4. 🚦 Train Protection System
**Service:** Treinbeveiligingsysteem_007 *(service name includes a single “s” before "ysteem")*  
**URL:** `https://mapservices.prorail.nl/arcgis/rest/services/Treinbeveiligingsysteem_007/FeatureServer`

**Description:**  
Holds train-protection equipment **sensitive to electromagnetic interference (EMI)**:
- Signals (Seinen)
- Signal boards (Seinborden)
- Balises (Train detection/positioning)
- Cabinets (Kasten)
- Other train protection equipment

**Default Visibility:** OFF  
**Best Scale:** < 1:50,000

**⚠️ CRITICAL FOR EMC COMPLIANCE:**  
These components are **highly sensitive to EMI** from high-voltage cables. This layer is essential for RLN00398 compliance - cable routes must maintain safe distances from these components or require special shielding.

**Use Case:**  
Primary layer for EMC safety analysis. Identify all train protection equipment near proposed cable routes and calculate required clearances per RLN00398 standard.

---

### 5. 🔌 Cable Situation
**Service:** Kabelsituatie_002  
**URL:** `https://mapservices.prorail.nl/arcgis/rest/services/Kabelsituatie_002/FeatureServer`

**Description:**  
Shows underground cable and conduit objects:
- **Cable Infrastructure:**
  - Trenches (Kabelgoten)
  - Ducts (Kabelbuizen)
  - Earthing (Aarding)
  - ATB/CTA cables
  - Cabinets (Kasten)
  - Lighting cables (Verlichtingskabels)
- **Crossings:**
  - Rail crossings (Spoorkruisingen)
  - Road crossings (Wegkruisingen)
  - Water crossings (Waterkruisingen)

**Default Visibility:** OFF  
**Best Scale:** < 1:25,000

**Use Case:**  
Understand existing cable infrastructure, identify potential conflicts, find existing conduits that might be reused, plan crossings, and coordinate installation with existing cable networks.

---

### 6. 🔧 Other Track Objects
**Service:** Overige_spoorobjecten_002  
**URL:** `https://mapservices.prorail.nl/arcgis/rest/services/Overige_spoorobjecten_002/FeatureServer`

**Description:**  
Contains topographic rail-specific environment objects:
- Service points (Bedieningspunten)
- Terrain lighting (Terreinverlichting)
- Anti-suicide lighting (Anti-suïcideverlichting)
- Hydrants (Brandkranen)
- Service platforms (Bedieningsperrons)
- Other trackside facilities

**Default Visibility:** OFF  
**Best Scale:** < 1:50,000

**Use Case:**  
Identify service infrastructure along the track, understand lighting requirements, locate access points, and plan cable routing around trackside facilities.

---

### 7. 📏 Track Asset Distances
**Service:** Trackasset_afstanden_002  
**URL:** `https://mapservices.prorail.nl/arcgis/rest/services/Trackasset_afstanden_002/FeatureServer`

**Description:**  
Includes track assets with precise distance measurements:
- Platform walls (Perronwanden)
- Signal boards (Seinborden)
- Light signals (Lichtseinen)
- Speed signs (Snelheidsborden)

**Special Feature:**  
Provides distances measured from the start or end of each functional track section - enables precise positioning and documentation.

**Default Visibility:** OFF  
**Best Scale:** < 1:25,000

**Use Case:**  
Precise documentation of cable route positions relative to track infrastructure. Essential for engineering documentation and maintenance records.

---

## 🗂️ Layer Organization in Application

All datasets are organized in the Layer List as collapsible groups:

```
Layer List Panel (top-right)
│
├── 🚂 ProRail Base Infrastructure [EXPANDED ON STARTUP]
│   ├── 🚂 Railway Tracks (Spoorbaanhartlijn) [ON]
│   ├── 🛤️ Track Sections (Spoortakdeel) [ON]
│   ├── 🚉 Stations [ON]
│   ├── 🔀 Switches (Wissel) [OFF]
│   └── ⚠️ Level Crossings (Overweg) [ON]
│
├── 🏗️ Structures & Buildings [COLLAPSED]
│   └── 🏗️ Structures & Buildings [OFF]
│
├── ⚡ Energy Supply System [COLLAPSED]
│   └── ⚡ Energy Supply System [OFF]
│
├── 🚦 Train Protection System [COLLAPSED - CRITICAL FOR EMC!]
│   └── 🚦 Train Protection System [OFF]
│
├── 🔌 Cable Situation [COLLAPSED]
│   └── 🔌 Cable Situation [OFF]
│
├── 🔧 Other Track Objects [COLLAPSED]
│   └── 🔧 Other Track Objects [OFF]
│
├── 📏 Track Asset Distances [COLLAPSED]
│   └── 📏 Track Asset Distances [OFF]
│
└── 📍 Cable Routes [ALWAYS VISIBLE]
    └── User-drawn cable routes
```

---

## 🎯 Recommended Workflow for EMC Analysis

### Phase 1: Initial Route Planning
**Layers to enable:**
- ✅ 🚂 ProRail Base Infrastructure (all)
- ✅ 🏗️ Structures & Buildings
- ✅ 🔌 Cable Situation

**Goal:** Understand basic infrastructure layout and identify potential cable corridors.

---

### Phase 2: EMC Hazard Identification
**Layers to enable:**
- ✅ 🚦 Train Protection System ⚠️ **CRITICAL**
- ✅ ⚡ Energy Supply System
- ✅ 🔌 Cable Situation

**Goal:** Identify all EMI-sensitive equipment and existing electrical infrastructure near proposed route.

---

### Phase 3: Detailed Route Design
**Layers to enable:**
- ✅ All layers
- ✅ 📏 Track Asset Distances (for precise positioning)
- ✅ 🔧 Other Track Objects (access and service points)

**Goal:** Finalize exact cable route with precise measurements and clearances.

---

### Phase 4: Documentation
**Use:**
- 📏 Track Asset Distances for precise position records
- 🚦 Train Protection System for EMC compliance documentation
- All relevant layers for comprehensive as-built documentation

---

## 🔧 Technical Notes

### FeatureServer vs MapServer
All these services are **FeatureServers**, which means:
- ✅ Individual features can be queried
- ✅ Attributes are accessible
- ✅ Supports pop-ups with detailed information
- ✅ Better performance with large datasets
- ✅ Supports feature editing (if permissions allow)

### Scale Dependencies
Layers have appropriate scale ranges set:
- **Broad view layers:** Railway tracks, stations (visible at all scales)
- **Detail layers:** Cables, signals, switches (visible < 1:50,000)
- **Precision layers:** Track assets, cabinets (visible < 1:25,000)

This prevents performance issues and visual clutter at inappropriate zoom levels.

### Pop-up Information
All layers show pop-ups when clicking features. Pop-ups display all available attributes (`outFields: ['*']`) for maximum flexibility during analysis.

---

## 📋 Data Source Attribution

**Data Provider:** ProRail  
**Service Type:** ArcGIS REST FeatureServers  
**Base URL:** `https://mapservices.prorail.nl/arcgis/rest/services/`  
**Alternative Base URL (basemap):** `https://maps.prorail.nl/arcgis/rest/services/`

**License & Usage:**  
Data is provided by ProRail for infrastructure planning and analysis. Ensure compliance with ProRail's data usage policies.

---

## 🆘 Troubleshooting

### Layer Won't Load
1. Check console for error messages (F12)
2. Verify network access to `mapservices.prorail.nl`
3. Confirm service is accessible: visit REST endpoint URL in browser
4. Check if authentication is required

### Too Many Features / Slow Performance
1. Zoom in closer - many layers have scale dependencies
2. Toggle off layers you're not actively using
3. Only enable detailed layers (cables, signals) at close zoom levels

### Can't See Pop-up Information
1. Ensure layer is visible (checkbox on)
2. Click directly on a feature (not empty space)
3. Zoom in if features are very small
4. Check if layer has loaded (look for feature count in console)

---

## 🚀 Future Enhancements

Potential improvements to this dataset integration:

1. **Custom Symbology:** Refine rendering for each layer type
2. **EMC Buffer Zones:** Automatically calculate safety buffers around train protection equipment
3. **Clash Detection:** Automated alerts when cable routes are too close to sensitive equipment
4. **Layer Filters:** Pre-defined filters for specific equipment types
5. **Measurement Tools:** Distance measurement from cable route to critical infrastructure
6. **Export Reports:** Generate EMC compliance reports with distances to all sensitive equipment

---

## 📞 Support

For questions about:
- **Data content:** Contact ProRail GIS/Data team
- **Application features:** See project documentation
- **EMC standards:** Refer to RLN00398 standard document

---

*Last Updated: October 7, 2025*  
*Application Version: 1.0.0*  
*ProRail Dataset Integration: Complete*
