/**
 * Internationalization (i18n) translations for the ProRail Cable Route Evaluator
 * Based on RLN00398-V001 - EMC requirements for high-voltage connections
 */

export const translations = {
  en: {
    // Application title
    appTitle: "ProRail Cable Route Evaluator",
    appSubtitle: "EMC Compliance Tool for High-Voltage Cable Routes",
    
    // Drawing controls
    drawingControls: "Drawing Controls",
    startDrawing: "Start Drawing Route",
    finishRoute: "Finish Route",
    cancelDrawing: "Cancel Drawing",
    clearAll: "Clear All Routes",
    newRoute: "New Route",
    
    // Route management
    routes: "Routes",
    routeName: "Route",
    routeLength: "Length",
    evaluateRoute: "Evaluate Route",
    deleteRoute: "Delete Route",
    selectRoute: "Select Route",
    editRoute: "Edit Route",
    noRoutesYet: "No routes yet",
    clickToCreateRoute: "Click ➕ to create one",
    
    // Evaluation results
    evaluationResults: "Evaluation Results",
    complianceStatus: "Compliance Status",
    passed: "Passed",
    failed: "Failed",
    pending: "Pending",
    notApplicable: "N/A",
    pass: "Pass",
    fail: "Fail",
    
    // EMC Rules (from RLN00398)
    emcRules: "EMC Rules",
    emcCompliance: "EMC Compliance",
    rule: "Rule",
    status: "Status",
    description: "Description",
    requirement: "Requirement",
    criteria: "Criteria",
    
    // RLN00398 specific terms
    highVoltageConnection: "High-Voltage Connection",
    highVoltageLine: "High-Voltage Line",
    highVoltageCable: "High-Voltage Cable",
    mainRailwayInfrastructure: "Main Railway Infrastructure",
    electromagneticInterference: "Electromagnetic Interference",
    crossingAngle: "Crossing Angle",
    clearance: "Clearance",
    parallelRoute: "Parallel Route",
    perpendicularCrossing: "Perpendicular Crossing",
    
    // Layer controls
    layers: "Layers",
    basemaps: "Basemaps",
    prorailLayers: "ProRail Layers",
    energySupply: "Energy Supply System (All)",
    energySupplyShort: "Energy Supply",
    cableSituation: "Cable Situation (All)",
    cableSituationShort: "Cable Situation",
    trainProtection: "Train Protection System",
    trackObjects: "Other Track Objects",
    trackDistances: "Track Asset Distances",
    
    // Specific layers (matching ProRail terminology)
    technicalRooms: "EV Buildings (Technical Rooms)",
    technicalRoomsShort: "Technical Rooms",
    earthingPoints: "Earthing (Earthing Points)",
    earthingPointsShort: "Earthing Points",
    railwayTracks: "Railway Track Centerline",
    railwayTracksShort: "Railway Tracks",
    switches: "Switches",
    levelCrossings: "Level Crossings",
    stations: "Stations",
    trackSections: "Track Sections",
    cableRoutes: "Tracé (Cable Routes)",
    cableRoutesShort: "Cable Routes",
    conduitRoutes: "Conduit Tracé",
    conduitRoutesShort: "Conduit Routes",
    structures: "Structures & Buildings",
    
    // Distance and measurements
    distance: "Distance",
    distanceToTrack: "Distance to Track",
    distanceAnnotations: "Distance Annotations",
    meters: "m",
    kilometers: "km",
    minimumDistance: "Minimum Distance",
    
    // Compliance messages
    minDistanceRequired: "Minimum distance required",
    crossingAngleRequired: "Crossing angle must be 80-100°",
    technicalRoomDistance: "Distance from technical rooms: min. 20m",
    clearanceDistance: "Clearance distance",
    requiredDistance: "Required Distance",
    actualDistance: "Actual Distance",
    
    // Welcome message
    welcomeTitle: "Welcome to ProRail Cable Route Evaluator",
    welcomeDescription: "This tool helps you design and evaluate cable routes along railway infrastructure for compliance with EMC (Electromagnetic Compatibility) requirements.",
    howToUse: "How to Use:",
    drawingRoutesTitle: "Drawing Routes:",
    drawingRoutesStep1: "Click the ➕ button in the top-left Routes panel",
    drawingRoutesStep2: "Click on the map to add waypoints along your route",
    drawingRoutesStep3: "Double-click to finish the route",
    drawingRoutesStep4: "Hover over the ➕ button for quick tips",
    evaluatingRoutesTitle: "Evaluating Routes:",
    evaluatingRoutesStep1: "After drawing, routes appear in the Routes panel",
    evaluatingRoutesStep2: "Click Evaluate to check EMC compliance",
    evaluatingRoutesStep3: "View detailed results and distance measurements",
    standardInfo: "Based on ProRail Standard RLN00398: EMC Requirements for High-Voltage Connections",
    getStarted: "Get Started",
    
    // Infrastructure types
    infrastructureTypes: "Infrastructure Types:",
    cablesType: "Cables:",
    cablesTypeDesc: "Underground or overhead cable routes",
    ohlType: "OHL (Overhead Lines):",
    ohlTypeDesc: "Overhead power line routes",
    
    // View results
    viewResults: "View Your Results:",
    leftPanelRoutes: "Left Panel (Routes):",
    leftPanelRoutesDesc: "All your drawn routes with details",
    rightPanelResults: "Right Panel (Results):",
    rightPanelResultsDesc: "EMC evaluation results and compliance status",
    mapLayers: "Map Layers:",
    mapLayersDesc: "Toggle railway infrastructure layers (top-right icon)",
    
    // Console messages (for logging)
    initializingApp: "Initializing application",
    appReady: "Application ready",
    projectionEngineLoaded: "Projection engine loaded",
    mapViewLoaded: "Map view loaded",
    
    // UI elements
    close: "Close",
    open: "Open",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    apply: "Apply",
    reset: "Reset",
    
    // Help text
    drawingHelp: "Click on the map to add points to your route. Double-click or press Finish to complete.",
    evaluationHelp: "Evaluate your cable route against ProRail EMC standards (RLN00398).",
    
    // Header buttons
    help: "Help",
    settings: "Settings",
    language: "Language",
    
    // Tooltips
    startDrawingTooltip: "Start drawing a new cable route",
    cancelDrawingTooltip: "Cancel current drawing",
    evaluateRouteTooltip: "Evaluate route against EMC standards",
    deleteRouteTooltip: "Delete this route",
  },
  
  nl: {
    // Application title
    appTitle: "ProRail Kabeltracé Evaluator",
    appSubtitle: "EMC Nalevingsinstrument voor Hoogspanningsverbindingen",
    
    // Drawing controls
    drawingControls: "Tekengereedschap",
    startDrawing: "Start Tekenen Route",
    finishRoute: "Route Voltooien",
    cancelDrawing: "Annuleren",
    clearAll: "Alles Wissen",
    newRoute: "Nieuwe Route",
    
    // Route management
    routes: "Routes",
    routeName: "Route",
    routeLength: "Lengte",
    evaluateRoute: "Route Evalueren",
    deleteRoute: "Route Verwijderen",
    selectRoute: "Route Selecteren",
    editRoute: "Route Bewerken",
    noRoutesYet: "Nog geen routes",
    clickToCreateRoute: "Klik ➕ om er één te maken",
    
    // Evaluation results
    evaluationResults: "Evaluatieresultaten",
    complianceStatus: "Nalevingsstatus",
    passed: "Goedgekeurd",
    failed: "Afgekeurd",
    pending: "In Behandeling",
    notApplicable: "N.V.T.",
    pass: "Voldoet",
    fail: "Voldoet Niet",
    
    // EMC Rules (from RLN00398)
    emcRules: "EMC Regels",
    emcCompliance: "EMC Naleving",
    rule: "Regel",
    status: "Status",
    description: "Beschrijving",
    requirement: "Eis",
    criteria: "Criteria",
    
    // RLN00398 specific terms (official Dutch terminology)
    highVoltageConnection: "Hoogspanningsverbinding",
    highVoltageLine: "Hoogspanningslijn",
    highVoltageCable: "Hoogspanningskabel",
    mainRailwayInfrastructure: "Hoofdspoorweginfrastructuur (HSWI)",
    electromagneticInterference: "Elektromagnetische Beïnvloeding (EM)",
    crossingAngle: "Kruisingshoek",
    clearance: "Vrijhoudingsafstand",
    parallelRoute: "Parallelloop",
    perpendicularCrossing: "Haakse Kruising",
    
    // Layer controls
    layers: "Lagen",
    basemaps: "Basiskaarten",
    prorailLayers: "ProRail Lagen",
    energySupply: "⚡ Energievoorzieningssysteem (Alles)",
    energySupplyShort: "Energievoorziening",
    cableSituation: "🔌 Kabelsituatie (Alles)",
    cableSituationShort: "Kabelsituatie",
    trainProtection: "🚦 Treinbeveiligingssysteem",
    trackObjects: "🔧 Overige Spoorobjecten",
    trackDistances: "📏 Spoor Asset Afstanden",
    
    // Specific layers (Official ProRail terminology from RLN00398)
    technicalRooms: "🏢 EV Gebouwen (Technische Ruimtes)",
    technicalRoomsShort: "Technische Ruimtes",
    earthingPoints: "⚡ Aarding (Aardingspunten)",
    earthingPointsShort: "Aardingspunten",
    railwayTracks: "🚂 Spoorbaanhartlijn",
    railwayTracksShort: "Spoorlijnen",
    switches: "🔀 Wissel",
    levelCrossings: "⚠️ Overweg",
    stations: "🚉 Stations",
    trackSections: "🛤️ Spoortakdeel",
    cableRoutes: "📍 Tracé (Kabeltracés)",
    cableRoutesShort: "Kabeltracés",
    conduitRoutes: "🔧 Kokertracé",
    conduitRoutesShort: "Kokertracé",
    structures: "🏗️ Bouwwerken & Gebouwen",
    
    // Distance and measurements
    distance: "Afstand",
    distanceToTrack: "Afstand tot Spoor",
    distanceAnnotations: "Afstandsaanduidingen",
    meters: "m",
    kilometers: "km",
    minimumDistance: "Minimale Afstand",
    
    // Compliance messages (RLN00398 terminology)
    minDistanceRequired: "Minimale afstand vereist",
    crossingAngleRequired: "Kruisingshoek moet 80-100° zijn",
    technicalRoomDistance: "Afstand vanaf technische ruimtes: min. 20m",
    clearanceDistance: "Vrijhoudingsafstand",
    requiredDistance: "Vereiste Afstand",
    actualDistance: "Werkelijke Afstand",
    
    // Welcome message
    welcomeTitle: "Welkom bij ProRail Kabeltracé Evaluator",
    welcomeDescription: "Deze tool helpt u bij het ontwerpen en evalueren van kabeltracés langs spoorweginfrastructuur voor naleving van EMC-eisen (Elektromagnetische Compatibiliteit).",
    howToUse: "Hoe te Gebruiken:",
    drawingRoutesTitle: "📍 Routes Tekenen:",
    drawingRoutesStep1: "Klik op de ➕ knop in het linker Routes paneel",
    drawingRoutesStep2: "Klik op de kaart om wegpunten toe te voegen aan uw route",
    drawingRoutesStep3: "Dubbelklik om de route te voltooien",
    drawingRoutesStep4: "Beweeg over de ➕ knop voor snelle tips",
    evaluatingRoutesTitle: "📊 Routes Evalueren:",
    evaluatingRoutesStep1: "Na het tekenen verschijnen routes in het Routes paneel",
    evaluatingRoutesStep2: "Klik op Evalueren om EMC-naleving te controleren",
    evaluatingRoutesStep3: "Bekijk gedetailleerde resultaten en afstandsmetingen",
    standardInfo: "Gebaseerd op ProRail Richtlijn RLN00398: EMC-eisen voor Hoogspanningsverbindingen",
    getStarted: "Aan de Slag",
    
    // Infrastructure types
    infrastructureTypes: "Infrastructuurtypen:",
    cablesType: "Kabels:",
    cablesTypeDesc: "Ondergrondse of bovengrondse kabeltracés",
    ohlType: "Bovenleidingen:",
    ohlTypeDesc: "Bovengrondse hoogspanningslijn routes",
    
    // View results
    viewResults: "Bekijk Uw Resultaten:",
    leftPanelRoutes: "Linker Paneel (Routes):",
    leftPanelRoutesDesc: "Al uw getekende routes met details",
    rightPanelResults: "Rechter Paneel (Resultaten):",
    rightPanelResultsDesc: "EMC evaluatieresultaten en nalevingsstatus",
    mapLayers: "Kaartlagen:",
    mapLayersDesc: "Schakel spoorweginfrastructuur lagen in/uit (rechtsboven icoon)",
    
    // Console messages (for logging)
    initializingApp: "Applicatie wordt geïnitialiseerd",
    appReady: "Applicatie gereed",
    projectionEngineLoaded: "Projectie-engine geladen",
    mapViewLoaded: "Kaartweergave geladen",
    
    // UI elements
    close: "Sluiten",
    open: "Openen",
    save: "Opslaan",
    cancel: "Annuleren",
    confirm: "Bevestigen",
    delete: "Verwijderen",
    edit: "Bewerken",
    apply: "Toepassen",
    reset: "Resetten",
    
    // Help text
    drawingHelp: "Klik op de kaart om punten aan uw route toe te voegen. Dubbelklik of druk op Voltooien om te voltooien.",
    evaluationHelp: "Evalueer uw kabeltracé tegen ProRail EMC-normen (RLN00398).",
    
    // Header buttons
    help: "Hulp",
    settings: "Instellingen",
    language: "Taal",
    
    // Tooltips
    startDrawingTooltip: "Start met het tekenen van een nieuw kabeltracé",
    cancelDrawingTooltip: "Huidige tekening annuleren",
    evaluateRouteTooltip: "Route evalueren volgens EMC-normen",
    deleteRouteTooltip: "Deze route verwijderen",
  }
};

/**
 * Get current language from localStorage or default to English
 */
export function getCurrentLanguage() {
  return localStorage.getItem('prorail-language') || 'en';
}

/**
 * Set current language in localStorage
 */
export function setCurrentLanguage(lang) {
  localStorage.setItem('prorail-language', lang);
}

/**
 * Get translation for a key in the current language
 */
export function t(key, lang = null) {
  const currentLang = lang || getCurrentLanguage();
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

/**
 * Update all translatable elements in the DOM
 */
export function updateTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key, lang);
    
    // Update text content or placeholder based on element type
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else if (element.tagName === 'BUTTON') {
      // For buttons, preserve any child elements and just update text
      element.textContent = translation;
    } else {
      // For other elements, check if they have innerHTML with <strong> or other tags
      const hasHTML = element.querySelector('strong, em, b, i');
      if (hasHTML && translation.includes('<')) {
        element.innerHTML = translation;
      } else if (hasHTML) {
        // Keep existing formatting but update the main text
        element.textContent = translation;
      } else {
        element.textContent = translation;
      }
    }
  });
  
  // Update aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    const key = element.getAttribute('data-i18n-aria');
    element.setAttribute('aria-label', t(key, lang));
  });
  
  // Update tooltips
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    element.setAttribute('title', t(key, lang));
  });
}
