#!/bin/bash

# Apartment Booking Website - Installation Script
# This script sets up the entire project

echo "🏠 Setting up Apartment Booking Website..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+"
    exit 1
fi

echo -e "${BLUE}✓ Node.js version: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo -e "${BLUE}✓ npm version: $(npm --version)${NC}"

# Install backend dependencies
echo -e "\n${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Check and create .env file
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/apartment-booking
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
PORT=5000
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ .env file created. Please add your Stripe keys.${NC}"
fi

cd ..

# Install frontend dependencies
echo -e "\n${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo -e "\n${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${BLUE}📖 Next steps:${NC}"
echo "1. Add your Stripe keys to backend/.env"
echo "2. Update Stripe public key in frontend/src/pages/PaymentPage.jsx"
echo "3. Start MongoDB service"
echo "4. Run: npm run dev (to start both frontend and backend)"
echo ""
echo -e "${BLUE}📚 For more information, see:${NC}"
echo "- README.md - Complete documentation"
echo "- QUICK_START.md - Quick setup guide"
echo "- PROJECT_CHECKLIST.md - Files overview"
