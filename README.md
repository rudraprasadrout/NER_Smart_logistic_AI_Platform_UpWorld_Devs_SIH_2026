<div align="center">

# 🚆 RailPulse

### Network-Aware, Explainable ETA Forecasting for Indian Railways

**Predicting train arrivals like a network, not a train.**

[![SIH](https://img.shields.io/badge/Smart%20India%20Hackathon-Problem%20Statement%2026028-orange?style=for-the-badge)](#)
[![Status](https://img.shields.io/badge/status-in%20development-yellow?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](#)

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](#)
[![PyTorch](https://img.shields.io/badge/PyTorch%20Geometric-GNN-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-Dashboard-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![Redis](https://img.shields.io/badge/Redis-Live%20Cache-DC382D?style=flat-square&logo=redis&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)](#)

</div>

---

## 🧭 Overview

Indian Railways currently estimates ETA using **static schedules + current delay + fixed recovery time** — treating every train as if it runs alone. In reality, delays are a **network phenomenon**: one late train blocks sections, platforms, and crossings for others.

**RailPulse** models the entire rail network as a **live graph** and uses a **Graph Neural Network (GNN)** to forecast how delays propagate across trains sharing infrastructure — then delivers that forecast as an **honest, explainable, confidence-ranged ETA**, not a false-precision number.

> Built for **Smart India Hackathon** — Problem Statement **#26028**
> *Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains*

---

## ✨ What Makes It Different

| | |
|---|---|
| 🔗 **Graph-based, not per-train** | Models stations as nodes, sections as edges — captures cascading delays across neighboring trains |
| 📊 **Confidence-ranged ETA** | Shows a shrinking arrival window, not a fake-precise single number |
| 🧠 **Explainable predictions** | Surfaces *why* a delay is predicted — e.g. congestion, speed restrictions |
| 🎛️ **What-if simulator** | Control room can simulate a hypothetical delay and see network-wide impact instantly |
| 🚕 **Feeder auto-trigger** | Notifies last-mile transport once ETA confidence narrows enough to act on |
| 🛟 **Graceful degradation** | Falls back to schedule-based ETA with a visible "low confidence" flag if live data drops out |

---

## 🏗️ Architecture

```
Live/Simulated Events (GPS, delay, signal)
              │
              ▼
     Data Ingestion Layer (Kafka / Webhook)
              │
              ▼
   Feature Engineering + Live Graph State
     (nodes = stations, edges = sections)
              │
              ▼
   GNN Prediction Engine
   + Uncertainty Layer (confidence bands)
   + Explainability Layer
              │
   ┌──────────┼──────────┐
   ▼          ▼          ▼
ETA Store  What-If    Fallback /
(Redis)    Engine     Degradation Logic
   │          │          │
   └──────────┼──────────┘
              ▼
       REST API Layer
              │
   ┌──────────┴──────────┐
   ▼                      ▼
Web Dashboard      Station / Control
(map + graph +     Room Displays +
what-if panel)     Feeder Webhooks
```

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| **Ingestion** | Kafka / MQTT / REST webhook |
| **Backend** | FastAPI (Python) |
| **ML / Graph** | PyTorch Geometric (GNN), XGBoost (baseline), MAPIE (uncertainty) |
| **Explainability** | SHAP / GNN attention weights |
| **Storage** | PostgreSQL + Redis |
| **Frontend** | React + Mapbox/Leaflet + graph visualization |
| **Deployment** | Docker Compose |

---

## 📂 Project Structure

```
railpulse/
├── ingestion/          # Data ingestion & event simulation
├── graph/               # Network graph construction & state management
├── models/               # GNN, baseline models, uncertainty layer
├── explainability/        # Attribution / explanation generation
├── whatif/                # Cascading impact simulator
├── api/                    # FastAPI backend & routes
├── dashboard/                # React frontend
├── data/                      # Sample / historical datasets
├── docs/                       # PRD, architecture notes, diagrams
└── README.md
```

---

## ⚙️ Getting Started

```bash
# Clone the repo
git clone https://github.com/<org>/railpulse.git
cd railpulse

# Backend setup
cd api
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd ../dashboard
npm install
npm start
```

> Full setup, environment variables, and dataset instructions are in [`docs/SETUP.md`](docs/SETUP.md).

---

## 📊 Evaluation

RailPulse is benchmarked against two baselines:

1. **Static schedule** (existing Indian Railways method)
2. **Non-graph ML regression** (XGBoost)

against the core **GNN model**, on Mean Absolute Error, confidence-interval calibration, and cascading-delay detection accuracy.

---

## 🗺️ Roadmap

- [ ] Integrate real RTIS/CRIS live data feeds
- [ ] Scale graph model to full national network with zone-wise partitioning
- [ ] Push notifications via NTES/IRCTC integration
- [ ] Real feeder-transport partner integrations
- [ ] Feed outputs into crew scheduling & platform allocation systems

See [`docs/PRD.md`](docs/PRD.md) for the full product requirements document.

---

## 👥 Team — UpWorld Devs

<div align="center">

| <img src="https://github.com/identicons/member1.png" width="80"/> | <img src="https://github.com/identicons/member2.png" width="80"/> | <img src="https://github.com/identicons/member3.png" width="80"/> |
|:---:|:---:|:---:|
| **Member 1**<br/>Role | **Member 2**<br/>Role | **Member 3**<br/>Role |

| <img src="https://github.com/identicons/member4.png" width="80"/> | <img src="https://github.com/identicons/member5.png" width="80"/> | <img src="https://github.com/identicons/member6.png" width="80"/> |
|:---:|:---:|:---:|
| **Member 4**<br/>Role | **Member 5**<br/>Role | **Member 6**<br/>Role |

</div>

<!--
Replace the placeholders above with actual GitHub usernames, e.g.:
[![Member1](https://github.com/USERNAME1.png?size=80)](https://github.com/USERNAME1)
This will pull their real GitHub avatar automatically.
-->

Built with 🚆 by **Team UpWorld Devs** for Smart India Hackathon 2026 — Problem Statement #26028.

---

<div align="center">
<sub>Licensed under MIT · Made for Indian Railways passengers, staff, and control rooms</sub>
</div>
