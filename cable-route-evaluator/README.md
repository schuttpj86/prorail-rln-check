# ProRail RLN00398-V004 EMC Evaluator

**Version:** 1.0.0  
**Standard:** RLN00398-V004 (ProRail EMC Policy for High Voltage Connections)  
**Developer:** DNV  
**Status:** 🚧 In Development - V004 Implementation Phase

---

## 📋 Overview

A professional web-based GIS application for evaluating electromagnetic compatibility (EMC) compliance of high-voltage connections (cables and overhead lines) against ProRail's RLN00398-V004 standard. This tool enables engineers to perform preliminary EMC assessments, compare multiple route alternatives, and generate comprehensive evaluation reports.

### Key Features

- ✅ **Interactive Route Drawing** - Create cable/overhead line routes directly on the map
- ✅ **GeoJSON Import/Export** - Import routes from CAD/GIS systems (GeoJSON Feature/FeatureCollection), export for further analysis
- ✅ **Multiple Import Formats** - Support for GeoJSON, simplified JSON, and native exports
- ✅ **Automated EMC Checks** - Evaluate routes against RLN00398-V004 criteria
- ✅ **V004 Flowchart Logic** - Sequential filtering through Steps A-F
- ✅ **Bijlage 3 Reports** - Auto-generate ProRail-compliant EMC reports (100% template alignment) **NEW! ✨**
- ✅ **Comparative Analysis** - Compare multiple route alternatives side-by-side
- ✅ **Professional Reports** - Generate markdown reports for ProRail documentation
- ✅ **Multi-language Support** - Dutch and English interface
- ✅ **Real ProRail Data** - Integration with ProRail WMS layers (tracks, technical rooms, etc.)
- ✅ **Joint/Moffen Management** - Mark and track cable joints with automatic distance calculations

---

## 🎯 Purpose

This tool implements the **flowchart-based assessment approach** from RLN00398-V004, providing:

1. **Early Design Phase Support** - Identify EMC issues before detailed engineering
2. **Route Optimization** - Compare alternatives to find optimal solutions
3. **Stakeholder Communication** - Clear visualization and reporting for non-technical stakeholders
4. **Efficiency** - Reduce time spent on manual checks and calculations
5. **Compliance Documentation** - Generate audit-ready reports for ProRail submissions

---

## 🏗️ Technology Stack

- **Frontend Framework:** Vanilla JavaScript (ES6+)
- **Build Tool:** Vite 7.0
- **GIS Engine:** ArcGIS Maps SDK for JavaScript 4.33
- **UI Components:** Esri Calcite Design System 3.2
- **Coordinate System:** RD New (EPSG:28992 / Amersfoort)
- **Data Sources:** ProRail WMS Services

---

## 📁 Project Structure

```
cable-route-evaluator/
├── src/
│   ├── config.v4.js                    # V004 Standard Configuration
│   ├── main.js                          # Application Entry Point
│   ├── style.css                        # Global Styles
│   │
│   ├── i18n/                            # Internationalization
│   │   ├── en.js                        # English translations
│   │   ├── nl.js                        # Dutch translations (Nederlands)
│   │   └── i18n.js                      # i18n Manager
│   │
│   ├── layers/                          # ArcGIS Layer Configurations
│   │   ├── baseConfig.js                # Base layer settings
│   │   └── layerConfig.js               # ProRail WMS layers
│   │
│   └── utils/
│       ├── v4/                          # V004 Implementation
│       │   ├── flowchartEvaluator.js    # Flowchart-based EMC evaluation
│       │   └── reportGenerator.js       # V004 report templates
│       │
│       ├── shared/                      # Reusable Utilities
│       │   └── geometryUtils.js         # Geometry calculations
│       │
│       ├── drawingUtils.js              # Map drawing tools
│       ├── spatialQueries.js            # GIS spatial queries
│       ├── routeImporter.js             # GeoJSON route import
│       ├── routeExporter.js             # JSON export
│       ├── reportExporter.js            # Comparative report generation
│       ├── measurementTool.js           # Distance measurement widget
│       └── jointManager.js              # Cable joint/moffen management
│
├── docs/                                # Documentation
│   ├── ARCHITECTURE.md                  # System architecture
│   ├── V004_IMPLEMENTATION.md           # V004 standard implementation
│   ├── DEVELOPMENT_GUIDE.md             # Developer guide
│   └── API_REFERENCE.md                 # API documentation
│
├── index.html                           # Main HTML file
├── package.json                         # Dependencies
├── vite.config.js                       # Vite configuration
└── README.md                            # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- Modern web browser (Chrome, Firefox, Edge)

### Installation

```bash
# Clone the repository (if applicable)
cd cable-route-evaluator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 📖 Usage

### 1. Create a Route

1. Click the **➕ Route** button in the Routes panel
2. Enter route details:
   - Name
   - Voltage level (≤24kV, 24-35kV, ≥35kV)
   - Type (Cable or Overhead Line)
   - Cable configuration (if applicable)
3. Click **Start Drawing** and draw your route on the map
4. Right-click to finish drawing

### 2. Import Existing Routes

1. Click **📂 Import** button
2. Select a GeoJSON file with route geometry
3. Configure imported route parameters
4. Routes are automatically added to the map

### 3. Evaluate EMC Compliance

1. Select a route from the Routes panel
2. Click **⚡ Evaluate** button
3. Review evaluation results in the right panel:
   - Overall compliance status (PASS / REQUIRES STUDY / FAIL)
   - Step-by-step assessment (A → F)
   - Distance measurements to infrastructure
   - Recommendations and mitigations

### 4. Generate Bijlage 3 Reports (NEW! ✨)

**Per-trace compliance reports aligned 100% with RLN00398-V004 Bijlage 3 template:**

1. Evaluate your route (click ⚡ Evaluate)
2. Click **📋 Bijlage 3** button (blue document icon) on the route card
3. Download the auto-generated Markdown report
4. Convert to DOCX/PDF using Pandoc or online converters
5. Complete placeholders and add required drawings
6. Submit to ProRail

**What's included:**
- ✅ Full template structure (Sections 1-3 + Bijlage A)
- ✅ Auto-filled compliance table (Initial, A.1-A.3, B.4-B.7)
- ✅ Distance measurements and technical details
- ✅ Onderbouwing (justifications) per requirement
- ✅ Clear placeholders for engineer completion

📖 **Full guide:** `docs/BIJLAGE3_REPORTS.md`  
🚀 **Quick reference:** `BIJLAGE3_QUICKREF.md`

### 5. Compare Routes

1. Create or import multiple routes
2. Click **📄 Report** to generate comparative analysis
3. Download markdown report with side-by-side comparison

### 6. Export Routes

- **Single Route:** Click **💾 Export** on individual route card
- **All Routes:** Click **💾 Export All** button to save all routes in one JSON file

---

## 🔬 RLN00398-V004 Implementation

This application implements the flowchart-based assessment from RLN00398-V004:

### Flowchart Steps

- **Step A:** Basic Requirements (voltage, clearances, fault protection)
- **Step B:** Distance and Parallel Run Checks
- **Step C:** Unity Study Requirements
- **Step D:** EMC Detail Study Requirements
- **Steps E/F:** Mitigation Decision Tree

See `docs/V004_IMPLEMENTATION.md` for complete details.

---

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and components
- **[V004 Implementation](docs/V004_IMPLEMENTATION.md)** - Standard interpretation and logic
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup, development, and deployment
- **[API Reference](docs/API_REFERENCE.md)** - Function and API documentation

---

## 🧪 Development Status

### ✅ Completed Features

- Interactive map with ProRail layers
- Route drawing and editing
- GeoJSON import/export
- Basic EMC rule evaluation (V001 logic)
- Multi-language support (NL/EN)
- Distance measurement tool
- Cable joint/moffen management
- Professional report generation

### 🚧 In Progress

- **V004 Flowchart Logic** (Steps A-F) - Currently implementing
- **V004 Assessment Criteria** - Mapping from standard
- **Unity Study Integration** - Step C requirements
- **HVDC Connection Handling** - Special assessment logic

### 📋 Planned Features

- Automated PDF report generation
- ProRail API integration for real-time data
- Offline mode support
- Advanced route optimization algorithms
- Integration with EMC calculation tools

---

## 🤝 Contributing

This is a proprietary DNV project. For internal development guidelines, see `docs/DEVELOPMENT_GUIDE.md`.

---

## 📄 License

**Proprietary & Confidential**  
© 2025 DNV. All rights reserved.

This software is confidential and proprietary to DNV. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 📞 Support

For technical support or questions:
- Internal DNV Team: Contact project lead
- ProRail Standard Questions: Refer to RLN00398-V004 official documentation

---

## 🔄 Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | Nov 2025 | Initial V004 clean branch - streamlined structure |
| 0.9.x | Oct 2025 | V001 implementation and feature development |

---

**Status:** 🟡 Beta - V004 Implementation In Progress
