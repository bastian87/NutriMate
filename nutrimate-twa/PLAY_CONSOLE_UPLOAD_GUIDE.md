# NutriMate Play Console Upload Guide

## Pre-Upload Checklist

### ✅ Required Files Ready
- [ ] **AAB File**: `app-release-bundle.aab` (preferred over APK)
- [ ] **App Icon**: 512×512 PNG
- [ ] **Feature Graphic**: 1024×500 PNG
- [ ] **Screenshots**: 5 phone screenshots (1080×1920)
- [ ] **Privacy Policy**: Accessible at https://nutrimate.app/privacy-policy

### ✅ App Information Prepared
- [ ] **App Name**: NutriMate
- [ ] **Package Name**: app.nutrimate.twa
- [ ] **Short Description**: English + Spanish versions
- [ ] **Full Description**: English + Spanish versions
- [ ] **Category**: Health & Fitness
- [ ] **Content Rating**: Everyone

## Step-by-Step Upload Process

### 1. Create New App in Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - **App name**: NutriMate
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check all applicable boxes

### 2. Upload AAB File
1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload `app-release-bundle.aab`
4. Fill in release notes:
   ```
   Initial release of NutriMate - Your Personal Nutrition Companion
   
   Features:
   • Smart meal planning and nutrition tracking
   • Recipe discovery with detailed nutritional information
   • Grocery list management
   • Offline access to saved content
   • Multi-language support (English/Spanish)
   ```

### 3. Configure App Content
1. Go to **Store listing**
2. Upload required assets:
   - **App icon**: 512×512 PNG
   - **Feature graphic**: 1024×500 PNG
   - **Phone screenshots**: 5 images (1080×1920)
3. Fill in text content:
   - **App name**: NutriMate
   - **Short description**: [From PLAY_STORE_LISTING.md]
   - **Full description**: [From PLAY_STORE_LISTING.md]

### 4. Set Up App Information
1. Go to **App content**
2. **Privacy Policy**:
   - URL: https://nutrimate.app/privacy-policy
   - Status: Must be accessible
3. **App category**: Health & Fitness
4. **Content rating**: Complete questionnaire for "Everyone" rating

### 5. Configure Data Safety
1. Go to **Data safety**
2. **Data collection**: 
   - ✅ Personal info (email, name)
   - ✅ App activity (usage analytics)
   - ✅ Device or other IDs (for authentication)
3. **Data sharing**: 
   - ❌ No data shared with third parties
4. **Security practices**:
   - ✅ Data is encrypted in transit
   - ✅ Users can request data deletion

### 6. Set Up Pricing & Distribution
1. Go to **Pricing & distribution**
2. **Pricing**:
   - ✅ Free
   - ❌ No in-app purchases (purchases stay on web)
3. **Countries/regions**: Select all applicable countries
4. **Device categories**: 
   - ✅ Phones
   - ✅ Tablets (if supported)

### 7. Configure App Access
1. Go to **App access**
2. **App availability**:
   - ✅ Available to everyone
3. **Ads**: 
   - ❌ No ads (if applicable)

### 8. Set Up Store Settings
1. Go to **Store settings**
2. **App details**:
   - **Contact details**: [Your contact information]
   - **Website**: https://nutrimate.app
   - **Support URL**: https://nutrimate.app/support (if available)
3. **App updates**:
   - ✅ Auto-update

## Post-Upload Steps

### 1. Internal Testing
1. Go to **Testing** → **Internal testing**
2. Create internal test track
3. Upload AAB to internal testing
4. Add testers (email addresses)
5. Share testing link with team

### 2. Review Process
1. Submit app for review
2. **Review time**: Typically 1-3 days
3. **Common issues to watch for**:
   - Asset links verification
   - Privacy policy accessibility
   - App functionality in standalone mode
   - Content rating compliance

### 3. Release Management
1. **Staged rollout**: Start with 20% of users
2. **Monitor**: Check crash reports and user feedback
3. **Full rollout**: After 7 days of successful staged rollout

## Important Notes

### TWA-Specific Considerations
- **Asset Links**: Ensure https://nutrimate.app/.well-known/assetlinks.json is accessible
- **Manifest**: Verify https://nutrimate.app/manifest.webmanifest is valid
- **Standalone Mode**: App must open without browser UI
- **Navigation**: Back button must work correctly

### Compliance Requirements
- **Privacy Policy**: Must be comprehensive and accessible
- **Data Safety**: Accurately describe data collection and usage
- **Content Rating**: Complete questionnaire honestly
- **Target Audience**: Appropriate for all ages

### Common Rejection Reasons
1. **Asset Links Not Found**: Verify .well-known/assetlinks.json is deployed
2. **Privacy Policy Issues**: Ensure policy covers all data collection
3. **App Functionality**: Test thoroughly on multiple devices
4. **Content Rating**: Complete questionnaire accurately

## Monitoring and Maintenance

### Post-Launch Monitoring
1. **Crash Reports**: Monitor for crashes and ANRs
2. **User Reviews**: Respond to user feedback
3. **Analytics**: Track app performance and usage
4. **Updates**: Plan regular updates with new features

### Update Process
1. **Version Code**: Increment for each update
2. **Release Notes**: Document new features and fixes
3. **Testing**: Test updates thoroughly before release
4. **Rollout**: Use staged rollout for major updates

## Support and Resources

### Google Play Console Resources
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Asset Links Generator](https://developers.google.com/digital-asset-links/tools/generator)

### Contact Information
- **Developer Email**: [Your email]
- **Support URL**: https://nutrimate.app/support
- **Privacy Policy**: https://nutrimate.app/privacy-policy

## Final Checklist Before Submission

### ✅ Technical Requirements
- [ ] AAB file builds successfully
- [ ] App installs and launches on test devices
- [ ] All core features work in standalone mode
- [ ] Asset links are accessible and valid
- [ ] Privacy policy is comprehensive and accessible

### ✅ Content Requirements
- [ ] All required images are uploaded
- [ ] Descriptions are complete in English and Spanish
- [ ] Content rating questionnaire is completed
- [ ] Data safety information is accurate
- [ ] App category is appropriate

### ✅ Compliance Requirements
- [ ] Privacy policy covers all data collection
- [ ] App follows Google Play policies
- [ ] Content is appropriate for target audience
- [ ] No misleading claims in descriptions
- [ ] All required legal pages are accessible

**Ready for submission**: ✅ / ❌
**Submission date**: [Date]
**Expected review completion**: [Date + 3 days]
