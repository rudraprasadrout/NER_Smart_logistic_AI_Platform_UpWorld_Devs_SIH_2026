import os
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from models.data_loader import load_historical_disruptions

def train_and_save_model(pkl_path='models/risk_model.pkl'):
    records = load_historical_disruptions()
    if not records:
        print("No historical disruption records found!")
        return None
    
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
    
    # Train robust Gradient Boosting Regressor
    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.06,
        max_depth=3,
        subsample=0.9,
        random_state=42
    )
    model.fit(X, y)
    
    # Save to PKL
    os.makedirs(os.path.dirname(pkl_path), exist_ok=True)
    joblib.dump(model, pkl_path)
    print(f"Successfully trained and serialized ML model to {pkl_path}")
    print(f"Feature importances: {model.feature_importances_}")
    return model

if __name__ == '__main__':
    train_and_save_model()
