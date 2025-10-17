@echo off
cls
echo ==========================================
echo   Smart Library System
echo ==========================================
echo.

echo [1/2] Building frontend...
cd /d "%~dp0frontend"

REM Use npx to run the build commands
call npx tsc
if errorlevel 1 (
    echo [ERROR] TypeScript compilation failed!
    cd /d "%~dp0"
    pause
    exit /b 1
)

call npx vite build
if errorlevel 1 (
    echo [ERROR] Vite build failed!
    cd /d "%~dp0"
    pause
    exit /b 1
)

echo Build completed successfully!
echo.

echo [2/2] Starting server...
cd /d "%~dp0backend"
start "Smart Library Server" python app.py

echo.
echo ==========================================
echo   Server starting...
echo ==========================================
echo.
echo Opening browser in 3 seconds...
echo URL: http://localhost:5000
echo.
echo Default account: admin / admin123
echo.

timeout /t 3 /nobreak >nul
start "" "http://localhost:5000"

cd /d "%~dp0"
echo.
echo Server is running in separate window.
echo Close the server window to stop.
echo.
pause
