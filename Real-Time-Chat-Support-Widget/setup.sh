#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Real-Time Chat Support Widget...${NC}"
echo ""

# Create server .env if it doesn't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating server/.env..."
    cp server/.env.example server/.env
    echo -e "${GREEN}✓ Created server/.env${NC}"
else
    echo "✓ server/.env already exists"
fi

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..
echo -e "${GREEN}✓ Server dependencies installed${NC}"

# Install client dependencies
echo ""
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..
echo -e "${GREEN}✓ Client dependencies installed${NC}"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Terminal 1: cd server && npm run dev"
echo "2. Terminal 2: cd client && npm run dev"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "Happy coding! 🎉"
