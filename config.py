import os
from pathlib import Path

# Load environment variables from .env file if present
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent / '.env'
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Flask Security & Environment
    SECRET_KEY = os.environ.get('SECRET_KEY', 'pathner-default-dev-secret-key')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1', 'yes']
    PORT = int(os.environ.get('PORT', 5000))
    
    # Data & Database Paths
    DATA_DIR_NAME = os.environ.get('DATA_DIR', 'data')
    DATA_DIR = os.path.join(BASE_DIR, DATA_DIR_NAME)
    DATABASE_PATH = os.path.join(BASE_DIR, os.environ.get('DATABASE_PATH', 'data/database.sqlite'))
    
    # Risk calculation thresholds
    RISK_BLOCKED_THRESHOLD = float(os.environ.get('RISK_BLOCKED_THRESHOLD', 70.0))
    RISK_HIGH_THRESHOLD = float(os.environ.get('RISK_HIGH_THRESHOLD', 50.0))
    RISK_MODERATE_THRESHOLD = float(os.environ.get('RISK_MODERATE_THRESHOLD', 25.0))
    
    # Optional Third-Party Integration Keys & AI Models
    MISTRAL_API_KEY = os.environ.get('MISTRAL_API_KEY', '')
    MISTRAL_MODEL = os.environ.get('MISTRAL_MODEL', 'mistral-small-latest')
    OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')
    MAPBOX_ACCESS_TOKEN = os.environ.get('MAPBOX_ACCESS_TOKEN', '')
    SMS_GATEWAY_API_KEY = os.environ.get('SMS_GATEWAY_API_KEY', '')

    # Regional Bounds (Assam - Meghalaya - Cachar Lifeline Corridor)
    DEFAULT_CENTER = [25.5788, 91.8933]  # Shillong coordinates
    DEFAULT_ZOOM = 9
    
    # Supported notification languages
    LANGUAGES = ['en', 'as', 'hi', 'bn', 'kha']
