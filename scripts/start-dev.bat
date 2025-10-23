@echo off
echo Starting NewsBuddy in development mode...

REM Check if .env files exist
if not exist "backend\.env" (
    echo Error: backend\.env file not found. Run setup-local.bat first.
    pause
    exit /b 1
)

if not exist "frontend\.env" (
    echo Error: frontend\.env file not found. Run setup-local.bat first.
    pause
    exit /b 1
)

REM Start backend in a new window
echo Starting backend server...
start "NewsBuddy Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend in a new window
echo Starting frontend server...
start "NewsBuddy Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ NewsBuddy development servers are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul