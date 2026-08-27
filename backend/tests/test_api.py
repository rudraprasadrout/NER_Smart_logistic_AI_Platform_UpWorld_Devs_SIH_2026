import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "RailPulse"
    assert data["status"] == "OPERATIONAL"

def test_list_trains():
    response = client.get("/api/v1/trains")
    assert response.status_code == 200
    trains = response.json()
    assert len(trains) > 0
    assert any(t["train_no"] == "12301" for t in trains)

def test_train_eta_prediction_models():
    # Test Core GNN
    resp_gnn = client.get("/api/v1/train/12301/eta?model_type=CORE_GNN_SPATIAL")
    assert resp_gnn.status_code == 200
    data_gnn = resp_gnn.json()
    assert data_gnn["model_applied"] == "CORE_GNN_SPATIAL"
    assert len(data_gnn["stops_timeline"]) > 0
    assert "uncertainty_bounds" in data_gnn["stops_timeline"][0]

    # Test Baseline B (GBM)
    resp_gbm = client.get("/api/v1/train/12301/eta?model_type=BASELINE_B_GBM")
    assert resp_gbm.status_code == 200
    assert resp_gbm.json()["model_applied"] == "BASELINE_B_GBM"

    # Test Baseline A (Rule)
    resp_rule = client.get("/api/v1/train/12301/eta?model_type=BASELINE_A_RULE")
    assert resp_rule.status_code == 200
    assert resp_rule.json()["model_applied"] == "BASELINE_A_RULE"

def test_train_explainability():
    response = client.get("/api/v1/train/12301/eta/explain")
    assert response.status_code == 200
    data = response.json()
    assert "factor_percentages" in data
    assert "cascading_headway_pct" in data["factor_percentages"]
    assert "executive_summary" in data

def test_station_arrivals():
    response = client.get("/api/v1/station/CNB/arrivals")
    assert response.status_code == 200
    data = response.json()
    assert data["station_code"] == "CNB"
    assert "arrivals" in data

def test_whatif_simulator():
    payload = {
        "target_train_no": "12301",
        "target_station_code": "CNB",
        "additional_hold_min": 15.0,
        "apply_tsr_kmph": 30
    }
    response = client.post("/api/v1/whatif", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_parameters"]["additional_hold_min"] == 15.0
    assert data["impact_summary"]["total_trains_impacted"] >= 1
    assert "recommended_mitigations" in data
