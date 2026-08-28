import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'pathner-ner-smart-logistics-sih2026-key')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1']
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    DATABASE_PATH = os.path.join(DATA_DIR, 'database.sqlite')
    
    # Risk calculation thresholds
    RISK_BLOCKED_THRESHOLD = 70.0      # Edge considered effectively blocked/impassable
    RISK_HIGH_THRESHOLD = 50.0         # Edge flagged as high risk / dangerous
    RISK_MODERATE_THRESHOLD = 25.0     # Edge flagged as moderate risk
    
    # Regional Bounds (Assam - Meghalaya - Cachar Lifeline Corridor)
    DEFAULT_CENTER = [25.5788, 91.8933]  # Shillong coordinates
    DEFAULT_ZOOM = 9
    
    # Supported notification languages
    LANGUAGES = ['en', 'as', 'hi', 'bn', 'kha']
