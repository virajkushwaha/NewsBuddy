Write-Host "🚀 Starting NewsBuddy Complete Setup..." -ForegroundColor Green

# Navigate to project root
Set-Location ..

# Kill any existing processes
Write-Host "🔄 Cleaning up existing processes..." -ForegroundColor Yellow
.\scripts\kill-ports.ps1

# Install dependencies if needed
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
    Set-Location frontend
    npm install
    Set-Location ..
}

# Create .env files if they don't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚙️ Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env" -ErrorAction SilentlyContinue
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚙️ Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env" -ErrorAction SilentlyContinue
}

# Start backend
Write-Host "🔧 Starting backend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🚀 NewsBuddy Backend Server' -ForegroundColor Green; Write-Host 'API: http://localhost:5000' -ForegroundColor Cyan; npm run dev"

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "🎨 Starting frontend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 NewsBuddy Frontend Server' -ForegroundColor Green; Write-Host 'App: http://localhost:3000' -ForegroundColor Cyan; npm start"

# Wait for frontend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ NewsBuddy is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📊 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "📰 News API: http://localhost:5000/api/news/headlines" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your AI-powered news platform is ready!" -ForegroundColor Green
Write-Host "📱 Features: Real-time news, AI recommendations, modern UI" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in the server windows to stop the servers" -ForegroundColor Gray
Read-Host "Press Enter to close this window"