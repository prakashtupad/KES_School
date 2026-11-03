@echo off
title KES School - Shri Siddharoodha English Medium School Launcher
echo ============================================================================
echo   Khanatti Education Society's
echo   Shri Siddharoodha English Medium School, Khanatti
echo   Full-Stack Application Launcher (Backend + Frontend)
echo ============================================================================
echo.

REM Ensure Node.js is on the PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js was not found in PATH or C:\Program Files\nodejs.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

cd /d "%~dp0"

REM Install Backend Dependencies if missing
if not exist "server\node_modules" (
    echo [1/4] Installing Backend Server dependencies...
    pushd server
    call npm install
    popd
) else (
    echo [1/4] Backend dependencies already installed.
)

REM Install Frontend Dependencies if missing
if not exist "client\node_modules" (
    echo [2/4] Installing Frontend Client dependencies...
    pushd client
    call npm install
    popd
) else (
    echo [2/4] Frontend dependencies already installed.
)

echo.
echo [3/4] Starting Backend API Server on http://localhost:5000 ...
start "KES School - Backend API (Port 5000)" /D "%~dp0server" cmd /k "set PATH=C:\Program Files\nodejs;%PATH%&& node src/server.js"

REM Wait briefly for backend to initialize
ping 127.0.0.1 -n 3 >nul

echo [4/4] Starting Frontend Vite Server on http://localhost:5173 ...
start "KES School - Frontend Client (Port 5173)" /D "%~dp0client" cmd /k "set PATH=C:\Program Files\nodejs;%PATH%&& node node_modules/vite/bin/vite.js --port 5173 --host"

ping 127.0.0.1 -n 3 >nul
echo.
echo Opening http://localhost:5173 in your default browser...
start "" "http://localhost:5173"

echo.
echo ============================================================================
echo   Both Frontend (5173) and Backend (5000) servers have been launched!
echo ============================================================================
