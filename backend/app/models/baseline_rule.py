from datetime import datetime, timedelta
from typing import Dict, List, Any
from app.core.graph_network import railway_network

class BaselineRuleModel:
    """
    Baseline A: Traditional Rule-Based Static Estimation.
    Formula: Predicted ETA = Scheduled Arrival + Current Train Delay - Scheduled Buffer Recovery
    """
    @staticmethod
    def predict_eta_timeline(train_no: str, current_delay_min: float, current_station_idx: int) -> List[Dict[str, Any]]:
        train_meta = railway_network.trains_metadata.get(train_no)
        if not train_meta:
            return []

        stops = train_meta["stops"]
        results = []
        
        # Indian Railways typical recovery margin: ~3-5% of remaining run time
        recovery_rate_per_hour = 2.5 # minutes recovered per hour of run

        accumulated_runtime_hours = 0.0
        
        for i, stop in enumerate(stops):
            sched_arr_str = stop["sched_arrival"]
            sched_dep_str = stop["sched_departure"]
            station_code = stop["station_code"]
            st_info = railway_network.get_station_info(station_code) or {}

            if i < current_station_idx:
                status = "PASSED"
                pred_delay = 0.0
            elif i == current_station_idx:
                status = "CURRENT"
                pred_delay = current_delay_min
            else:
                status = "UPCOMING"
                # Calculate remaining recovery
                prev_dist = stops[i - 1]["distance_km"] if i > 0 else 0
                curr_dist = stop["distance_km"]
                seg_dist = max(0, curr_dist - prev_dist)
                seg_hours = seg_dist / 90.0 # estimated avg speed 90 kmph
                accumulated_runtime_hours += seg_hours
                
                # Rule-based recovery: cannot recover more than 50% of current delay
                potential_recovery = min(current_delay_min * 0.5, accumulated_runtime_hours * recovery_rate_per_hour)
                pred_delay = max(0.0, current_delay_min - potential_recovery)

            # Construct arrival timestamp string (assumed on base date)
            results.append({
                "station_code": station_code,
                "station_name": st_info.get("station_name", station_code),
                "distance_km": stop["distance_km"],
                "sched_arrival": sched_arr_str,
                "sched_departure": sched_dep_str,
                "predicted_delay_min": round(pred_delay, 1),
                "status": status,
                "model_type": "BASELINE_A_RULE"
            })

        return results
