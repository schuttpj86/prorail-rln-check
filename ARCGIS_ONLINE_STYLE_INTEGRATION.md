# 🎨 ArcGIS Online Style Integration Guide

## Overview

This guide shows how to integrate your ProRail Cable Route Evaluator app with the professional ArcGIS Online viewer style using **Calcite Components** and **ArcGIS Map Components**.

The ArcGIS Online style features:
- ✅ **Calcite Shell** - Professional layout container
- ✅ **Collapsible Panels** - Left and right side panels with expand/collapse
- ✅ **Action Bar** - Icon-based navigation on the left
- ✅ **Navigation Header** - Top navigation with logo and title
- ✅ **Consistent Design System** - Matches ArcGIS Online exactly

---

## 📚 Reference Examples

In your `jsapi-resources-main` folder, you have excellent examples:

### Best Starting Point:
```
jsapi-resources-main/
└── component-samples/
    └── map-components/
        └── tutorials/
            └── create-a-web-app-using-components-solution/
```

This tutorial demonstrates:
- `calcite-shell` for layout
- `calcite-navigation` for header
- `arcgis-map` integration
- `arcgis-layer-list` in the map

---

## 🏗️ Proposed Architecture

### Current Structure (Your App)
```
<div id="app">
  <div id="controlsPanel"> <!-- Left side -->
  <div id="mapContainer"> <!-- Map -->
  <div id="resultsPanel"> <!-- Right side -->
</div>
```

### New Structure (ArcGIS Online Style)
```html
<calcite-shell>
  <!-- Top Navigation Bar -->
  <calcite-navigation slot="header">
    <calcite-navigation-logo 
      slot="logo" 
      heading="ProRail Cable Route Evaluator"
      description="EMC Compliance Analysis Tool">
    </calcite-navigation-logo>
    
    <!-- Language toggle and other header actions -->
    <calcite-action-group slot="content-end">
      <calcite-action text="Nederlands" icon="language"></calcite-action>
    </calcite-action-group>
  </calcite-navigation>

  <!-- Left Collapsible Panel with Action Bar -->
  <calcite-shell-panel 
    slot="panel-start" 
    position="start"
    collapsed
    collapsible>
    
    <!-- Icon menu on the left edge -->
    <calcite-action-bar slot="action-bar">
      <calcite-action 
        text="Routes" 
        icon="map-pin"
        data-panel="routes">
      </calcite-action>
      <calcite-action 
        text="Tools" 
        icon="tools"
        data-panel="tools">
      </calcite-action>
      <calcite-action 
        text="Layers" 
        icon="layers"
        data-panel="layers">
      </calcite-action>
      <calcite-action 
        text="Settings" 
        icon="gear"
        data-panel="settings">
      </calcite-action>
    </calcite-action-bar>

    <!-- Panel content (switchable) -->
    <calcite-panel heading="Routes" id="routes-panel">
      <!-- Your route controls here -->
    </calcite-panel>
    
    <calcite-panel heading="Tools" id="tools-panel" hidden>
      <!-- Drawing tools, measurement, etc. -->
    </calcite-panel>
    
    <calcite-panel heading="Layers" id="layers-panel" hidden>
      <!-- Layer controls -->
    </calcite-panel>
  </calcite-shell-panel>

  <!-- Map Container -->
  <arcgis-map 
    item-id="your-map-id-or-blank"
    zoom="7"
    center="[5.2913, 52.1326]">
    
    <!-- Built-in widgets positioned on map -->
    <arcgis-zoom position="top-left"></arcgis-zoom>
    <arcgis-search position="top-right"></arcgis-search>
  </arcgis-map>

  <!-- Right Collapsible Panel -->
  <calcite-shell-panel 
    slot="panel-end" 
    position="end"
    width-scale="m">
    
    <calcite-panel heading="Results">
      <!-- Your evaluation results here -->
    </calcite-panel>
  </calcite-shell-panel>

</calcite-shell>
```

---

## 🔧 Implementation Steps

### Step 1: Update Dependencies

Your `package.json` already has what you need, but verify versions:

```json
{
  "dependencies": {
    "@arcgis/core": "^4.33.0",
    "@esri/calcite-components": "^3.2.1"
  }
}
```

### Step 2: Import Calcite Components

In your `main.js`, add these imports:

```javascript
// Import Calcite Components
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-navigation";
import "@esri/calcite-components/dist/components/calcite-navigation-logo";
import "@esri/calcite-components/dist/components/calcite-action-bar";
import "@esri/calcite-components/dist/components/calcite-action";
import "@esri/calcite-components/dist/components/calcite-action-group";
import "@esri/calcite-components/dist/components/calcite-panel";

// Set asset path for Calcite icons and assets
import { setAssetPath } from "@esri/calcite-components/dist/components";
setAssetPath("https://js.arcgis.com/calcite-components/3.2.1/assets");
```

### Step 3: Create New HTML Structure

Replace your `index.html` body:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProRail Cable Route Evaluator</title>
  <link rel="icon" href="data:;base64,=" />
</head>
<body>
  <calcite-shell>
    <!-- Header -->
    <calcite-navigation slot="header">
      <calcite-navigation-logo 
        slot="logo" 
        heading="ProRail Cable Route Evaluator"
        description="EMC Compliance Analysis">
      </calcite-navigation-logo>
    </calcite-navigation>

    <!-- Left Panel -->
    <calcite-shell-panel 
      slot="panel-start" 
      position="start"
      width-scale="m"
      collapsible
      id="leftPanel">
      
      <calcite-action-bar slot="action-bar" id="actionBar">
        <calcite-action 
          text="Routes" 
          icon="map-pin" 
          id="action-routes"
          active>
        </calcite-action>
        <calcite-action 
          text="Tools" 
          icon="effects" 
          id="action-tools">
        </calcite-action>
        <calcite-action 
          text="Layers" 
          icon="layers" 
          id="action-layers">
        </calcite-action>
      </calcite-action-bar>

      <!-- Routes Panel -->
      <calcite-panel 
        heading="Cable Routes" 
        id="panel-routes"
        closable>
        <div id="routesContent">
          <!-- Your existing route controls -->
        </div>
      </calcite-panel>

      <!-- Tools Panel -->
      <calcite-panel 
        heading="Tools" 
        id="panel-tools"
        hidden
        closable>
        <div id="toolsContent">
          <!-- Your measurement and drawing tools -->
        </div>
      </calcite-panel>

      <!-- Layers Panel -->
      <calcite-panel 
        heading="Layers" 
        id="panel-layers"
        hidden
        closable>
        <div id="layersContent">
          <!-- Your layer list -->
        </div>
      </calcite-panel>
    </calcite-shell-panel>

    <!-- Map -->
    <div id="mapContainer" style="width: 100%; height: 100%;">
      <!-- Your existing map will be initialized here -->
    </div>

    <!-- Right Panel -->
    <calcite-shell-panel 
      slot="panel-end" 
      position="end"
      width-scale="m"
      collapsed
      collapsible
      id="rightPanel">
      
      <calcite-panel heading="Evaluation Results">
        <div id="resultsContent">
          <!-- Your existing results panel content -->
        </div>
      </calcite-panel>
    </calcite-shell-panel>

  </calcite-shell>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### Step 4: Update CSS

Add to your `style.css`:

```css
/* Reset for Calcite Shell */
html,
body {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  font-family: "Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

calcite-shell {
  --calcite-shell-panel-width: 380px;
}

/* Map container takes full space */
#mapContainer {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Panel content padding */
#routesContent,
#toolsContent,
#layersContent,
#resultsContent {
  padding: 1rem;
}

/* Keep your existing component styles */
.route-card {
  /* Your existing styles */
}

/* Ensure proper z-index for widgets */
.esri-ui-corner {
  z-index: 1;
}
```

### Step 5: Add Panel Switching Logic

In your `main.js`, add this functionality:

```javascript
// Panel switching logic
function initializePanelSwitching() {
  const actionBar = document.getElementById('actionBar');
  const panels = {
    'action-routes': 'panel-routes',
    'action-tools': 'panel-tools',
    'action-layers': 'panel-layers'
  };

  actionBar.addEventListener('click', (event) => {
    const action = event.target.closest('calcite-action');
    if (!action) return;

    // Hide all panels
    Object.values(panels).forEach(panelId => {
      const panel = document.getElementById(panelId);
      if (panel) panel.hidden = true;
    });

    // Remove active from all actions
    Object.keys(panels).forEach(actionId => {
      const actionEl = document.getElementById(actionId);
      if (actionEl) actionEl.active = false;
    });

    // Show selected panel and activate action
    const targetPanel = document.getElementById(panels[action.id]);
    if (targetPanel) {
      targetPanel.hidden = false;
      action.active = true;
      
      // Make sure the panel is expanded
      const leftPanel = document.getElementById('leftPanel');
      if (leftPanel) leftPanel.collapsed = false;
    }
  });
}

// Call this after DOM is loaded
initializePanelSwitching();
```

---

## 🎯 Key Benefits

### 1. **Professional Appearance**
- Matches ArcGIS Online exactly
- Consistent with Esri design language
- Modern, clean interface

### 2. **Better Space Management**
- Collapsible panels save screen space
- Action bar provides quick access
- Right panel for contextual results

### 3. **Improved UX**
- Icon-based navigation is intuitive
- Panels can be collapsed when not needed
- More focus on the map

### 4. **Responsive Design**
- Calcite components are mobile-friendly
- Automatic responsive behavior
- Proper touch support

### 5. **Accessibility**
- WCAG compliant components
- Keyboard navigation built-in
- Screen reader support

---

## 📦 Component Reference

### Main Layout Components

| Component | Purpose | Key Properties |
|-----------|---------|----------------|
| `calcite-shell` | Main container | - |
| `calcite-shell-panel` | Side panels | `position`, `collapsed`, `collapsible`, `width-scale` |
| `calcite-navigation` | Top header | `slot="header"` |
| `calcite-navigation-logo` | App branding | `heading`, `description`, `thumbnail` |
| `calcite-action-bar` | Icon menu | `slot="action-bar"` |
| `calcite-action` | Individual icon button | `text`, `icon`, `active` |
| `calcite-panel` | Panel content container | `heading`, `closable`, `hidden` |

### Useful Properties

**Shell Panel:**
```html
<calcite-shell-panel
  slot="panel-start"           <!-- or "panel-end" -->
  position="start"              <!-- or "end" -->
  width-scale="s|m|l"          <!-- small, medium, large -->
  collapsed                     <!-- starts collapsed -->
  collapsible                   <!-- can be collapsed -->
  detached                      <!-- floating style -->
  display-mode="float|overlay"  <!-- behavior -->
>
```

**Action Bar:**
```html
<calcite-action-bar
  expand-disabled               <!-- disable expansion -->
  layout="vertical|horizontal"  <!-- orientation -->
>
```

---

## 🔍 Complete Icon Reference

Calcite has 500+ icons. Common ones for your app:

| Icon Name | Use For |
|-----------|---------|
| `map-pin` | Routes/waypoints |
| `effects` | Drawing tools |
| `layers` | Layer management |
| `measure` | Measurement tools |
| `gear` | Settings |
| `information` | Help/info |
| `save` | Save actions |
| `trash` | Delete actions |
| `plus` | Add new |
| `pencil` | Edit |
| `eye` | Visibility toggle |
| `x` | Close/cancel |
| `check` | Confirm |
| `list-check` | Evaluation results |
| `まる` | Point selection |
| `line` | Line drawing |
| `language` | Language toggle |

Full icon list: https://developers.arcgis.com/calcite-design-system/icons/

---

## 💡 Migration Strategy

### Option 1: Clean Rewrite (Recommended)
1. Create new branch: `feature/calcite-ui`
2. Start with tutorial template
3. Migrate functionality piece by piece
4. Test thoroughly
5. Merge when complete

### Option 2: Incremental Migration
1. Add Calcite shell around existing app
2. Move controls into panels one at a time
3. Refactor as you go
4. Keep app functional throughout

### Option 3: Parallel Development
1. Create `/calcite-version/` folder
2. Build new UI alongside old one
3. Switch when ready

---

## 🎨 Customization Tips

### 1. Custom Colors
```css
calcite-shell {
  --calcite-ui-brand: #0079c1;           /* ProRail blue */
  --calcite-ui-brand-hover: #005a8f;
  --calcite-ui-background: #f8f8f8;
}
```

### 2. Panel Widths
```css
calcite-shell-panel {
  --calcite-shell-panel-width: 400px;    /* Wider panels */
  --calcite-shell-panel-max-width: 600px;
}
```

### 3. Custom Header Height
```css
calcite-navigation {
  --calcite-shell-header-height: 56px;
}
```

---

## 🚀 Next Steps

1. **Study the Example**
   - Run the tutorial: `jsapi-resources-main/component-samples/map-components/tutorials/create-a-web-app-using-components-solution`
   - Experiment with collapsing panels
   - Try different icons

2. **Create Prototype**
   - Start with basic shell structure
   - Add one panel with your route list
   - Get comfortable with switching between panels

3. **Migrate Components**
   - Route list → Left panel
   - Tools → Left panel (different tab)
   - Results → Right panel
   - Layer list → Left panel OR use `arcgis-layer-list` widget

4. **Polish**
   - Add icons
   - Improve spacing
   - Test responsive behavior
   - Add loading states

---

## 📖 Additional Resources

- **Calcite Components Docs**: https://developers.arcgis.com/calcite-design-system/components/
- **Map Components Docs**: https://developers.arcgis.com/javascript/latest/components/
- **Design System**: https://developers.arcgis.com/calcite-design-system/
- **Storybook Examples**: https://developers.arcgis.com/calcite-design-system/components/?path=/story/components-shell--simple

---

## ❓ FAQ

**Q: Will this break my existing functionality?**  
A: No, it's just a UI wrapper. Your map and logic stay the same.

**Q: Can I still use my custom CSS?**  
A: Yes! Calcite components are customizable via CSS variables.

**Q: Do I need to rewrite everything?**  
A: No, you're just moving your existing HTML into Calcite panels.

**Q: Will it work with my current Vite setup?**  
A: Yes, Calcite components work perfectly with Vite.

**Q: Can I mix Calcite with my custom UI?**  
A: Yes, use Calcite for the shell/layout and keep your custom components inside panels.

---

## 🎉 Summary

The ArcGIS Online style integration gives you:
- ✅ Professional, polished appearance
- ✅ Better space management with collapsible panels
- ✅ Icon-based navigation that's intuitive
- ✅ Consistent design language
- ✅ Mobile-responsive out of the box
- ✅ Accessibility built-in
- ✅ Minimal code changes required

**The tutorial in your jsapi-resources folder is the perfect starting point!** 🚀
