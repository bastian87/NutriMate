# NutriMate TWA Setup Guide

## Overview
This guide documents the Trusted Web Activity (TWA) setup for NutriMate Android app using Bubblewrap.

## Files Created

### 1. Asset Links Configuration
- **Path**: `public/.well-known/assetlinks.json`
- **Purpose**: Verifies domain ownership for TWA
- **Content**: Contains package name and SHA-256 fingerprint

### 2. TWA Manifest
- **Path**: `nutrimate-twa/twa-manifest.json`
- **Purpose**: Configuration for the Android app wrapper

### 3. Keystore
- **Path**: `nutrimate-twa/nutrimate-release-key.keystore`
- **Alias**: `nutrimate-release`
- **Password**: `nutrimate123` (redacted for security)
- **Validity**: 10,000 days

## Configuration Summary

### Bubblewrap Config
- **Host URL**: `https://nutrimate.app`
- **Package ID**: `app.nutrimate.twa`
- **Theme Colors**: 
  - Primary: `#16a34a` (green)
  - Background: `#ffffff` (white)
- **Orientation**: `portrait`
- **Display Mode**: `standalone`
- **Min SDK Version**: 19 (Android 4.4+)

### SHA-256 Fingerprint
```
9A:73:46:8B:84:98:A0:C3:92:E5:F0:CB:9E:8F:39:B5:28:B2:DB:15:99:5A:69:28:06:DA:97:04:40:16:B9:2B
```

### App Shortcuts
1. **Dashboard** - Quick access to nutrition dashboard
2. **Recipes** - Browse and discover recipes
3. **Grocery List** - Manage grocery lists

## Build Instructions

### Prerequisites
1. Android SDK installed
2. Java Development Kit (JDK) 8 or higher
3. Bubblewrap CLI installed globally

### Build Commands
```bash
# Navigate to TWA directory
cd nutrimate-twa

# Build the TWA (interactive mode)
bubblewrap build --twaManifest ./twa-manifest.json

# Or use the build script
./build-twa.ps1
```

### Expected Output
- **APK**: `app-release-signed.apk`
- **AAB**: `app-release-bundle.aab` (preferred for Play Store)

## Verification Steps

### 1. Asset Links Verification
Verify that the assetlinks.json is accessible at:
```
https://nutrimate.app/.well-known/assetlinks.json
```

### 2. Manifest Validation
Ensure the PWA manifest is accessible at:
```
https://nutrimate.app/manifest.webmanifest
```

### 3. TWA Testing
1. Install the generated APK on an Android device
2. Verify the app opens in standalone mode
3. Test navigation and functionality
4. Confirm offline capabilities work

## Play Store Submission

### Required Files
1. **AAB File**: `app-release-bundle.aab`
2. **App Icon**: 512x512 PNG
3. **Screenshots**: Various device sizes
4. **Store Listing**: Description, keywords, etc.

### Store Listing Information
- **App Name**: NutriMate
- **Short Description**: Your Nutrition Companion
- **Category**: Health & Fitness
- **Content Rating**: Everyone

## Security Notes

### Keystore Security
- **IMPORTANT**: Keep the keystore file secure
- **Backup**: Store keystore in multiple secure locations
- **Password**: Use strong passwords in production
- **Version Control**: Never commit keystore to version control

### Domain Verification
- The assetlinks.json file must be served over HTTPS
- The SHA-256 fingerprint must match the keystore used for signing
- Domain ownership is verified through this file

## Troubleshooting

### Common Issues
1. **SDK Not Found**: Install Android SDK or use Bubblewrap's auto-install
2. **Build Failures**: Check Java version and Android SDK setup
3. **Asset Links Not Found**: Ensure file is deployed to production
4. **App Won't Install**: Check package name and signing

### Debug Commands
```bash
# Check keystore info
keytool -list -v -keystore nutrimate-release-key.keystore -alias nutrimate-release

# Verify asset links
curl https://nutrimate.app/.well-known/assetlinks.json

# Test manifest
curl https://nutrimate.app/manifest.webmanifest
```

## Next Steps

1. **Deploy assetlinks.json** to production
2. **Build and test** the TWA locally
3. **Upload to Play Console** for internal testing
4. **Submit for review** once testing is complete
5. **Monitor** app performance and user feedback

## Support

For issues with TWA setup:
- Check Bubblewrap documentation
- Verify Android SDK installation
- Ensure all URLs are accessible over HTTPS
- Test on multiple Android devices and versions
