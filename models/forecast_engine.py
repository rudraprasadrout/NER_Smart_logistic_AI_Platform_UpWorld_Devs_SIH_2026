from .data_loader import load_edges, load_weather
from .risk_model import risk_model

class ForecastEngine:
    _cached_timeline = {}
    _cached_weather_stamp = 0

    @classmethod
    def clear_cache(cls):
        cls._cached_timeline.clear()
        cls._cached_weather_stamp = 0

    @classmethod
    def get_forecast_timeline(cls, edges_data=None, weather_data=None):
        """
        Computes risk projections across 4 horizons (current, 24h, 48h, 72h) in batch.
        Caches results in memory for instantaneous (0ms) response.
        """
        if weather_data is None:
            weather_data = load_weather()

        # Check in-memory cache
        if cls._cached_timeline and edges_data is None:
            return cls._cached_timeline

        if edges_data is None:
            edges_data = load_edges()

        horizons = ['current', '24h', '48h', '72h']
        timeline = {}

        for h in horizons:
            horizon_param = None if h == 'current' else h
            batch_evals = risk_model.calculate_risk_batch(edges_data, weather_data, horizon=horizon_param)
            
            edge_results = []
            for i, edge in enumerate(edges_data):
                risk_eval = batch_evals[i]
                edge_results.append({
                    'id': edge['id'],
                    'edge_id': edge['id'],
                    'name': edge['name'],
                    'u': edge['u'],
                    'v': edge['v'],
                    'risk_score': risk_eval['risk_score'],
                    'status': risk_eval['status'],
                    'rainfall_mm': risk_eval['rainfall_mm'],
                    'severity': risk_eval['severity'],
                    'slope_deg': edge.get('slope_deg', 5.0),
                    'distance_km': edge.get('distance_km', 10.0),
                    'district_context': edge.get('district_context', 'Assam-Meghalaya')
                    
                })
                
            timeline[h] = edge_results

        cls._cached_timeline = timeline
        return timeline
