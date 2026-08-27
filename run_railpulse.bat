@echo off
echo ===================================================
echo   Starting RailPulse Backend (FastAPI) & Frontend (Vite)
echo ===================================================

start "RailPulse Backend" cmd /k "set PYTHONPATH=backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "RailPulse Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo RailPulse services started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo Swagger Docs: http://localhost:8000/docs
echo ===================================================
