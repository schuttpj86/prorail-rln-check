# 🚂 ProRail Cable Route Evaluator

Web-based GIS tool for evaluating high-voltage cable routes against ProRail's EMC standards (RLN00398).

## 🎯 Features

- ✅ Interactive map with ProRail infrastructure layers
- ✅ Draw and edit cable route alternatives  
- ✅ Automatic compliance evaluation against 8 criteria
- ✅ Real-time visual feedback
- ✅ Export compliance reports
- ✅ Project save/load (localStorage)

## 🛠️ Technology Stack

- **Frontend:** Vite + ArcGIS Maps SDK for JavaScript 4.33
- **UI Components:** Calcite Design System
- **Spatial Reference:** RD New (EPSG:28992)
- **Data Source:** ProRail ArcGIS FeatureServer

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- ArcGIS API Key

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your ArcGIS credentials:

```
VITE_ARCGIS_API_KEY=your_key_here
VITE_CLIENT_ID=your_client_id
VITE_CLIENT_SECRET=your_client_secret
VITE_PRORAIL_BASE_URL=https://maps.prorail.nl/arcgis/rest/services/ProRail_basiskaart/FeatureServer
```

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t cable-route-evaluator .

# Run container
docker run -p 3000:3000 cable-route-evaluator
```

## 📐 ProRail EMC Compliance Criteria

The tool evaluates cable routes against 8 requirements from RLN00398:

1. **Crossing Angle:** 80° - 100°
2. **Fault Clearing:** ≤ 100ms
3. **Distance (≥35kV):** ≥ 700m (or 11m on 25kV lines)
4. **Distance (3-core <35kV):** ≥ 11m
5. **Distance (single-phase <35kV):** ≥ 11m
6. **Technical Rooms:** ≥ 20m
7. **Insulated Pipe:** Required under tracks
8. **Joints:** ≥ 31m from tracks

## 📁 Project Structure

```
cable-route-evaluator/
├── src/
│   ├── main.js              # Application entry point
│   ├── config.js            # Configuration & constants
│   ├── style.css            # Styles
│   ├── layers/              # 📦 Layer management system
│   │   ├── layerConfig.js   # Define all FeatureServer layers here
│   │   ├── layerFactory.js  # Factory to create ArcGIS layers
│   │   └── README.md        # How to add new FeatureServers
│   ├── utils/               # Utility functions (Phase 4)
│   │   ├── geometry.js      # Geometry calculations
│   │   └── compliance.js    # Compliance evaluation
│   └── components/          # UI components (Phase 6)
├── index.html               # Main HTML
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── .env                     # Environment variables (not in git)
└── README.md               # This file
```

## 🆕 Adding New FeatureServers

The app uses a modular layer management system. To add new data sources:

1. **Add URL to `src/config.js`**
2. **Define layers in `src/layers/layerConfig.js`**
3. **Import and use in `src/main.js`**

See **[src/layers/README.md](src/layers/README.md)** for detailed instructions and examples.

### Quick Example:

```javascript
// 1. In src/config.js
export const config = {
  newDataSource: {
    baseUrl: 'https://example.com/arcgis/rest/services/MyService/FeatureServer'
  }
};

// 2. In src/layers/layerConfig.js
export const newLayers = [{
  id: 'my-layer',
  url: `${config.newDataSource.baseUrl}/0`,
  title: '🎯 My Layer',
  visible: true,
  renderer: { /* ... */ },
  popupTemplate: { /* ... */ }
}];

// 3. In src/main.js
import { newLayers } from "./layers/layerConfig.js";
const myFeatureLayers = createFeatureLayersWithHandling(newLayers);
```

## 🗺️ Development Phases

- [x] **Phase 1:** Foundation setup ← **WE ARE HERE**
- [ ] **Phase 2:** ProRail data integration
- [ ] **Phase 3:** Drawing & editing tools
- [ ] **Phase 4:** Geometry analysis engine
- [ ] **Phase 5:** Compliance evaluation logic
- [ ] **Phase 6:** Visual feedback & UI
- [ ] **Phase 7:** Reports & export

## 🧪 Testing

```bash
# Run development server and test drawing
npm run dev

# Open browser console (F12)
# Check for:
# - ✅ Map loads with ProRail layers
# - ✅ Drawing tools work
# - ✅ Routes save to localStorage
```

## 🐛 Troubleshooting

### Map doesn't load
- Check API key in `.env`
- Verify ProRail URL is accessible
- Check browser console for errors

### Spatial reference issues
- Verify RD New (EPSG:28992) is supported
- Check view.spatialReference in console

### ProRail layers don't appear
- Verify FeatureServer URL
- Check layer indices in `config.js`
- Try accessing URL directly in browser

## 📚 Resources

- [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/)
- [ProRail RLN00398 Standard](https://www.prorail.nl)
- [RD New Coordinate System](https://epsg.io/28992)

## 📝 License

Internal DNV project - All rights reserved

## 👤 Author

DNV EFT - ProRail Cable Route Evaluation Team

---

**Status:** Phase 1 Complete - Basic map with ProRail layers functional ✅
