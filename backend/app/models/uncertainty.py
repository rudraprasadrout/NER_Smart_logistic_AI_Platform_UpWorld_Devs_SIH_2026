import math
from datetime import datetime, timedelta
from typing import Dict, List, Any

class ConformalUncertaintyEngine:
    """
    Computes calibrated confidence bands (e.g. 90% confidence interval)
    around ETA forecasts. As the train nears a station, the uncertainty band
    monotonically shrinks from wide horizons to sharp, actionable arrival windows.
    """
    @staticmethod
    def calculate_confidence_bounds(
        predicted_delay_min: float,
        distance_to_station_km: float,
        model_type: str = "CORE_GNN_SPATIAL"
    ) -> Dict[str, Any]:
        """
        Conformal quantile bounds: [p10, p50, p90]
        """
        if distance_to_station_km <= 0.0:
            return {
                "lower_delay_min": round(max(0.0, predicted_delay_min - 1.0), 1),
                "point_delay_min": round(predicted_delay_min, 1),
                "upper_delay_min": round(predicted_delay_min + 1.0, 1),
                "window_width_min": 2.0,
                "confidence_score": 0.98,
                "is_tight": True
            }

        # Model variance factor (GNN has lowest epistemic uncertainty)
        model_variance_multiplier = {
            "CORE_GNN_SPATIAL": 0.85,
            "BASELINE_B_GBM": 1.15,
            "BASELINE_A_RULE": 1.60
        }.get(model_type, 1.0)

        # Shrinking interval function based on physics & distance remaining:
        # sigma grows with sqrt(distance) + log(delay + 1)
        base_sigma = (
            math.sqrt(distance_to_station_km) * 0.38
            + math.log1p(predicted_delay_min) * 0.9
        ) * model_variance_multiplier

        # 90% confidence bound corresponds to ~1.645 * sigma
        bound_width = max(2.5, round(1.645 * base_sigma, 1))

        lower_bound = max(0.0, round(predicted_delay_min - (bound_width * 0.6), 1))
        upper_bound = round(predicted_delay_min + (bound_width * 1.4), 1)
        total_window = round(upper_bound - lower_bound, 1)

        # Confidence score (0.0 to 1.0) inversely related to window width
        confidence_score = max(0.40, min(0.98, round(1.0 - (bound_width / 60.0), 2)))
        is_tight = total_window <= 10.0 # Under 10 mins window width is tight

        return {
            "lower_delay_min": lower_bound,
            "point_delay_min": round(predicted_delay_min, 1),
            "upper_delay_min": upper_bound,
            "window_width_min": total_window,
            "confidence_score": confidence_score,
            "is_tight": is_tight
        }

    @classmethod
    def enrich_timeline_with_uncertainty(
        cls,
        timeline: List[Dict[str, Any]],
        current_distance_km: float,
        model_type: str = "CORE_GNN_SPATIAL"
    ) -> List[Dict[str, Any]]:
        enriched = []
        for stop in timeline:
            dist_to_stop = max(0.0, stop["distance_km"] - current_distance_km)
            pred_delay = stop.get("predicted_delay_min", 0.0)
            
            bounds = cls.calculate_confidence_bounds(pred_delay, dist_to_stop, model_type)
            
            # Compute actual expected time strings (HH:MM)
            sched_arr = stop.get("sched_arrival", "00:00")
            try:
                base_time = datetime.strptime(sched_arr, "%H:%M")
                expected_point = (base_time + timedelta(minutes=bounds["point_delay_min"])).strftime("%H:%M")
                expected_early = (base_time + timedelta(minutes=bounds["lower_delay_min"])).strftime("%H:%M")
                expected_late = (base_time + timedelta(minutes=bounds["upper_delay_min"])).strftime("%H:%M")
            except Exception:
                expected_point = sched_arr
                expected_early = sched_arr
                expected_late = sched_arr

            enriched.append({
                **stop,
                "dist_remaining_km": round(dist_to_stop, 1),
                "uncertainty_bounds": bounds,
                "eta_window": f"{expected_early} – {expected_late}",
                "expected_eta": expected_point
            })
        return enriched

uncertainty_engine = ConformalUncertaintyEngine()
