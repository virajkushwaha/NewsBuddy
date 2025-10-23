Write-Host "Starting NewsBuddy with MongoDB..." -ForegroundColor Green

# Navigate to project root
Set-Location ..

# Start MongoDB using Docker
Write-Host "Starting MongoDB..." -ForegroundColor Blue
docker run -d --name newsbuddy-mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7.0

# Wait for MongoDB to start
Write-Host "Waiting for MongoDB to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Update backend .env for local MongoDB
$envContent = @"
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://admin:password123@localhost:27017/newsbuddy?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NEWS_API_KEY=79571b9c95fa40fd81389f6f6e79ea6d
NEWSDATA_API_KEY=pub_bc7c0eb9ffb14c9badbce36ba8439fba
AWS_REGION=us-east-1
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@

$envContent | Out-File -FilePath "backend\.env" -Encoding UTF8

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start"

Write-Host ""
Write-Host "✅ NewsBuddy is starting with MongoDB..." -ForegroundColor Green
Write-Host ""
Write-Host "MongoDB: mongodb://localhost:27017" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop MongoDB: docker stop newsbuddy-mongo" -ForegroundColor Yellow
Read-Host "Press Enter to close this window"