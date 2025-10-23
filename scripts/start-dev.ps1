Write-Host "Starting NewsBuddy in development mode..." -ForegroundColor Green

# Navigate to project root
Set-Location ..

# Kill any existing processes on ports 3000 and 5000
.\scripts\kill-ports.ps1

# Check if .env files exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "Error: backend\.env file not found. Run setup-local.ps1 first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "Error: frontend\.env file not found. Run setup-local.ps1 first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start backend in a new PowerShell window
Write-Host "Starting backend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new PowerShell window
Write-Host "Starting frontend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start"

Write-Host ""
Write-Host "✅ NewsBuddy development servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close this window"