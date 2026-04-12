#!/bin/bash
# BadmintonHub - Installation Script

echo "🏸 BadmintonHub - Quick Start Script"
echo "======================================"
echo ""

echo "📦 Installing Backend Dependencies..."
cd server
npm install
echo "✅ Backend dependencies installed"
echo ""

echo "📦 Installing Frontend Dependencies..."
cd ../client
npm install
echo "✅ Frontend dependencies installed"
echo ""

echo "🎉 Installation Complete!"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd server"
echo "  npm start"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd client"
echo "  npm start"
echo ""
echo "App will open at http://localhost:3000"
echo ""
echo "📚 For detailed setup help, see SETUP.md or QUICKSTART.md"
