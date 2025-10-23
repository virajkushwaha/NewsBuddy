@echo off
echo Setting up NewsBuddy locally on Windows...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm first.
    exit /b 1
)

echo Node.js and npm are installed.

REM Create environment files if they don't exist
if not exist "backend\.env" (
    echo Creating backend .env file...
    copy "backend\.env.example" "backend\.env"
    echo Please update backend\.env with your configuration
)

if not exist "frontend\.env" (
    echo Creating frontend .env file...
    copy "frontend\.env.example" "frontend\.env"
    echo Please update frontend\.env with your configuration
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    exit /b 1
)
cd ..

echo.
echo ✅ Setup completed successfully!
echo.
echo Next steps:
echo 1. Update backend\.env with your API keys and database configuration
echo 2. Update frontend\.env with your API URL
echo 3. Start MongoDB (if using local instance)
echo 4. Run 'npm run dev' in the backend directory
echo 5. Run 'npm start' in the frontend directory
echo.
echo For Docker setup, run: docker-compose up --build
echo.
pause