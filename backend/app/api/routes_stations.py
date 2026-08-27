from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.core.graph_network import railway_network
from app.simulator.multi_train_engine import simulator_engine
from app.models.gnn_model import gnn_engine
from app.models.uncertainty import uncertainty_engine

router = APIRouter(prefix="/api/v1", tags=["Stations & Live Boards"])

@router.get("/stations")
def list_stations():
    """Returns all stations along the corridor network."""
    return railway_network.get_all_stations()

@router.get("/station/{station_code}/arrivals")
def get_station_arrivals(station_code: str):
    """
    Live Station Arrival Board displaying all trains approaching the station,
    their dynamic ETA, confidence band, and assigned platform.
    """
    st_info = railway_network.get_station_info(station_code.upper())
    if not st_info:
        raise HTTPException(status_code=404, detail=f"Station {station_code} not found")

    target_code = station_code.upper()
    target_km = st_info.get("corridor_km", 0.0)
    arrivals = []

    for tr_no, meta in railway_network.trains_metadata.items():
        stops = meta.get("stops", [])
        # Check if train stops at this station
        matched_stop_idx = None
        for idx, stop in enumerate(stops):
            if stop["station_code"] == target_code:
                matched_stop_idx = idx
                break

        if matched_stop_idx is not None:
            live_state = simulator_engine.active_trains.get(tr_no)
            if live_state:
                curr_idx = live_state.get("next_station_idx", 0)
                curr_km = live_state.get("current_distance_km", 0.0)
                curr_delay = live_state.get("delay_minutes", 0.0)
                
                # Only include trains that haven't already departed the station
                if curr_idx <= matched_stop_idx:
                    # Run GNN ETA
                    timeline = gnn_engine.predict_eta_timeline(
                        tr_no, curr_delay, curr_idx, simulator_engine.active_trains
                    )
                    enriched = uncertainty_engine.enrich_timeline_with_uncertainty(
                        timeline, current_distance_km=curr_km, model_type="CORE_GNN_SPATIAL"
                    )
                    
                    target_entry = enriched[matched_stop_idx]
                    status = "APPROACHING" if target_entry["dist_remaining_km"] < 30.0 else "EN_ROUTE"
                    if curr_idx == matched_stop_idx and live_state.get("dwell_remaining_sec", 0) > 0:
                        status = "AT_PLATFORM"

                    # Platform allocation heuristics
                    platform_num = (int(tr_no.replace("BOXN_", "").replace("tr_", "")[-1:]) % st_info.get("platforms", 6)) + 1

                    arrivals.append({
                        "train_no": tr_no,
                        "train_name": meta.get("train_name"),
                        "type": meta.get("type"),
                        "direction": meta.get("direction"),
                        "scheduled_arrival": target_entry["sched_arrival"],
                        "expected_eta": target_entry["expected_eta"],
                        "eta_window": target_entry["eta_window"],
                        "predicted_delay_min": target_entry["predicted_delay_min"],
                        "confidence_score": target_entry["uncertainty_bounds"]["confidence_score"],
                        "dist_remaining_km": target_entry["dist_remaining_km"],
                        "platform": f"PF-{platform_num}",
                        "status": status
                    })

    # Sort arrivals by expected ETA
    arrivals.sort(key=lambda x: x["expected_eta"])

    return {
        "station_code": target_code,
        "station_name": st_info.get("station_name"),
        "zone": st_info.get("zone"),
        "total_platforms": st_info.get("platforms"),
        "active_arrivals_count": len(arrivals),
        "arrivals": arrivals
    }
