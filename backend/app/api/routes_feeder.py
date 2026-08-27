import time
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/v1", tags=["Feeder & Last-Mile Dispatch"])

class FeederSubscription(BaseModel):
    train_no: str
    destination_station: str
    passenger_name: Optional[str] = "Passenger"
    contact_or_webhook: str = Field(..., description="Phone number or webhook URL for dispatch")
    threshold_window_min: float = Field(8.0, description="Trigger alert when confidence window width <= this value")
    transport_mode: str = Field("CAB_AGGREGATOR", description="CAB_AGGREGATOR | EV_FEEDER_BUS | PASSENGER_SMS")

# In-memory subscription store
subscriptions_db: List[Dict[str, Any]] = [
    {
        "id": "SUB-101",
        "train_no": "12301",
        "destination_station": "CNB",
        "passenger_name": "Rohan Sharma",
        "contact_or_webhook": "+91-9876543210",
        "threshold_window_min": 10.0,
        "transport_mode": "CAB_AGGREGATOR",
        "status": "ACTIVE",
        "created_at": "2026-08-27 10:15:00"
    },
    {
        "id": "SUB-102",
        "train_no": "22436",
        "destination_station": "PRYJ",
        "passenger_name": "Priya Sen",
        "contact_or_webhook": "https://api.ridefeeder.mock/dispatch",
        "threshold_window_min": 6.0,
        "transport_mode": "EV_FEEDER_BUS",
        "status": "ACTIVE",
        "created_at": "2026-08-27 10:20:00"
    }
]

# Trigger event history
trigger_history: List[Dict[str, Any]] = [
    {
        "trigger_id": "TRIG-8821",
        "subscription_id": "SUB-101",
        "train_no": "12301",
        "station_code": "CNB",
        "confirmed_eta": "21:38",
        "confidence_window": "21:35 – 21:42 (±3.5 min)",
        "message": "Cab dispatch triggered for Rohan Sharma at Kanpur Central (PF-1 Cab Bay 4).",
        "timestamp": "2026-08-27 10:22:15",
        "status": "DISPATCHED"
    }
]

@router.post("/feeder/subscribe")
def subscribe_feeder(payload: FeederSubscription):
    """Subscribes a webhook or SMS alert to be triggered when ETA confidence tightens."""
    sub_id = f"SUB-{len(subscriptions_db) + 101}"
    record = {
        "id": sub_id,
        "train_no": payload.train_no,
        "destination_station": payload.destination_station.upper(),
        "passenger_name": payload.passenger_name,
        "contact_or_webhook": payload.contact_or_webhook,
        "threshold_window_min": payload.threshold_window_min,
        "transport_mode": payload.transport_mode,
        "status": "ACTIVE",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    subscriptions_db.append(record)
    return {
        "status": "SUCCESS",
        "message": f"Successfully registered feeder subscription {sub_id}",
        "subscription": record
    }

@router.get("/feeder/subscriptions")
def list_subscriptions():
    """Lists all active feeder subscriptions."""
    return subscriptions_db

@router.get("/feeder/triggers")
def list_trigger_history():
    """Returns log of all automated feeder transport and alert dispatches."""
    return trigger_history
