Write-Host "Setting up NewsBuddy locally on Windows..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Navigate to project root
Set-Location ..

# Create environment files if they don't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "Please update backend\.env with your configuration" -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "Please update frontend\.env with your configuration" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
try {
    npm install
    Write-Host "Backend dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Blue
Set-Location frontend
try {
    npm install
    Write-Host "Frontend dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend\.env with your API keys and database configuration"
Write-Host "2. Update frontend\.env with your API URL"
Write-Host "3. Start MongoDB (if using local instance)"
Write-Host "4. Run 'npm run dev' in the backend directory"
Write-Host "5. Run 'npm start' in the frontend directory"
Write-Host ""
Write-Host "For Docker setup, run: docker-compose up --build" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"