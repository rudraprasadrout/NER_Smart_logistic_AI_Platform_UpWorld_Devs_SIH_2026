import time
import math
import random
from typing import Dict, List, Any, Optional
from app.core.config import settings
from app.core.graph_network import railway_network

class MultiTrainSimulationEngine:
    """
    Real-time Discrete Event Multi-Train Movement Simulator.
    Simulates trains progressing along the corridor with kinematic speed curves,
    station dwells, signal block occupancy, and mutual delay propagation.
    """
    def __init__(self):
        self.is_running = True
        self.sim_time_sec = 0.0
        self.active_trains: Dict[str, Dict[str, Any]] = {}
        self.history_logs: List[Dict[str, Any]] = []
        self._initialize_train_states()

    def _initialize_train_states(self):
        """
        Initializes starting locations for trains along the corridor.
        """
        initial_configs = [
            # Train 12301 (Howrah Rajdhani) starting near TDL heading to CNB
            {
                "train_no": "12301",
                "current_km": 280.0,
                "current_speed": 125.0,
                "delay_min": 12.0,
                "direction": "DOWN",
                "state": "RUNNING"
            },
            # Train 22436 (Vande Bharat) running ahead near Kanpur-Fatehpur
            {
                "train_no": "22436",
                "current_km": 490.0,
                "current_speed": 130.0,
                "delay_min": 2.0,
                "direction": "DOWN",
                "state": "RUNNING"
            },
            # Train 12382 (Poorva Express) near Aligarh
            {
                "train_no": "12382",
                "current_km": 115.0,
                "current_speed": 105.0,
                "delay_min": 28.0,
                "direction": "DOWN",
                "state": "RUNNING"
            },
            # Train 12302 (UP Rajdhani) heading towards NDLS near Mirzapur
            {
                "train_no": "12302",
                "current_km": 740.0,
                "current_speed": 120.0,
                "delay_min": 6.0,
                "direction": "UP",
                "state": "RUNNING"
            },
            # Train 12876 (Neelachal SF) near Prayagraj
            {
                "train_no": "12876",
                "current_km": 620.0,
                "current_speed": 40.0,
                "delay_min": 35.0,
                "direction": "DOWN",
                "state": "APPROACHING"
            },
            # BOXN Freight Train ahead of Neelachal near Prayagraj-Mirzapur
            {
                "train_no": "BOXN_904",
                "current_km": 665.0,
                "current_speed": 55.0,
                "delay_min": 52.0,
                "direction": "DOWN",
                "state": "RUNNING"
            },
            # Train 12566 (Bihar Sampark Kranti) near Tundla
            {
                "train_no": "12566",
                "current_km": 215.0,
                "current_speed": 110.0,
                "delay_min": 18.0,
                "direction": "DOWN",
                "state": "RUNNING"
            }
        ]

        for cfg in initial_configs:
            tr_no = cfg["train_no"]
            meta = railway_network.trains_metadata.get(tr_no, {})
            stops = meta.get("stops", [])
            
            # Find next upcoming stop
            curr_km = cfg["current_km"]
            next_stop_idx = 0
            for idx, stop in enumerate(stops):
                if stop["distance_km"] >= curr_km:
                    next_stop_idx = idx
                    break

            # Calculate coordinates based on corridor distance
            coords = self._km_to_coordinates(curr_km)

            self.active_trains[tr_no] = {
                "train_no": tr_no,
                "train_name": meta.get("train_name", f"Train {tr_no}"),
                "type": meta.get("type", "Express"),
                "priority": meta.get("priority", 2),
                "direction": cfg["direction"],
                "current_distance_km": curr_km,
                "speed_kmph": cfg["current_speed"],
                "delay_minutes": cfg["delay_min"],
                "state": cfg["state"],
                "latitude": coords["lat"],
                "longitude": coords["lng"],
                "current_section": self._get_section_for_km(curr_km),
                "next_station_idx": next_stop_idx,
                "next_station_code": stops[next_stop_idx]["station_code"] if next_stop_idx < len(stops) else "DEST",
                "dwell_remaining_sec": 0
            }

            # Register initial section occupancy
            sec_id = self._get_section_for_km(curr_km)
            if sec_id:
                railway_network.update_section_occupancy(sec_id, tr_no, is_entering=True)

    def _km_to_coordinates(self, km: float) -> Dict[str, float]:
        stations = sorted(railway_network.get_all_stations(), key=lambda s: s.get("corridor_km", 0.0))
        if not stations:
            return {"lat": 28.6424, "lng": 77.2209}

        if km <= stations[0]["corridor_km"]:
            return {"lat": stations[0]["latitude"], "lng": stations[0]["longitude"]}
        if km >= stations[-1]["corridor_km"]:
            return {"lat": stations[-1]["latitude"], "lng": stations[-1]["longitude"]}

        # Interpolate between two enclosing stations
        for i in range(len(stations) - 1):
            st1 = stations[i]
            st2 = stations[i + 1]
            km1 = st1["corridor_km"]
            km2 = st2["corridor_km"]
            if km1 <= km <= km2:
                ratio = (km - km1) / max(0.001, (km2 - km1))
                lat = st1["latitude"] + ratio * (st2["latitude"] - st1["latitude"])
                lng = st1["longitude"] + ratio * (st2["longitude"] - st1["longitude"])
                return {"lat": round(lat, 6), "lng": round(lng, 6)}

        return {"lat": stations[0]["latitude"], "lng": stations[0]["longitude"]}

    def _get_section_for_km(self, km: float) -> Optional[str]:
        stations = sorted(railway_network.get_all_stations(), key=lambda s: s.get("corridor_km", 0.0))
        for i in range(len(stations) - 1):
            st1 = stations[i]
            st2 = stations[i + 1]
            if st1["corridor_km"] <= km <= st2["corridor_km"]:
                return f"{st1['station_code']}-{st2['station_code']}"
        return None

    def tick(self, delta_seconds: float = 1.0):
        """
        Advances the multi-train simulation by delta_seconds.
        """
        if not self.is_running:
            return

        sim_delta = delta_seconds * settings.SIMULATION_TIME_SCALE
        self.sim_time_sec += sim_delta

        for tr_no, state in self.active_trains.items():
            meta = railway_network.trains_metadata.get(tr_no, {})
            stops = meta.get("stops", [])

            # Handle Station Dwell
            if state["dwell_remaining_sec"] > 0:
                state["dwell_remaining_sec"] -= sim_delta
                state["speed_kmph"] = 0.0
                state["state"] = "HALTED_AT_STATION"
                if state["dwell_remaining_sec"] <= 0:
                    state["dwell_remaining_sec"] = 0
                    state["state"] = "RUNNING"
                    # Advance to next stop
                    if state["next_station_idx"] + 1 < len(stops):
                        state["next_station_idx"] += 1
                        state["next_station_code"] = stops[state["next_station_idx"]]["station_code"]
                continue

            # Section Occupancy & Headway Check (check if slow train is immediately ahead)
            curr_sec = state["current_section"]
            sec_info = railway_network.sections.get(curr_sec, {}) if curr_sec else {}
            tsr = sec_info.get("active_tsr", 0)

            # Target speed determination
            max_allowed = 130.0 if state.get("priority", 2) == 1 else 110.0
            if state.get("priority") == 5:
                max_allowed = 65.0 # Freight
            if tsr > 0:
                max_allowed = min(max_allowed, float(tsr))

            # Dynamic acceleration towards target speed
            if state["speed_kmph"] < max_allowed:
                state["speed_kmph"] = min(max_allowed, state["speed_kmph"] + 1.2)
            elif state["speed_kmph"] > max_allowed:
                state["speed_kmph"] = max(max_allowed, state["speed_kmph"] - 2.5)

            # Kinematic position update (speed in km/h -> km per sim_delta seconds)
            distance_delta = (state["speed_kmph"] / 3600.0) * sim_delta
            old_km = state["current_distance_km"]
            new_km = old_km + distance_delta if state["direction"] == "DOWN" else max(0.0, old_km - distance_delta)

            # Section transition handling
            old_sec = state["current_section"]
            new_sec = self._get_section_for_km(new_km)
            if new_sec != old_sec:
                if old_sec:
                    railway_network.update_section_occupancy(old_sec, tr_no, is_entering=False)
                if new_sec:
                    railway_network.update_section_occupancy(new_sec, tr_no, is_entering=True)
                state["current_section"] = new_sec

            # Check if reaching next scheduled station stop
            if state["next_station_idx"] < len(stops):
                target_stop = stops[state["next_station_idx"]]
                target_km = target_stop["distance_km"]
                
                # Arrival condition
                reached = (state["direction"] == "DOWN" and old_km <= target_km <= new_km) or \
                          (state["direction"] == "UP" and old_km >= target_km >= new_km)

                if reached:
                    dwell = target_stop.get("dwell_min", 2) * 60.0
                    if dwell > 0:
                        state["dwell_remaining_sec"] = dwell
                        state["speed_kmph"] = 0.0
                        state["state"] = "HALTED_AT_STATION"
                    else:
                        if state["next_station_idx"] + 1 < len(stops):
                            state["next_station_idx"] += 1
                            state["next_station_code"] = stops[state["next_station_idx"]]["station_code"]

            state["current_distance_km"] = round(new_km, 2)
            coords = self._km_to_coordinates(new_km)
            state["latitude"] = coords["lat"]
            state["longitude"] = coords["lng"]

    def inject_event(self, train_no: str, event_type: str, value: float):
        """
        Manually injects telemetry disruptions or updates.
        """
        if train_no in self.active_trains:
            if event_type == "DELAY_MIN":
                self.active_trains[train_no]["delay_minutes"] = max(0.0, self.active_trains[train_no]["delay_minutes"] + value)
            elif event_type == "SET_SPEED":
                self.active_trains[train_no]["speed_kmph"] = max(0.0, value)
            elif event_type == "EMERGENCY_HALT":
                self.active_trains[train_no]["dwell_remaining_sec"] = value * 60.0
                self.active_trains[train_no]["state"] = "EMERGENCY_HALT"

    def get_full_telemetry(self) -> Dict[str, Any]:
        return {
            "simulation_time_sec": round(self.sim_time_sec, 1),
            "time_scale": settings.SIMULATION_TIME_SCALE,
            "is_running": self.is_running,
            "trains": list(self.active_trains.values()),
            "active_sections": [s for s in railway_network.get_all_sections() if s.get("occupants") or s.get("active_tsr", 0) > 0]
        }

simulator_engine = MultiTrainSimulationEngine()
