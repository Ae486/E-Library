@echo off
chcp 65001 >nul 2>&1
cls
echo ==========================================
echo   E-Librarian React Version
echo ==========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found
    echo Install: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found
    echo Install: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Python dependencies...
if not exist "backend\.installed" (
    pip install Flask Flask-CORS Werkzeug >nul 2>&1
    echo. > backend\.installed
)

echo [2/5] Node dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing (2-3 minutes)...
    call npm install
)

echo [3/5] Building React...
if not exist "dist" (
    echo Building app...
    call npm run build
)
cd ..

echo [4/5] Starting server...
cd backend
start /B python3 app.py >nul 2>&1
if errorlevel 1 start /B python app.py >nul 2>&1
cd ..

echo [5/5] Opening browser...
timeout /t 3 /nobreak >nul
start "" "http://localhost:5000"

echo.
echo ==========================================
echo   Started!
echo ==========================================
echo.
echo API:      http://localhost:5000/api
echo Frontend: http://localhost:5000
echo.
echo Account: admin / admin123
echo.
echo Dev Mode: cd frontend ^&^& npm run dev
echo           Then open: http://localhost:3000
echo.
echo Press any key to stop...
echo ==========================================

pause >nul

echo Stopping...
taskkill /F /IM python.exe >nul 2>&1
timeout /t 1 /nobreak >nul
