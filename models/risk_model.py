import os
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from .data_loader import load_historical_disruptions

class RiskScoringModel:
    def __init__(self, pkl_path='models/risk_model.pkl'):
        self.pkl_path = pkl_path
        self.model = None
        self.is_trained = False
        self._load_or_train_model()

    def _load_or_train_model(self):
        """Loads pre-trained model from PKL file or trains if not found."""
        if os.path.exists(self.pkl_path):
            try:
                self.model = joblib.load(self.pkl_path)
                self.is_trained = True
                return
            except Exception as e:
                print(f"Failed to load {self.pkl_path}, retraining: {e}")

        # Train and serialize if PKL not found
        records = load_historical_disruptions()
        if not records:
            return
        
        X = []
        y = []
        for r in records:
            X.append([
                r['rainfall_24h_mm'],
                r['slope_deg'],
                r['soil_saturation'],
                r['base_vulnerability'],
                r['active_reports_count']
            ])
            y.append(r['disruption_level'])
            
        X = np.array(X)
        y = np.array(y)
        self.model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.06, max_depth=3, random_state=42)
        self.model.fit(X, y)
        self.is_trained = True
        try:
            os.makedirs(os.path.dirname(self.pkl_path), exist_ok=True)
            joblib.dump(self.model, self.pkl_path)
        except Exception:
            pass

    def calculate_risk(self, edge, district_weather, active_reports=0, horizon=None):
        """
        Calculates 0-100 risk score and explainable contributing factors.
        Horizon can be None (current), '24h', '48h', or '72h'.
        """
        # Determine rainfall based on horizon
        if horizon == '24h':
            rainfall = district_weather.get('forecast_24h_mm', 20.0)
        elif horizon == '48h':
            rainfall = district_weather.get('forecast_48h_mm', 30.0)
        elif horizon == '72h':
            rainfall = district_weather.get('forecast_72h_mm', 15.0)
        else:
            rainfall = district_weather.get('current_rainfall_mm', 10.0)
            
        slope = edge['slope_deg']
        soil = district_weather.get('soil_saturation_index', edge['soil_factor'])
        base_vuln = edge['base_vulnerability']
        
        # Feature vector
        feat = np.array([[rainfall, slope, soil, base_vuln, active_reports]])
        
        if self.is_trained:
            pred_raw = float(self.model.predict(feat)[0])
        else:
            # Fallback baseline formula
            pred_raw = (rainfall * 0.4) + (slope * 1.5) + (soil * 25.0) + (base_vuln * 30.0) + (active_reports * 15.0)
            
        # Add dynamic report boost
        if active_reports > 0:
            pred_raw += active_reports * 12.0

        risk_score = round(max(0.0, min(100.0, pred_raw)), 1)
        
        # Determine status
        if risk_score >= 70.0:
            status = 'blocked'
            severity = 'Critical'
        elif risk_score >= 50.0:
            status = 'high_risk'
            severity = 'Severe'
        elif risk_score >= 25.0:
            status = 'moderate_risk'
            severity = 'Caution'
        else:
            status = 'safe'
            severity = 'Normal'

        # Explainability Factor Attribution (Normalized 100% breakdown)
        f_rain = max(5.0, rainfall * 0.45)
        f_slope = max(5.0, slope * 1.2)
        f_soil = max(5.0, soil * 30.0)
        f_base = max(5.0, base_vuln * 35.0)
        f_reports = max(0.0, active_reports * 20.0)
        
        total_raw = f_rain + f_slope + f_soil + f_base + f_reports
        
        factors = [
            {
                'factor': 'Precipitation Intensity',
                'detail': f"{rainfall} mm rainfall ({'Observed' if not horizon else horizon.upper() + ' Forecast'})",
                'percentage': round((f_rain / total_raw) * 100, 1),
                'impact': 'High' if rainfall > 60 else 'Moderate' if rainfall > 25 else 'Low'
            },
            {
                'factor': 'Terrain Steepness & Slope',
                'detail': f"{slope}° gradient hill sector",
                'percentage': round((f_slope / total_raw) * 100, 1),
                'impact': 'High' if slope > 18 else 'Moderate' if slope > 10 else 'Low'
            },
            {
                'factor': 'Soil Saturation & Moisture Index',
                'detail': f"{round(soil * 100)}% soil water saturation",
                'percentage': round((f_soil / total_raw) * 100, 1),
                'impact': 'High' if soil > 0.75 else 'Moderate'
            },
            {
                'factor': 'Historical Landslide Vulnerability',
                'detail': f"{round(base_vuln * 100)}% historical zonation index",
                'percentage': round((f_base / total_raw) * 100, 1),
                'impact': 'High' if base_vuln > 0.6 else 'Moderate'
            }
        ]
        
        if active_reports > 0:
            factors.append({
                'factor': 'Active Ground Incident Reports',
                'detail': f"{active_reports} verified field obstacle report(s)",
                'percentage': round((f_reports / total_raw) * 100, 1),
                'impact': 'Critical'
            })
            
        # Sort factors by impact percentage descending
        factors = sorted(factors, key=lambda x: x['percentage'], reverse=True)

        return {
            'risk_score': risk_score,
            'status': status,
            'severity': severity,
            'rainfall_mm': rainfall,
            'slope_deg': slope,
            'soil_saturation': soil,
            'factors': factors
        }

# Global singleton model instance
risk_model = RiskScoringModel()
