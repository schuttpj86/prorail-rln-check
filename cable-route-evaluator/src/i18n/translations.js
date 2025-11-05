/**
 * Internationalization (i18n) translations for the ProRail Cable Route Evaluator
 * Based on RLN00398-V001 - EMC requirements for high-voltage connections
 */

export const translations = {
  en: {
    // Application title
    appTitle: "ProRail High Voltage Connection Evaluator",
    appSubtitle: "EMC Compliance Tool for High-Voltage Connections",
    
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
    clickToCreateRoute: "Route",
    
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
    welcomeTitle: "Welcome to ProRail High Voltage Connection Evaluator",
    welcomeIntro: "In the Netherlands, ProRail Standard RLN00398 (Version 002, 01-12-2020) is used for the evaluation of electromagnetic interference between high-voltage connections and railway infrastructure.",
    welcomePurpose: "The initial part of this standard requires a combination of checks between the high-voltage connection and railway infrastructure. These checks determine whether more detailed electromagnetic compatibility (EMC) studies are required.",
    welcomeScope: "This tool focuses on the preliminary evaluation phase—not detailed studies—enabling fast assessment and comparative analysis of different cable and overhead line routes.",
    
    welcomeCapabilitiesTitle: "Key Capabilities:",
    welcomeCapability1: "✓ Draw routes directly on the map using the interactive interface",
    welcomeCapability2: "✓ Import existing route geometries from CAD/GIS files (GeoJSON)",
    welcomeCapability3: "✓ Perform automated EMC compliance checks against RLN00398 criteria",
    welcomeCapability4: "✓ Compare multiple route alternatives side-by-side",
    welcomeCapability5: "✓ Generate professional reports for Request for Proposal (RFP) documentation",
    welcomeCapability6: "✓ Document design details: cable type, layout, earthing points, joint locations",
    
    welcomeValueTitle: "Engineering Value:",
    welcomeValue1: "⚡ Early identification of EMC compliance issues during route planning",
    welcomeValue2: "📊 Optimize detailed study efficiency with well-documented preliminary analysis",
    welcomeValue3: "🤝 Facilitate collaboration between engineers, clients, and stakeholders",
    welcomeValue4: "✅ Clear overview of which routes pass/fail criteria and what's needed to meet requirements",
    welcomeValue5: "🛡️ Address ProRail safety concerns and permitting requirements upfront",
    
    howToUse: "How to Use This Tool:",
    step1Title: "1. Create or Import Routes",
    step1Desc: "Click ➕ in the Routes panel to draw, or import GeoJSON files from CAD systems",
    step2Title: "2. Configure Route Details",
    step2Desc: "Specify voltage level, cable type, installation method (underground/overhead)",
    step3Title: "3. Evaluate Compliance",
    step3Desc: "Click 'Evaluate' to run automated checks against RLN00398 requirements",
    step4Title: "4. Review Results & Optimize",
    step4Desc: "Analyze distance measurements, crossing angles, and compliance status",
    step5Title: "5. Generate Reports",
    step5Desc: "Export professional documentation for RFP submissions or design records",
    
    standardInfo: "Based on ProRail Standard RLN00398-V002 (01-12-2020): EMC Requirements for High-Voltage Connections",
    getStarted: "Get Started",
    
    // Version and disclaimer
    versionInfo: "Version 1.0 BETA",
    developedBy: "Developed by DNV",
    confidentialityNotice: "CONFIDENTIAL & PROPRIETARY",
    disclaimerTitle: "Important Notice:",
    disclaimer: "This software is proprietary to DNV and is shared under strict confidentiality. This beta version is intended for evaluation and preliminary design purposes only. All results should be verified by qualified engineers before use in official submissions or construction projects.",
    
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
    hideRouteTooltip: "Hide route from map",
    showRouteTooltip: "Show route on map",
    
    // Route visibility
    hideRoute: "Hide",
    showRoute: "Show",
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
    clickToCreateRoute: "Route",
    
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
    hideRouteTooltip: "Route verbergen op de kaart",
    showRouteTooltip: "Route tonen op de kaart",
    
    // Route visibility
    hideRoute: "Verbergen",
    showRoute: "Tonen",
  }
};

/**
 * Get current language from localStorage or default to English
 */
export function getCurrentLanguage() {
  // Always default to English for now
  return 'en';
  // Commented out to disable Dutch language switching
  // return localStorage.getItem('prorail-language') || 'en';
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
