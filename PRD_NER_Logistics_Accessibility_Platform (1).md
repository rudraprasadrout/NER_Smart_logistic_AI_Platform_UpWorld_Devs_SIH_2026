# Product Requirements Document (PRD)
## AI-Powered Smart Logistics & Accessibility Intelligence Platform for North Eastern Region (NER)
### Project Codename: **PathNER** — Who's Cut Off, Why, and For How Long

| | |
|---|---|
| **Problem Statement ID** | 26028 |
| **Track** | Smart Automation / Logistics & Infrastructure |
| **Theme** | Infrastructure-led Development, NER Connectivity |
| **Document Version** | 2.0 |
| **Status** | Draft — Hackathon Submission |

---

## 1. Executive Summary

The North Eastern Region (NER) faces chronic logistics disruption due to terrain, weather, and infrastructure gaps — landslides, floods, and road damage routinely cut off remote districts, delaying essential supplies like medicine, food, and construction material. There is currently **no unified system** that tells anyone — government, logistics operators, or citizens — which roads are actually usable *right now*, which are likely to fail *soon*, and what to do instead.

We propose **PathNER**, an AI-powered logistics intelligence platform that models the region's transport network as a **live, risk-scored accessibility graph** — fusing satellite/weather data, historical disruption patterns, and real-time field reports — to predict route disruptions before they happen, recommend alternate routes, track essential-goods vehicles, and answer the question that actually matters in a crisis: **"which villages are cut off right now, and when will that change?"**

---

## 2. What Makes PathNER Different

Most solutions to this problem will look like: GPS tracking + a manual "report a blocked road" app + a static map showing open/closed roads. That solves visibility but not *impact* or *planning*. PathNER's differentiation:

| # | Differentiator | Status |
|---|---|---|
| 1 | **Isolation Index — people cut off, not just roads blocked** | **Core MVP** |
| 2 | **72-hour Accessibility Forecast, not just current status** | **Core MVP** |
| 3 | **Live accessibility graph with continuous risk scores (0–100)**, not binary open/closed | Core MVP (foundation) |
| 4 | **Explainable risk scores** — every score shows contributing factors | Core MVP |
| 5 | **Offline-first field reporting** for zero-connectivity zones | Core MVP |
| 6 | Multi-modal routing (foot trails/ropeways as fallback edges) | Roadmap / stretch |
| 7 | Trust-weighted crowd reports (reporter reliability scoring) | Roadmap / stretch |
| 8 | Cargo-priority routing (life-saving vs general goods) | Roadmap / stretch |
| 9 | Disaster-mode auto-switch UI | Roadmap / stretch |

The two headline differentiators (#1 and #2) directly answer the two questions a control room or disaster-response official actually asks — **"who's affected?"** and **"how much warning do we have?"** — which is a stronger pitch than showing a map with colored lines.

---

### 2.1 Isolation Index (Core MVP Differentiator)

Instead of only flagging *which roads* are risky, PathNER computes, for every settlement/town node in the graph, an **Isolation Index**: is it currently reachable from the nearest supply hub, and if not, since when and via what alternate (if any)?

- Computed via multi-hop reachability analysis on the accessibility graph: if an edge's risk score crosses the "effectively blocked" threshold, re-run reachability from designated supply hubs (district HQs, warehouses) to every settlement node.
- Output per settlement: `reachable / at-risk / isolated`, plus `isolated_since` timestamp and `estimated_population_affected` (from static population data joined to settlement nodes).
- This reframes the whole platform from "road monitoring tool" to **"who's stranded right now"** — a human, policy-relevant framing that's a natural extension of the graph you're already building, not a separate system.

### 2.2 Accessibility Forecast (Core MVP Differentiator)

Instead of only showing current risk, PathNER projects risk **24 / 48 / 72 hours ahead**, using rainfall forecast data layered onto the same risk model used for current scoring.

- Reuses the risk-scoring model (Section 11) but feeds it forecasted weather instead of observed weather, producing a risk score trajectory per edge.
- Surfaced as: *"This corridor is at 40% risk now, projected to reach 75% (likely impassable) by Thursday evening."*
- Turns the platform from reactive monitoring into a **planning tool** — supplies can be pre-positioned before a road fails, not after.

---

## 3. Problem Statement

**Current State:** No integrated system exists. Route status is discovered informally (word of mouth, driver experience, delayed official reports). Disruptions are identified only *after* they block a route, not predicted in advance, and no one currently knows how many people are actually cut off at any given time.

**Gaps:**
- No real-time, district-wise visibility into which roads/bridges are actually accessible.
- No predictive capability — disruptions (landslides, floods) are reacted to, not anticipated.
- No structured way for field officials to report incidents from remote, low-connectivity areas.
- No tracking of essential-goods vehicles once they're en route.
- No centralized dashboard for emergency responders or logistics planners.
- No alternate-route intelligence — drivers/planners have to work it out manually.
- **No visibility into human impact** — nobody can currently answer "how many people are cut off right now, and for how long."

**Impact:** Delayed medicine and food supply to remote districts, higher transport costs from unplanned detours, slower emergency/disaster response, weaker public trust in service delivery, poor visibility for infrastructure planning decisions, and no early warning to pre-position supplies before a corridor fails.

---

## 4. Goals & Objectives

| Goal | Description |
|---|---|
| **G1** | Provide real-time, district-wise road/bridge accessibility status across NER |
| **G2** | Predict route disruptions before they fully occur, using weather + historical + field-report fusion |
| **G3** | Forecast accessibility risk 24/48/72 hours ahead to enable proactive planning |
| **G4** | Compute an Isolation Index showing which settlements are cut off, since when, and how many people are affected |
| **G5** | Recommend AI-optimized alternate routes with estimated delay when a corridor is disrupted |
| **G6** | Track GPS movement of vehicles carrying essential commodities |
| **G7** | Enable field officials to report incidents (geo-tagged, photo-backed) even without connectivity |
| **G8** | Deliver a centralized dashboard for control rooms, district authorities, and emergency responders |
| **G9** | Support multilingual notifications and function reliably on low-bandwidth/offline connections |

### Success Metrics (KPIs)
- **Prediction lead time** — average time between a "high risk" flag and an actual road closure (target: >12 hrs where weather-driven).
- **Forecast accuracy** — % of 48-hour risk projections that correctly anticipated an actual disruption.
- **Isolation Index accuracy** — % agreement between computed isolation status and simulated/ground-truth reachability.
- **Alternate-route accuracy** — % of AI-suggested reroutes that are actually viable on ground-truth check.
- **Field-report sync reliability** — % of offline-created reports successfully synced once connectivity returns.
- **Dashboard coverage** — % of NER districts with live accessibility status.
- **Alert delivery latency** — time from disruption detection to notification reaching relevant stakeholders (target: <5 min).

---

## 5. Target Users / Personas

| Persona | Need | PathNER Feature Used |
|---|---|---|
| **District Control Room / OCC Operator** | Network-wide accessibility visibility, proactive planning | Risk-graph dashboard, Isolation Index, forecast |
| **Disaster Management Authority** | Know who's cut off and pre-position relief before failure | Isolation Index, 72-hr forecast, emergency view |
| **Field Official (BRO, PWD, District Admin)** | Report incidents from remote, low-network locations | Offline-first geo-tagged reporting app |
| **Logistics/Transport Operator** | Route essential goods reliably, avoid blocked corridors | Alternate-route engine, vehicle tracking |
| **Driver (essential goods vehicle)** | Know which roads are safe, get reroute guidance | Mobile app with route risk + multilingual alerts |
| **Citizen (remote district resident)** | Know when supplies are delayed, why, and expected resolution | Public-facing status view (stretch goal) |

---

## 6. Scope

### In Scope (Hackathon MVP)
- **Accessibility graph construction:** model a demo sub-region of NER (e.g., a few districts of Assam/Meghalaya/Sikkim) as a road network graph — junctions/towns/settlements as nodes, road segments as edges, with supply hubs designated.
- **Risk scoring engine:** combine (a) historical disruption data, (b) weather/rainfall data, (c) simulated field reports into a per-edge risk score (0–100).
- **Accessibility Forecast (24/48/72 hr):** project risk scores forward using rainfall forecast data.
- **Isolation Index:** multi-hop reachability computation from supply hubs to every settlement node, flagged `reachable / at-risk / isolated` with duration and estimated population affected.
- **Predictive disruption alerts:** flags edges/settlements crossing risk thresholds, with explanation of contributing factors.
- **Alternate-route engine:** risk-weighted shortest-safe-path routing (Dijkstra/A*) that reroutes around high-risk edges.
- **GPS vehicle tracking (simulated):** simulate a small fleet of essential-goods vehicles moving along the graph, visualized live on the dashboard.
- **Field reporting app (offline-capable demo):** geo-tagged incident report form with photo upload, local-storage queue + sync-on-reconnect logic.
- **Centralized dashboard:** district-wise connectivity view, Isolation Index view, forecast timeline, bottleneck view, live vehicle tracking, emergency-route view.
- **Multilingual notification stub:** at least 2 languages for alert templates, demonstrating the i18n architecture.
- REST APIs for all of the above (see Section 12).

### Out of Scope (Future Phase)
- Real integration with BRO/PWD/state government road-condition databases.
- Real satellite feed subscriptions (ISRO Bhuvan/Sentinel) for live landslide detection — simulated/sample imagery used for demo.
- Full NER-wide coverage (all 8 states) — MVP scoped to a representative sub-region.
- Multi-modal routing (foot trails, ropeways, river routes) — roadmap item.
- Trust-weighted reporter reliability scoring — roadmap item.
- Cargo-priority routing — roadmap item.
- Disaster-mode auto-switch UI — roadmap item.
- SMS gateway integration for zero-smartphone users.

---

## 7. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR1 | System shall model the regional road network as a graph (nodes = junctions/towns/settlements, edges = road segments) with designated supply hubs | Must |
| FR2 | System shall maintain a live risk score (0–100) per edge, combining weather, historical, and field-report data | Must |
| FR3 | System shall project risk scores 24/48/72 hours ahead using forecasted weather data | Must |
| FR4 | System shall compute an Isolation Index per settlement node — reachable/at-risk/isolated status, isolation duration, and estimated population affected | Must |
| FR5 | System shall flag edges crossing a risk threshold as "high risk" with a plain-language explanation of contributing factors | Must |
| FR6 | System shall compute AI-optimized alternate routes when a preferred route is high-risk or blocked | Must |
| FR7 | System shall track and display live/simulated GPS position of essential-goods vehicles | Must |
| FR8 | System shall allow field officials to submit geo-tagged incident reports (text + photo) | Must |
| FR9 | System shall queue reports locally when offline and sync automatically once connectivity is restored | Must |
| FR10 | System shall generate automated alerts for blocked roads, high-risk corridors, newly isolated settlements, and delayed deliveries | Must |
| FR11 | System shall provide a centralized dashboard showing district-wise connectivity, Isolation Index, forecast timeline, and live delivery status | Must |
| FR12 | System shall support alert notifications in at least two languages | Should |
| FR13 | System shall expose all accessibility, forecast, isolation, routing, and tracking data via REST API | Must |
| FR14 | System shall provide a dedicated emergency/disaster-time accessibility view highlighting currently viable routes and isolated settlements | Should |
| FR15 | System shall log prediction vs actual disruption outcomes for model evaluation | Should |
| FR16 | System shall degrade gracefully — show last-known status with a "stale data" flag when live feeds are unavailable | Must |

---

## 8. Non-Functional Requirements

- **Scalability:** Architecture should scale from a demo sub-region to full NER coverage (multiple states, thousands of road segments, thousands of settlement nodes) without redesign — partition by district/state as a scaling strategy.
- **Reliability:** Graceful degradation (FR16) is a first-class requirement — a system that fails silently in a disaster context is worse than one that clearly shows stale data.
- **Low-bandwidth resilience:** Mobile/field app must function on 2G/intermittent connectivity; API payloads should be lightweight (compressed JSON, pagination).
- **Offline-first field reporting:** Local queuing and conflict-free sync is a core design constraint, not an add-on.
- **Explainability:** Every risk score, forecast, and isolation status must show its contributing factors.
- **Security:** Field reports and vehicle tracking data require authenticated access; role-based access control for control-room vs field vs public views.
- **Latency:** Dashboard should reflect new risk data within a few minutes of ingestion; alternate-route and isolation-index recomputation should return in under 2 seconds for the demo graph size.

---

## 9. Proposed System Architecture

```
 Weather/Rainfall     Historical Disruption      Field Reports (offline-first
  Data + Forecast       Records                    mobile/web app, local queue)
      │                      │                              │
      ▼                      ▼                              ▼
┌───────────────────────────────────────────────────────────────────┐
│               Data Ingestion & Sync Layer (REST + Queue)           │
└───────────────────────────────┬───────────────────────────────────┘
                                 ▼
                  ┌───────────────────────────────┐
                  │  Accessibility Graph Engine     │
                  │  (nodes = junctions/settlements,│
                  │   edges = road segments,        │
                  │   supply hubs designated,       │
                  │   live per-edge risk score)      │
                  └───────────────┬─────────────────┘
                                 ▼
      ┌──────────────┬───────────┼───────────┬──────────────┐
      ▼              ▼           ▼           ▼              ▼
┌───────────┐ ┌─────────────┐ ┌─────────┐ ┌───────────┐ ┌───────────┐
│ Risk        │ │ Forecast     │ │ Isolation│ │ Alternate- │ │ Vehicle    │
│ Prediction &│ │ Engine       │ │ Index    │ │ Route      │ │ Tracking   │
│ Explainab.  │ │ (24/48/72h)  │ │ Engine   │ │ Engine     │ │ (GPS)      │
└──────┬──────┘ └──────┬──────┘ └────┬─────┘ └─────┬──────┘ └─────┬─────┘
       └────────────────┴─────────────┴─────────────┴──────────────┘
                                 ▼
                  ┌───────────────────────────────┐
                  │  Alert & Notification Engine    │
                  │  (multilingual, role-based)     │
                  └───────────────┬─────────────────┘
                                 ▼
                  ┌───────────────────────────────┐
                  │        API Layer (REST)         │
                  └──┬──────────────┬───────────────┘
                     ▼              ▼
            ┌────────────────┐  ┌──────────────────────────┐
            │ Control Room /   │  │ Field Officer Mobile/Web  │
            │ District Dashboard│  │ App (offline-capable)     │
            │ (incl. Isolation  │  │                            │
            │  Index + Forecast)│  │                            │
            └────────────────┘  └──────────────────────────┘
```

---

## 10. Data Sources

| Data | Source (Hackathon) | Source (Production) |
|---|---|---|
| Road network / topology | OpenStreetMap (OSM) extract for NER districts | State PWD / NHIDCL road databases |
| Settlement/population data | Census of India district/village population data (open, censusindia.gov.in) | Same, refreshed periodically |
| Weather & rainfall (observed) | Open-Meteo (free, no key) or IMD data | IMD real-time feed, ISRO satellite rainfall estimates |
| Weather forecast (for the 24/48/72h projection) | Open-Meteo forecast API (free, no key) | IMD forecast feed |
| Historical disruption/landslide zones | Published landslide susceptibility zonation maps (GSI Geological Survey of India), NDMA reports | GSI/NDMA official disruption databases |
| Satellite imagery (landslide/flood indicators) | Sample Sentinel-1/2 imagery via Copernicus Open Access Hub (free) | ISRO Bhuvan / NRSC live feeds |
| Field incident reports | Simulated + a live demo form | Real field officer submissions via mobile app |
| Vehicle GPS | Simulated fleet movement along the graph | Fleet GPS/telematics integration |

---

## 11. AI / ML Approach

1. **Baseline:** Rule-based risk flag (e.g., rainfall > threshold OR historical closure frequency > threshold ⇒ "at risk").
2. **Risk Scoring Model:** Gradient boosting (XGBoost/LightGBM) regression per road segment, trained on: rainfall intensity/duration, soil-saturation proxy, historical closure frequency, season, terrain slope (from OSM/DEM elevation data), field-report severity.
3. **Forecast Extension:** Same model, fed forecasted rainfall (instead of observed) for +24h/+48h/+72h horizons, producing a risk trajectory per edge rather than a single point value.
4. **Isolation Index Computation:** Graph reachability algorithm (BFS/Dijkstra from supply-hub nodes) re-run whenever an edge crosses the "effectively blocked" risk threshold; settlement nodes unreachable from any hub are flagged isolated, with duration tracked from first isolation timestamp and population pulled from the settlement data join.
5. **Explainability:** SHAP values surfaced as plain-language contributing factors per risk score and per forecast.
6. **Routing:** Dijkstra/A* pathfinding over the graph, using **risk score as edge weight** (not just distance) — so "safest reasonable route" is computed, not just shortest.
7. **Continuous Learning:** Log predicted risk/forecast vs actual outcome (road closed/not closed) to refine thresholds and model weights over time.
8. **Stretch Goal:** Basic image-based landslide/flood indicator detection on sample satellite tiles (segmentation model) to demonstrate the imagery-fusion pathway.

---

## 12. API Specification (MVP)

**GET `/api/v1/graph/accessibility`**
Returns the full road-network graph with current risk scores per edge.

**GET `/api/v1/graph/forecast?horizon=48h`**
Returns projected risk scores per edge for the requested horizon (24h/48h/72h).

**GET `/api/v1/isolation-index`**
Returns per-settlement isolation status (`reachable/at-risk/isolated`), isolation duration, and estimated population affected.

**GET `/api/v1/route/{from}/{to}`**
Returns the AI-recommended (risk-weighted) route between two points, with estimated delay vs the default route.

**POST `/api/v1/reports/incident`**
Accepts a geo-tagged field report (text, photo reference, severity); supports offline queue replay with a client-generated report ID for idempotent sync.

**GET `/api/v1/vehicles/{vehicle_id}/location`**
Returns live/last-known GPS position and route status of a tracked vehicle.

**GET `/api/v1/district/{district_code}/status`**
Returns district-wise connectivity summary (accessible/at-risk/blocked segment counts, isolated settlement count).

**GET `/api/v1/alerts`**
Returns active alerts (blocked roads, high-risk corridors, newly isolated settlements, delayed deliveries), filterable by district and severity.

**POST `/api/v1/alerts/subscribe`**
Registers a stakeholder (control room, field officer, driver) for notifications, with language preference.

---

## 13. Tech Stack (Suggested)

| Layer | Technology |
|---|---|
| Road network / graph | OSM data + NetworkX / Neo4j (graph engine) |
| Backend/API | Python (FastAPI) or Node.js (Express) |
| ML | scikit-learn / XGBoost, SHAP for explainability |
| Geospatial | GeoPandas, PostGIS, Leaflet/Mapbox for visualization |
| Storage | PostgreSQL + PostGIS (spatial data), Redis (live risk cache) |
| Offline sync | IndexedDB/local storage (web) or SQLite (mobile) with a sync queue |
| Dashboard | React + Leaflet/Mapbox for map visualization, timeline component for forecast |
| Notifications | Firebase Cloud Messaging / simple webhook stub for multilingual alerts |
| Deployment | Docker Compose (hackathon demo), Kubernetes (production vision) |

---

## 14. Hackathon Deliverables & Milestones

| Phase | Deliverable |
|---|---|
| Day 1 (AM) | Road network graph built from OSM for demo sub-region; settlement/population data joined; supply hubs designated |
| Day 1 (PM) | Baseline rule-based risk flagging + risk-weighted routing engine (v1) |
| Day 2 (AM) | ML risk scoring model trained; forecast extension (24/48/72h) added |
| Day 2 (PM) | Isolation Index engine (reachability computation) + explainability layer integrated |
| Day 3 (AM) | Field reporting app (offline queue + sync) + simulated vehicle GPS tracking + alert engine |
| Day 3 (PM) | Dashboard polish (Isolation Index view + forecast timeline), end-to-end demo run-through, pitch deck |

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| No access to real road-condition/closure data for NER | Use OSM + published landslide susceptibility maps + GSI/NDMA reports as historical proxies; simulate closures for demo realism |
| Full NER coverage unrealistic in hackathon timeframe | Scope demo graph to one representative sub-region (2–3 districts) and explicitly present the scaling strategy for full coverage |
| Isolation Index requires accurate population/settlement data | Use Census of India open data; if granularity is too coarse for the demo sub-region, approximate at village-cluster level and state the assumption clearly in the demo |
| Forecast accuracy hard to validate without ground-truth outcomes | Present forecast as a v1 capability with a clear evaluation methodology (log predicted vs actual over time), not a claimed-accurate finished product |
| Offline-sync complexity under time pressure | Keep offline demo to a clear, simple local-queue + sync flow rather than building full conflict-resolution logic |
| Multilingual support seen as superficial if only UI strings translated | Focus effort on making the *notification templates* genuinely multilingual and demo at least one full alert flow in a regional language |

---

## 16. Future Roadmap (Post-Hackathon)

- Integrate real BRO/PWD/NHIDCL road-condition databases and live GSI/NDMA disruption feeds.
- Full ISRO Bhuvan/Sentinel satellite feed integration for automated landslide/flood detection.
- **Multi-modal routing** — incorporate foot trails, ropeways, and river routes as fallback edges when roads fail.
- **Trust-weighted crowd reports** — reliability scoring per field reporter based on historical report accuracy.
- **Cargo-priority routing** — route life-saving shipments via safest path even if slower; lower-priority cargo via fastest path.
- **Disaster-mode auto-switch UI** — automatically simplify dashboard to safest routes + isolated settlements when multiple high-risk flags trigger simultaneously.
- SMS/IVR gateway for zero-smartphone-access citizens and field officials.
- Expand risk model with a graph neural network to capture how one segment's closure affects reachability of dependent downstream areas at scale.
- Full NER-wide coverage across all 8 states with state-wise partitioning for performance.
- Public-facing citizen status portal for transparency on essential supply delivery timelines.

---

## 17. Team Roles (Suggested for Hackathon)

| Role | Responsibility |
|---|---|
| ML/Data Engineer | Risk scoring model, forecast extension, explainability layer, historical data pipeline |
| Backend Developer | Graph engine, Isolation Index computation, routing algorithm, API, offline-sync logic |
| Frontend Developer | Dashboard, map visualization, forecast timeline UI, field-reporting app UI |
| GIS/Geospatial Specialist | Road network graph construction, settlement/population data join, OSM/DEM data processing |
| Presenter/PM | Pitch narrative (lead with "who's cut off, and for how long"), demo flow, PRD/documentation |
