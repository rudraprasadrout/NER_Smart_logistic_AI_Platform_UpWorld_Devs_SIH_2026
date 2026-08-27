import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from flask_server import flask_app

if __name__ == "__main__":
    print("\n=======================================================")
    print(" [RailPulse] Smart India Hackathon (SIH 2026 #26028)")
    print(" Architecture: Pure Python Flask + HTML5 + CSS3 + Vanilla JS")
    print(" Running on: http://127.0.0.1:5000")
    print("=======================================================\n")
    flask_app.run(host="127.0.0.1", port=5000, debug=False)
