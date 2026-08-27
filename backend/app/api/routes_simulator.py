from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.core.graph_network import railway_network
from app.simulator.multi_train_engine import simulator_engine

router = APIRouter(prefix="/api/v1", tags=["Simulator & Ingestion"])

class EventIngestPayload(BaseModel):
    train_no: str
    event_type: str = Field(..., description="DELAY_MIN | SET_SPEED | EMERGENCY_HALT")
    value: float = Field(..., description="Value to apply")

class TSRControlPayload(BaseModel):
    section_id: str
    speed_kmph: int = Field(30, description="TSR speed limit, or 0 to clear")

class SimulatorControlPayload(BaseModel):
    action: str = Field(..., description="PLAY | PAUSE | RESET | TICK")
    time_scale: Optional[float] = None

@router.get("/simulator/state")
def get_simulator_state():
    """Returns comprehensive real-time corridor state and live train positions."""
    return simulator_engine.get_full_telemetry()

@router.post("/events/ingest")
def ingest_event(payload: EventIngestPayload):
    """Ingests live / simulated telemetry events to trigger dynamic recomputation."""
    simulator_engine.inject_event(payload.train_no, payload.event_type, payload.value)
    return {
        "status": "SUCCESS",
        "message": f"Event {payload.event_type} applied to Train {payload.train_no}",
        "train_state": simulator_engine.active_trains.get(payload.train_no)
    }

@router.post("/simulator/tsr")
def manage_speed_restriction(payload: TSRControlPayload):
    """Sets or clears a cautionary speed restriction on a track section."""
    if payload.speed_kmph > 0:
        railway_network.set_temporary_speed_restriction(payload.section_id, payload.speed_kmph)
        msg = f"TSR of {payload.speed_kmph} km/h applied to section {payload.section_id}"
    else:
        railway_network.clear_speed_restriction(payload.section_id)
        msg = f"TSR cleared on section {payload.section_id}"
    return {"status": "SUCCESS", "message": msg}

@router.post("/simulator/control")
def control_simulator(payload: SimulatorControlPayload):
    """Controls simulation execution."""
    if payload.action == "PAUSE":
        simulator_engine.is_running = False
    elif payload.action == "PLAY":
        simulator_engine.is_running = True
    elif payload.action == "RESET":
        simulator_engine._initialize_train_states()
    elif payload.action == "TICK":
        simulator_engine.tick(delta_seconds=1.0)

    return {
        "status": "SUCCESS",
        "is_running": simulator_engine.is_running,
        "sim_time_sec": simulator_engine.sim_time_sec
    }
