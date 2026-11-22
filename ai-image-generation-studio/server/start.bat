@echo off
echo ========================================
echo   AI Image Generation Studio
echo   Backend - Replicate API Version
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found: %node_version%

echo.
echo [2/3] Installing dependencies...
if not exist "node_modules" (
    echo Installing packages...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Installation failed!
        pause
        exit /b 1
    )
    echo ✅ Packages installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo [3/3] Starting server...
echo.
echo ========================================
echo   🚀 Server is running!
echo   API: http://localhost:5000
echo   Docs: http://localhost:5000/api
echo ========================================
echo.
echo Press Ctrl+C to stop
echo.
npm start