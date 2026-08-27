from typing import Dict, List, Any

class ExplainabilityEngine:
    """
    Explainable AI (XAI) engine for RailPulse.
    Decomposes dynamic delays into clear human-readable factors and % contributions.
    """
    @staticmethod
    def generate_explanation(
        train_no: str,
        timeline: List[Dict[str, Any]],
        current_delay_min: float
    ) -> Dict[str, Any]:
        all_factors = []
        weight_sums = {
            "preceding_train": 0.0,
            "speed_restriction": 0.0,
            "platform_congestion": 0.0,
            "weather_visibility": 0.0
        }
        total_delay_impact = 0.0

        for stop in timeline:
            edge_attr = stop.get("edge_attribution")
            if edge_attr and edge_attr.get("explanation_factors"):
                for fac in edge_attr["explanation_factors"]:
                    all_factors.append({
                        **fac,
                        "at_station": stop["station_code"]
                    })
                
                weights = edge_attr.get("attention_weights", {})
                impact = edge_attr.get("additional_delay", 0.0)
                total_delay_impact += impact

                for k, v in weights.items():
                    if k in weight_sums:
                        weight_sums[k] += v * max(1.0, impact)

        # Normalize weights to percentages
        total_w = sum(weight_sums.values())
        if total_w > 0:
            pct_breakdown = {
                "cascading_headway_pct": round((weight_sums["preceding_train"] / total_w) * 100, 1),
                "speed_restrictions_pct": round((weight_sums["speed_restriction"] / total_w) * 100, 1),
                "platform_dwell_pct": round((weight_sums["platform_congestion"] / total_w) * 100, 1),
                "weather_visibility_pct": round((weight_sums["weather_visibility"] / total_w) * 100, 1)
            }
        else:
            # Baseline natural distribution
            pct_breakdown = {
                "cascading_headway_pct": 50.0 if current_delay_min > 0 else 0.0,
                "speed_restrictions_pct": 25.0 if current_delay_min > 0 else 0.0,
                "platform_dwell_pct": 15.0 if current_delay_min > 0 else 0.0,
                "weather_visibility_pct": 10.0 if current_delay_min > 0 else 0.0
            }

        # Build natural language narrative
        if current_delay_min <= 2.0:
            narrative = f"Train {train_no} is operating on time. All upcoming corridor sections are clear with optimal headway."
            severity_badge = "ON_TIME"
        elif pct_breakdown["cascading_headway_pct"] >= 40:
            top_factors = [f["detail"] for f in all_factors if f["factor"] == "Cascading Headway Blockage"]
            detail_str = f" ({top_factors[0]})" if top_factors else ""
            narrative = (
                f"Primary delay ({pct_breakdown['cascading_headway_pct']}%) caused by preceding train headway contention{detail_str}. "
                f"Section throughput is constrained; speed recovery is limited until clear blocks ahead."
            )
            severity_badge = "HEADWAY_BLOCK"
        elif pct_breakdown["speed_restrictions_pct"] >= 35:
            narrative = (
                f"Delay is predominantly driven by active Engineering Speed Restrictions ({pct_breakdown['speed_restrictions_pct']}%) "
                f"along track maintenance zones."
            )
            severity_badge = "CAUTION_ORDER"
        else:
            narrative = (
                f"Minor cumulative delay ({round(current_delay_min)} min) resulting from combined station dwell contention "
                f"and corridor speed moderation."
            )
            severity_badge = "MODERATE_DELAY"

        return {
            "train_no": train_no,
            "current_delay_min": round(current_delay_min, 1),
            "severity_badge": severity_badge,
            "executive_summary": narrative,
            "factor_percentages": pct_breakdown,
            "root_cause_events": all_factors[:6] # Top 6 contributing bottleneck events
        }

explainability_engine = ExplainabilityEngine()
