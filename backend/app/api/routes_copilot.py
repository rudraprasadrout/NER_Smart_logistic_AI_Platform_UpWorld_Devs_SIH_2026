from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.llm_copilot import ai_copilot

router = APIRouter(prefix="/api/v1/copilot", tags=["Mistral AI Copilot"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="Passenger natural language query")
    train_no: Optional[str] = Field("12301", description="Train number context")
    api_key: Optional[str] = Field(None, description="Optional Mistral AI API key")

class MemoRequest(BaseModel):
    whatif_scenario: Dict[str, Any] = Field(..., description="What-if simulation result payload")
    api_key: Optional[str] = Field(None, description="Optional Mistral AI API key")

class KeyConfigRequest(BaseModel):
    api_key: str = Field(..., description="Mistral AI API Key")

@router.post("/chat")
def passenger_copilot_chat(payload: ChatRequest):
    """
    Conversational AI Copilot grounded in real-time train telemetry,
    delay factors, and dynamic GNN predictions using Mistral AI.
    """
    response = ai_copilot.generate_passenger_chat_response(
        user_message=payload.message,
        train_no=payload.train_no,
        user_api_key=payload.api_key
    )
    return response

@router.post("/dispatch-memo")
def generate_dispatch_memo(payload: MemoRequest):
    """
    Generates an official OCC Control Room operational Dispatch Memo & Caution Order.
    """
    response = ai_copilot.generate_occ_dispatch_memo(
        whatif_scenario=payload.whatif_scenario,
        user_api_key=payload.api_key
    )
    return response

@router.post("/set-key")
def configure_mistral_key(payload: KeyConfigRequest):
    """
    Sets or updates the active Mistral AI API key at runtime.
    """
    ai_copilot.set_api_key(payload.api_key.strip())
    return {
        "status": "SUCCESS",
        "message": "Mistral AI API key successfully configured for RailPulse AI Copilot"
    }
