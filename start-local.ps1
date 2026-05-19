$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundledNode = "C:\Users\Zbook\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

Set-Location $projectRoot

if (Get-Command npm -ErrorAction SilentlyContinue) {
  Write-Host "npm found. Starting Nebula Tasks with npm..." -ForegroundColor Green
  npm start
  exit
}

if (Test-Path $bundledNode) {
  Write-Host "npm was not found. Starting Nebula Tasks with bundled Node fallback..." -ForegroundColor Yellow
  & $bundledNode server.js
  exit
}

Write-Host "Could not find npm or bundled Node." -ForegroundColor Red
Write-Host "Install Node.js LTS from https://nodejs.org, then run: npm install; npm start"
