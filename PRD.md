
# Cable‑Route Evaluation Tool for ProRail EMC Standard

## 1 Background

### 1.1 ProRail electromagnetic interference policy

ProRail’s guideline **RLN00398 – “Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hoofdspoorweginfrastructuur”** (effective 1 November 2013) sets out rules to prevent high‑voltage cables from disturbing rail infrastructure.  The policy applies to non‑ProRail high‑voltage lines and cables (> 1 kV, ≤ 1 kHz) located on, under or above the railway or in the surrounding zone.  Section 5.2 lists eight specific requirements for high‑voltage cables:

1. **Perpendicular crossing:** when crossing the railway, a cable must cross nearly perpendicular to the track.  The crossing angle Ψ must be between 80° and 100°.
2. **Rapid fault clearance:** any first‑order cable fault must be disconnected within  **100 ms** .
3. **Distance for non‑crossing cables ≥ 35 kV:** non‑crossing cables with a nominal voltage ≥ 35 kV must not be present within **700 m** of the outermost track.  On 25 kV/50 Hz electrified lines this distance may be reduced to  **11 m** .
4. **Three‑core cables < 35 kV:** non‑crossing three‑core cables with nominal voltage < 35 kV must stay at least **11 m** from the outermost track.
5. **Single‑phase cables < 35 kV:** single‑phase cables in triangular configuration and < 35 kV must also remain outside  **11 m** .
6. **Technical rooms:** high‑voltage cables are not allowed within **20 m** of the nearest wall of a railway technical room.
7. **Isolated pipe under the track:** any cable passing under the railway must be routed through an electrically isolated conduit.
8. **No joints within 31 m:** cable joints or grounding points must not be located within **31 m** of the outermost track (20 m + 11 m).

If these requirements cannot be met, the guideline mandates a  **location‑specific study** .  The study uses modelling principles given in chapter 6 (e.g., model the true cable configuration) and assesses the results against the evaluation criteria in chapter 7.

### 1.2 Need for a digital evaluation tool

Cable engineers working on new projects often consider several routing options.  Evaluating each option against the eight ProRail criteria manually is time‑consuming and error‑prone.  A web‑based tool that integrates ProRail’s public geospatial layers with an interactive map could drastically improve efficiency.  By allowing engineers to draw or import candidate routes, the tool could compute crossing angles, distances to tracks and technical rooms, presence of joints, and display compliance results in real time.  An automated check would reduce the risk of non‑compliant designs and accelerate approval.

## 2 Technology options for the application

Developers have several ArcGIS SDKs/APIs to choose from.  The main options considered are:

| SDK/API                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Pros/Cons (relevant to this project)                                                                                                                                                                                                                                                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ArcGIS Maps SDK for JavaScript (JS API)** | Esri’s flagship web‑mapping SDK.  It provides a complete client‑side library for visualising, editing and analysing geospatial data, including smart mapping, 2D and 3D rendering and geometry operations[developers.arcgis.com](https://developers.arcgis.com/arcgis-rest-js/faq/#:~:text=The%20ArcGIS%20Maps%20SDK%20for,web%20maps%20and%20web%20scenes).  It enables interactive web apps with feature editing and supports Web Map/Web Scene integration[developers.arcgis.com](https://developers.arcgis.com/javascript/latest/#:~:text=ArcGIS%20Maps%20SDK%20for%20JavaScript).       | **Pros:**Full mapping functionality out of the box, built‑in geometry engine, sketch/edit widgets, support for interactive UI and real‑time feedback.**Cons:**Larger package size; requires client‑side JavaScript development.                                                                        |
| **ArcGIS REST JS**                          | A lightweight collection of JavaScript modules that wrap the ArcGIS REST API and run in browsers or Node.js[github.com](https://github.com/Esri/arcgis-rest-js#:~:text=,js%20and%20modern%20browsers).  It provides low‑level request functions, authentication and service wrappers[developers.arcgis.com](https://developers.arcgis.com/arcgis-rest-js/faq/#:~:text=However%2C%20the%20goal%20of%20ArcGIS,js%20and%20browser%20applications)but does not include mapping widgets or a geometry engine.                                                                                       | **Pros:**Small footprint, modular, can be combined with other frameworks.**Cons:**Lacks built‑in map rendering and editing tools; developers must integrate their own UI and geometry logic.                                                                                                             |
| **ArcGIS API for Python**                   | A Pythonic library for GIS administrators, analysts and data scientists.  It excels at scripting, data management and analysis in notebooks[developers.arcgis.com](https://developers.arcgis.com/python/latest/guide/part1-introduction-to-using-the-map-widget/#:~:text=The%20,paradigm%20in%20action).  The `map`module provides an interactive map widget within Jupyter; this widget is powered by the JavaScript SDK[developers.arcgis.com](https://developers.arcgis.com/python/latest/guide/part1-introduction-to-using-the-map-widget/#:~:text=The%20,2D%20or%203D%20data%20content). | **Pros:**Great for automating data workflows, modelling and analysis; integrates with Pandas/SeDF.**Cons:**Designed for Jupyter notebooks rather than custom web apps; custom UI elements and real‑time editing are limited; embedding the map in standalone web applications still requires JavaScript. |

**Recommendation:** For a real‑time, interactive web application that allows engineers to draw routes and get immediate feedback, the **ArcGIS Maps SDK for JavaScript** is the most suitable choice.  It is purpose‑built for creating rich web mapping applications with editing and geometry analysis[developers.arcgis.com](https://developers.arcgis.com/arcgis-rest-js/faq/#:~:text=The%20ArcGIS%20Maps%20SDK%20for,web%20maps%20and%20web%20scenes) and avoids the need to manually handle REST requests[community.esri.com](https://community.esri.com/t5/arcgis-rest-apis-and-services-questions/arcgis-rest-api-vs-javascript-api/td-p/279056#:~:text=The%20JavaScript%20API%20builds%20on%2C,which%20use%20the%20REST%20API).  ArcGIS REST JS can still be useful on the server for lightweight operations (e.g., querying features), but the front‑end should leverage the JS API.  The Python API is better suited to scripting and offline analyses.

## 3 Product Requirements Document (PRD)

### 3.1 Problem statement

Cable engineers in the Netherlands must ensure that new high‑voltage cable routes near railway infrastructure comply with the ProRail EMC standards.  Today this process is often manual: engineers overlay cable plans on paper maps or static GIS layers, estimate distances and angles by eye or with separate tools, and prepare compliance reports.  This manual workflow is slow, error‑prone and not easily repeatable.

### 3.2 Goal and objectives

Develop a **web‑based tool** that allows engineers to draw or import multiple cable routing options and evaluate each route against ProRail’s eight‑point cable criteria.  The tool should:

* Provide an interactive map showing ProRail infrastructure (tracks, technical rooms) from publicly available ArcGIS layers.
* Allow users to sketch or upload polylines representing cable routes.
* Automatically compute crossing angles, distances and other parameters and check them against the ProRail requirements (see Section 1.1).
* Display real‑time pass/fail results for each criterion and highlight problem areas on the map.
* Generate a summary report for each route option and recommend the most compliant route.
* Enable users to save/load projects and export data for documentation.

### 3.3 Scope

* **In scope:** High‑voltage cables (> 1 kV) near the Dutch railway network; evaluation of routes with respect to the eight criteria in RLN00398.  Interaction with ArcGIS layers and base maps, drawing/editing polylines, basic user authentication using an API key, and export of results.
* **Out of scope:** Design or evaluation of overhead high‑voltage lines (treated separately in Section 5.1 of the guideline), electromagnetic modelling beyond simple distance/angle checks, and complex multi‑route optimisation algorithms.  The tool will not manage construction workflows or regulatory submissions.

### 3.4 Stakeholders and user personas

* **Cable engineer (primary user):** Works for a utility or contractor and is responsible for designing new cable routes.  Needs to evaluate routes quickly and ensure compliance before submitting to ProRail.
* **Project manager:** Oversees multiple projects; needs high‑level summaries and compliance status to coordinate with ProRail and other stakeholders.
* **ProRail reviewer (secondary user):** May use the tool or review exported reports to verify that proposed routes meet the EMC standard.

### 3.5 User stories

1. **As a cable engineer** , I want to load the ProRail infrastructure layer so that I can see tracks, stations and technical rooms on the map.
2. **As a cable engineer** , I want to draw multiple route options or import them as GeoJSON/GPX files so that I can compare different alignments.
3. **As a cable engineer** , I want the tool to calculate the crossing angle where a route intersects the tracks and indicate whether it falls between 80° and 100°.
4. **As a cable engineer** , I want the tool to measure the shortest distance from each route segment to the nearest track and technical room and compare it to the distance thresholds (700 m, 11 m or 20 m).
5. **As a cable engineer** , I want to enter cable properties (nominal voltage, phase, fault‑clearing time) and have the tool evaluate criteria such as fault clearing within 100 ms and whether the cable is three‑core or single‑phase.
6. **As a project manager** , I want to export a compliance report summarising each route’s compliance status and highlighting any violations.
7. **As a user** , I want to save my project and reload it later to continue editing or reviewing.

### 3.6 Functional requirements

1. **Interactive map and layers**
   * Display base maps (e.g., streets, satellite) using ArcGIS location services.
   * Load public ProRail GIS layers (tracks, stations, technical rooms) and render them on the map.
2. **Route creation and editing**
   * Provide drawing tools (polyline) with snapping and editing handles.
   * Allow importing routes in common geospatial formats (GeoJSON, Shapefile, GPX).
3. **Cable property input**
   * For each route option, allow the user to specify nominal voltage (kV), cable type (three‑core, single‑phase, etc.), whether it crosses the track and the expected fault‑clearing time (ms).
4. **Automated compliance checks**
   * Compute the angle at each track crossing and compare it to 80° – 100°.
   * Calculate minimum distances from the route to the outermost track, to technical rooms and to any joints/ground points based on imported data.  Compare against thresholds (700 m/11 m, 11 m, 20 m and 31 m).
   * Check whether the cable passes under the track and flag if it is not in an insulated pipe.
   * Evaluate whether the cable’s fault‑clearing time ≤ 100 ms.
   * Determine compliance based on the cable type and nominal voltage (rules 3–5).
5. **Visual feedback**
   * Use symbology and pop‑ups to indicate compliant vs. non‑compliant segments.
   * Provide a dashboard summarising pass/fail status for each of the eight criteria per route.
6. **Reporting and export**
   * Generate a PDF or JSON report with route geometry, cable properties, measured values and compliance status.
   * Allow exporting route geometries and results for further analysis.
7. **Persistence**
   * Save projects (routes, parameters and results) to local storage or a backend database and enable reloading.
8. **Authentication**
   * Use the developer’s ArcGIS API key for access to base maps and services; handle token expiry.

### 3.7 Non‑functional requirements

* **Performance:** Real‑time updates when users edit routes; distance and angle calculations should complete within a second for typical route lengths (~10 km).
* **Usability:** The interface should be intuitive, with clear drawing tools and visual indicators of compliance.  Support both desktop and tablet browsers.
* **Reliability:** Calculations must be accurate; use ArcGIS geometry engine for robust measurement.
* **Security:** Protect the API key, use HTTPS and handle user data securely.
* **Extensibility:** The architecture should allow adding new criteria or data layers (e.g., different voltage ranges) without major refactoring.

### 3.8 System architecture and technology

* **Client:** Built as a single‑page application using the  **ArcGIS Maps SDK for JavaScript** .  Use its map/scene components, sketch/geometry widgets and geometry engine for measurements.  Use the Calcite design system for UI components.
* **Server (optional):** A lightweight Node.js (or Python/Flask) backend can store projects and perform long‑running analyses.  ArcGIS REST JS can be used server‑side for queries and authentication.
* **Data sources:** ProRail infrastructure layers served via ArcGIS Online/ArcGIS Server; user‑uploaded route files; additional shapefiles for technical rooms and joints.  All spatial data should be stored in a common projection (e.g., RD_New or WGS84).
* **Authentication:** Use the developer’s API key (the user already has one) for read‑only services.  For editing feature services (if needed), OAuth could be integrated.

### 3.9 Assumptions and constraints

* Public ProRail GIS layers are accessible via ArcGIS services and can be consumed in the app.
* Users have moderate familiarity with GIS tools; a brief tutorial will be provided.
* The tool assumes that cable fault‑clearing times and insulation details are provided by the engineer; it does not compute them.
* The application will be deployed in modern browsers that support ES6.

### 3.10 Success metrics

* **Accuracy:** Percentage of routes correctly flagged for compliance when compared to manual calculations.
* **Efficiency:** Reduction in average time needed to evaluate a route compared with the previous manual process (target ≥ 50 % improvement).
* **User adoption:** Number of projects created and reports generated within the first six months.
* **User satisfaction:** Qualitative feedback from engineers (e.g., via surveys) regarding ease of use and confidence in results.

## 4 JSON data structure

The following JSON schema illustrates how the tool might store project data, route options, cable properties and evaluation results.  It is designed to be flexible and self‑describing so that additional criteria can be added later.

<pre class="overflow-visible!" data-start="13701" data-end="15956"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-json"><span><span>{</span><span>
  </span><span>"projectId"</span><span>:</span><span></span><span>"string"</span><span>,</span><span>
  </span><span>"name"</span><span>:</span><span></span><span>"string"</span><span>,</span><span>
  </span><span>"description"</span><span>:</span><span></span><span>"string"</span><span>,</span><span>
  </span><span>"engineer"</span><span>:</span><span></span><span>"string"</span><span>,</span><span>
  </span><span>"created"</span><span>:</span><span></span><span>"ISO8601 date"</span><span>,</span><span>
  </span><span>"routeOptions"</span><span>:</span><span></span><span>[</span><span>
    </span><span>{</span><span>
      </span><span>"optionId"</span><span>:</span><span></span><span>"string"</span><span>,</span><span>
      </span><span>"name"</span><span>:</span><span></span><span>"string"</span><span>,</span><span>
      </span><span>"geometry"</span><span>:</span><span></span><span>{</span><span>
        </span><span>"type"</span><span>:</span><span></span><span>"LineString"</span><span>,</span><span>
        </span><span>"coordinates"</span><span>:</span><span></span><span>[</span><span></span><span>[</span><span>lon</span><span>,</span><span> lat</span><span>]</span><span>,</span><span> … </span><span>]</span><span>,</span><span>
        </span><span>"spatialReference"</span><span>:</span><span></span><span>"EPSG:4326"</span><span>
      </span><span>}</span><span>,</span><span>
      </span><span>"cableProperties"</span><span>:</span><span></span><span>{</span><span>
        </span><span>"nominalVoltageKV"</span><span>:</span><span></span><span>110</span><span>,</span><span>
        </span><span>"phase"</span><span>:</span><span></span><span>"three-core"</span><span>,</span><span></span><span>// three-core | single-phase | other</span><span>
        </span><span>"isCrossing"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
        </span><span>"crossingAngleDeg"</span><span>:</span><span></span><span>90.0</span><span>,</span><span>
        </span><span>"faultClearingTimeMs"</span><span>:</span><span></span><span>80</span><span>
      </span><span>}</span><span>,</span><span>
      </span><span>"evaluation"</span><span>:</span><span></span><span>{</span><span>
        </span><span>"angleRequirement"</span><span>:</span><span></span><span>{</span><span>
          </span><span>"passes"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
          </span><span>"actualAngle"</span><span>:</span><span></span><span>90.0</span><span>,</span><span>
          </span><span>"requiredRange"</span><span>:</span><span></span><span>[</span><span>80</span><span>,</span><span></span><span>100</span><span>]</span><span>,</span><span>
          </span><span>"message"</span><span>:</span><span></span><span>"Angle within permitted range"</span><span>
        </span><span>}</span><span>,</span><span>
        </span><span>"faultClearRequirement"</span><span>:</span><span></span><span>{</span><span>
          </span><span>"passes"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
          </span><span>"actualTimeMs"</span><span>:</span><span></span><span>80</span><span>,</span><span>
          </span><span>"maxAllowedMs"</span><span>:</span><span></span><span>100</span><span>,</span><span>
          </span><span>"message"</span><span>:</span><span></span><span>"Clearing time below 100 ms"</span><span>
        </span><span>}</span><span>,</span><span>
        </span><span>"distanceToTrack"</span><span>:</span><span></span><span>{</span><span>
          </span><span>"passes"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
          </span><span>"minDistanceM"</span><span>:</span><span></span><span>800</span><span>,</span><span>
          </span><span>"requiredDistanceM"</span><span>:</span><span></span><span>700</span><span>,</span><span>
          </span><span>"message"</span><span>:</span><span></span><span>"Distance > 700 m for ≥35 kV cable"</span><span>
        </span><span>}</span><span>,</span><span>
        </span><span>"distanceThreeCore"</span><span>:</span><span></span><span>{</span><span>
          </span><span>"passes"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
          </span><span>"minDistanceM"</span><span>:</span><span></span><span>15</span><span>,</span><span>
          </span><span>"requiredDistanceM"</span><span>:</span><span></span><span>11</span><span>,</span><span>
          </span><span>"message"</span><span>:</span><span></span><span>"Three‑core cable <35 kV beyond 11 m"</span><span>
        </span><span>}</span><span>,</span><span>
        </span><span>"distanceSinglePhase"</span><span>:</span><span></span><span>{</span><span>
          </span><span>"passes"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
          </span><span>"minDistanceM"</span><span>:</span><span></span><span>12</span><span>,</span><span>
          </span><span>"requiredDistanceM"</span><span>:</span><span></span><span>11</span><span>,</span><span>
          </span><span>"message"</span><span>:</span><span></span><span>"Single‑phase cable <35 kV beyond 11 m"</span><span>
        </span><span>}</span><span>,</span><span>
        </span><span>"distanceToTechnicalRoom"</span><span>:</span><span></span><span>{</span><span>
          </span><span>"passes"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
          </span><span>"minDistanceM"</span><span>:</span><span></span><span>25</span><span>,</span><span>
          </span><span>"requiredDistanceM"</span><span>:</span><span></span><span>20</span><span>,</span><span>
          </span><span>"message"</span><span>:</span><span></span><span>"Distance to technical room > 20 m"</span><span>
        </span><span>}</span><span>,</span><span>
        </span><span>"insulatedPipe"</span><span>:</span><span></span><span>{</span><span>
          </span><span>"passes"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
          </span><span>"isInsulated"</span><span>:</span><span></span><span>true</span><span></span><span>,</span><span>
          </span><span>"message"</span><span>:</span><span></span><span>"Cable in insulated pipe under track"</span><span>
        </span><span>}</span><span>,</span><span>
        </span><span>"noJoints"</span><span>:</span><span></span><span>{</span><span>
          </span><span>"passes"</span><span>:</span><span></span><span>false</span><span></span><span>,</span><span>
          </span><span>"minDistanceToJointM"</span><span>:</span><span></span><span>20</span><span>,</span><span>
          </span><span>"requiredDistanceM"</span><span>:</span><span></span><span>31</span><span>,</span><span>
          </span><span>"message"</span><span>:</span><span></span><span>"Joint within 31 m of track"</span><span>
        </span><span>}</span><span>,</span><span>
        </span><span>"overallPass"</span><span>:</span><span></span><span>false</span><span>
      </span><span>}</span><span>,</span><span>
      </span><span>"notes"</span><span>:</span><span></span><span>"string"</span><span>
    </span><span>}</span><span>
  </span><span>]</span><span>,</span><span>
  </span><span>"projectSummary"</span><span>:</span><span></span><span>{</span><span>
    </span><span>"bestOptionId"</span><span>:</span><span></span><span>"string"</span><span>,</span><span>
    </span><span>"summary"</span><span>:</span><span></span><span>"string"</span><span>
  </span><span>}</span><span>
</span><span>}</span><span>
</span></span></code></div></div></pre>

* **projectId/name/description:** Identify the project and provide context.
* **routeOptions:** Array of route candidates.  Each has a geometry (GeoJSON‐like), cable properties and evaluation results.
* **evaluation:** Contains an object for each of the eight criteria.  Each includes a boolean `passes`, the measured value, the threshold(s) and a human‑readable message.  The `overallPass` flag summarises compliance.
* **projectSummary:** Identifies the most compliant option and provides an overall narrative.

This structure allows the front‑end to bind UI elements directly to evaluation fields and to update the map symbology based on `passes`.  It also makes exporting results straightforward.

## 5 Recommended SDK/API choice and rationale

The evaluation tool’s core requirements—drawing and editing polylines on a map, performing geometric calculations (angles, distances) client‑side, overlaying multiple GIS layers and providing immediate visual feedback—align closely with the capabilities of the  **ArcGIS Maps SDK for JavaScript** .  Esri’s documentation describes it as the “flagship product for building web applications to visualize, edit, map and analyse geospatial data”[developers.arcgis.com](https://developers.arcgis.com/arcgis-rest-js/faq/#:~:text=The%20ArcGIS%20Maps%20SDK%20for,web%20maps%20and%20web%20scenes) and highlights its client‑side functionality such as smart mapping, 2D/3D rendering and feature editing[developers.arcgis.com](https://developers.arcgis.com/arcgis-rest-js/faq/#:~:text=The%20ArcGIS%20Maps%20SDK%20for,web%20maps%20and%20web%20scenes).  By contrast, **ArcGIS REST JS** is a thin wrapper around the REST API[github.com](https://github.com/Esri/arcgis-rest-js#:~:text=,js%20and%20modern%20browsers) and lacks built‑in mapping or editing widgets; developers would need to implement their own geometry calculations and UI, increasing complexity.  The **ArcGIS API for Python** excels in data analysis and Jupyter notebooks[developers.arcgis.com](https://developers.arcgis.com/python/latest/guide/part1-introduction-to-using-the-map-widget/#:~:text=The%20,paradigm%20in%20action) but is not intended for standalone web applications; its interactive map widget actually uses the JavaScript SDK under the hood[developers.arcgis.com](https://developers.arcgis.com/python/latest/guide/part1-introduction-to-using-the-map-widget/#:~:text=The%20,2D%20or%203D%20data%20content).

Therefore, the **ArcGIS Maps SDK for JavaScript** should be used as the main front‑end framework.  ArcGIS REST JS can complement it on the server or where lightweight REST calls are needed, but the JS API will provide the necessary map rendering, editing tools and geometry engine for the cable‑route evaluation tool.

## 6 Conceptual architecture diagram

The diagram below illustrates the high‑level architecture of the proposed tool.  ProRail’s geospatial layers and the engineer’s cable route data feed into an **evaluation engine** that applies the eight criteria from RLN00398.  The results are presented in an **interactive map UI** powered by the ArcGIS Maps SDK for JavaScript.
