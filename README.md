# PathNER — AI-Powered Smart Logistics & Accessibility Platform
### Smart India Hackathon (SIH) 2026 | UpWorld Devs

> **Real-time multimodal logistics intelligence, terrain vulnerability scoring, 72-hour accessibility forecasting, and disaster response dispatch for Northeast India (Meghalaya, Assam, Dima Hasao, Barak Valley).**

---

## 🌟 Key Capabilities & PRD Compliance

1. **Isolation Index & 72-Hour Accessibility Forecasting**:
   - Multi-hop graph reachability from central supply hubs (`Guwahati`, `Shillong`, `Haflong`, `Silchar`) to 968 settlements across Assam and Meghalaya.
   - Dynamic forecasting across `Current`, `24h`, `48h`, and `72h` timelines based on district-level meteorological precipitation and soil moisture saturation.

2. **Pre-Trained Machine Learning Risk Model (`models/risk_model.pkl`)**:
   - Gradient Boosting Regressor trained on historical disruption records.
   - Predicts 0–100 terrain vulnerability scores based on rainfall, slope, soil saturation index, base landslide zonation, and ground incident reports.
   - Instant startup with serialized `joblib` model artifact.

3. **Mistral AI Integration**:
   - Live AI Emergency Advisories for relief convoys and engineering teams.
   - Multilingual alerts in **English (`en`)**, **Assamese (`as`)**, **Bengali (`bn`)**, and **Hindi (`hi`)**.
   - Zero-downtime local fallback engine when offline.

4. **Multi-Criteria Route Dispatch**:
   - Compares **Standard Shortest Path** vs **AI-Recommended Safe Detour** with priority weighting (`CRITICAL_MEDICAL`, `FOOD_RATION`, `GENERAL_CARGO`).
   - High-fidelity mountain highway curve tracing along NH-6, NH-27, and regional corridors.
   - Quantifies optimization tradeoffs: Detour Time Delay (+min), Hazard Reduction (-%), and Blocked Choke Points Avoided.

5. **Offline-First Field Reporter (PWA / Local Queue)**:
   - IndexedDB / localStorage queue for ground observers and PWD/BRO engineers to report landslides, waterlogging, and bridge damages in remote areas.
   - Automated background synchronization upon reconnecting to network.

---

## 🚀 Quick Start & Local Execution

### 1. Clone & Setup Virtual Environment
```bash
git clone https://github.com/rudraprasadrout/NER_Smart_logistic_AI_Platform_UpWorld_Devs_SIH_2026.git
cd NER_Smart_logistic_AI_Platform_UpWorld_Devs_SIH_2026

python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Optionally add your MISTRAL_API_KEY in .env
```

### 4. Run Development Server
```bash
python app.py
```
Open **http://localhost:5000** in your browser.

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
```text
web: gunicorn app:app --workers 4 --threads 2 --timeout 120 --bind 0.0.0.0:$PORT
```

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```bash
pytest tests/test_app.py -v
```

All 10 test suites covering routing, ML prediction, accessibility, field sync, and multilingual AI advisories pass with 100% success.

---

## 📡 Core API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
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
