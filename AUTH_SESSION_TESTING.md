# Testing Session Restoration in NutriMate

## Overview
This document provides instructions for testing and debugging session restoration issues in NutriMate, especially in production environments.

## Key Changes Made

### 1. Improved AuthProvider
- **Eliminated conflicting AuthRedirector**: Removed the separate AuthRedirector component that was creating duplicate auth state listeners
- **Better loading state management**: Added `initialized` state to prevent premature rendering
- **Robust session restoration**: Improved `getSession()` handling with proper error management
- **Cleaner auth state changes**: Single, well-managed `onAuthStateChange` listener

### 2. Enhanced ConditionalLayout
- **Centralized redirection logic**: All auth-related redirections now handled in one place
- **Better route protection**: Improved logic for public vs protected routes
- **Prevented redirect loops**: Added `isRedirecting` state to prevent infinite redirects

### 3. Improved Auth Callback
- **Better error handling**: More robust error handling in OAuth callback
- **Automatic profile creation**: Creates user profiles automatically for OAuth users
- **Proper redirection**: Ensures users go to the right place after OAuth

## Testing Instructions

### Local Development Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Login with a test account**:
   - Go to `/login`
   - Use test credentials or create a new account
   - Verify you're redirected to `/dashboard` or `/onboarding`

3. **Test session restoration**:
   - Close the browser tab completely
   - Reopen the browser and go to `http://localhost:3000`
   - You should be automatically logged in and redirected to the appropriate page

4. **Test logout and re-login**:
   - Logout from the sidebar
   - Verify you're redirected to `/landing`
   - Login again and verify the session is restored

### Production Testing (nutrimate.net)

1. **Test session persistence**:
   - Login to the production site
   - Close the browser tab
   - Reopen and navigate to `https://nutrimate.net`
   - Verify you're still logged in

2. **Test cross-tab session sharing**:
   - Login in one tab
   - Open a new tab to `https://nutrimate.net`
   - Verify you're automatically logged in

3. **Test session expiration**:
   - Login and wait for session to expire (or manually clear localStorage)
   - Verify you're redirected to `/landing`

### Debug Tools

#### Auth Debug Component
- Press `Ctrl+Shift+D` to toggle the auth debug panel
- Shows current session state, user info, and localStorage status
- Available in development and production (with keyboard shortcut)

#### Console Logging
- Auth state changes are logged to console
- Look for "Auth state change:" messages
- Check for any error messages

#### Script Testing
Run the session restoration test script:
```bash
npx tsx scripts/test-session-restoration.ts
```

## Common Issues and Solutions

### Issue: User not staying logged in after page refresh
**Solution**: Check that:
- Supabase session is valid and not expired
- localStorage is not being cleared unexpectedly
- No JavaScript errors in console

### Issue: Infinite redirect loops
**Solution**: 
- Check ConditionalLayout logic
- Verify PUBLIC_ROUTES array includes all public routes
- Check for conflicting redirect logic

### Issue: OAuth users not getting profiles created
**Solution**:
- Verify the callback page is working correctly
- Check Supabase RLS policies allow profile creation
- Look for errors in the callback page

### Issue: Loading state never resolves
**Solution**:
- Check AuthProvider initialization logic
- Verify `getSession()` is completing
- Check for errors in the auth state change listener

## Environment Variables

Ensure these are set correctly:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Configuration

### Auth Settings
- **Email confirmation**: Should be OFF for seamless login
- **Session duration**: Default (1 hour) or custom as needed
- **OAuth providers**: Google should be configured

### RLS Policies
Ensure these policies exist:
```sql
-- Users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences table
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Monitoring in Production

### Key Metrics to Monitor
- Session restoration success rate
- Time to first meaningful paint after session restoration
- Error rates in auth-related operations
- User retention after session restoration

### Logs to Check
- Browser console errors
- Network requests to Supabase
- Auth state change events
- Redirect patterns

## Troubleshooting Checklist

- [ ] Supabase client properly configured
- [ ] Environment variables set correctly
- [ ] RLS policies configured
- [ ] OAuth providers configured
- [ ] Session duration appropriate
- [ ] No conflicting auth listeners
- [ ] Proper error handling in place
- [ ] Loading states managed correctly
- [ ] Redirect logic centralized
- [ ] localStorage not being cleared unexpectedly 