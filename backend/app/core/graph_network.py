import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import networkx as nx
from app.core.config import settings

class RailwayGraphNetwork:
    """
    Railway Network Graph representing Stations (Nodes) and Track Sections (Edges).
    Maintains static infrastructure and dynamic occupancy / speed restriction states.
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self.stations: Dict[str, Dict[str, Any]] = {}
        self.sections: Dict[str, Dict[str, Any]] = {}
        self.trains_metadata: Dict[str, Dict[str, Any]] = {}
        self._load_network_data()

    def _load_network_data(self):
        # 1. Load Stations
        if settings.STATIONS_FILE.exists():
            with open(settings.STATIONS_FILE, "r", encoding="utf-8") as f:
                stations_data = json.load(f)
                for st in stations_data:
                    code = st["station_code"]
                    self.stations[code] = st
                    self.graph.add_node(
                        code,
                        name=st["station_name"],
                        lat=st["latitude"],
                        lng=st["longitude"],
                        zone=st.get("zone", ""),
                        platforms=st.get("platforms", 4),
                        corridor_km=st.get("corridor_km", 0.0),
                        loop_lines=st.get("has_loop_lines", True),
                        junction_type=st.get("junction_type", "Station")
                    )

        # 2. Load Track Sections (Bidirectional edges)
        if settings.SECTIONS_FILE.exists():
            with open(settings.SECTIONS_FILE, "r", encoding="utf-8") as f:
                sections_data = json.load(f)
                for sec in sections_data:
                    u = sec["from_station"]
                    v = sec["to_station"]
                    sec_id_down = f"{u}-{v}"
                    sec_id_up = f"{v}-{u}"
                    
                    # DOWN direction edge
                    self.sections[sec_id_down] = {
                        **sec,
                        "id": sec_id_down,
                        "direction": "DOWN",
                        "active_tsr": 0, # Temporary Speed Restriction (0 = none)
                        "occupants": [], # Train numbers currently occupying
                        "congestion_index": 0.0
                    }
                    self.graph.add_edge(
                        u, v,
                        distance_km=sec["distance_km"],
                        max_speed_kmph=sec["max_speed_kmph"],
                        nominal_runtime_min=sec["nominal_runtime_min"],
                        num_tracks=sec["num_tracks"],
                        section_id=sec_id_down
                    )

                    # UP direction edge
                    self.sections[sec_id_up] = {
                        **sec,
                        "id": sec_id_up,
                        "from_station": v,
                        "to_station": u,
                        "direction": "UP",
                        "active_tsr": 0,
                        "occupants": [],
                        "congestion_index": 0.0
                    }
                    self.graph.add_edge(
                        v, u,
                        distance_km=sec["distance_km"],
                        max_speed_kmph=sec["max_speed_kmph"],
                        nominal_runtime_min=sec["nominal_runtime_min"],
                        num_tracks=sec["num_tracks"],
                        section_id=sec_id_up
                    )

        # 3. Load Train Timetable
        if settings.TIMETABLE_FILE.exists():
            with open(settings.TIMETABLE_FILE, "r", encoding="utf-8") as f:
                trains_data = json.load(f)
                for tr in trains_data:
                    self.trains_metadata[tr["train_no"]] = tr

    def get_section(self, from_station: str, to_station: str) -> Optional[Dict[str, Any]]:
        sec_id = f"{from_station}-{to_station}"
        return self.sections.get(sec_id)

    def get_station_info(self, station_code: str) -> Optional[Dict[str, Any]]:
        return self.stations.get(station_code)

    def get_all_stations(self) -> List[Dict[str, Any]]:
        return list(self.stations.values())

    def get_all_sections(self) -> List[Dict[str, Any]]:
        return list(self.sections.values())

    def update_section_occupancy(self, section_id: str, train_no: str, is_entering: bool):
        sec = self.sections.get(section_id)
        if sec:
            if is_entering and train_no not in sec["occupants"]:
                sec["occupants"].append(train_no)
            elif not is_entering and train_no in sec["occupants"]:
                sec["occupants"].remove(train_no)
            
            # Recalculate congestion index based on track count and occupants
            tracks = max(1, sec.get("num_tracks", 2))
            count = len(sec["occupants"])
            sec["congestion_index"] = min(1.0, count / (tracks * 1.5))

    def set_temporary_speed_restriction(self, section_id: str, tsr_kmph: int):
        if section_id in self.sections:
            self.sections[section_id]["active_tsr"] = tsr_kmph

    def clear_speed_restriction(self, section_id: str):
        if section_id in self.sections:
            self.sections[section_id]["active_tsr"] = 0

railway_network = RailwayGraphNetwork()
