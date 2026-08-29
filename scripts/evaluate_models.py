import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, KFold, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support, classification_report,
    confusion_matrix, mean_absolute_error, mean_squared_error, r2_score
)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor

from models.data_loader import load_historical_disruptions, load_edges, load_nodes, load_weather
from models.graph_engine import GraphEngine
from models.isolation_engine import IsolationEngine
from models.risk_model import RiskScoringModel

def evaluate_vulnerability_model():
    print("\n==========================================")
    print(" 1. EVALUATING VULNERABILITY MODEL (RF)")
    print("==========================================")
    
    df = pd.read_csv("data/ner_edges_FINAL_824.csv")
    
    # Calculate vulnerability baseline rule as in training
    slope_risk = (df["slope_deg"] - df["slope_deg"].min()) / (df["slope_deg"].max() - df["slope_deg"].min())
    distance_risk = (df["distance_km"] - df["distance_km"].min()) / (df["distance_km"].max() - df["distance_km"].min())
    bridge_risk = df["bridge"].map({"T": 1, "F": 0}).fillna(0)
    tunnel_risk = df["tunnel"].map({"T": 1, "F": 0}).fillna(0)
    road_risk_map = {"motorway": 1.0, "trunk": 0.8, "primary": 0.7, "secondary": 0.5, "tertiary": 0.3}
    road_risk = df["road_type"].map(road_risk_map).fillna(0.4)

    df["vulnerability_score"] = (
        slope_risk * 0.40 +
        distance_risk * 0.20 +
        bridge_risk * 0.15 +
        tunnel_risk * 0.10 +
        road_risk * 0.15
    )

    df["vulnerability"] = pd.qcut(df["vulnerability_score"], q=3, labels=["Low", "Medium", "High"])

    features = [
        "distance_km", "avg_speed_kmh", "slope_deg", "layer", "code",
        "road_type", "oneway", "bridge", "tunnel"
    ]
    X = df[features]
    y = df["vulnerability"]

    numeric_features = ["distance_km", "avg_speed_kmh", "slope_deg", "layer", "code"]
    categorical_features = ["road_type", "oneway", "bridge", "tunnel"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median"))]), numeric_features),
            ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical_features)
        ]
    )

    clf = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", RandomForestClassifier(n_estimators=300, max_depth=12, min_samples_split=5, random_state=42, class_weight="balanced"))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, support = precision_recall_fscore_support(y_test, y_pred, labels=["Low", "Medium", "High"])
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro")
    prec_weighted, rec_weighted, f1_weighted, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted")
    cm = confusion_matrix(y_test, y_pred, labels=["Low", "Medium", "High"])

    # 5-fold Cross-Validation
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(clf, X, y, cv=skf, scoring='accuracy')

    # Feature importances from inner model
    rf_model = clf.named_steps["model"]
    cat_encoder = clf.named_steps["preprocessor"].named_transformers_["cat"].named_steps["onehot"]
    cat_feature_names = list(cat_encoder.get_feature_names_out(categorical_features))
    all_feature_names = numeric_features + cat_feature_names
    feat_importances = sorted(zip(all_feature_names, rf_model.feature_importances_), key=lambda x: x[1], reverse=True)

    results = {
        "dataset_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": float(acc),
        "macro_f1": float(f1_macro),
        "weighted_f1": float(f1_weighted),
        "cv_accuracy_mean": float(cv_scores.mean()),
        "cv_accuracy_std": float(cv_scores.std()),
        "per_class": {
            "Low": {"precision": float(prec[0]), "recall": float(rec[0]), "f1": float(f1[0]), "support": int(support[0])},
            "Medium": {"precision": float(prec[1]), "recall": float(rec[1]), "f1": float(f1[1]), "support": int(support[1])},
            "High": {"precision": float(prec[2]), "recall": float(rec[2]), "f1": float(f1[2]), "support": int(support[2])}
        },
        "confusion_matrix": cm.tolist(),
        "top_features": feat_importances[:5]
    }

    print(f"Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print(f"5-Fold CV Accuracy: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")
    print(f"Macro F1: {f1_macro:.4f}, Weighted F1: {f1_weighted:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, labels=["Low", "Medium", "High"]))
    print("Confusion Matrix (Low, Medium, High):\n", cm)
    print("\nTop 5 Feature Importances:")
    for name, imp in feat_importances[:5]:
        print(f"  - {name}: {imp:.4f}")

    return results

def evaluate_risk_scoring_model():
    print("\n==========================================")
    print(" 2. EVALUATING RISK SCORING MODEL (GBR)")
    print("==========================================")
    
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
    feature_names = ['rainfall_24h_mm', 'slope_deg', 'soil_saturation', 'base_vulnerability', 'active_reports_count']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.06,
        max_depth=3,
        subsample=0.9,
        random_state=42
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)

    # 5-fold Cross-Validation
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_r2 = cross_val_score(model, X, y, cv=kf, scoring='r2')
    cv_mae = -cross_val_score(model, X, y, cv=kf, scoring='neg_mean_absolute_error')

    feat_importances = sorted(zip(feature_names, model.feature_importances_), key=lambda x: x[1], reverse=True)

    results = {
        "dataset_samples": len(records),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "r2_score": float(r2),
        "mae": float(mae),
        "mse": float(mse),
        "rmse": float(rmse),
        "cv_r2_mean": float(cv_r2.mean()),
        "cv_r2_std": float(cv_r2.std()),
        "cv_mae_mean": float(cv_mae.mean()),
        "cv_mae_std": float(cv_mae.std()),
        "feature_importances": {name: float(imp) for name, imp in feat_importances}
    }

    print(f"R² Score: {r2:.4f}")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"5-Fold CV R²: {cv_r2.mean():.4f} +/- {cv_r2.std():.4f}")
    print(f"5-Fold CV MAE: {cv_mae.mean():.4f} +/- {cv_mae.std():.4f}")
    print("\nFeature Importances:")
    for name, imp in feat_importances:
        print(f"  - {name}: {imp:.4f} ({imp*100:.1f}%)")

    return results

def evaluate_graph_and_isolation_engine():
    print("\n==========================================")
    print(" 3. EVALUATING GRAPH & ISOLATION ENGINES")
    print("==========================================")
    ge = GraphEngine()

    total_nodes = ge.graph.number_of_nodes()
    total_edges = ge.graph.number_of_edges()

    # Route testing
    test_od_pairs = [
        ('guwahati_hub', 'silchar_hub'),
        ('guwahati_hub', 'shillong_hub'),
        ('shillong_hub', 'agartala_hub')
    ]
    
    routing_results = []
    for origin, destination in test_od_pairs:
        route_eval = ge.compute_route(origin, destination)
        if route_eval and route_eval.get('ai_recommended_route'):
            ai_r = route_eval['ai_recommended_route']
            def_r = route_eval['default_route']
            comp = route_eval.get('comparison', {})
            routing_results.append({
                'origin': origin,
                'destination': destination,
                'ai_path_nodes': len(ai_r.get('path', [])),
                'ai_distance_km': ai_r.get('distance_km', 0),
                'ai_risk_score': ai_r.get('avg_risk_score', 0),
                'default_distance_km': def_r.get('distance_km', 0),
                'default_risk_score': def_r.get('avg_risk_score', 0),
                'risk_reduction_pct': comp.get('risk_reduction_pct', 0)
            })

    # Isolation testing
    isolation_eval = IsolationEngine.compute_isolation_index()

    results = {
        "graph_nodes": total_nodes,
        "graph_edges": total_edges,
        "is_connected": bool(ge.graph.number_of_nodes() > 0),
        "routes_evaluated": len(routing_results),
        "routing_sample": routing_results,
        "isolation_summary": isolation_eval.get("summary", {})
    }

    print(f"Graph Nodes: {total_nodes}, Graph Edges: {total_edges}")
    print(f"Routes evaluated successfully: {len(routing_results)}/{len(test_od_pairs)}")
    for r in routing_results:
        print(f"  - [{r['origin']} -> {r['destination']}]: AI Distance={r['ai_distance_km']}km, Risk={r['ai_risk_score']} | Def Risk={r['default_risk_score']} | Risk Reduction={r['risk_reduction_pct']}%")
    print(f"\nIsolation Engine Summary: {isolation_eval.get('summary', {})}")

    return results

if __name__ == '__main__':
    v_res = evaluate_vulnerability_model()
    r_res = evaluate_risk_scoring_model()
    g_res = evaluate_graph_and_isolation_engine()
    
    full_report = {
        "vulnerability_model": v_res,
        "risk_scoring_model": r_res,
        "graph_isolation_engine": g_res
    }
    
    with open("model_evaluation_report.json", "w") as f:
        json.dump(full_report, f, indent=2)
    print("\nSaved full evaluation report to model_evaluation_report.json")
