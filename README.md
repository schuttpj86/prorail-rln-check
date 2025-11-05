# ProRail RLN-Check - High Voltage Connection EMC Evaluator

**Organization:** DNV  
**Client:** ProRail  
**Standard:** RLN00398-V004  
**Status:** 🚧 Active Development

---

## 📋 Repository Overview

This repository contains the ProRail EMC (Electromagnetic Compatibility) evaluation tool for high-voltage connections (cables and overhead lines) on or near railway infrastructure. The tool implements the assessment methodology from **ProRail Standard RLN00398-V004**.

---

## 🎯 Purpose

Enable engineers and planners to:

1. **Evaluate EMC Compliance** - Assess if high-voltage connections meet ProRail safety requirements
2. **Compare Route Alternatives** - Analyze multiple cable/overhead line routing options
3. **Generate Documentation** - Produce professional reports for Request for Proposal (RFP) submissions
4. **Early Risk Identification** - Identify EMC issues during preliminary design phase

---

## 📁 Repository Structure

```
prorail-rln-check/
├── .github/
│   └── instructions/
│       └── development-instructions.instructions.md    # IDE development guidelines
│
├── cable-route-evaluator/                             # Main Application
│   ├── src/                                            # Source code
│   ├── docs/                                           # Documentation
│   ├── index.html                                      # Entry point
│   ├── package.json                                    # Dependencies
│   ├── vite.config.js                                  # Build configuration
│   └── README.md                                       # Application documentation
│
├── RLN00398-V001 eisen EMC spoor.pdf                   # V001 Standard (reference)
├── RLN00398-V002[1].pdf                                # V002 Standard (reference)
│
└── README.md                                           # This file
```

---

## 🚀 Quick Start

### For Users

1. Navigate to the application folder:
   ```bash
   cd cable-route-evaluator
   ```

2. Follow the setup instructions in [`cable-route-evaluator/README.md`](cable-route-evaluator/README.md)

### For Developers

1. **Read Development Instructions:**
   - [Application README](cable-route-evaluator/README.md) - Getting started
   - [Architecture Guide](cable-route-evaluator/docs/ARCHITECTURE.md) - System design
   - [Development Guide](cable-route-evaluator/docs/DEVELOPMENT_GUIDE.md) - Developer workflow

2. **Setup Development Environment:**
   ```bash
   cd cable-route-evaluator
   npm install
   npm run dev
   ```

---

## 📚 Documentation

### Application Documentation
- **[Application README](cable-route-evaluator/README.md)** - Main application documentation
- **[Architecture](cable-route-evaluator/docs/ARCHITECTURE.md)** - System architecture and design
- **[V004 Implementation](cable-route-evaluator/docs/V004_IMPLEMENTATION.md)** - RLN00398-V004 standard implementation
- **[Development Guide](cable-route-evaluator/docs/DEVELOPMENT_GUIDE.md)** - Setup and development workflow
- **[API Reference](cable-route-evaluator/docs/API_REFERENCE.md)** - Function and API documentation

### ProRail Standards (Reference Documents)
- **RLN00398-V001** - Historical version (for reference)
- **RLN00398-V002** - Previous version (for reference)
- **RLN00398-V004** - **Current implementation** (official standard to be provided)

---

## 🏗️ Technology Stack

- **Framework:** Vanilla JavaScript (ES6+)
- **Build Tool:** Vite 7.0
- **GIS Engine:** ArcGIS Maps SDK for JavaScript 4.33
- **UI Components:** Esri Calcite Design System 3.2
- **Coordinate System:** RD New (EPSG:28992)

---

## 🔄 Version History

| Version | Date | Branch | Description |
|---------|------|--------|-------------|
| 1.0.0 | Nov 2025 | `feature/v004-clean` | Clean V004 branch - streamlined structure |
| 0.9.x | Oct 2025 | `feature/rln00398-v002-refactor` | V001 implementation + features |

---

## 🌿 Branch Structure

### Active Branches

- **`feature/v004-clean`** ✅ Current - Clean implementation for V004 standard
- **`main`** - Stable releases (deployment ready)
- **`develop`** - Integration branch for ongoing development

### Legacy Branches

- **`feature/rln00398-v002-refactor`** - Contains V001 implementation and extensive feature history

---

## 🔐 Confidentiality

**CONFIDENTIAL & PROPRIETARY**

This software is proprietary to DNV and is developed under contract for ProRail. All code, documentation, and data are confidential. Unauthorized copying, distribution, modification, or use is strictly prohibited.

© 2025 DNV. All rights reserved.

---

## 📞 Contact

### DNV Development Team
- **Project Lead:** [Contact Info]
- **Technical Lead:** [Contact Info]
- **Support:** [Internal Support Channel]

### ProRail Stakeholders
- **Standard Owner:** ProRail AM Techniek
- **Technical Contact:** [ProRail Contact Info]

---

## ⚖️ License

**Proprietary Software License**

This software is licensed exclusively to ProRail under the terms of the development agreement between DNV and ProRail. No part of this software may be used, copied, modified, or distributed without explicit written permission from DNV.

---

**For application-specific information, see [`cable-route-evaluator/README.md`](cable-route-evaluator/README.md)**
