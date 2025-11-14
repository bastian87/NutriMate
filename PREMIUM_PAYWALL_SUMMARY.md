# Premium Paywall Implementation Summary

## Overview

NutriMate uses a minimal Premium layer with simple feature gating. The Weekly Summary is the primary Premium feature, with a clear paywall that shows a blurred preview to free users.

## Premium Status Checking

### Primary Mechanism

**Hook**: `useIsPremium()` from `components/auth/user-profile-provider.tsx`

```typescript
export function useIsPremium() {
  const { userData } = useUserProfile()
  return userData?.isPremium ?? false
}
```

**Data Source**: 
- Subscription data is fetched from `user_subscriptions` table
- Premium status is determined by: `subscription.plan === "premium" && (subscription.status === "active" || subscription.status === "trialing")`
- Status is cached in `UserProfileProvider` context and localStorage

**Where Premium Status is Stored:**
- **Database Table**: `user_subscriptions`
  - Fields: `user_id`, `subscription_id`, `status`, `customer_id`, `plan` (implicitly "premium" if active)
- **Context**: `UserProfileProvider` maintains `userData.isPremium` boolean
- **Local Storage**: Cached for performance (1 hour TTL)

## Premium-Gated Features

### 1. Weekly Summary (`/weekly-summary`)

**Location**: `app/weekly-summary/page.tsx`

**Implementation**:
- **Data Fetching**: API allows all authenticated users to fetch data (`/api/summary/weekly`)
- **UI Gating**: Content is blurred and overlaid with paywall for free users
- **Paywall Display**:
  - Blur effect: `blur-sm pointer-events-none select-none` classes on content
  - Overlay: Absolute positioned card with upgrade CTA
  - Features shown: Days logged, Average calories per day

**Code Pattern**:
```tsx
<div className="relative">
  {/* Content - blurred if not premium */}
  <div className={isPremium ? "" : "blur-sm pointer-events-none select-none"}>
    {/* Weekly summary cards */}
  </div>

  {/* Premium Paywall Overlay */}
  {!isPremium && (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      {/* Paywall card with CTA */}
    </div>
  )}
</div>
```

**Premium Check**: Uses `useIsPremium()` hook

---

## Free Features (Always Available)

The following features remain fully functional for free users:

### Core Functionality
- ✅ **Daily Meal Logging** (`/food-diary`)
  - Quick meal entry
  - Advanced ingredient mode
  - Recent items
  - No restrictions

- ✅ **Gamification System**
  - XP earning
  - Level progression
  - Streaks
  - Achievements
  - All gamification features are free

- ✅ **Home Dashboard** (`/dashboard`)
  - Today's calories and macros
  - XP today and streak
  - Today's logged meals
  - All dashboard features are free

- ✅ **Achievements Page** (`/gamification`)
  - Level, XP, streak display
  - Achievement list
  - All achievement features are free

- ✅ **Profile Page** (`/account`)
  - User settings
  - Progress display
  - All profile features are free

### Custom Recipes
- ✅ Create custom recipes
- ✅ Edit custom recipes
- ✅ View recipes
- ✅ No restrictions

---

## Premium Paywall Components

### Weekly Summary Paywall

**Location**: `app/weekly-summary/page.tsx` (lines 164-201)

**Features**:
- Crown icon badge
- "Unlock Weekly Summary" title
- Feature list (Days logged, Average calories)
- "Unlock Premium" CTA button linking to `/pricing`
- Blurred content preview

**Styling**:
- Overlay: `bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm`
- Border: `border-2 border-orange-200 dark:border-orange-800`
- CTA Button: `bg-orange-600 hover:bg-orange-700`

---

## API Endpoints

### Weekly Summary API

**Endpoint**: `GET /api/summary/weekly`

**Access**: All authenticated users (no premium check in API)

**Response**: Returns weekly data regardless of subscription status
- `totalDays`: Days logged in the week
- `averageKcalPerDay`: Average calories per day
- Other weekly metrics

**Rationale**: API doesn't gate data - UI handles the paywall. This allows:
- Preview of data to entice upgrades
- Consistent API behavior
- Easier testing and debugging

---

## Premium Status Flow

```
User Profile Provider
  ↓
Fetches subscription from DB
  ↓
Checks: plan === "premium" && status === "active"|"trialing"
  ↓
Sets userData.isPremium = true/false
  ↓
Caches in context and localStorage
  ↓
Components use useIsPremium() hook
  ↓
UI shows/hides premium features
```

---

## Files with Premium Checks

### Pages
- `app/weekly-summary/page.tsx` - Weekly summary paywall
- `app/dashboard/page.tsx` - Shows premium badge (no gating)
- `app/account/page.tsx` - Shows premium badge (no gating)

### Components
- `components/auth/user-profile-provider.tsx` - Premium status provider
- `components/premium-preview.tsx` - Reusable paywall component (not currently used for weekly summary)

### Hooks
- `components/auth/user-profile-provider.tsx` - `useIsPremium()` hook

### Services
- `lib/subscription-service.ts` - Subscription data fetching
- `lib/entitlements.ts` - Feature access logic (not currently used for weekly summary)

---

## Implementation Pattern

### Standard Premium Check Pattern

```tsx
import { useIsPremium } from "@/components/auth/user-profile-provider"

export default function FeaturePage() {
  const isPremium = useIsPremium()
  
  return (
    <div className="relative">
      {/* Content */}
      <div className={isPremium ? "" : "blur-sm pointer-events-none"}>
        {/* Feature content */}
      </div>
      
      {/* Paywall */}
      {!isPremium && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {/* Paywall overlay */}
        </div>
      )}
    </div>
  )
}
```

---

## Future Premium Features (Placeholder)

The system is designed to easily add more premium features:

1. **Extended History**: Historical data beyond current week
2. **Cosmetic Features**: Themes, custom colors, etc.
3. **Advanced Analytics**: Trends, comparisons, etc.

To add a new premium feature:
1. Add feature check using `useIsPremium()`
2. Apply blur/overlay pattern similar to weekly summary
3. Add feature to `lib/entitlements.ts` if using centralized feature access

---

## Testing Premium Status

### Manual Testing
1. **Free User**: 
   - Weekly summary should show blurred content with paywall
   - All other features should work normally

2. **Premium User**:
   - Weekly summary should show full content
   - No paywall overlay

### Premium Status Verification
- Check `user_subscriptions` table for active subscription
- Verify `userData.isPremium` in context
- Check localStorage cache (if present)

---

## Notes

- **No API Gating**: APIs don't check premium status - UI handles all gating
- **Data Preview**: Free users can see blurred preview to encourage upgrades
- **Minimal Gating**: Only Weekly Summary is gated - everything else is free
- **Easy Maintenance**: Single hook (`useIsPremium()`) for all premium checks
- **Consistent Pattern**: All premium features use the same blur + overlay pattern

