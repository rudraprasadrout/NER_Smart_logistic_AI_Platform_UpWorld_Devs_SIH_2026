import os
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import cross_val_score, KFold
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
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
            r['base_vulnerability']
        ])
        y.append(r['disruption_level'])
        
    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.float32)
    
    # Train high-precision Gradient Boosting Regressor
    model = GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.9,
        random_state=42
    )
    model.fit(X, y)
    
    # Cross-validation & Accuracy
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X, y, cv=cv, scoring='r2')
    y_pred = model.predict(X)
    r2 = r2_score(y, y_pred)
    mae = mean_absolute_error(y, y_pred)
    rmse = np.sqrt(mean_squared_error(y, y_pred))

    # Save to PKL
    os.makedirs(os.path.dirname(pkl_path), exist_ok=True)
    joblib.dump(model, pkl_path)
    
    feat_names = ['Precipitation (24h mm)', 'Slope Gradient (deg)', 'Soil Saturation Index', 'Geotechnical Vulnerability']
    
    print("=" * 50)
    print("PATHNER ML RISK MODEL TRAINING REPORT")
    print("=" * 50)
    print(f"Dataset Records: {len(records)}")
    print(f"R^2 Score: {r2 * 100:.2f}%")
    print(f"5-Fold CV R^2: {np.mean(cv_scores) * 100:.2f}% (+/- {np.std(cv_scores) * 100:.2f}%)")
    print(f"Mean Absolute Error (MAE): {mae:.2f} risk points")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")
    print("\nFeature Importances:")
    for name, imp in sorted(zip(feat_names, model.feature_importances_), key=lambda x: x[1], reverse=True):
        print(f" - {name:<30}: {imp * 100:.1f}%")
    print(f"\nModel saved successfully to: {pkl_path}")
    print("=" * 50)
    return model

if __name__ == '__main__':
    train_and_save_model()
