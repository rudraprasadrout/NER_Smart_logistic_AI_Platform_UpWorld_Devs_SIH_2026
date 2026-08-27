from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.simulator.multi_train_engine import simulator_engine
from app.models.whatif_engine import whatif_engine

router = APIRouter(prefix="/api/v1", tags=["What-If Decision Simulator"])

class WhatIfRequest(BaseModel):
    target_train_no: Optional[str] = Field(None, description="Train number to perturb (optional)")
    target_station_code: str = Field(..., description="Station code where perturbation occurs (e.g. CNB)")
    additional_hold_min: float = Field(15.0, description="Hypothetical additional hold or delay in minutes")
    apply_tsr_kmph: Optional[int] = Field(None, description="Optional temporary speed restriction km/h")

@router.post("/whatif")
def run_whatif_simulation(payload: WhatIfRequest):
    """
    Simulates hypothetical dispatch decisions or station holds,
    and returns forecasted cascading delays across all network trains.
    """
    result = whatif_engine.simulate_perturbation(
        target_train_no=payload.target_train_no,
        target_station_code=payload.target_station_code.upper(),
        additional_hold_min=payload.additional_hold_min,
        apply_tsr_kmph=payload.apply_tsr_kmph,
        active_train_states=simulator_engine.active_trains
    )
    return result
