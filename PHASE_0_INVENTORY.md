# Phase 0 - Complete Inventory for Nutrimate V2 Simplification

**Date**: Generated from comprehensive codebase scan  
**Purpose**: Complete inventory of all features, routes, components, API modules, database models, and dependencies that need to be removed or simplified for V2

---

## EXECUTIVE SUMMARY

**Total Impact Areas**: 7 major feature categories  
**Pages to Remove/Simplify**: ~15 pages  
**API Routes to Remove**: ~15 routes  
**Components to Remove**: ~20 components  
**Database Tables to Remove/Simplify**: 6 tables  
**Dependencies to Remove**: 2 libraries (recharts, pdf-lib)

---

## 1. RECIPE DISCOVERY & EXTERNAL RECIPE FEATURES

### Pages & Routes (REMOVE)
- ✅ **`app/recipes/page.tsx`** - Main recipe discovery/browsing page (REMOVE)
- ✅ **`app/recipes/[slug]/page.tsx`** - Individual recipe detail page (REMOVE)
- ✅ **`app/recipes/[slug]/edit/page.tsx`** - Recipe editing page (REMOVE)
- ✅ **`app/recipes/new/page.tsx`** - Create new recipe page (REMOVE)
- ✅ **`app/recipes/loading.tsx`** - Recipe page loading state (REMOVE)
- ✅ **`app/saved-recipes/page.tsx`** - User's saved/favorited recipes (REMOVE)

### API Routes (REMOVE)
- ✅ **`app/api/recipes/private/route.ts`** - CRUD for private recipes (REMOVE)
- ✅ **`app/api/recipes/ratings/route.ts`** - Recipe rating system (REMOVE)
- ✅ **`app/api/recipes/import/one/`** - Single recipe import (EMPTY DIR - DELETE)
- ✅ **`app/api/recipes/import/bulk/`** - Bulk recipe import (EMPTY DIR - DELETE)
- ✅ **`app/api/favorites/route.ts`** - User favorites management (REMOVE)

### Components (REMOVE)
- ✅ **`components/recipe-card-new.tsx`** - Recipe card display component (REMOVE)
- ✅ **`components/recipe-card-skeleton.tsx`** - Loading skeleton for recipe cards (REMOVE)
- ✅ **`components/recipe-detail-new.tsx`** - Recipe detail view component (REMOVE)
- ✅ **`components/recipe-filters-new.tsx`** - Recipe filtering/search component (REMOVE)

### Services & Hooks (REMOVE)
- ✅ **`lib/services/recipe-service.ts`** - Core recipe service (SIMPLIFY - keep only basic CRUD for custom recipes)
- ✅ **`hooks/use-recipes.ts`** - React hook for recipe data fetching (REMOVE)
- ✅ **`hooks/use-user-favorites.ts`** - Hook for managing user favorites (REMOVE)
- ✅ **`hooks/use-favorites.ts`** - Legacy favorites hook (REMOVE)

### Database Tables (SIMPLIFY)
- ✅ **`recipes`** - Keep minimal fields only (id, name, image_url, calories, created_by, is_private, created_at, updated_at)
  - **Remove from types**: description, prep_time_minutes, cook_time_minutes, servings, protein, carbs, fat, fiber, sugar, sodium, difficulty_level, cuisine_type, meal_type, instructions
- ✅ **`recipe_ingredients`** - Keep (needed for custom recipes)
- ❌ **`recipe_ratings`** - REMOVE (no ratings in V2)
- ❌ **`user_favorites`** - REMOVE (no favorites in V2)

### Notes
- Custom recipes (user-created) should remain but simplified
- No external recipe discovery or browsing
- No recipe ratings or favorites
- Recipe import directories are empty and can be deleted

---

## 2. MEAL PLANNING & CALENDAR

### Pages & Routes (REMOVE)
- ✅ **No dedicated calendar page** - Calendar functionality embedded in dashboard

### Components (SIMPLIFY)
- ✅ **`components/dashboard-food-diary.tsx`** - Contains calendar view (lines 254-346 removed in previous refactor)
  - **Status**: Calendar grid already removed, verify no remaining calendar logic

### Database Tables (ALREADY REMOVED)
- ✅ **`meal_plans`** - Already commented out in database.ts (no code references)
- ✅ **`meal_plan_meals`** - Already commented out in database.ts (no code references)

### Notes
- Calendar functionality was already removed from dashboard in previous refactor
- No dedicated meal planning pages found
- Database tables are commented out but may still exist in actual database

---

## 3. GROCERY LISTS

### Pages & Routes (REMOVE)
- ✅ **`app/grocery-list/page.tsx`** - Main grocery list page (REMOVE)
- ✅ **`app/debug-grocery-list/`** - Debug page (if exists, REMOVE)

### API Routes (REMOVE)
- ✅ **`app/api/grocery-lists/route.ts`** - Grocery list CRUD operations (REMOVE)
- ✅ **`app/api/grocery-lists/items/route.ts`** - Grocery list item operations (REMOVE)

### Components (REMOVE)
- ✅ **`components/grocery-list-component.tsx`** - Grocery list display component (REMOVE)
- ✅ **`components/grocery-item-card.tsx`** - Individual grocery item card (REMOVE)
- ✅ **`components/grocery-section-card.tsx`** - Category section card (REMOVE)
- ✅ **`components/grocery-add-form.tsx`** - Add item form (REMOVE)
- ✅ **`components/grocery-toolbar.tsx`** - Toolbar with export/actions (REMOVE)

### Services & Hooks (REMOVE)
- ✅ **`hooks/use-grocery-list.ts`** - Single grocery list hook (REMOVE)
- ✅ **`hooks/use-multiple-grocery-lists.ts`** - Multiple lists management hook (REMOVE)
- ✅ **`lib/services/grocery-service.ts`** - Grocery service (REMOVE)
- ✅ **`lib/grocery-service.ts`** - Duplicate or legacy service (REMOVE)

### Database Tables (REMOVE)
- ❌ **`grocery_lists`** - REMOVE (id, user_id, name, created_at, updated_at)
- ❌ **`grocery_list_items`** - REMOVE (id, grocery_list_id, recipe_id, name, quantity, unit, category, is_checked, created_at, updated_at)

### Notes
- All grocery list functionality should be completely removed
- No navigation links to grocery lists should remain

---

## 4. EXPORT FUNCTIONALITY (PDF/Word/CSV)

### Pages & Routes (REMOVE)
- ✅ Export functionality embedded in grocery list page (will be removed with grocery lists)

### API Routes (REMOVE)
- ✅ **`app/api/exports/grocery-list/route.ts`** - Export API (REMOVE)
  - Supports: JSON, CSV, TXT formats
  - Premium feature guard

### Dependencies (REMOVE)
- ✅ **`pdf-lib`** (v1.17.1) - PDF generation library (REMOVE from package.json)
  - Currently used only for grocery list exports

### Notes
- All export functionality tied to grocery lists
- No standalone export features found
- Remove pdf-lib dependency after removing exports

---

## 5. ADVANCED ANALYTICS & CHARTS

### Pages & Routes (REMOVE)
- ✅ **`app/admin/analytics/`** - Admin analytics directory (EMPTY - DELETE)
- ✅ **`app/test-analytics/`** - Test analytics directory (EMPTY - DELETE)
- ✅ **`app/monthly-summary/`** - Monthly summary directory (EMPTY - DELETE)
- ✅ **`app/weekly-summary/page.tsx`** - KEEP (simplified, Premium paywall - already implemented)

### API Routes (REMOVE)
- ✅ **`app/api/analytics/`** - Analytics API directory (EMPTY - DELETE)
- ✅ **`app/api/setup-analytics/`** - Analytics setup directory (EMPTY - DELETE)
- ✅ **`app/api/metrics/`** - Metrics API directory (EMPTY - DELETE)
- ✅ **`app/api/summary/monthly/`** - Monthly summary API directory (EMPTY - DELETE)
- ✅ **`app/api/summary/weekly/route.ts`** - KEEP (simplified weekly summary)

### Components (KEEP/SIMPLIFY)
- ✅ **`components/summary/WeeklySummaryCard.tsx`** - KEEP (used by weekly summary)
- ✅ **`components/dashboard-food-diary.tsx`** - Already simplified (calendar removed)

### Dependencies (REMOVE)
- ✅ **`recharts`** (v3.2.1) - Chart library (REMOVE from package.json)
  - Previously used for analytics charts
  - Verify no remaining usage before removal

### Notes
- Most analytics code already removed in previous refactoring
- Weekly summary is simplified (days logged, average calories) and should remain
- Monthly summary directories are empty and can be deleted
- Remove recharts dependency after verifying no usage

---

## 6. CUSTOM INGREDIENTS (PREMIUM FEATURE)

### Pages & Routes (REMOVE)
- ✅ **`app/ingredients/page.tsx`** - Ingredients management page (REMOVE)
  - Currently allows viewing all ingredients and creating custom ones (Premium)
  - Remove entire page - ingredients should only be available in meal logging flow

### API Routes (REMOVE)
- ✅ **`app/api/custom-ingredients/route.ts`** - Custom ingredients CRUD (REMOVE)
  - GET: List custom ingredients (Free)
  - POST: Create custom ingredient (Premium)
  - PUT: Update custom ingredient (Premium)
  - DELETE: Delete custom ingredient (Premium)
- ✅ **`app/api/ingredients/route.ts`** - General ingredients API (EVALUATE)
  - GET: List all ingredients
  - **Decision needed**: Keep for meal logging or remove entirely?

### Components (EVALUATE)
- ✅ **`components/ingredient-selector.tsx`** - Ingredient selection component
  - **Decision needed**: Used in meal logging? Keep if needed, remove if not

### Hooks (EVALUATE)
- ✅ **`hooks/use-ingredients.ts`** - Ingredients data hook
  - **Decision needed**: Used in meal logging? Keep if needed, remove if not

### Database Tables (KEEP)
- ✅ **`ingredients`** - KEEP (needed for meal logging)
  - Fields: id, name, nutrition_data, created_by, is_custom, created_at, updated_at
  - Custom ingredient creation/editing should be removed (Premium feature)

### Notes
- Ingredients page should be removed (not core to "fastest food logging")
- Custom ingredient creation/editing is Premium - remove this feature
- Ingredients should only be accessible through meal logging flow
- Verify if ingredient-selector is used in quick-meal-logger

---

## 7. MULTI-LANGUAGE / I18N

### Components (DISABLE, KEEP STRUCTURE)
- ✅ **`components/language-selector.tsx`** - Language selection component
  - **Status**: Already returns null (hidden) - KEEP but verify
- ✅ **`lib/i18n/context.tsx`** - Language context provider
  - **Status**: Already configured to always use English - KEEP structure

### Translation Files (KEEP)
- ✅ **`lib/i18n/translations.ts`** - Main translations file (KEEP for future re-enablement)
- ✅ **`lib/i18n/en.ts`** - English constants (KEEP)
- ✅ **`lib/i18n/es.ts`** - Spanish constants (KEEP for future)

### Usage
- ✅ **`useLanguage()` hook** - Used throughout codebase
  - **Status**: Already simplified to single language - KEEP structure
  - All pages use `t("key.path")` pattern - no changes needed

### Notes
- i18n is already simplified to single language (English)
- Language selector is hidden
- Structure preserved for future re-enablement
- No code changes needed for i18n

---

## 8. NAVIGATION & ROUTING

### Navigation Components (ALREADY SIMPLIFIED)
- ✅ **`components/sidebar-new.tsx`** - Main desktop sidebar (already simplified to 4 main areas)
- ✅ **`components/bottom-navigation.tsx`** - Mobile bottom nav (already simplified)
- ✅ **`components/navigation.tsx`** - Legacy navigation (already simplified)
- ✅ **`components/sidebar.tsx`** - Legacy sidebar (already simplified)
- ✅ **`components/mobile-navigation.tsx`** - Legacy mobile nav (already simplified)
- ✅ **`components/horizontal-navigation.tsx`** - Legacy horizontal nav (already simplified)
- ✅ **`components/optimized-navigation.tsx`** - Legacy optimized nav (already simplified)

### Notes
- Navigation already simplified to: Home, Add Meal, Achievements, Profile
- All grocery list, meal plan, and recipe discovery links already removed
- Verify no remaining dead links

---

## 9. DATABASE SCHEMA SUMMARY

### Tables to REMOVE
1. ❌ **`recipe_ratings`** - Recipe ratings/reviews
2. ❌ **`user_favorites`** - User favorite recipes
3. ❌ **`grocery_lists`** - Grocery list container
4. ❌ **`grocery_list_items`** - Individual grocery items
5. ❌ **`meal_plans`** - (Already commented out, verify DB)
6. ❌ **`meal_plan_meals`** - (Already commented out, verify DB)

### Tables to SIMPLIFY
1. ✅ **`recipes`** - Remove unused fields (description, prep_time, cook_time, servings, protein, carbs, fat, fiber, sugar, sodium, difficulty_level, cuisine_type, meal_type, instructions)
   - **Keep**: id, name, image_url, calories, created_by, is_private, created_at, updated_at

### Tables to KEEP
1. ✅ **`users`** - Core user data
2. ✅ **`recipe_ingredients`** - Needed for custom recipes
3. ✅ **`ingredients`** - Needed for meal logging
4. ✅ **`food_diary_entries`** - Core meal logging
5. ✅ **`day_entries`** - Daily summaries
6. ✅ **`day_entry_items`** - Daily entry items
7. ✅ **`goals`** - User goals
8. ✅ **`user_preferences`** - User preferences (may simplify later)
9. ✅ **`xp_ledger`** - XP tracking
10. ✅ **`streaks`** - Streak tracking
11. ✅ **`achievements`** - Achievement data
12. ✅ **`user_subscriptions`** - Subscription data
13. ✅ **`support_tickets`** - Support system

---

## 10. ENVIRONMENT VARIABLES

### Variables to REMOVE
- ❌ **No Spoonacular API key** - Already removed (no references found)
- ❌ **No external recipe API keys** - Already removed

### Variables to KEEP
- ✅ **`NEXT_PUBLIC_SUPABASE_URL`** - Supabase URL
- ✅ **`SUPABASE_SERVICE_ROLE_KEY`** - Supabase service role key
- ✅ **`NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID`** - LemonSqueezy monthly plan
- ✅ **`NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID`** - LemonSqueezy annual plan

---

## 11. DEPENDENCIES TO REMOVE

### From package.json
1. ✅ **`recharts`** (v3.2.1) - Chart library
   - **Reason**: Used for analytics charts (removed)
   - **Action**: Remove after verifying no usage

2. ✅ **`pdf-lib`** (v1.17.1) - PDF generation
   - **Reason**: Used for grocery list exports (removed)
   - **Action**: Remove after removing export functionality

### Dependencies to KEEP
- ✅ **`framer-motion`** - Animations (used throughout)
- ✅ **`date-fns`** - Date manipulation (used in logging)
- ✅ **`zod`** - Schema validation (used in API routes)
- ✅ **`next-pwa`** - PWA support (core feature)
- ✅ All other dependencies are core to remaining features

---

## 12. CORE FEATURES TO KEEP (V2 IDENTITY)

### Pages (KEEP)
- ✅ **`app/dashboard/page.tsx`** - Home screen (redesigned for V2)
- ✅ **`app/food-diary/page.tsx`** - Meal logging (core)
- ✅ **`app/gamification/page.tsx`** - Achievements (core)
- ✅ **`app/account/page.tsx`** - Profile (minimal)
- ✅ **`app/weekly-summary/page.tsx`** - Weekly summary (Premium, simplified)
- ✅ **`app/goals/page.tsx`** - Goals (core)
- ✅ **`app/pricing/page.tsx`** - Pricing page
- ✅ **`app/landing/page.tsx`** - Landing page

### API Routes (KEEP)
- ✅ **`app/api/food-entries/route.ts`** - Meal logging API
- ✅ **`app/api/day-entries/route.ts`** - Daily entries API
- ✅ **`app/api/gamification/route.ts`** - Gamification API
- ✅ **`app/api/goals/route.ts`** - Goals API
- ✅ **`app/api/summary/weekly/route.ts`** - Weekly summary API
- ✅ **`app/api/user/preferences/route.ts`** - User preferences
- ✅ **`app/api/user/subscription/route.ts`** - Subscription management
- ✅ **`app/api/create-checkout/route.ts`** - Checkout creation
- ✅ **`app/api/webhooks/lemonsqueezy/route.ts`** - Payment webhooks

### Components (KEEP)
- ✅ **`components/quick-meal-logger.tsx`** - Quick meal logging (core)
- ✅ **`components/dashboard-food-diary.tsx`** - Dashboard (simplified)
- ✅ **`components/gamification/*`** - Gamification components
- ✅ **`components/auth/*`** - Authentication components
- ✅ **`components/premium-preview.tsx`** - Premium paywall component

### Services (KEEP)
- ✅ **`lib/gamification/gamification-service.ts`** - Centralized gamification
- ✅ **`lib/gamification/xp-system.ts`** - XP system definitions
- ✅ **`lib/subscription-service.ts`** - Subscription service

---

## 13. FILES TO DELETE (COMPLETE LIST)

### Pages
1. `app/recipes/page.tsx`
2. `app/recipes/[slug]/page.tsx`
3. `app/recipes/[slug]/edit/page.tsx`
4. `app/recipes/new/page.tsx`
5. `app/recipes/loading.tsx`
6. `app/saved-recipes/page.tsx`
7. `app/grocery-list/page.tsx`
8. `app/ingredients/page.tsx`

### API Routes
1. `app/api/recipes/private/route.ts`
2. `app/api/recipes/ratings/route.ts`
3. `app/api/recipes/import/one/` (directory)
4. `app/api/recipes/import/bulk/` (directory)
5. `app/api/favorites/route.ts`
6. `app/api/grocery-lists/route.ts`
7. `app/api/grocery-lists/items/route.ts`
8. `app/api/exports/grocery-list/route.ts`
9. `app/api/custom-ingredients/route.ts`
10. `app/api/analytics/` (directory)
11. `app/api/setup-analytics/` (directory)
12. `app/api/metrics/` (directory)
13. `app/api/summary/monthly/` (directory)

### Components
1. `components/recipe-card-new.tsx`
2. `components/recipe-card-skeleton.tsx`
3. `components/recipe-detail-new.tsx`
4. `components/recipe-filters-new.tsx`
5. `components/grocery-list-component.tsx`
6. `components/grocery-item-card.tsx`
7. `components/grocery-section-card.tsx`
8. `components/grocery-add-form.tsx`
9. `components/grocery-toolbar.tsx`

### Hooks
1. `hooks/use-recipes.ts`
2. `hooks/use-user-favorites.ts`
3. `hooks/use-favorites.ts`
4. `hooks/use-grocery-list.ts`
5. `hooks/use-multiple-grocery-lists.ts`

### Services
1. `lib/services/grocery-service.ts`
2. `lib/grocery-service.ts` (if duplicate)

### Directories (Empty)
1. `app/admin/analytics/`
2. `app/test-analytics/`
3. `app/monthly-summary/`
4. `app/debug-grocery-list/` (if exists)

---

## 14. FILES TO MODIFY (SIMPLIFY)

### Database Types
1. **`lib/types/database.ts`**
   - Remove `recipe_ratings` table definition
   - Remove `user_favorites` table definition
   - Remove `grocery_lists` table definition
   - Remove `grocery_list_items` table definition
   - Simplify `recipes` table (remove unused fields from types)

### Services
1. **`lib/services/recipe-service.ts`**
   - Simplify to only support custom recipe CRUD
   - Remove discovery/browsing logic
   - Remove favorites/ratings logic

### Navigation Components
1. Verify all navigation components have no dead links
2. Ensure no references to removed pages

### Package.json
1. Remove `recharts` dependency
2. Remove `pdf-lib` dependency

---

## 15. VERIFICATION CHECKLIST

After each phase, verify:
- [ ] No broken imports
- [ ] TypeScript compiles without errors
- [ ] No dead routes in navigation
- [ ] No references to deleted components/pages
- [ ] Database schema types match actual usage
- [ ] Dependencies are actually unused before removal
- [ ] Core features (logging, gamification) still work
- [ ] Premium paywall (weekly summary) still works

---

## 16. PHASE EXECUTION ORDER

### Phase 1 - Remove Non-Core Features
1. Task 1.1: Remove Recipe Discovery (pages, API, components)
2. Task 1.2: Remove Meal Planning (verify already removed)
3. Task 1.3: Remove Grocery Lists (pages, API, components)
4. Task 1.4: Remove Advanced Analytics (empty directories)
5. Task 1.5: Verify i18n is single-language (already done)

### Phase 2 - Data Model Cleanup
1. Remove unused database table types
2. Simplify recipes table types
3. Verify no code references to removed tables

### Phase 3 - Navigation & Core Screens
1. Verify navigation is simplified (already done)
2. Verify Home screen is redesigned (already done)

### Phase 4 - Gamification Core
1. Verify gamification is centralized (already done)
2. Verify Achievements screen is simplified (already done)

### Phase 5 - Simple Premium Layer
1. Verify Weekly Summary paywall (already done)

---

## END OF INVENTORY

**Next Step**: Wait for user confirmation before proceeding with Phase 1 edits.

