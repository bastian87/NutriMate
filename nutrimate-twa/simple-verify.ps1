Write-Host "NutriMate TWA Setup Verification" -ForegroundColor Green

# Check assetlinks.json
$assetlinksPath = "../public/.well-known/assetlinks.json"
if (Test-Path $assetlinksPath) {
    Write-Host "✓ assetlinks.json exists" -ForegroundColor Green
} else {
    Write-Host "✗ assetlinks.json missing" -ForegroundColor Red
}

# Check keystore
$keystorePath = "./nutrimate-release-key.keystore"
if (Test-Path $keystorePath) {
    Write-Host "✓ Keystore exists" -ForegroundColor Green
} else {
    Write-Host "✗ Keystore missing" -ForegroundColor Red
}

# Check TWA manifest
$manifestPath = "./twa-manifest.json"
if (Test-Path $manifestPath) {
    Write-Host "✓ TWA manifest exists" -ForegroundColor Green
} else {
    Write-Host "✗ TWA manifest missing" -ForegroundColor Red
}

Write-Host "Verification complete!" -ForegroundColor Blue
