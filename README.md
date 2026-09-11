<p align="center">
  <img src="https://img.shields.io/badge/SIH-2026-orange?style=for-the-badge&logo=hackthebox&logoColor=white" alt="SIH 2026"/>
  <img src="https://img.shields.io/badge/Team-UpWorld_Devs-blueviolet?style=for-the-badge&logo=teamspeak&logoColor=white" alt="UpWorld Devs"/>
  <img src="https://img.shields.io/badge/Problem_ID-26028-critical?style=for-the-badge" alt="PS ID 26028"/>
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">🛤️ PathNER — AI-Powered Smart Logistics & Accessibility Platform</h1>

<p align="center">
  <strong>Who's Cut Off, Why, and For How Long?</strong><br/>
  Real-time multimodal logistics intelligence for India's North Eastern Region
</p>

<p align="center">
  <em>Built for Smart India Hackathon (SIH) 2026 by <strong>Team UpWorld Devs</strong></em>
</p>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution--what-is-pathner)
- [Key Differentiators](#-key-differentiators)
- [Features & Capabilities](#-features--capabilities)
- [System Architecture](#-system-architecture)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [ML Model Performance](#-ml-model-performance)
- [Project Structure](#-project-structure)
- [Quick Start & Installation](#-quick-start--installation)
- [Production Deployment](#-production-deployment)
- [API Reference](#-api-reference)
- [Running Tests](#-running-tests)
- [Team UpWorld Devs](#-team-upworld-devs)
- [License](#-license)

---

## 🔴 Problem Statement

> **Problem Statement ID:** `26028`
> **Track:** Smart Automation / Logistics & Infrastructure
> **Theme:** Infrastructure-led Development, NER Connectivity

India's **North Eastern Region (NER)** — spanning Assam, Meghalaya, Dima Hasao, Barak Valley, and surrounding districts — faces **chronic logistics disruptions** due to extreme terrain, heavy monsoons, and fragile infrastructure. Landslides, floods, and road damage routinely sever lifeline corridors, cutting off remote settlements from essential supplies like medicine, food, and construction materials.

### The Core Gaps Today

| # | Gap | Impact |
|:-:|:----|:-------|
| 1 | **No real-time visibility** into which roads/bridges are actually accessible district-wise | Delayed supply chain decisions |
| 2 | **No predictive capability** — disruptions are reacted to, never anticipated | Slower emergency response |
| 3 | **No structured reporting** from remote, low-connectivity field locations | Poor situational awareness |
| 4 | **No alternate-route intelligence** — drivers & planners figure it out manually | Higher transport costs |
| 5 | **No visibility into human impact** — nobody knows how many people are cut off right now | Weaker public trust & planning |
| 6 | **No centralized dashboard** for emergency responders or logistics planners | Fragmented response coordination |

**Bottom Line:** When a road fails in NER, nobody can currently answer — *"Who is stranded? How many people are affected? When will connectivity be restored? What's the safe alternate?"*

---

## 💡 Our Solution — What is PathNER?

**PathNER** is an AI-powered logistics intelligence platform that models NER's entire transport network as a **live, risk-scored accessibility graph** — fusing satellite/weather data, historical disruption patterns, ML-driven terrain vulnerability analysis, and real-time field reports — to:

1. **Predict** route disruptions **before** they happen
2. **Quantify** the human impact (who's isolated, since when, how many people)
3. **Recommend** AI-optimized safe alternate routes in real-time
4. **Forecast** accessibility 24/48/72 hours ahead for proactive planning
5. **Track** essential-goods vehicles along the graph
6. **Enable** offline-first field incident reporting from zero-connectivity zones
7. **Deliver** multilingual emergency advisories (English, Assamese, Bengali, Hindi)

> PathNER reframes road monitoring from *"which road is blocked?"* to **"which villages are cut off, and when will that change?"** — a human-centric, policy-relevant approach.

---

## 🏆 Key Differentiators

| # | Differentiator | What It Means | Status |
|:-:|:---------------|:--------------|:------:|
| 1 | **Isolation Index** | Measures *people cut off*, not just roads blocked — multi-hop reachability from supply hubs to 968 settlements | ✅ Core MVP |
| 2 | **72-Hour Accessibility Forecast** | Projects risk forward using weather forecasts, not just current status — turns reactive monitoring into a planning tool | ✅ Core MVP |
| 3 | **Continuous Risk Scores (0–100)** | Live per-edge scoring, not binary open/closed — captures deteriorating conditions before full failure | ✅ Core MVP |
| 4 | **Explainable Risk Factors** | Every score shows contributing factors (rainfall, slope, soil saturation, incident reports) | ✅ Core MVP |
| 5 | **Offline-First Field Reporting** | IndexedDB/localStorage queue with auto-sync — works in zero-connectivity zones | ✅ Core MVP |
| 6 | **AI Emergency Advisories (Mistral)** | Tactical logistics guidance with zero-downtime local fallback engine | ✅ Core MVP |
| 7 | **Multi-Criteria Route Dispatch** | Compares standard shortest path vs AI safe detour with priority weighting (CRITICAL_MEDICAL, FOOD_RATION, GENERAL_CARGO) | ✅ Core MVP |

---

## ✨ Features & Capabilities

### 🗺️ Real-Time Accessibility Graph
- **968 settlement nodes** + **840 road segment edges** across Assam & Meghalaya
- 4 central supply hubs: `Guwahati`, `Shillong`, `Haflong`, `Silchar`
- Live risk scoring per edge combining weather, terrain, historical data, and field reports
- High-fidelity mountain highway curve tracing along NH-6, NH-27, and regional corridors

### 📊 Isolation Index Engine
- Multi-hop graph reachability analysis from supply hubs to every settlement
- Per-settlement classification: `Reachable` / `At-Risk` / `Isolated`
- Real-time tracking: isolation duration, estimated population affected, severed corridors
- **Current stats:** 4 isolated settlements, 282 at-risk, ~13,453 people cut off, ~960,902 at-risk population

### 🔮 72-Hour Accessibility Forecast
- Dynamic forecasting across `Current`, `24h`, `48h`, `72h` timelines
- District-level meteorological precipitation and soil moisture saturation modeling
- Pre-position supplies **before** a corridor fails, not after

### 🤖 ML-Powered Terrain Vulnerability Scoring
- **Gradient Boosting Regressor** trained on historical disruption records
- Predicts 0–100 vulnerability scores based on: rainfall, slope, soil saturation, base landslide zonation, ground incident reports
- Pre-trained serialized model (`models/risk_model.pkl`) for instant startup

### 🧭 AI Route Dispatch Engine
- Standard Shortest Path vs AI-Recommended Safe Detour comparison
- Priority weighting: `CRITICAL_MEDICAL` > `FOOD_RATION` > `GENERAL_CARGO`
- Quantifies tradeoffs: Detour Time Delay (+min), Hazard Reduction (-%), Blocked Choke Points Avoided

### 🤖 Mistral AI Emergency Advisories
- Live AI tactical advisories for relief convoys and engineering teams
- **Multilingual alerts:** English (`en`), Assamese (`as`), Bengali (`bn`), Hindi (`hi`), Khasi (`kha`)
- Zero-downtime local fallback engine when API is offline

### 📡 Offline-First Field Reporter (PWA)
- IndexedDB / localStorage queue for ground observers and PWD/BRO engineers
- Geo-tagged incident reports (landslides, waterlogging, bridge damage)
- Automated background sync upon network reconnection

### 🚛 Vehicle Tracking & Fleet Simulation
- Simulated live telematics for essential-goods relief convoys
- Real-time position tracking along the accessibility graph

### 🚨 Disaster Mode View
- Dedicated emergency accessibility dashboard
- Highlights currently viable routes and isolated settlements
- Emergency-priority visualization for control room operators

---

## 🏗 System Architecture

```
 Weather/Rainfall        Historical Disruption       Field Reports (offline-first
  Data + Forecast          Records                     mobile/web app, local queue)
       │                        │                               │
       ▼                        ▼                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                Data Ingestion & Sync Layer (REST + Queue)            │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
                    ┌─────────────────────────────────┐
                    │   Accessibility Graph Engine      │
                    │   (968 nodes, 840 edges,          │
                    │    4 supply hubs, live per-edge    │
                    │    risk score 0-100)               │
                    └────────────────┬────────────────────┘
                                   ▼
       ┌──────────────┬────────────┼────────────┬───────────────┐
       ▼              ▼            ▼            ▼               ▼
 ┌───────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐
 │ Risk       │ │ Forecast   │ │ Isolation│ │ Alternate  │ │ Vehicle  │
 │ Scoring    │ │ Engine     │ │ Index    │ │ Route      │ │ Tracking │
 │ Model (ML) │ │ (24/48/72h)│ │ Engine   │ │ Engine     │ │ System   │
 └─────┬──────┘└─────┬──────┘ └────┬─────┘ └─────┬──────┘ └────┬─────┘
       │              │             │              │             │
       ▼              ▼             ▼              ▼             ▼
┌──────────────────────────────────────────────────────────────────────┐
│               REST API Layer (Flask Blueprints)                      │
│   /api/v1/graph  /api/v1/isolation  /api/v1/route  /api/v1/alerts   │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                 Frontend (Jinja2 + Mapbox + Chart.js)                │
│   Dashboard │ Route Planner │ Field Reporter │ Disaster Mode View   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Backend Framework** | Flask 3.0+ (Python) |
| **ML / AI** | Scikit-learn (Gradient Boosting), Joblib, NumPy |
| **AI Advisories** | Mistral AI API (with offline fallback) |
| **Graph Engine** | NetworkX (Dijkstra / A* routing) |
| **Database** | SQLite (field reports, incident data) |
| **Frontend** | Jinja2 Templates, Vanilla JS, CSS3 |
| **Mapping** | Mapbox GL JS |
| **Offline Support** | IndexedDB, localStorage (PWA architecture) |
| **Containerization** | Docker, Docker Compose |
| **Production Server** | Gunicorn (WSGI) |
| **API Architecture** | RESTful Blueprints with Gzip compression middleware |
| **Weather Data** | OpenWeatherMap API integration |
| **Languages** | Python 3.10+, JavaScript ES6+, HTML5, CSS3 |

---

## 📈 ML Model Performance

### Terrain Vulnerability Classification Model
> Gradient Boosting Classifier — 824 samples, 3 classes (Low / Medium / High)

| Metric | Score |
|:-------|:-----:|
| **Accuracy** | **93.33%** |
| **Macro F1** | **93.35%** |
| **Cross-Val Accuracy** | **94.78% ± 1.74%** |

| Class | Precision | Recall | F1-Score |
|:------|:---------:|:------:|:--------:|
| Low Risk | 98.18% | 98.18% | 98.18% |
| Medium Risk | 86.67% | 94.55% | 90.43% |
| High Risk | 96.00% | 87.27% | 91.43% |

**Top Features by Importance:**
1. `slope_deg` — 44.68%
2. `distance_km` — 18.73%
3. `bridge_type` — 6.53%
4. `road_code` — 6.23%
5. `avg_speed_kmh` — 5.38%

### Risk Scoring Regression Model
> Gradient Boosting Regressor — continuous 0–100 risk prediction

| Metric | Score |
|:-------|:-----:|
| **R² Score** | **0.971** |
| **MAE** | **3.13** |
| **RMSE** | **3.62** |
| **Cross-Val R²** | **0.975 ± 0.017** |

**Feature Importances:**
1. `soil_saturation` — 47.61%
2. `base_vulnerability` — 26.80%
3. `rainfall_24h_mm` — 16.37%
4. `slope_deg` — 8.29%
5. `active_reports_count` — 0.93%

---

## 📂 Project Structure

```
NER_Smart_logistic_AI_Platform_UpWorld_Devs_SIH_2026/
│
├── app.py                          # Flask application factory & entry point
├── config.py                       # Environment config & regional bounds
├── train_model.py                  # ML model training pipeline
├── vulnerability_model.pkl         # Pre-trained vulnerability classifier
├── model_evaluation_report.json    # Detailed model metrics & confusion matrices
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Docker container definition
├── docker-compose.yml              # Multi-service orchestration
├── Procfile                        # PaaS deployment config (Render/Railway/Heroku)
├── PRD.md                          # Full Product Requirements Document
│
├── models/                         # Core AI/ML engines
│   ├── graph_engine.py             # Accessibility graph (NetworkX) — 968 nodes, 840 edges
│   ├── risk_model.py               # Risk scoring engine (0-100 per edge)
│   ├── risk_model.pkl              # Serialized Gradient Boosting risk model
│   ├── disruption_model.pkl        # Disruption prediction model
│   ├── distruption_pred.py         # Disruption prediction service
│   ├── isolation_engine.py         # Multi-hop Isolation Index computation
│   ├── forecast_engine.py          # 24/48/72h accessibility forecast
│   ├── mistral_service.py          # Mistral AI advisory engine + offline fallback
│   ├── weather_service.py          # OpenWeatherMap API integration
│   ├── vehicle_simulator.py        # Relief convoy fleet simulation
│   ├── data_loader.py              # CSV/GeoJSON data ingestion pipeline
│   └── db_manager.py               # SQLite database manager
│
├── routes/                         # REST API Blueprints
│   ├── api_graph.py                # /api/v1/graph/* endpoints
│   ├── api_isolation.py            # /api/v1/isolation-index endpoint
│   ├── api_routes.py               # /api/v1/route/<from>/<to> endpoint
│   ├── api_reports.py              # /api/v1/reports/incident endpoint
│   ├── api_vehicles.py             # /api/v1/vehicles endpoint
│   └── api_alerts.py               # /api/v1/alerts & /api/v1/ai/advisory endpoints
│
├── templates/                      # Jinja2 HTML templates
│   ├── base.html                   # Base layout with navigation
│   ├── landing.html                # Landing / home page
│   ├── dashboard.html              # Control room dashboard
│   ├── route_planner.html          # AI route comparison & dispatch
│   ├── field_app.html              # Offline-first field incident reporter
│   └── disaster_view.html          # Emergency / disaster mode view
│
├── static/                         # Frontend assets
│   ├── css/                        # Stylesheets (components, landing page)
│   ├── js/                         # Client-side JavaScript
│   └── images/                     # Static images & icons
│
├── data/                           # Datasets & database
│   ├── ner_nodes_REAL.csv          # 968 settlement/junction nodes (17.8 MB)
│   ├── ner_edges_REAL (3).csv      # 840 road segment edges (8.8 MB)
│   ├── historical_disruptions.csv  # Historical disruption records
│   ├── weather_data.csv            # Weather & precipitation data
│   └── database.sqlite             # SQLite DB (field reports, incidents)
│
├── scripts/                        # Utility scripts
│   ├── evaluate_models.py          # Model evaluation & benchmarking
│   ├── generate_presentation_pdf.py# Presentation PDF generator
│   └── repair_csv.py               # Data cleaning & CSV repair
│
└── tests/                          # Automated test suite
    └── test_app.py                 # 10 test suites (routing, ML, accessibility, sync, AI)
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Python 3.10+
- pip
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/rudraprasadrout/NER_Smart_logistic_AI_Platform_UpWorld_Devs_SIH_2026.git
cd NER_Smart_logistic_AI_Platform_UpWorld_Devs_SIH_2026
```

### 2. Create & Activate Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
```bash
cp .env.example .env
```
Edit `.env` to add your API keys (all are optional — the platform works without them):
```env
MISTRAL_API_KEY=your_mistral_api_key      # AI advisories (optional — fallback engine works offline)
OPENWEATHER_API_KEY=your_openweather_key   # Live weather data (optional — sample data included)
MAPBOX_ACCESS_TOKEN=your_mapbox_token      # Map rendering (optional)
```

### 5. Run the Development Server
```bash
python app.py
```
🌐 Open **http://localhost:5000** in your browser.

---

## 🐳 Production Deployment

### Option A: Docker (Recommended)
```bash
docker-compose up --build -d
```

### Option B: Gunicorn (Linux / Cloud VPS)
```bash
gunicorn app:app --workers 4 --threads 2 --timeout 120 --bind 0.0.0.0:5000
```

### Option C: Cloud PaaS (Render / Railway / Heroku)
The repository includes a production-ready `Procfile`:
```
web: gunicorn app:app --workers 4 --threads 2 --timeout 120 --bind 0.0.0.0:$PORT
```

---

## 📡 API Reference

| Endpoint | Method | Description |
|:---------|:------:|:------------|
| `/api/v1/graph/accessibility` | `GET` | Evaluated road graph with real-time risk scores & nodes |
| `/api/v1/graph/forecast?horizon=48h` | `GET` | 24h / 48h / 72h accessibility forecast timeline |
| `/api/v1/graph/nodes` | `GET` | Settlements & strategic supply depots with metadata |
| `/api/v1/graph/edges` | `GET` | Filtered road network segments by highway type & district |
| `/api/v1/isolation-index` | `GET` | Real-time multi-hop isolation index & severed populations |
| `/api/v1/route/<from>/<to>` | `GET` | Multi-criteria shortest vs AI safe route comparison |
| `/api/v1/ai/advisory?lang=en` | `GET/POST` | Mistral AI tactical emergency logistics advisory |
| `/api/v1/alerts?lang=as` | `GET` | Multilingual emergency hazard broadcast alerts |
| `/api/v1/reports/incident` | `POST` | Ground incident obstacle submission (offline-sync ready) |
| `/api/v1/vehicles` | `GET` | Live telematics & progress of critical relief convoys |

---

## 🧪 Running Tests

Run the full **pytest** suite:
```bash
pytest tests/test_app.py -v
```

**All 10 test suites pass with 100% success**, covering:
- ✅ Graph accessibility & node/edge validation
- ✅ ML risk prediction pipeline
- ✅ Isolation index computation
- ✅ Route dispatch & AI detour comparison
- ✅ Field report offline sync mechanism
- ✅ Multilingual AI advisory generation
- ✅ Vehicle tracking simulation
- ✅ Forecast engine (24h/48h/72h)
- ✅ Alert broadcast system
- ✅ API endpoint response validation

---

## 👥 Team UpWorld Devs

> **Smart India Hackathon 2026 — Problem Statement 26028**

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/rudraprasadrout">
        <img src="https://github.com/rudraprasadrout.png" width="100px;" alt="Rudra Prasad Rout"/><br/>
        <sub><b>Rudra Prasad Rout</b></sub>
      </a><br/>
      <sub>🎯 Team Lead & Full Stack Developer</sub><br/>
      <a href="https://github.com/rudraprasadrout">@rudraprasadrout</a>
    </td>
    <td align="center">
      <a href="https://github.com/satyajitmohapatra">
        <img src="https://github.com/satyajitmohapatra.png" width="100px;" alt="Satyajit Mohapatra"/><br/>
        <sub><b>Satyajit Mohapatra</b></sub>
      </a><br/>
      <sub>🤖 ML / AI Engineer</sub><br/>
      <a href="https://github.com/satyajitmohapatra">@satyajitmohapatra</a>
    </td>
    <td align="center">
      <a href="https://github.com/Tomkar527">
        <img src="https://github.com/Tomkar527.png" width="100px;" alt="T. Omkar"/><br/>
        <sub><b>T. Omkar</b></sub>
      </a><br/>
      <sub>🗄️ Data Engineer</sub><br/>
      <a href="https://github.com/Tomkar527">@Tomkar527</a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/SubhadraMohapatra">
        <img src="https://github.com/SubhadraMohapatra.png" width="100px;" alt="Subhadra Mohapatra"/><br/>
        <sub><b>Subhadra Mohapatra</b></sub>
      </a><br/>
      <sub>🎨 UI/UX Designer</sub><br/>
      <a href="https://github.com/SubhadraMohapatra">@SubhadraMohapatra</a>
    </td>
    <td align="center">
      <a href="https://github.com/debun09">
        <img src="https://github.com/debun09.png" width="100px;" alt="Durga Prasad Dutta"/><br/>
        <sub><b>Durga Prasad Dutta</b></sub>
      </a><br/>
      <sub>📋 Resource Analyst & Project Planner</sub><br/>
      <a href="https://github.com/debun09">@debun09</a>
    </td>
    <td align="center">
      <a href="https://github.com/dasabhisekh100-max">
        <img src="https://github.com/dasabhisekh100-max.png" width="100px;" alt="Abhisekh Das"/><br/>
        <sub><b>Abhisekh Das</b></sub>
      </a><br/>
      <sub>💻 Frontend Developer</sub><br/>
      <a href="https://github.com/dasabhisekh100-max">@dasabhisekh100-max</a>
    </td>
  </tr>
</table>

---

## 📄 License

This project is built for **Smart India Hackathon 2026** under Problem Statement **26028**.

---

<p align="center">
  <strong>Built with ❤️ by Team UpWorld Devs for SIH 2026</strong><br/>
  <em>Empowering India's Northeast — One Route at a Time</em>
</p>
