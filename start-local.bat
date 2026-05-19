@echo off
setlocal

cd /d "%~dp0"

where npm >nul 2>nul
if %errorlevel%==0 (
  echo npm found. Starting Nebula Tasks with npm...
  npm start
  pause
  exit /b %errorlevel%
)

set "BUNDLED_NODE=C:\Users\Zbook\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%BUNDLED_NODE%" (
  echo npm was not found. Starting Nebula Tasks with bundled Node fallback...
  "%BUNDLED_NODE%" server.js
  pause
  exit /b %errorlevel%
)

echo Could not find npm or bundled Node.
echo Install Node.js LTS from https://nodejs.org, then run: npm install && npm start
pause
