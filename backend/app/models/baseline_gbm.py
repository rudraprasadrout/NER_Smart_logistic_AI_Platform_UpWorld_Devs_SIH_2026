import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from typing import Dict, List, Any
from app.core.graph_network import railway_network

class BaselineGBMModel:
    """
    Baseline B: Machine Learning Tabular Sectional Regressor.
    Predicts section transit delays using non-graph tabular features.
    """
    def __init__(self):
        self.model = HistGradientBoostingRegressor(
            max_iter=100,
            learning_rate=0.08,
            max_leaf_nodes=31,
            random_state=42
        )
        self.is_trained = False
        self._pretrain_synthetic_baseline()

    def _pretrain_synthetic_baseline(self):
        """
        Train the tabular regressor on synthetic historical corridor records
        generated from real section lengths and train characteristics.
        """
        np.random.seed(42)
        n_samples = 3000

        # Features: [distance_km, max_speed, train_priority, current_delay, hour_of_day, num_tracks]
        distances = np.random.uniform(25, 140, n_samples)
        max_speeds = np.random.choice([110, 130], n_samples)
        priorities = np.random.choice([1, 2, 3, 5], n_samples, p=[0.25, 0.35, 0.25, 0.15])
        current_delays = np.random.exponential(scale=15, size=n_samples)
        hours = np.random.randint(0, 24, n_samples)
        tracks = np.random.choice([2, 3, 4], n_samples, p=[0.7, 0.15, 0.15])

        X = np.column_stack([distances, max_speeds, priorities, current_delays, hours, tracks])

        # Target: additional section delay (minutes)
        # Physics + heuristic relation
        peak_factor = np.where((hours >= 7) & (hours <= 11) | (hours >= 17) & (hours <= 21), 1.25, 1.0)
        priority_factor = 1.0 + (priorities - 1) * 0.35
        track_relief = 1.0 / (tracks * 0.6)

        section_runtime_base = (distances / max_speeds) * 60.0
        synthetic_add_delay = (
            (distances / 50.0) * peak_factor * priority_factor * track_relief * 3.5
            + (current_delays * 0.12)
            + np.random.normal(0, 2.5, n_samples)
        )
        y = np.maximum(0.0, synthetic_add_delay)

        self.model.fit(X, y)
        self.is_trained = True

    def predict_section_delay(
        self,
        distance_km: float,
        max_speed: float,
        priority: int,
        current_delay: float,
        hour: int,
        num_tracks: int
    ) -> float:
        feat = np.array([[distance_km, max_speed, priority, current_delay, hour, num_tracks]])
        pred = self.model.predict(feat)[0]
        return float(max(0.0, pred))

    def predict_eta_timeline(
        self,
        train_no: str,
        current_delay_min: float,
        current_station_idx: int,
        sim_hour: int = 14
    ) -> List[Dict[str, Any]]:
        train_meta = railway_network.trains_metadata.get(train_no)
        if not train_meta:
            return []

        stops = train_meta["stops"]
        priority = train_meta.get("priority", 2)
        results = []
        running_delay = current_delay_min

        for i, stop in enumerate(stops):
            st_code = stop["station_code"]
            st_info = railway_network.get_station_info(st_code) or {}

            if i < current_station_idx:
                status = "PASSED"
                pred_delay = 0.0
            elif i == current_station_idx:
                status = "CURRENT"
                pred_delay = current_delay_min
            else:
                status = "UPCOMING"
                prev_stop = stops[i - 1]
                prev_st_code = prev_stop["station_code"]
                sec = railway_network.get_section(prev_st_code, st_code)
                
                dist = sec["distance_km"] if sec else (stop["distance_km"] - prev_stop["distance_km"])
                max_spd = sec["max_speed_kmph"] if sec else 130
                tracks = sec["num_tracks"] if sec else 2

                add_delay = self.predict_section_delay(dist, max_spd, priority, running_delay, sim_hour, tracks)
                running_delay += add_delay
                pred_delay = running_delay

            results.append({
                "station_code": st_code,
                "station_name": st_info.get("station_name", st_code),
                "distance_km": stop["distance_km"],
                "sched_arrival": stop["sched_arrival"],
                "sched_departure": stop["sched_departure"],
                "predicted_delay_min": round(pred_delay, 1),
                "status": status,
                "model_type": "BASELINE_B_GBM"
            })

        return results

baseline_gbm = BaselineGBMModel()
