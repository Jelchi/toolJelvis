@echo off
TITLE NEXUS WORKSPACE Launcher
COLOR 0A

echo ========================================================
echo        NEXUS WORKSPACE — One Workspace. Infinite Possibilities.
echo ========================================================
echo.

set WORKSPACE_DIR=%~dp0
cd /d "%WORKSPACE_DIR%"

echo [1/2] Launching FastAPI Backend Server (Port 8000)...
start "NEXUS Backend (FastAPI)" cmd /k "cd /d %WORKSPACE_DIR%backend && set PYTHONPATH=. && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching Next.js Frontend Development Server (Port 3000)...
start "NEXUS Frontend (Next.js)" cmd /k "cd /d %WORKSPACE_DIR%frontend && npm run dev"

echo.
echo ========================================================
echo   NEXUS WORKSPACE is starting up!
echo   - Web Application: http://localhost:3000
echo   - Swagger API Docs: http://localhost:8000/api/v1/docs
echo ========================================================
echo.
pause
