from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"

class Settings(BaseModel):
    PROJECT_NAME: str = "RailPulse"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "Network-Aware Dynamic ETA & Cascading Delay Decision Support System"
    STATIONS_FILE: Path = DATA_DIR / "stations_corridor.json"
    SECTIONS_FILE: Path = DATA_DIR / "track_sections.json"
    TIMETABLE_FILE: Path = DATA_DIR / "trains_timetable.json"
    
    # Simulation defaults
    SIMULATION_TICK_SECONDS: float = 1.0
    SIMULATION_TIME_SCALE: float = 10.0  # 1 real second = 10 simulated seconds

settings = Settings()
