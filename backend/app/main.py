import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.core.config import settings
from app.simulator.multi_train_engine import simulator_engine
from app.api.routes_eta import router as eta_router
from app.api.routes_stations import router as stations_router
from app.api.routes_whatif import router as whatif_router
from app.api.routes_simulator import router as simulator_router
from app.api.routes_feeder import router as feeder_router
from app.api.routes_copilot import router as copilot_router

# WebSocket connection manager for live dashboard updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

ws_manager = ConnectionManager()

# Background ticker task
async def simulation_loop():
    while True:
        try:
            simulator_engine.tick(delta_seconds=1.0)
            if ws_manager.active_connections:
                telemetry = simulator_engine.get_full_telemetry()
                await ws_manager.broadcast_json({"type": "TELEMETRY_UPDATE", "data": telemetry})
        except Exception as e:
            print(f"Simulation tick error: {e}")
        await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    sim_task = asyncio.create_task(simulation_loop())
    yield
    # Shutdown
    sim_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# CORS configuration for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(eta_router)
app.include_router(stations_router)
app.include_router(whatif_router)
app.include_router(simulator_router)
app.include_router(feeder_router)
app.include_router(copilot_router)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "features": [
            "Network-Graph Spatial GNN Delay Propagation",
            "Conformal Shrinking Confidence Intervals (p10-p90)",
            "Explainable AI (XAI) Factor Attribution",
            "What-If Dispatch Decision Sandbox",
            "Automated Feeder Transport Triggers",
            "Graceful Degradation Fallbacks"
        ]
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send immediate initial telemetry
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "data": simulator_engine.get_full_telemetry()
        })
        while True:
            # Keep connection open and accept client heartbeats / events
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
