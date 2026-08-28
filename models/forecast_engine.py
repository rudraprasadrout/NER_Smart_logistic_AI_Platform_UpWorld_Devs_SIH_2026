from .data_loader import load_edges, load_weather
from .risk_model import risk_model

class ForecastEngine:
    @staticmethod
    def get_forecast_timeline(edges_data=None, weather_data=None):
        """
        Computes risk scores across 4 time horizons: current, 24h, 48h, 72h.
        """
        if edges_data is None:
            edges_data = load_edges()
        if weather_data is None:
            weather_data = load_weather()

        horizons = ['current', '24h', '48h', '72h']
        timeline = {}

        for h in horizons:
            horizon_param = None if h == 'current' else h
            edge_results = []
            
            for edge in edges_data:
                district = edge.get('district_context', 'East Khasi Hills')
                w = weather_data.get(district, {
                    'current_rainfall_mm': 15.0,
                    'forecast_24h_mm': 25.0,
                    'forecast_48h_mm': 35.0,
                    'forecast_72h_mm': 20.0,
                    'soil_saturation_index': 0.5
                })
                
                risk_eval = risk_model.calculate_risk(edge, w, active_reports=0, horizon=horizon_param)
                edge_results.append({
                    'edge_id': edge['id'],
                    'name': edge['name'],
                    'u': edge['u'],
                    'v': edge['v'],
                    'risk_score': risk_eval['risk_score'],
                    'status': risk_eval['status'],
                    'rainfall_mm': risk_eval['rainfall_mm'],
                    'severity': risk_eval['severity'],
                    'factors': risk_eval['factors']
                })
                
            timeline[h] = edge_results

        return timeline
