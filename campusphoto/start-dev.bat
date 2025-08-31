@echo off
chcp 65001 >nul

REM Get the directory where this script is located
cd /d "%~dp0"

echo Starting CampusPhoto Development Environment...
echo Current directory: %CD%

echo.
echo 1. Starting database and Redis services...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo 2. Waiting for database to start...
timeout /t 5 /nobreak > nul

echo.
echo 3. Checking service status...
docker-compose -f docker-compose.dev.yml ps

echo.
echo Services started successfully!
echo.
echo Next, please manually start frontend and backend services:
echo.
echo Backend service (new terminal window):
echo   cd backend
echo   python -m venv venv
echo   venv\Scripts\activate
echo   pip install -r requirements.txt
echo   uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo Frontend service (new terminal window):
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo Access URLs:
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
pause

