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
                'priority': 'CRITICAL',
                'origin': 'guwahati_hub',
                'destination': 'silchar_hub',
                'current_edge': 'e_jowai_umrangso',
                'progress_pct': 35.0,
                'speed_kmh': 42.0,
                'status': 'EN_ROUTE_SAFE_DETOUR',
                'delay_min': 15,
                'lat': 25.4800,
                'lon': 92.4800,
                'driver': 'T. Sangma (BRO Transit Wing)'
            },
            {
                'id': 'VEH-OXY-204',
                'name': 'Meghalaya Cryo Oxygen Tanker',
                'cargo_type': 'Medical Liquid Oxygen Cylinders',
                'priority': 'CRITICAL',
                'origin': 'guwahati_hub',
                'destination': 'shillong_hub',
                'current_edge': 'e_nongpoh_shillong',
                'progress_pct': 72.0,
                'speed_kmh': 45.0,
                'status': 'ON_SCHEDULE',
                'delay_min': 0,
                'lat': 25.6890,
                'lon': 91.8840,
                'driver': 'R. Das'
            },
            {
                'id': 'VEH-RATION-308',
                'name': 'FCI Essential Grain Carrier',
                'cargo_type': 'Rice & Pulses Relief Stock',
                'priority': 'HIGH',
                'origin': 'shillong_hub',
                'destination': 'jowai',
                'current_edge': 'e_shillong_jowai',
                'progress_pct': 50.0,
                'speed_kmh': 48.0,
                'status': 'ON_SCHEDULE',
                'delay_min': 5,
                'lat': 25.5340,
                'lon': 92.0520,
                'driver': 'B. Khongwir'
            },
            {
                'id': 'VEH-FUEL-402',
                'name': 'IOCL Mountain Fuel Bowzer',
                'cargo_type': 'Diesel & Generator Fuel for Hospitals',
                'priority': 'HIGH',
                'origin': 'silchar_hub',
                'destination': 'haflong',
                'current_edge': 'e_haflong_silchar',
                'progress_pct': 20.0,
                'speed_kmh': 38.0,
                'status': 'CAUTION_HIGH_SLOPE',
                'delay_min': 25,
                'lat': 24.9800,
                'lon': 92.9200,
                'driver': 'A. Choudhury'
            }
        ]
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

    def update_positions(self):
        """Simulates vehicle movement along active edge geometries."""
        now = time.time()
        dt = min(5.0, now - self.last_tick)
        self.last_tick = now

        for v in self.vehicles:
            # Advance progress slightly
            inc = (v['speed_kmh'] * (dt / 3600.0) / 50.0) * 100.0
            v['progress_pct'] = (v['progress_pct'] + inc) % 100.0

            # Interpolate lat/lon on current edge
            edge_id = v['current_edge']
            edge_data = next((e for e in graph_engine.edges if e['id'] == edge_id), None)
            if edge_data and edge_data.get('geometry') and len(edge_data['geometry']) >= 2:
                geom = edge_data['geometry']
                n_segments = len(geom) - 1
                segment_pct = 100.0 / n_segments
                
                seg_idx = min(int(v['progress_pct'] / segment_pct), n_segments - 1)
                sub_progress = (v['progress_pct'] % segment_pct) / segment_pct
                
                p1 = geom[seg_idx]
                p2 = geom[seg_idx + 1]
                
                v['lat'] = round(p1[0] + (p2[0] - p1[0]) * sub_progress, 5)
                v['lon'] = round(p1[1] + (p2[1] - p1[1]) * sub_progress, 5)

# Global singleton vehicle simulator
vehicle_simulator = VehicleSimulator()
