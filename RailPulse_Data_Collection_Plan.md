# RailPulse — Data Collection & Storage Plan

This document lists every data category you need, where to actually get it for the hackathon, how to collect/generate it, and how to store it.

---

## 1. Data Categories Overview

| # | Data Category | Why You Need It | Real-time or Historical? |
|---|---|---|---|
| 1 | Station master data (codes, names, coordinates, zone) | Build the graph nodes | Static |
| 2 | Train schedule / timetable | Build the graph edges + baseline ETA | Static |
| 3 | Railway route geometry (track paths) | Map visualization, section distances | Static |
| 4 | Historical running/delay data | Train the ML/GNN model | Historical |
| 5 | Live train location (GPS/cell-tower) | Real-time inference input | Real-time (simulated for hackathon) |
| 6 | Live congestion / section occupancy | GNN edge features | Real-time (simulated) |
| 7 | Weather data | Feature for delay prediction | Historical + real-time |
| 8 | Speed restriction / maintenance block data | Feature for delay prediction | Real-time (simulated, since not public) |

---

## 2. Detailed Breakdown, Sources & Collection Method

### 2.1 Station Master Data
**What:** Station code, name, latitude/longitude, zone, state.

**Sources:**
- `datameet/railways` GitHub repo — GeoJSON with ~8,900 station coordinates, codes, zones: https://github.com/datameet/railways
- `arunasank/indian-railways` — cleaned stations.geojson: https://github.com/arunasank/indian-railways/blob/master/data/stations.geojson
- `vstflugel/indian-railway-dataset` — station code/name/region JSON: https://github.com/vstflugel/indian-railway-dataset

**How to collect:** Direct download (`git clone` or raw file `wget`/`curl`). No scraping needed — already structured.

**Storage:** PostgreSQL table `stations`
```sql
CREATE TABLE stations (
  station_code   VARCHAR(10) PRIMARY KEY,
  station_name   TEXT NOT NULL,
  zone           VARCHAR(10),
  state          TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION
);
```
This table becomes your **graph nodes**.

---

### 2.2 Train Schedule / Timetable
**What:** Train number, name, route (ordered station list), scheduled arrival/departure at each stop, distance from origin.

**Sources:**
- data.gov.in official catalog: https://www.data.gov.in/catalog/indian-railways-train-time-table
- Kaggle mirror (easier to download in one go): https://www.kaggle.com/datasets/harsh16/indian-railways-time-table-for-trains-available
- `itzmeanjan/indian-railway` GitHub (cleaned version of the same data.gov.in dataset): https://github.com/itzmeanjan/indian-railway

**How to collect:** Direct CSV/JSON download from data.gov.in or Kaggle (`kaggle datasets download`).

**Storage:** PostgreSQL tables `trains` and `train_stops`
```sql
CREATE TABLE trains (
  train_no      VARCHAR(10) PRIMARY KEY,
  train_name    TEXT,
  source_code   VARCHAR(10) REFERENCES stations(station_code),
  dest_code     VARCHAR(10) REFERENCES stations(station_code),
  train_type    VARCHAR(20)   -- Express, Superfast, Passenger, etc.
);

CREATE TABLE train_stops (
  id              SERIAL PRIMARY KEY,
  train_no        VARCHAR(10) REFERENCES trains(train_no),
  stop_sequence   INT,
  station_code    VARCHAR(10) REFERENCES stations(station_code),
  sched_arrival   TIME,
  sched_departure TIME,
  distance_km     NUMERIC
);
```
Consecutive rows in `train_stops` (by `stop_sequence`) define your **graph edges** (sections).

---

### 2.3 Railway Route Geometry (Track Paths)
**What:** Actual polyline/track geometry between stations (for map rendering, not strictly needed for the model).

**Sources:**
- `datameet/railways` GitHub — includes `trains.geojson` with LineString paths per train route: https://github.com/datameet/railways
- Kaggle mirror: https://www.kaggle.com/datasets/sripaadsrinivasan/indian-railways-dataset

**How to collect:** Direct GeoJSON download.

**Storage:** Store as a `geometry` column (PostGIS) if you want proper spatial queries, or just as raw GeoJSON in a `route_geometry` JSONB column if you don't want to set up PostGIS for a hackathon.
```sql
CREATE TABLE route_geometry (
  train_no   VARCHAR(10) REFERENCES trains(train_no),
  geojson    JSONB
);
```

---

### 2.4 Historical Running/Delay Data
**What:** Actual arrival/departure times per train per station per day, so you can compute historical delay patterns per section.

**Sources:**
- Kaggle / GitHub: "Indian Railways Train Delay Dataset" (Guwahati–Delhi/Mumbai/Chennai/Kolkata routes, Mar 2023–Mar 2024): https://github.com/ankitaanand28/DA323_IndianRailwayTrainDelayDatasets
- RIDE (Railway Delay) open benchmark dataset — international, but useful as a modeling reference/pretraining source if Indian data is sparse for a given route: https://arxiv.org/pdf/2606.05070
- NTES site itself does not expose a public bulk-download API, so for broader historical coverage, treat it as an enrichment source you scrape sparingly (see note below) rather than your primary dataset.

**How to collect:** Direct CSV download from GitHub/Kaggle. If you need more routes than the above dataset covers, you can **supplement with synthetic historical data** (see Section 3) rather than scraping NTES at scale, which is against fair-use expectations for an unofficial bulk pull.

**Storage:** PostgreSQL table `historical_runs`
```sql
CREATE TABLE historical_runs (
  id              SERIAL PRIMARY KEY,
  train_no        VARCHAR(10),
  run_date        DATE,
  station_code    VARCHAR(10),
  sched_arrival   TIME,
  actual_arrival  TIME,
  delay_minutes   INT,
  weather_code    VARCHAR(10),   -- joined from weather data
  day_of_week     SMALLINT
);
```
This is your **primary ML training table** — indexed on `(train_no, station_code)` for fast section-level aggregation.

---

### 2.5 Live Train Location (GPS / Cell-Tower)
**What:** Real-time position of a running train.

**Reality check:** There is **no public, free, real-time bulk API** for this — NTES/RTIS data is not openly published for bulk consumption, and apps like RailYatri/ixigo/Where-is-my-Train get it via crowd-sourced user GPS or private CRIS partnerships.

**What to do for the hackathon:** Build a **train movement simulator** instead of trying to scrape live data:
- Take the timetable (`train_stops`) as ground truth for the route.
- Interpolate position between consecutive stations based on scheduled speed.
- Inject randomized delay events (following realistic distributions derived from your `historical_runs` table) to simulate real-world variability.
- Critically: make **multiple trains share the same section at overlapping times** — this is what lets you demonstrate cascading/graph effects, which is your core differentiator.

**Storage:** Don't persist this to Postgres directly — treat it as a **stream**. Use Redis (or an in-memory queue) for the live state:
```
Key: live:train:{train_no}
Value (JSON): {
  "current_section": "NDLS-GZB",
  "position_km": 12.4,
  "speed_kmph": 68,
  "delay_minutes": 14,
  "last_updated": "2026-08-27T09:15:00Z"
}
```
Also log every event to a `live_events` append-only table (for later replay/evaluation):
```sql
CREATE TABLE live_events (
  id            BIGSERIAL PRIMARY KEY,
  train_no      VARCHAR(10),
  event_time    TIMESTAMP,
  station_code  VARCHAR(10),
  event_type    VARCHAR(20),   -- 'departure','delay_update','halt', etc.
  delay_minutes INT
);
```

---

### 2.6 Live Congestion / Section Occupancy
**What:** How many trains are currently in/near a given section — the key GNN edge feature for cascading delay.

**Sources:** No public feed exists. **Derive it directly from your own simulator** — since you control which trains are "running" and their positions (Section 2.5), you can compute occupancy per section in real time as a derived value, not something you need to source externally.

**Storage:** Redis, computed on the fly:
```
Key: congestion:section:{from_code}-{to_code}
Value: { "trains_in_section": 2, "avg_delay": 9 }
```

---

### 2.7 Weather Data
**What:** Rain, fog, visibility, temperature — known drivers of speed restrictions and delays (especially fog in North India winters).

**Sources:**
- Open-Meteo (free, no API key needed, good for hackathons): https://open-meteo.com/
- OpenWeatherMap (free tier, needs API key): https://openweathermap.org/api
- IMD (India Meteorological Department) — official but harder to integrate quickly: https://mausam.imd.gov.in/

**How to collect:** REST API call per station (lat/long from Section 2.1) — Open-Meteo lets you batch historical + forecast queries by coordinate, no auth required, which is why it's the fastest option for a hackathon.

**Storage:** PostgreSQL table `weather_data`
```sql
CREATE TABLE weather_data (
  station_code   VARCHAR(10),
  observed_at    TIMESTAMP,
  temperature_c  NUMERIC,
  visibility_km  NUMERIC,
  precipitation_mm NUMERIC,
  fog_flag       BOOLEAN,
  PRIMARY KEY (station_code, observed_at)
);
```

---

### 2.8 Speed Restriction / Maintenance Block Data
**What:** Temporary speed restrictions (TSRs), maintenance blocks, level-crossing closures.

**Reality check:** Not publicly available in any structured open dataset.

**What to do for the hackathon:** Simulate it — randomly inject TSR events onto sections in your simulator (Section 2.5) with realistic frequency/duration, and use these as a labeled "ground truth cause" so your explainability layer has something real to point to in the demo (e.g., "TSR active at KM 412" becomes a genuine input feature, not a fabricated explanation).

**Storage:** Same `live_events` table (Section 2.5) with `event_type = 'speed_restriction'`, plus a duration field, or a small dedicated table:
```sql
CREATE TABLE speed_restrictions (
  id             SERIAL PRIMARY KEY,
  section_from   VARCHAR(10),
  section_to     VARCHAR(10),
  start_time     TIMESTAMP,
  end_time       TIMESTAMP,
  restricted_speed_kmph INT
);
```

---

## 3. Synthetic Data Generation Strategy (Important for Hackathon Timeline)

Since 3 of the 8 categories above (live GPS, live congestion, speed restrictions) have **no public real-time source**, don't waste hackathon time trying to scrape or fake-integrate with NTES. Instead:

1. Load real static data (stations, schedules, historical delays) from the sources above.
2. Build one **simulator service** that:
   - Replays trains along their real routes at scheduled times.
   - Samples delay injections from the *actual* historical delay distribution (Section 2.4) — so the simulated data still reflects real-world patterns, not pure randomness.
   - Randomly overlaps 2+ trains on shared sections to create genuine cascading scenarios.
3. Feed the simulator's output into the same ingestion pipeline you'd use for real data — this way your architecture is production-ready, and swapping the simulator for a real RTIS feed later is a drop-in replacement, not a rewrite.

---

## 4. Summary Table — Where Everything Lives

| Data | Storage | Update Frequency |
|---|---|---|
| Stations | PostgreSQL (`stations`) | Static, loaded once |
| Train schedules | PostgreSQL (`trains`, `train_stops`) | Static, loaded once |
| Route geometry | PostgreSQL/PostGIS or JSONB | Static, loaded once |
| Historical delays | PostgreSQL (`historical_runs`) | Batch, loaded once + periodic append |
| Live train position | Redis (`live:train:*`) | Every simulated event (~seconds) |
| Live congestion | Redis (`congestion:section:*`) | Derived on-the-fly |
| Weather | PostgreSQL (`weather_data`) | Hourly batch pull |
| Speed restrictions | PostgreSQL (`speed_restrictions`) | Simulated event stream |

---

## 5. Quick Source Link List

| Dataset | Link |
|---|---|
| Station coordinates/codes (GeoJSON) | https://github.com/datameet/railways |
| Cleaned stations GeoJSON | https://github.com/arunasank/indian-railways/blob/master/data/stations.geojson |
| Station code/name/region JSON | https://github.com/vstflugel/indian-railway-dataset |
| Official train timetable (data.gov.in) | https://www.data.gov.in/catalog/indian-railways-train-time-table |
| Timetable (Kaggle mirror) | https://www.kaggle.com/datasets/harsh16/indian-railways-time-table-for-trains-available |
| Cleaned timetable repo | https://github.com/itzmeanjan/indian-railway |
| Train delay dataset (Guwahati routes) | https://github.com/ankitaanand28/DA323_IndianRailwayTrainDelayDatasets |
| International delay benchmark (modeling reference) | https://arxiv.org/pdf/2606.05070 |
| Weather API (free, no key) | https://open-meteo.com/ |
| Weather API (free tier, key required) | https://openweathermap.org/api |
| IMD official weather | https://mausam.imd.gov.in/ |
| NTES (reference only, no bulk API) | https://enquiry.indianrail.gov.in |

---

## 6. Action Items for Your Data Sub-Team

1. Download stations + timetable + historical delay datasets (Section 5 links) — day 1 morning.
2. Load into PostgreSQL using the schemas in Section 2 — day 1 morning.
3. Build the train movement + delay-injection simulator (Section 3) — day 1 afternoon/evening.
4. Set up Redis for live state and wire the simulator's output into it — day 1 evening.
5. Pull weather data via Open-Meteo for your demo sub-network's stations — day 2 morning (can run in parallel with model work).
