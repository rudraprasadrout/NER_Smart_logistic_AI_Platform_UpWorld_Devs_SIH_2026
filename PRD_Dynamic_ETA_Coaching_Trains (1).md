# Product Requirements Document (PRD)
## Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains
### Project Codename: **RailPulse** — Network-Aware, Explainable ETA & Decision Support

| | |
|---|---|
| **Problem Statement ID** | 26028 |
| **Track** | Smart Automation / Transportation & Logistics |
| **Organization** | Ministry of Railways (Indian Railways) |
| **Document Version** | 2.0 |
| **Status** | Draft — Hackathon Submission |

---

## 1. Executive Summary

Indian Railways currently estimates coaching train ETAs using static timetables, current delays, and fixed recovery margins — treating each train as an isolated entity. This ignores the reality that delays are a **network phenomenon**: one train's lateness blocks sections, platforms, and crossings for others.

**RailPulse** reframes the problem: instead of predicting ETA per train in isolation, it models the **entire rail network as a live graph** — using a Graph Neural Network (GNN) to capture how congestion and delay propagate between trains sharing track. On top of that, it delivers not just a number but an **explainable, confidence-ranged ETA**, plus a **what-if simulator** for control-room decision-making and an **automated feeder-transport trigger** for passengers — turning a prediction tool into an end-to-end operational and passenger-experience system.

---

## 2. What Makes RailPulse Different

Most solutions to this problem statement will look like: *ingest data → regression model → dashboard showing a number*. That's necessary but not sufficient. RailPulse's differentiation:

| # | Differentiator | Why it matters |
|---|---|---|
| 1 | **Network-graph modeling (GNN), not per-train regression** | Captures cascading delays — Train A is late *because* Train B is blocking the section ahead. This is the core technical novelty. |
| 2 | **Explainable ETA** | Shows contributing factors ("congestion near X: 68%, speed restriction at KM 412: 22%") instead of a black-box number — builds operator and passenger trust. |
| 3 | **Confidence-ranged prediction** | ETA shown as a shrinking window (e.g., 14:20–14:45 narrowing as the train approaches) via quantile regression / conformal prediction — more honest and realistic than a false-precision point estimate. |
| 4 | **"What-if" cascading impact simulator** | Control room can ask "If Train 12301 is held 10 more minutes at X, who else is affected and by how much?" — shifts the product from passenger-facing to decision-support. |
| 5 | **Feeder/last-mile auto-trigger** | When ETA is confirmed within a tight window, auto-notify pre-configured feeder transport or family — makes the demo feel end-to-end and real-world usable. |
| 6 | **Graceful degradation by design** | If live data is missing/noisy, system falls back to statistical/schedule-based ETA with a visible "low confidence" flag rather than failing silently — a robustness story judges can probe and we can answer. |

---

## 3. Problem Statement

**Current State:** ETA = Scheduled Time + Current Delay ± Built-in Recovery Time (static, rule-based, per-train, no network awareness).

**Gaps:**
- Ignores real-time signal/congestion conditions on the section ahead.
- Ignores historical running-time patterns specific to route, season, weather, time of day.
- No cascading-delay awareness (e.g., a delayed preceding train blocking the path).
- No confidence/uncertainty indication for passengers or staff.
- No explainability — operators can't see *why* a delay is predicted.
- Not scalable/adaptive across thousands of trains and diverse operational zones.

**Impact:** Poor passenger trust, inefficient station resource planning, missed connections, cascading downstream delays, reactive (not proactive) control-room decisions.

---

## 4. Goals & Objectives

| Goal | Description |
|---|---|
| **G1** | Predict ETA at every upcoming station for a running train, updated dynamically as new data arrives |
| **G2** | Model cross-train, network-level delay propagation, not just isolated per-train regression |
| **G3** | Improve prediction accuracy over static-schedule baselines using ML/graph models |
| **G4** | Provide explainable, confidence-ranged predictions rather than opaque point estimates |
| **G5** | Give control room a "what-if" simulation tool for proactive decision-making |
| **G6** | Scale to thousands of concurrent trains across multiple zones |
| **G7** | Expose predictions via APIs for apps, displays, and dashboards |

### Success Metrics (KPIs)
- **Mean Absolute Error (MAE)** of predicted vs actual arrival time at each station (target: outperform static baseline by ≥30%, GNN model to outperform plain regression baseline by a measurable margin).
- **Cascading-delay detection accuracy** — % of downstream-affected trains correctly flagged when an upstream train is delayed.
- **Calibration of confidence intervals** — % of actual arrivals falling within predicted confidence band (target ≥90% for the stated interval).
- **Prediction latency** — time to refresh ETA after a new data event (target: < 30 sec).
- **API uptime** and **response time** (target: p95 < 300ms).
- **What-if simulator response time** (target: < 2 sec for a network query).

---

## 5. Target Users / Personas

| Persona | Need | RailPulse Feature Used |
|---|---|---|
| **Passenger** | Reliable real-time ETA + honest uncertainty; auto-arranged last-mile transport | Confidence-ranged ETA, feeder auto-trigger |
| **Station Staff** | Accurate arrival windows for platform allocation, cleaning, catering | ETA API + explainability |
| **Control Room / OCC Operator** | Network-wide visibility, proactive rescheduling | What-if simulator, cascading delay graph view |
| **Crew Scheduling System** | ETA feed to plan crew changeover timing | ETA API |
| **Logistics/Feeder Transport Services** | ETA to coordinate last-mile connectivity | Feeder auto-trigger API |

---

## 6. Scope

### In Scope (Hackathon MVP)
- Ingest simulated/sample real-time GPS + delay data feed (using open Indian Railways datasets / synthetic data generator that models trains sharing sections/platforms).
- **Graph construction**: stations/junctions as nodes, sections as edges, trains as dynamic entities moving along edges, with edge-level congestion state.
- **GNN-based prediction model** for sectional running time + delay propagation across neighboring trains, benchmarked against a static-schedule baseline and a plain (non-graph) regression baseline.
- **Confidence-ranged ETA** using quantile regression/conformal prediction on top of the point forecast.
- **Explainability layer** — feature/contribution breakdown per prediction (e.g., SHAP values or graph-attention weights surfaced as human-readable factors).
- **What-if simulator** — operator inputs a hypothetical delay/hold at a station; system re-runs the graph propagation and shows impacted trains + magnitude.
- **Feeder auto-trigger (demo-scope)** — mock notification/webhook fired when ETA confidence window narrows below a threshold.
- **Graceful degradation logic** — explicit fallback to static ETA + "low confidence" flag when live data is stale/missing.
- REST API layer (see Section 12).
- Demo dashboard (web) showing live train positions, predicted ETA per station with confidence band, explainability panel, and what-if control panel.

### Out of Scope (Future Phase)
- Direct integration with actual Indian Railways signaling/GPS systems (RTIS/COIS).
- Full-scale production deployment across all zones.
- Native mobile apps (web dashboard suffices for demo).
- Real feeder-transport partner integrations (mocked for MVP).
- Real-time weather API (can be mocked/stubbed for MVP).

---

## 7. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR1 | System shall ingest live/simulated location & delay events per train | Must |
| FR2 | System shall maintain historical running-time data per section (station-pair) | Must |
| FR3 | System shall represent the network as a graph (stations/junctions as nodes, sections as edges) with live occupancy state | Must |
| FR4 | System shall compute predicted ETA for all upcoming stations on a train's route, accounting for neighboring-train delay propagation | Must |
| FR5 | System shall recompute ETA within 30s of new event ingestion | Must |
| FR6 | System shall provide a confidence interval / uncertainty band with each ETA, narrowing as the train approaches the station | Must |
| FR7 | System shall provide a human-readable explanation of top contributing factors for each ETA | Must |
| FR8 | System shall support a "what-if" query: given a hypothetical delay at a node, return predicted impact on other trains in the graph | Must |
| FR9 | System shall expose ETA, explanation, and what-if data via REST API (JSON) | Must |
| FR10 | System shall visualize live train movement, ETA, and cascading impact on a dashboard map/graph view | Should |
| FR11 | System shall fall back to static-schedule ETA with a "low confidence" flag when live data is missing/stale | Must |
| FR12 | System shall log prediction vs actual outcomes for continuous model evaluation | Should |
| FR13 | System shall trigger a mock feeder-transport/notification webhook when ETA confidence narrows below a set threshold | Could |
| FR14 | System shall support multiple trains concurrently (scalability demo) | Must |

---

## 8. Non-Functional Requirements

- **Scalability:** Architecture should demonstrate horizontal scalability (stateless API + queue-based ingestion + graph updates) even if hackathon demo runs at small scale.
- **Reliability:** Graceful degradation to static-schedule-based ETA if ML/graph pipeline fails or data is stale (FR11 is a first-class design requirement, not an afterthought).
- **Latency:** Sub-second API response for cached predictions; < 2s for what-if graph re-simulation.
- **Extensibility:** Pluggable model architecture — able to swap/retrain per route/zone.
- **Explainability:** Every prediction must ship with a machine-generated, human-readable explanation (non-negotiable design principle, not a stretch feature).
- **Security:** API authentication (API key/OAuth) for control-room/partner integrations.

---

## 9. Proposed System Architecture

```
                     ┌─────────────────────────┐
Live/Simulated  ──▶  │  Data Ingestion Layer    │
GPS, Signal,         │  (Kafka / REST webhook)  │
Delay Events         └───────────┬─────────────┘
                                  │
                     ┌───────────▼─────────────┐
                     │  Stream Processing /     │
                     │  Feature Engineering &   │
                     │  Live Graph State Update │
                     │  (nodes=stations,        │
                     │   edges=sections,        │
                     │   trains=moving entities)│
                     └───────────┬─────────────┘
                                  │
                     ┌───────────▼─────────────┐
                     │  GNN Prediction Engine    │
                     │  + Quantile/Conformal     │
                     │    Uncertainty Layer      │
                     │  + Explainability Module  │
                     │    (attention/SHAP)       │
                     └───────────┬─────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
     ┌──────────▼──────┐  ┌───────▼────────┐  ┌─────▼───────────┐
     │  ETA Store        │  │ What-If        │  │ Fallback/       │
     │  (per train/       │  │ Simulation      │  │ Degradation     │
     │  station) — Redis  │  │ Engine          │  │ Logic           │
     └──────────┬──────┘  └───────┬────────┘  └─────┬───────────┘
                │                 │                 │
                └─────────────────┼─────────────────┘
                                  │
                     ┌───────────▼─────────────┐
                     │  API Layer (REST/GraphQL) │
                     └──┬─────────┬────────────┘
                        │         │
                 ┌──────▼──┐  ┌───▼──────────────┐
                 │ Web      │  │ Station / Control │
                 │ Dashboard│  │ Room Dashboards + │
                 │ (map +   │  │ Feeder Webhook     │
                 │ graph +  │  │ Trigger            │
                 │ what-if) │  │                    │
                 └──────────┘  └───────────────────┘
```

---

## 10. Data Sources

| Data | Source (Hackathon) | Source (Production) |
|---|---|---|
| Train schedules & routes | Open datasets (data.gov.in, Indian Railways time tables) | NTES / CRIS databases |
| Live GPS/location | Synthetic simulator (models multiple trains sharing sections) | RTIS (Real-Time Train Information System) |
| Historical delay data | Public NTES scrape / Kaggle Indian Railways datasets | CRIS historical logs |
| Network topology (stations, sections, junctions) | Constructed from open route data | Railway network topology DB |
| Weather | Mock/stub or OpenWeatherMap API | IMD data feed |
| Congestion/signal data | Simulated (derived from synthetic multi-train movement) | Signal & interlocking systems |

---

## 11. Machine Learning / Modeling Approach

1. **Baseline A (Rule-based):** Static schedule + current delay + recovery time (existing method).
2. **Baseline B (ML, non-graph):** Gradient Boosting (XGBoost/LightGBM) per-section regression using tabular features — used to show the *incremental* value of the graph approach.
3. **Core Model — Graph Neural Network (GNN):**
   - **Nodes:** stations/junctions. **Edges:** track sections, weighted by scheduled running time, live occupancy, and congestion. **Node/edge features:** current delay, historical average delay, weather, time of day, halts.
   - Model type: Graph Attention Network (GAT) or Temporal GNN (e.g., GraphSAGE + temporal encoding) to propagate delay information from upstream trains/sections to downstream predictions.
   - Output: per-section running-time distribution for each train's upcoming path.
4. **Uncertainty Layer:** Quantile regression or conformal prediction wrapped around the GNN output to produce calibrated confidence intervals that narrow as more real-time data arrives.
5. **Explainability Layer:** Surface GNN attention weights / SHAP-style feature contributions as plain-language factors ("congestion near X: 68%, speed restriction: 22%").
6. **What-If Engine:** Re-run graph propagation with a hypothetical perturbation (e.g., +10 min hold at node X) to estimate impact on neighboring trains — this reuses the trained GNN as a simulator, not a separate model.
7. **Continuous Learning:** Log actual vs predicted at each station; periodically retrain/fine-tune; track calibration drift.
8. **Evaluation:** MAE/RMSE per section and per train-class, compared across Baseline A → Baseline B → GNN, plus calibration accuracy of confidence intervals and cascading-impact precision/recall.

---

## 12. API Specification (MVP)

**GET `/api/v1/train/{train_no}/eta`**
Returns predicted ETA (with confidence band) for all upcoming stations of a given train.

**GET `/api/v1/train/{train_no}/eta/explain`**
Returns the top contributing factors behind the current ETA prediction.

**GET `/api/v1/station/{station_code}/arrivals`**
Returns live predicted arrivals of all trains due at a station.

**POST `/api/v1/whatif`**
Body: `{ "node": "STATION_CODE", "hypothetical_delay_min": 10 }`
Returns list of impacted trains and their predicted delay change (cascading simulation).

**POST `/api/v1/events/ingest`**
Accepts a live/simulated GPS or delay event to trigger recomputation.

**GET `/api/v1/train/{train_no}/history`**
Returns predicted vs actual comparison for model evaluation/demo.

**POST `/api/v1/feeder/subscribe`**
Registers a webhook/contact to be notified when a train's ETA confidence window narrows below a threshold.

---

## 13. Tech Stack (Suggested)

| Layer | Technology |
|---|---|
| Ingestion | Kafka / MQTT / simple REST webhook (hackathon-scale) |
| Backend/API | Python (FastAPI) or Node.js (Express) |
| Graph/ML | Python — PyTorch Geometric (GNN), scikit-learn/XGBoost (baseline), MAPIE or conformal-prediction libs (uncertainty) |
| Explainability | SHAP, or native GNN attention-weight extraction |
| Storage | PostgreSQL (historical + graph topology) + Redis (live ETA cache) |
| Dashboard | React + Mapbox/Leaflet (map) + a graph visualization lib (e.g., react-force-graph) for network/what-if view |
| Deployment | Docker Compose (hackathon demo), Kubernetes (production vision) |

---

## 14. Hackathon Deliverables & Milestones

| Phase | Deliverable |
|---|---|
| Day 1 (AM) | Network graph construction from open route data; train-movement simulator generating multi-train, shared-section events |
| Day 1 (PM) | Baseline A (static) + Baseline B (GBM regression) implemented and evaluated |
| Day 2 (AM) | GNN model (v1) trained on historical + simulated data; benchmarked vs baselines |
| Day 2 (PM) | Uncertainty layer (confidence bands) + explainability layer integrated |
| Day 3 (AM) | What-if simulation engine + feeder-trigger webhook (mock) + fallback/degradation logic |
| Day 3 (PM) | Dashboard (map + graph view + what-if panel), demo polish, pitch deck |

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| No access to real live GPS feed | Build a realistic multi-train movement simulator with shared sections/platforms to genuinely exercise the graph/cascading logic |
| Limited historical data | Use publicly available Indian Railways datasets; augment with synthetic variation across zones |
| GNN complexity/training time within hackathon window | Keep graph scoped to a demo sub-network (e.g., one zone, 20-30 stations) rather than the full national network; fall back to Baseline B if GNN underperforms in time available |
| Model overfitting on small demo data | Use simple, interpretable Baseline B as a safety net; present GNN as the headline model with honest benchmark comparison |
| Scalability can't be truly demoed | Architect for scalability (stateless services, queue-based ingestion) and explain the design explicitly even if the live demo runs on a sub-network |
| Explainability output looks like noise/jargon | Post-process attention/SHAP output into a small, fixed set of human-readable factor templates |

---

## 16. Future Roadmap (Post-Hackathon)

- Integrate with actual RTIS/CRIS live data feeds.
- Scale the graph model to full national network, with zone-wise sub-graph partitioning for performance.
- Push notifications to passengers via NTES/IRCTC integration.
- Real feeder-transport partner integrations (cab aggregators, auto-rickshaw stands).
- Feed ETA + what-if outputs into crew scheduling, platform allocation, and catering systems for automated resource optimization.
- Full explainable-AI control-room dashboard with drill-down from network view to individual section causes.

---

## 17. Team Roles (Suggested for Hackathon)

| Role | Responsibility |
|---|---|
| ML/Graph Engineer | GNN model, uncertainty layer, explainability, what-if engine |
| Backend Developer | API, data ingestion, graph state management, fallback logic |
| Frontend Developer | Dashboard, map + graph visualization, what-if UI |
| Data Engineer | Multi-train simulator, historical dataset prep, network topology construction |
| Presenter/PM | Pitch narrative (lead with the "network, not train" insight), demo flow, PRD/documentation |
