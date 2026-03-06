@echo off
REM Apartment Booking Website - Installation Script for Windows

echo 🏠 Setting up Apartment Booking Website...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16+
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm version: %NPM_VERSION%

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed

REM Create .env file if not exists
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo MONGODB_URI=mongodb://localhost:27017/apartment-booking
        echo STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
        echo STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
        echo PORT=5000
        echo NODE_ENV=development
    ) > .env
    echo ✓ .env file created. Please add your Stripe keys.
)

cd ..

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed

cd ..

echo.
echo ✅ Installation complete!
echo.
echo 📖 Next steps:
echo 1. Add your Stripe keys to backend\.env
echo 2. Update Stripe public key in frontend\src\pages\PaymentPage.jsx
echo 3. Start MongoDB service
echo 4. Run: npm run dev (to start both frontend and backend)
echo.
echo 📚 For more information, see:
echo - README.md - Complete documentation
echo - QUICK_START.md - Quick setup guide
echo - PROJECT_CHECKLIST.md - Files overview
echo.
pause
