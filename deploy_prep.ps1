# deploy_prep.ps1
Write-Host " Starting Deployment Preparation..." -ForegroundColor Cyan

# 1. Install Frontend Dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host " Installing frontend dependencies..."
    npm install
}

# 2. Build Frontend
Write-Host " Building frontend..."
npm run build

# 3. Prepare Backend Deployment Folder
$backendDir = "backend"
$distDir = "dist"
$targetDir = "$backendDir/static_dist"

if (Test-Path $targetDir) {
    Write-Host " Cleaning old build..."
    Remove-Item -Recurse -Force $targetDir
}

# 4. Move Build to Backend
Write-Host " Moving build artifacts to backend..."
Copy-Item -Recurse $distDir $targetDir
 
# 4.1 Create runtime config.js to set window.__API_URL at runtime (use FRONTEND_RUNTIME_API_URL if provided, otherwise VITE_CMS_API_URL)
$runtimeApiUrl = $env:FRONTEND_RUNTIME_API_URL
if (-not $runtimeApiUrl) { $runtimeApiUrl = $env:VITE_CMS_API_URL }
if (-not $runtimeApiUrl) { $runtimeApiUrl = "" }
$configContent = "window.__API_URL = '$runtimeApiUrl';"
Set-Content -Path "$targetDir/config.js" -Value $configContent -NoNewline

# 5. Create Startup Script for Azure
Write-Host " Creating startup.sh..."
$startupScript = "#!/bin/bash
python -m gunicorn -w 2 -k uvicorn.workers.UvicornWorker main:app"
Set-Content "$backendDir/startup.sh" $startupScript -NoNewline

Write-Host " Preparation Complete!" -ForegroundColor Green
Write-Host "--------------------------------------------------"
Write-Host "To deploy to Azure App Service:"
Write-Host "1. Create a Web App (Linux, Python 3.10+)"
Write-Host "2. Deploy the '$backendDir' folder to the Web App"
Write-Host "   (You can use the Azure VS Code extension: Right-click 'backend' folder -> Deploy to Web App)"
Write-Host "3. Ensure the Startup Command is set to: sh startup.sh"
Write-Host "--------------------------------------------------"
