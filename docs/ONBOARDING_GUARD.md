# Onboarding Guard

## Overview

The Onboarding Guard is a comprehensive system that ensures users complete their profile setup before accessing protected features. It consists of multiple components working together to provide a seamless user experience.

## Components

### 1. `useOnboardingGuard` Hook
- **Location**: `hooks/use-onboarding-guard.ts`
- **Purpose**: Main guard logic that handles routing and redirections
- **Features**:
  - Detects if user needs onboarding
  - Redirects to `/onboarding` if profile incomplete
  - Redirects to `/dashboard` if profile complete
  - Prevents redirect loops
  - Handles authentication state changes

### 2. `useOnboardingStatus` Hook
- **Location**: `hooks/use-onboarding-status.ts`
- **Purpose**: Checks user's onboarding completion status
- **Checks**:
  - `user_metadata.onboarding_complete` flag
  - Existence of profile in `public.users`
  - Existence of preferences in `public.user_preferences`
  - Username presence in profile

### 3. `OnboardingGuard` Component
- **Location**: `components/onboarding-guard.tsx`
- **Purpose**: Wrapper component that provides UI feedback
- **Features**:
  - Loading states
  - Redirect feedback
  - Banner display for incomplete profiles

### 4. `OnboardingBanner` Component
- **Location**: `components/onboarding-banner.tsx`
- **Purpose**: Displays banner when profile is incomplete
- **Features**:
  - Dismissible banner
  - Direct link to onboarding
  - Orange theme for attention

### 5. Middleware
- **Location**: `middleware.ts`
- **Purpose**: Server-side route protection
- **Features**:
  - Early redirect for unauthenticated users
  - Prevents unnecessary client-side checks
  - Handles OAuth callback scenarios

## How It Works

### 1. Route Classification

#### Public Routes (No Authentication Required)
```typescript
const publicRoutes = [
  '/', '/landing', '/login', '/signup',
  '/forgot-password', '/reset-password',
  '/privacy-policy', '/terms-of-service',
  '/pricing', '/auth/callback',
  // ... debug and test routes
]
```

#### Protected Routes (Authentication Required)
```typescript
const protectedRoutes = [
  '/dashboard', '/calendar',
  '/recipes', '/saved-recipes', '/grocery-list',
  '/ingredients', '/goals', '/gamification',
  '/monthly-summary', '/weekly-summary',
  '/calorie-calculator', '/account', '/checkout',
  '/admin'
]
```

### 2. Onboarding Status Check

The system checks multiple conditions to determine if onboarding is needed:

```typescript
// 1. Check user metadata
const onboardingComplete = user.user_metadata?.onboarding_complete === true

// 2. Check profile existence
const { data: profile } = await supabase
  .from('users')
  .select('id, username')
  .eq('id', user.id)
  .maybeSingle()

// 3. Check preferences existence
const { data: preferences } = await supabase
  .from('user_preferences')
  .select('id')
  .eq('user_id', user.id)
  .maybeSingle()

// 4. Determine if onboarding is needed
const needsOnboarding = !onboardingComplete && 
  (!profile || !profile.username || !preferences)
```

### 3. Redirect Logic

#### User Needs Onboarding
- **From protected route** → Redirect to `/onboarding`
- **From public route** → Show banner (if authenticated)
- **From `/onboarding`** → Stay on `/onboarding`

#### User Onboarding Complete
- **From `/onboarding`** → Redirect to `/dashboard`
- **From protected route** → Allow access
- **From public route** → Allow access

#### No Authentication
- **From protected route** → Redirect to `/login`
- **From public route** → Allow access

## Integration

### 1. Layout Integration

The guard is integrated into the root layout:

```typescript
// app/layout.tsx
<ConditionalLayout>
  <OnboardingGuard>
    {children}
  </OnboardingGuard>
</ConditionalLayout>
```

### 2. Hook Usage

Use the guard hook in components that need onboarding status:

```typescript
import { useOnboardingGuard } from '@/hooks/use-onboarding-guard'

function MyComponent() {
  const { isLoading, needsOnboarding, isRedirecting } = useOnboardingGuard()
  
  if (isLoading) return <LoadingSpinner />
  if (isRedirecting) return <RedirectMessage />
  
  return <div>Content</div>
}
```

## Configuration

### 1. Route Configuration

Add new routes to the appropriate arrays in `use-onboarding-guard.ts`:

```typescript
// For public routes
const publicRoutes = [
  // ... existing routes
  '/new-public-route'
]

// For protected routes
const protectedRoutes = [
  // ... existing routes
  '/new-protected-route'
]
```

### 2. Onboarding Criteria

Modify the onboarding check logic in `use-onboarding-status.ts`:

```typescript
// Add new criteria
const hasCustomField = profile?.custom_field !== null
const needsOnboarding = !onboardingComplete && 
  (!profile || !profile.username || !preferences || !hasCustomField)
```

## Error Handling

### 1. Database Errors
- If profile check fails → Assume onboarding needed
- If preferences check fails → Assume onboarding needed
- Log errors for debugging

### 2. Authentication Errors
- If session check fails → Allow public access
- If user fetch fails → Assume no authentication

### 3. Redirect Loops
- Prevented by checking current route before redirecting
- State management prevents multiple simultaneous redirects

## Testing

### 1. Manual Testing

Test different scenarios:

1. **New user signup** → Should redirect to onboarding
2. **Existing user login** → Should redirect based on profile status
3. **OAuth user** → Should redirect to onboarding initially
4. **Profile completion** → Should redirect to dashboard
5. **Public route access** → Should work without authentication

### 2. Automated Testing

Use the test script:

```bash
npx tsx scripts/test-onboarding-guard.ts
```

This will:
- Create a test user
- Check initial onboarding status
- Simulate onboarding completion
- Verify final status
- Clean up test data

## Troubleshooting

### Common Issues

1. **Redirect Loops**
   - Check route classification
   - Verify redirect conditions
   - Check for conflicting redirects

2. **Banner Not Showing**
   - Verify user authentication status
   - Check route classification
   - Verify onboarding status logic

3. **Incorrect Redirects**
   - Check onboarding status logic
   - Verify user metadata
   - Check database queries

### Debug Mode

Enable debug logging by adding console.log statements:

```typescript
console.log('Onboarding status:', {
  isLoading,
  needsOnboarding,
  isRedirecting,
  currentRoute: pathname,
  user: user?.id
})
```

## Performance Considerations

1. **Database Queries**: Minimized by checking metadata first
2. **Re-renders**: Prevented by proper state management
3. **Redirects**: Batched to prevent multiple redirects
4. **Caching**: User status cached in component state

## Security

1. **Route Protection**: Server-side middleware prevents unauthorized access
2. **Data Validation**: All database queries use proper error handling
3. **Authentication**: Proper session validation before profile checks
4. **RLS**: Database queries respect Row Level Security policies
