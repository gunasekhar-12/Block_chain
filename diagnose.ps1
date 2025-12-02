Write-Host "=== DEX Setup Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js NOT installed!" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
}

# Check npm
Write-Host ""
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm NOT installed!" -ForegroundColor Red
}

# Check node_modules
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "node_modules folder exists" -ForegroundColor Green
} else {
    Write-Host "node_modules NOT found" -ForegroundColor Red
    Write-Host "Run: npm install" -ForegroundColor Yellow
}

# Check contracts folder
Write-Host ""
Write-Host "Checking contracts..." -ForegroundColor Yellow
if (Test-Path "contracts") {
    $contractCount = (Get-ChildItem "contracts\*.sol").Count
    Write-Host "Contracts folder exists with $contractCount sol files" -ForegroundColor Green
} else {
    Write-Host "Contracts folder NOT found" -ForegroundColor Red
}

# Check hardhat
Write-Host ""
Write-Host "Checking Hardhat..." -ForegroundColor Yellow
if (Test-Path "hardhat.config.js") {
    Write-Host "hardhat.config.js exists" -ForegroundColor Green
} else {
    Write-Host "hardhat.config.js NOT found" -ForegroundColor Red
}

# Check package.json
Write-Host ""
Write-Host "Checking package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "package.json exists" -ForegroundColor Green
} else {
    Write-Host "package.json NOT found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If Node.js is missing install it from nodejs.org"
Write-Host "2. If node_modules is missing run: npm install"
Write-Host "3. Then run: npm run compile"
Write-Host "4. Then run: npm run node in a new terminal"
Write-Host "5. Then run: npm run deploy in another terminal"
Write-Host "6. Finally run: npm run dev"
