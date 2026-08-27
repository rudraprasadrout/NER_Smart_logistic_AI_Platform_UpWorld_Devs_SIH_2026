# RailPulse — Feature Breakdown & Technical Implementation Plan

## Executive Overview
**RailPulse** is an intelligent, network-aware dynamic ETA forecasting and operational decision-support platform for Indian Railways (Smart India Hackathon 2026 - Problem Statement #26028). Instead of treating trains as isolated point-estimates, RailPulse models the railway network as a **live spatial graph** where delays propagate dynamically across shared sections, platforms, and junctions.

---

## 1. Comprehensive Feature Breakdown

### 🎯 Feature 1: Network-Graph Topology & State Engine
- **Description:** Represents railway infrastructure as a dynamic graph $G = (V, E)$. 
  - **Nodes ($V$):** Stations, junctions, and major signal blocks (coordinates, platform counts, loop lines, zone).
  - **Edges ($E$):** Track sections connecting stations with physical constraints (distance, maximum permissible speed, double/single line flag, gradient/curve rating, live occupancy).
  - **Entities:** Trains actively moving through edges, carrying state (speed, current section, headway, delay, priority class: Rajdhani/Vande Bharat > Express > Passenger > Freight).
- **Value:** Delays are physical bottlenecks on shared track; graph topology enables capturing bottleneck propagation.

---

### ⏱️ Feature 2: Tri-Model ETA Forecasting Engine
RailPulse incorporates a 3-tier comparative modeling hierarchy:
1. **Baseline A (Static / Rule-Based):**
   - Traditional Indian Railways method: $\text{ETA} = \text{Scheduled Arrival} + \text{Current Delay} - \text{Built-in Recovery Margin}$.
2. **Baseline B (Tabular Gradient Boosting - LightGBM/XGBoost):**
   - Regresses section running time based on tabular features: distance, scheduled speed, time of day, day of week, train priority, current delay.
3. **Core Model (Graph Attention Network - GAT / Temporal-GNN):**
   - Propagates delay states across neighboring nodes and edges. It predicts the section transit time and dwell time by learning attention weights over upstream trains on the same corridor.
- **Value:** Proves technical superiority and quantifiable MAE improvements (>30% reduction over static baselines).

---

### 📊 Feature 3: Dynamic Shrinking Confidence-Ranged ETA
- **Description:** Instead of a false-precision static timestamp (e.g. "Arrival: 16:42:00"), RailPulse computes a **calibrated confidence interval** $[T_{\text{lower}}, T_{\text{upper}}]$ (e.g., 90% confidence window).
- **Mechanism:** Implemented via **Conformal Prediction** / Quantile Regression ($p_{10}, p_{50}, p_{90}$). As the train gets closer to the destination station, the confidence window progressively narrows (e.g., $\pm 25\text{ min}$ at 200km $\rightarrow \pm 3\text{ min}$ at 15km).
- **Value:** Prevents passenger frustration from fluctuating single-point ETAs and gives station masters realistic operational buffers.

---

### 🧠 Feature 4: Explainable AI (XAI) & Factor Attribution
- **Description:** Transparently decomposes the root causes behind any predicted delay into human-readable factor percentages and clear natural language summaries.
- **Factor Breakdown:**
  - 🟡 *Preceding Train Blockage / Cascading Headway:* e.g. "Train 12302 held at Section CNB-PRYJ" (45%)
  - 🔵 *Permanent/Temporary Speed Restrictions (TSR):* e.g. "Track renewal work at KM 412" (25%)
  - 🟣 *Junction Bottleneck / Platform Dwell:* e.g. "Platform occupation conflict at Kanpur Central" (20%)
  - 🟢 *Weather / Visibility:* e.g. "Dense fog / low visibility index" (10%)
- **Value:** Builds operator confidence in control rooms and eliminates "mystery delays" for passengers.

---

### 🎛️ Feature 5: Interactive "What-If" Cascading Simulator
- **Description:** An Operations Control Center (OCC) decision-support sandbox. Dispatchers can introduce hypothetical perturbations:
  - *"What if Train 12301 is halted for 15 additional minutes at Kanpur Central?"*
  - *"What if Section Allahabad-Mirzapur operates under a 30 km/h speed restriction?"*
- **Mechanism:** The simulator clones the current graph state, injects the delta perturbation, and re-executes GNN graph propagation in sub-2 seconds to reveal secondary and tertiary cascading delays across all downstream trains.
- **Value:** Enables proactive dispatching (loop-line overtakes, platform re-allocations) instead of reactive firefighting.

---

### 🚕 Feature 6: Feeder & Last-Mile Auto-Trigger Webhook
- **Description:** Automated integration trigger for multimodal transport and passenger alerts.
- **Mechanism:** When a train enters the final approach zone and its confidence interval tightens below a configurable threshold (e.g., $\text{ETA Window} \le \pm 5\text{ minutes}$), the system fires a webhook event payload (`train_no`, `station`, `confirmed_eta`, `confidence_score`).
- **Value:** Connects rail ETA directly to last-mile ride-hailing (Ola/Uber), feeder EV buses, and automated passenger SMS/WhatsApp alerts.

---

### 🛟 Feature 7: Graceful Degradation & Resilience Subsystem
- **Description:** Production-grade fault tolerance. If live telemetry drops, GPS signals go dark, or GNN inference exceeds timeout bounds:
  - Automatically falls back to Baseline B (GBM) or Baseline A (Rule-based).
  - Flags predictions with a clear `LOW_CONFIDENCE_FALLBACK` indicator in UI and API responses.
- **Value:** Guarantees zero downtime and prevents total system lockup during signal dropouts.

---

### 🖥️ Feature 8: Mission-Control Command Dashboard & Visualizer
- **Description:** A state-of-the-art, high-density Web UI featuring:
  - **Live Railway Network Map:** Interactive geographical and schematic topology showing running trains, signal states, and live section occupancy.
  - **Train Explorer & ETA Timeline:** Station-by-station progression with shrinking confidence bands and schedule comparisons.
  - **XAI Inspection Drawer:** Interactive radar and waterfall charts breaking down delay factors.
  - **What-If Simulation Lab:** Sliders for holds/delays, visual cascading impact graph, and impact summary table.
  - **Feeder Dispatch Monitor:** Live feed of triggered webhooks and last-mile notifications.

---

## 2. Proposed Architecture & Directory Structure

```
RailPulse_UpWorld_Devs_SIH_2026/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_eta.py           # /api/v1/train/{train_no}/eta & /explain
│   │   │   ├── routes_stations.py      # /api/v1/station/{station_code}/arrivals
│   │   │   ├── routes_whatif.py        # /api/v1/whatif
│   │   │   ├── routes_simulator.py     # /api/v1/events/ingest & live stream
│   │   │   └── routes_feeder.py        # /api/v1/feeder/subscribe & triggers
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── graph_state.py          # In-memory graph network state
│   │   ├── models/
│   │   │   ├── baseline_rule.py        # Baseline A
│   │   │   ├── baseline_gbm.py         # Baseline B (LightGBM/XGBoost)
│   │   │   ├── gnn_model.py            # Core GNN PyTorch / PyG delay engine
│   │   │   ├── uncertainty.py          # Conformal prediction interval engine
│   │   │   └── explainability.py       # Factor attribution (SHAP/Attention)
│   │   ├── simulator/
│   │   │   ├── network_generator.py    # Delhi-Howrah / Golden Quadrilateral Corridor graph
│   │   │   ├── multi_train_engine.py   # Discrete-event multi-train movement & blockage simulator
│   │   │   └── delay_injector.py       # Realistic disruption injector
│   │   └── main.py                     # FastAPI application entrypoint
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NetworkMap.jsx          # Interactive Corridor Map & Trains
│   │   │   ├── TrainEtaTimeline.jsx    # Station ETA with shrinking confidence bands
│   │   │   ├── ExplainabilityView.jsx  # Factor attribution & XAI charts
│   │   │   ├── WhatIfSimulator.jsx     # What-If scenario sandbox
│   │   │   ├── StationBoard.jsx        # Live Station arrival board
│   │   │   └── FeederAlerts.jsx        # Last-mile dispatch trigger log
│   │   ├── services/
│   │   │   └── api.js                  # Axios client & WebSocket/SSE listeners
│   │   ├── App.jsx
│   │   └── index.css                   # Modern dark-mode glassmorphic theme
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   ├── stations_corridor.json          # High-density route stations (NDLS, CNB, PRYJ, DDU, etc.)
│   ├── trains_timetable.json           # Real Rajdhani, Vande Bharat, SF Express schedules
│   └── track_sections.json             # Sectional topology, distance, speed limits
└── docs/
```

---

## 3. Implementation Phasing

### Phase 1: Corridor Data & Multi-Train Simulator
- Create high-density corridor topology data (Northern / North-Central corridor: NDLS $\leftrightarrow$ CNB $\leftrightarrow$ PRYJ $\leftrightarrow$ DDU $\leftrightarrow$ PNBE $\leftrightarrow$ HWH).
- Implement multi-train physics simulator simulating train speeds, signal block occupancy, headway restrictions, and mutual blocking.

### Phase 2: ML & Delay Propagation Engine (Baselines + GNN + Uncertainty + XAI)
- Build Baseline A (Static rule) and Baseline B (GBM regressor).
- Implement Graph Neural Network / Spatial Delay Propagator and train/fit with simulated corridor delay data.
- Build Conformal Uncertainty band calculator and Explainability module.

### Phase 3: FastAPI Backend & Simulation Endpoints
- Implement all PRD API endpoints (`/eta`, `/explain`, `/arrivals`, `/whatif`, `/events/ingest`, `/feeder`).
- Add WebSocket / SSE live event streaming for real-time dashboard sync.

### Phase 4: Modern Web Dashboard (Frontend)
- Build an interactive, responsive frontend with live track canvas/map, train search, real-time ETA bands, What-If simulation slider controls, XAI charts, and feeder trigger modal.

---

## 4. Verification Plan

### Automated Tests
- Backend API tests using `pytest` for all endpoints:
  ```bash
  pytest backend/tests/
  ```
- Validation of MAE comparison metrics:
  ```bash
  python backend/app/models/benchmark.py
  ```

### Manual & Interactive Verification
- Launch backend (`uvicorn app.main:app`) and frontend (`npm run dev`).
- Run the Multi-Train Simulator and watch live train movements.
- Test What-If scenario: Apply a 20-min hold at Kanpur (CNB) and confirm downstream trains show cascading delays on both the graph and API response.
- Verify shrinking confidence intervals as trains approach upcoming stations.
