import time
import math
from .graph_engine import graph_engine

class VehicleSimulator:
    def __init__(self):
        self.vehicles = [
            {
                'id': 'VEH-MED-101',
                'name': 'Barak Lifeline Medical Express',
                'cargo_type': 'Emergency Pharmaceuticals & Blood Units',
                'priority': 'CRITICAL_MEDICAL',
                'origin': 'guwahati_hub',
                'destination': 'silchar_hub',
                'progress_pct': 35.0,
                'speed_kmh': 42.0,
                'status': 'EN_ROUTE_SAFE_DETOUR',
                'delay_min': 15,
                'lat': 25.4502,
                'lon': 92.2045,
                'driver': 'Sub-Inspector T. Sangma (BRO Transit Wing)'
            },
            {
                'id': 'VEH-OXY-204',
                'name': 'Meghalaya Cryo Oxygen Tanker',
                'cargo_type': 'Medical Liquid Oxygen Cylinders',
                'priority': 'CRITICAL_MEDICAL',
                'origin': 'guwahati_hub',
                'destination': 'shillong_hub',
                'progress_pct': 65.0,
                'speed_kmh': 45.0,
                'status': 'ON_SCHEDULE',
                'delay_min': 0,
                'lat': 25.7510,
                'lon': 91.9050,
                'driver': 'R. Das (State Oxygen Task Force)'
            },
            {
                'id': 'VEH-RATION-308',
                'name': 'FCI Essential Grain Carrier',
                'cargo_type': 'Rice & Pulses Relief Stock',
                'priority': 'FOOD_RATION',
                'origin': 'shillong_hub',
                'destination': 'jowai',
                'progress_pct': 45.0,
                'speed_kmh': 48.0,
                'status': 'ON_SCHEDULE',
                'delay_min': 5,
                'lat': 25.5480,
                'lon': 92.0520,
                'driver': 'B. Khongwir (FCI Logistics)'
            },
            {
                'id': 'VEH-FUEL-402',
                'name': 'IOCL Mountain Fuel Bowzer',
                'cargo_type': 'Diesel & Generator Fuel for Hospitals',
                'priority': 'FOOD_RATION',
                'origin': 'silchar_hub',
                'destination': 'haflong',
                'progress_pct': 25.0,
                'speed_kmh': 38.0,
                'status': 'CAUTION_HIGH_SLOPE',
                'delay_min': 20,
                'lat': 25.0450,
                'lon': 92.8450,
                'driver': 'A. Choudhury (IOCL Hills)'
            }
        ]
        self._route_cache = {}
        self.last_tick = time.time()

    def get_all_vehicles(self):
        self.update_positions()
        return self.vehicles

    def get_vehicle(self, vehicle_id):
        self.update_positions()
        for v in self.vehicles:
            if v['id'] == vehicle_id:
                return v
        return None

    def _get_vehicle_route(self, origin, destination, priority):
        """Computes and caches full route polyline for a vehicle convoy."""
        cache_key = f"{origin}_{destination}_{priority}"
        if cache_key in self._route_cache:
            return self._route_cache[cache_key]

        try:
            route_data = graph_engine.compute_route(origin, destination, priority=priority)
            safe_route = route_data.get('ai_recommended_route')
            if safe_route and safe_route.get('polyline_geometry'):
                geom = safe_route['polyline_geometry']
                self._route_cache[cache_key] = geom
                return geom
        except Exception:
            pass

        # Fallback to origin coordinates
        u_id = graph_engine.resolve_node_id(origin)
        v_id = graph_engine.resolve_node_id(destination)
        u_node = graph_engine.nodes.get(u_id, {'lat': 25.5, 'lon': 91.9})
        v_node = graph_engine.nodes.get(v_id, {'lat': 25.0, 'lon': 92.7})
        return [[u_node['lat'], u_node['lon']], [v_node['lat'], v_node['lon']]]

    def update_positions(self):
        """Simulates vehicle movement along active multi-hop route geometries."""
        now = time.time()
        dt = min(5.0, max(0.1, now - self.last_tick))
        self.last_tick = now

        for v in self.vehicles:
            route_geom = self._get_vehicle_route(v['origin'], v['destination'], v['priority'])
            if not route_geom or len(route_geom) < 2:
                continue

            # Advance progress smoothly along the route
            step = (v['speed_kmh'] * (dt / 3600.0) / max(10.0, 150.0)) * 100.0
            v['progress_pct'] = (v['progress_pct'] + step) % 100.0

            n_segments = len(route_geom) - 1
            segment_pct = 100.0 / n_segments
            
            seg_idx = min(int(v['progress_pct'] / segment_pct), n_segments - 1)
            sub_progress = (v['progress_pct'] % segment_pct) / segment_pct
            
            p1 = route_geom[seg_idx]
            p2 = route_geom[seg_idx + 1]
            
            v['lat'] = round(p1[0] + (p2[0] - p1[0]) * sub_progress, 5)
            v['lon'] = round(p1[1] + (p2[1] - p1[1]) * sub_progress, 5)

# Global singleton vehicle simulator
vehicle_simulator = VehicleSimulator()
