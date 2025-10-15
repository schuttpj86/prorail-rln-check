# Route Visibility Toggle Feature

**Date:** October 15, 2025  
**Feature:** Hide/Show Routes on Map  
**Status:** ✅ Implemented

---

## 🎯 Overview

Added a visibility toggle button for each route to help manage visual clutter when multiple routes are displayed on the map. Users can now hide and show individual routes along with their associated visual elements (annotations, buffers, and asset points).

---

## ✨ What's New

### User-Visible Changes

1. **New Hide/Show Button**
   - Added to each route's action buttons (between "Evaluate" and "Edit")
   - Shows 👁️ "Hide" when route is visible
   - Shows 👁️‍🗨️ "Show" when route is hidden
   - Multi-language support (English/Dutch)

2. **What Gets Hidden/Shown**
   When toggling visibility, the following elements are affected:
   - ✅ Route geometry (the main polyline)
   - ✅ Buffer zones (if displayed)
   - ✅ Distance annotations
   - ✅ Joint/earthing point markers
   - ✅ Any other route-specific graphics

3. **Visual Feedback**
   - Button text updates immediately
   - Icon changes: 👁️ (visible) ↔️ 👁️‍🗨️ (hidden)
   - Tooltips provide clear guidance

---

## 🔧 Technical Implementation

### Files Modified

#### 1. **Translations** (`src/i18n/translations.js`)
Added new translation keys:
```javascript
// English
hideRoute: "Hide",
showRoute: "Show",
hideRouteTooltip: "Hide route from map",
showRouteTooltip: "Show route on map",

// Dutch
hideRoute: "Verbergen",
showRoute: "Tonen",
hideRouteTooltip: "Route verbergen op de kaart",
showRouteTooltip: "Route tonen op de kaart",
```

#### 2. **Main Application** (`src/main.js`)

**New Functions:**
- `window.toggleRouteVisibility(routeId)` - Toggles visibility for a specific route
- `updateVisibilityButton(routeId, isVisible)` - Updates button text and tooltip
- `updateVisibilityButtonTexts()` - Updates all visibility buttons (called on language change)

**Modified Functions:**
- `addRouteToList()` - Added visibility button to route UI with translated text
- Language toggle handler - Now calls `updateVisibilityButtonTexts()` to update button labels

**Key Implementation Details:**
```javascript
window.toggleRouteVisibility = function(routeId) {
  const route = drawingManager.getRoute(routeId);
  
  // Toggle visibility state
  route.visible = !route.visible;
  
  // Update all associated graphics
  route.graphic.visible = route.visible;
  route.bufferGraphic.visible = route.visible;
  
  // Update distance annotations
  distanceAnnotationsLayer.graphics.forEach(g => {
    if (g.attributes?.routeId === routeId) {
      g.visible = route.visible;
    }
  });
  
  // Update joint markers
  jointsLayer.graphics.forEach(g => {
    if (g.attributes?.routeId === routeId) {
      g.visible = route.visible;
    }
  });
  
  // Update button UI
  updateVisibilityButton(routeId, route.visible);
};
```

#### 3. **Drawing Manager** (`src/utils/EnhancedDrawingManager.js`)

**Modified Route Creation:**
Routes now include a `visible` property initialized to `true`:
```javascript
this.routes.set(routeId, {
  ...routeData,
  graphic: routeGraphic,
  visible: true  // ✅ New property
});
```

---

## 🎨 UI Layout

### Route Actions Panel
```
┌─────────────────────────────────────────────┐
│  [Evaluate]  [👁️ Hide]  [Edit]  [Style]  [Delete]  │
└─────────────────────────────────────────────┘
```

### Button States

**When Route is Visible:**
- Text: `👁️ Hide` / `👁️ Verbergen`
- Tooltip: "Hide route from map" / "Route verbergen op de kaart"
- Action: Clicking hides the route

**When Route is Hidden:**
- Text: `👁️‍🗨️ Show` / `👁️‍🗨️ Tonen`
- Tooltip: "Show route on map" / "Route tonen op de kaart"
- Action: Clicking shows the route

---

## 💡 Use Cases

### 1. **Multiple Route Comparison**
- Draw several alternative routes
- Hide all except two to compare side-by-side
- Toggle visibility to quickly switch between options

### 2. **Presentation Mode**
- Hide work-in-progress routes
- Show only final/approved routes
- Clean map display for screenshots or presentations

### 3. **Performance Optimization**
- Hide routes with many annotation points
- Reduce visual complexity for large projects
- Improve map rendering performance

### 4. **Route Organization**
- Keep routes in list for reference
- Hide old/deprecated routes without deleting
- Maintain project history

---

## 🧪 Testing Checklist

- [x] Create multiple routes and verify all are visible by default
- [x] Click "Hide" button and verify route disappears from map
- [x] Verify buffer zones are hidden when route is hidden
- [x] Verify distance annotations are hidden
- [x] Verify joint/earthing markers are hidden
- [x] Click "Show" button and verify route reappears
- [x] Verify button text changes between "Hide" and "Show"
- [x] Switch language and verify button text updates
- [x] Edit a hidden route and verify it remains hidden after editing
- [x] Delete a hidden route and verify no errors occur

---

## 🔄 State Persistence

**Current Behavior:**
- Visibility state is stored in memory (`route.visible` property)
- State persists during editing and re-evaluation
- State is **lost on page refresh** (same as other route data)

**Future Enhancement:**
When save/load functionality is added, include `visible` property in saved route data:
```javascript
{
  id: "route-123",
  name: "Route 1",
  geometry: {...},
  visible: false,  // ⚠️ Remember to save this
  ...
}
```

---

## 🐛 Known Limitations

1. **No Persistence**: Visibility state is lost on page refresh
2. **No "Hide All" Button**: Users must hide routes individually
3. **No Layer-Level Control**: Cannot hide all routes at once via layer panel

---

## 🚀 Future Enhancements

### Potential Improvements:
1. **Bulk Operations**
   - "Hide All" / "Show All" buttons
   - Select multiple routes to hide/show
   
2. **Keyboard Shortcuts**
   - Press `H` to toggle visibility of selected route
   - Press `Shift+H` to hide all routes
   
3. **Visual Indicators**
   - Dim/gray out route name when hidden
   - Add hidden icon (👁️‍🗨️) next to route name
   
4. **Layer Panel Integration**
   - Show/hide routes from ArcGIS layer list
   - Group visibility control

5. **Persistent State**
   - Save visibility in project file
   - Remember last visibility state per route

---

## 📋 Code Quality

### Follows Best Practices:
- ✅ Multi-language support built-in
- ✅ Clear function names and comments
- ✅ Consistent with existing code style
- ✅ No breaking changes to existing features
- ✅ Defensive programming (null checks)

### Console Logging:
```javascript
console.log(`👁️ Route ${routeId} visibility toggled to:`, route.visible);
```

---

## 📚 Related Documentation

- **Current State Summary**: See `CURRENT_STATE_SUMMARY.md`
- **UI Reorganization**: See `UI_REORGANIZATION_COMPLETE.md`
- **Route Style Customization**: See `ROUTE_STYLE_CUSTOMIZATION.md`

---

## ✅ Summary

This feature provides a simple but effective way to manage visual complexity in the ProRail Cable Route Evaluator. Users can now:

1. ✨ **Hide individual routes** with one click
2. 🎨 **Reduce map clutter** when working with many routes
3. 🔄 **Toggle visibility** easily without deleting routes
4. 🌍 **Use in any language** (English/Dutch)
5. 📊 **Maintain route data** even when hidden

The implementation is clean, well-integrated, and ready for production use.

---

**Ready to use! Test it at:** http://localhost:3000/
