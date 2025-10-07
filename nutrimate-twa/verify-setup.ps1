# NutriMate TWA Setup Verification Script
Write-Host "Verifying NutriMate TWA Setup..." -ForegroundColor Green

# Test 1: Verify assetlinks.json format
Write-Host "`n1. Checking assetlinks.json format..." -ForegroundColor Yellow
$assetlinksPath = "../public/.well-known/assetlinks.json"
if (Test-Path $assetlinksPath) {
    try {
        $assetlinks = Get-Content $assetlinksPath | ConvertFrom-Json
        Write-Host "✓ assetlinks.json is valid JSON" -ForegroundColor Green
        Write-Host "  Package Name: $($assetlinks[0].target.package_name)" -ForegroundColor Cyan
        Write-Host "  SHA-256: $($assetlinks[0].target.sha256_cert_fingerprints[0])" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ assetlinks.json is not valid JSON" -ForegroundColor Red
    }
} else {
    Write-Host "✗ assetlinks.json not found" -ForegroundColor Red
}

# Test 2: Verify keystore exists
Write-Host "`n2. Checking keystore..." -ForegroundColor Yellow
$keystorePath = "./nutrimate-release-key.keystore"
if (Test-Path $keystorePath) {
    Write-Host "✓ Keystore file exists" -ForegroundColor Green
    Write-Host "  Path: $keystorePath" -ForegroundColor Cyan
} else {
    Write-Host "✗ Keystore file not found" -ForegroundColor Red
}

# Test 3: Verify TWA manifest
Write-Host "`n3. Checking TWA manifest..." -ForegroundColor Yellow
$manifestPath = "./twa-manifest.json"
if (Test-Path $manifestPath) {
    try {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        Write-Host "✓ TWA manifest is valid JSON" -ForegroundColor Green
        Write-Host "  Package ID: $($manifest.packageId)" -ForegroundColor Cyan
        Write-Host "  Host: $($manifest.host)" -ForegroundColor Cyan
        Write-Host "  Theme Color: $($manifest.themeColor)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ TWA manifest is not valid JSON" -ForegroundColor Red
    }
} else {
    Write-Host "✗ TWA manifest not found" -ForegroundColor Red
}

# Test 4: Check if URLs are accessible (simulation)
Write-Host "`n4. URL Accessibility Check..." -ForegroundColor Yellow
$urls = @(
    "https://nutrimate.app/.well-known/assetlinks.json",
    "https://nutrimate.app/manifest.webmanifest",
    "https://nutrimate.app/icons/icon-512x512.png"
)

foreach ($url in $urls) {
    Write-Host "  Checking: $url" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "    ✓ Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "    ⚠ Unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    ✗ Not accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Verify Bubblewrap CLI
Write-Host "`n5. Checking Bubblewrap CLI..." -ForegroundColor Yellow
try {
    $bubblewrapVersion = bubblewrap --version 2>$null
    if ($bubblewrapVersion) {
        Write-Host "✓ Bubblewrap CLI is installed" -ForegroundColor Green
        Write-Host "  Version: $bubblewrapVersion" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Bubblewrap CLI not found" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Bubblewrap CLI not found" -ForegroundColor Red
}

Write-Host "`nVerification completed!" -ForegroundColor Blue
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy the assetlinks.json to production" -ForegroundColor White
Write-Host "2. Run: bubblewrap build --twaManifest ./twa-manifest.json" -ForegroundColor White
Write-Host "3. Test the generated APK/AAB on Android devices" -ForegroundColor White