# NutriMate TWA Build Script
Write-Host "Building NutriMate TWA..." -ForegroundColor Green

# Set environment variables for non-interactive build
$env:BUBBLEWRAP_SKIP_SDK_INSTALL = "true"

# Try to build with existing configuration
try {
    Write-Host "Attempting to build TWA..." -ForegroundColor Yellow
    bubblewrap build --twaManifest ./twa-manifest.json --skipPwaValidation
    Write-Host "TWA build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You may need to install Android SDK manually or run the build interactively." -ForegroundColor Yellow
}

Write-Host "Build process completed." -ForegroundColor Blue
