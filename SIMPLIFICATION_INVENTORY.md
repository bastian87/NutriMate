# Nutrimate Simplification Inventory

**Purpose**: High-level inventory of features and code areas that will be affected by major simplification.

**Date**: Generated from codebase analysis

---

## 1. RECIPE DISCOVERY & MANAGEMENT

### Pages & Routes
- **`app/recipes/page.tsx`** - Main recipe discovery/browsing page
- **`app/recipes/[slug]/page.tsx`** - Individual recipe detail page
- **`app/recipes/[slug]/edit/page.tsx`** - Recipe editing page (Premium)
- **`app/recipes/new/page.tsx`** - Create new recipe page
- **`app/recipes/loading.tsx`** - Recipe page loading state
- **`app/saved-recipes/page.tsx`** - User's saved/favorited recipes

### API Routes
- **`app/api/recipes/private/route.ts`** - CRUD for private recipes (Premium)
  - GET: List user's private recipes
  - POST: Create private recipe
  - PUT: Update private recipe
  - DELETE: Delete private recipe
- **`app/api/recipes/ratings/route.ts`** - Recipe rating system (Free)
  - GET: Get recipe ratings
  - POST: Add/update rating
  - DELETE: Remove rating
- **`app/api/recipes/import/one/route.ts`** - (Not found - may be deleted)
- **`app/api/recipes/import/bulk/route.ts`** - (Not found - may be deleted)
- **`app/api/favorites/route.ts`** - User favorites management

### Components
- **`components/recipe-card-new.tsx`** - Recipe card display component
- **`components/recipe-card-skeleton.tsx`** - Loading skeleton for recipe cards
- **`components/recipe-detail-new.tsx`** - Recipe detail view component
- **`components/recipe-filters-new.tsx`** - Recipe filtering/search component

### Services & Hooks
- **`lib/services/recipe-service.ts`** - Core recipe service with CRUD operations
- **`hooks/use-recipes.ts`** - React hook for recipe data fetching
- **`hooks/use-user-favorites.ts`** - Hook for managing user favorites

### Database Tables
- **`recipes`** - Main recipe table
  - Fields: id, name, description, image_url, prep_time_minutes, cook_time_minutes, servings, calories, protein, carbs, fat, fiber, sugar, sodium, difficulty_level, cuisine_type, meal_type, instructions, created_at, updated_at, created_by, is_private
- **`recipe_ingredients`** - Recipe ingredients junction table
  - Fields: id, recipe_id, name, quantity, unit, created_at
- **`recipe_ratings`** - Recipe ratings/reviews
  - Fields: id, recipe_id, user_id, rating, review, created_at
- **`user_favorites`** - User favorite recipes
  - Fields: id, user_id, recipe_id, created_at

### Environment Variables
- **None found** - No Spoonacular or external recipe API keys detected in codebase

---

## 2. MEAL PLANNING & CALENDAR

### Pages & Routes
- **No dedicated calendar page found** - Calendar functionality appears to be embedded in dashboard
- **`components/dashboard-food-diary.tsx`** - Contains calendar view for monthly food diary

### API Routes
- **No dedicated calendar API** - Calendar data likely comes from day-entries API

### Components
- **`components/dashboard-food-diary.tsx`** - Contains calendar grid view (lines 50-324)
  - Monthly calendar view with day status indicators
  - Week navigation
  - Day status tracking (success/failure/no entry)

### Database Tables
- **`meal_plans`** - (COMMENTED OUT in database.ts)
  - Fields: id, user_id, name, start_date, end_date, created_at, updated_at
- **`meal_plan_meals`** - (COMMENTED OUT in database.ts)
  - Fields: id, meal_plan_id, recipe_id, day_number, meal_type, created_at

### Notes
- Meal planning tables are commented out in database types, suggesting they were removed or never fully implemented
- Calendar functionality is minimal and embedded in dashboard component

---

## 3. GROCERY LISTS

### Pages & Routes
- **`app/grocery-list/page.tsx`** - Main grocery list page
  - Multiple list management
  - Item management (add, update, delete, check off)
  - Export functionality (Print, Word, CSV, TXT, JSON)
  - Category grouping
  - Expense breakdown (text-based, charts removed)

### API Routes
- **`app/api/grocery-lists/route.ts`** - Grocery list CRUD operations
- **`app/api/grocery-lists/items/route.ts`** - Grocery list item operations
- **`app/api/exports/grocery-list/route.ts`** - Export grocery lists (Premium)
  - Supports: JSON, CSV, TXT formats
  - Premium feature guard

### Components
- **`components/grocery-list-component.tsx`** - Grocery list display component
- **`components/grocery-item-card.tsx`** - Individual grocery item card
- **`components/grocery-section-card.tsx`** - Category section card
- **`components/grocery-add-form.tsx`** - Add item form
- **`components/grocery-toolbar.tsx`** - Toolbar with export/actions

### Services & Hooks
- **`hooks/use-grocery-list.ts`** - Single grocery list hook
- **`hooks/use-multiple-grocery-lists.ts`** - Multiple lists management hook
- **`lib/services/grocery-service.ts`** - Grocery service
- **`lib/grocery-service.ts`** - (Duplicate or legacy?)

### Database Tables
- **`grocery_lists`** - Grocery list container
  - Fields: id, user_id, name, created_at, updated_at
- **`grocery_list_items`** - Individual grocery items
  - Fields: id, grocery_list_id, recipe_id, name, quantity, unit, category, is_checked, created_at, updated_at

### Premium Features
- Multiple grocery lists (Free: 1 list, Premium: unlimited)
- Export functionality (Premium only)

---

## 4. EXPORTS (PDF/Word/CSV)

### Pages & Routes
- Export functionality is embedded in grocery list page

### API Routes
- **`app/api/exports/grocery-list/route.ts`** - Export API (Premium)
  - POST: Export grocery list
  - Formats: JSON, CSV, TXT
  - Premium feature guard

### Components
- **`app/grocery-list/page.tsx`** - Contains export handlers:
  - `handlePrint()` - Print functionality (lines 317-480)
  - `handleDownloadWord()` - Word export (lines 483-627)
  - Export buttons in toolbar

### Dependencies
- **`pdf-lib`** - PDF generation library (in package.json)
  - Currently used for grocery list exports

### Premium Features
- All export functionality is Premium-only
- Guarded by `requirePremiumFeature(request, "exports")`

---

## 5. ADVANCED ANALYTICS

### Pages & Routes
- **`app/admin/analytics/`** - (Directory exists but page may be deleted)
- **`app/test-analytics/`** - (Directory exists but page may be deleted)
- **`app/monthly-summary/`** - (Directory exists)
- **`app/weekly-summary/page.tsx`** - Weekly summary (simplified, Premium paywall)

### API Routes
- **`app/api/analytics/`** - (Directory exists but route may be deleted)
- **`app/api/setup-analytics/`** - (Directory exists but route may be deleted)
- **`app/api/metrics/`** - (Directory exists but route may be deleted)
- **`app/api/summary/weekly/route.ts`** - Weekly summary API (simplified)
- **`app/api/summary/monthly/`** - (Directory exists)

### Components
- **`components/summary/WeeklySummaryCard.tsx`** - Weekly summary card component
- **`components/dashboard-food-diary.tsx`** - Contains calendar analytics view

### Database Tables
- No dedicated analytics tables found
- Analytics likely computed from `food_diary_entries` and `day_entries`

### Notes
- Most analytics code appears to have been removed in previous refactoring
- Weekly summary is simplified (days logged, average calories)
- Monthly summary directory exists but implementation unclear

---

## 6. MULTI-LANGUAGE / I18N

### Pages & Routes
- No dedicated i18n pages - functionality is embedded throughout

### Components
- **`components/language-selector.tsx`** - Language selection component
- **`lib/i18n/context.tsx`** - Language context provider
  - Manages language state (en, es)
  - Provides `useLanguage()` hook
  - localStorage persistence

### Translation Files
- **`lib/i18n/translations.ts`** - Main translations file (large, 26444+ tokens)
- **`lib/i18n/en.ts`** - English constants file
- **`lib/i18n/es.ts`** - (Assumed to exist based on context)

### Usage
- **`useLanguage()` hook** - Used throughout codebase
  - Found in: landing-client, recipes page, grocery list, dashboard, etc.
- **Translation keys** - Used via `t("key.path")` pattern

### Supported Languages
- English (`en`)
- Spanish (`es`)

### Storage
- Language preference stored in `localStorage` as `"nutrimate-language"`

---

## 7. CUSTOM INGREDIENTS

### Pages & Routes
- **`app/ingredients/page.tsx`** - Ingredients management page
- **`app/calorie-calculator/page.tsx`** - Calorie calculator (may use ingredients)

### API Routes
- **`app/api/custom-ingredients/route.ts`** - Custom ingredients CRUD (Premium)
  - GET: List custom ingredients (Free)
  - POST: Create custom ingredient (Premium)
  - PUT: Update custom ingredient (Premium)
  - DELETE: Delete custom ingredient (Premium)
- **`app/api/ingredients/route.ts`** - General ingredients API (Free)
  - GET: List all ingredients

### Components
- **`components/ingredient-selector.tsx`** - Ingredient selection component

### Hooks
- **`hooks/use-ingredients.ts`** - Ingredients data hook

### Database Tables
- **`ingredients`** - Ingredients table
  - Fields: id, name, nutrition_data, created_by, is_custom, created_at, updated_at

### Premium Features
- Creating/editing/deleting custom ingredients is Premium-only
- Viewing ingredients is Free

---

## 8. ADDITIONAL FEATURES TO CONSIDER

### Goals System
- **`app/goals/page.tsx`** - Goals management page
- **`app/api/goals/route.ts`** - Goals API
- **`app/api/goals/force-delete/route.ts`** - Force delete goals
- **Database**: `goals` table

### User Preferences
- **`app/api/user/preferences/route.ts`** - User preferences API
- **Database**: `user_preferences` table
  - Extensive fields: age, gender, height, weight, activity_level, health_goal, calorie_target, dietary_preferences, excluded_ingredients, allergies, intolerances, etc.

### Support System
- **`app/api/support/route.ts`** - Support tickets API
- **Database**: `support_tickets` table

### Subscription Management
- **`app/account/subscription/page.tsx`** - Subscription management
- **`app/api/user/subscription/route.ts`** - Subscription API
- **`app/api/create-checkout/route.ts`** - Checkout creation
- **`app/api/webhooks/lemonsqueezy/route.ts`** - Payment webhooks
- **Database**: `user_subscriptions` table

---

## 9. ENVIRONMENT VARIABLES

### Found References (No actual .env file analyzed)
- **`NEXT_PUBLIC_SUPABASE_URL`** - Supabase URL
- **`SUPABASE_SERVICE_ROLE_KEY`** - Supabase service role key
- **`NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID`** - LemonSqueezy monthly plan
- **`NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID`** - LemonSqueezy annual plan

### External API Keys
- **No Spoonacular API key found** - External recipe API integration appears removed
- **No other external recipe API keys found**

---

## 10. DEPENDENCIES RELATED TO FEATURES

### Chart/Analytics Libraries
- **`recharts`** - Chart library (v3.2.1)
  - Used for: Previously used for analytics charts (may be partially removed)

### PDF/Export Libraries
- **`pdf-lib`** - PDF generation (v1.17.1)
  - Used for: Grocery list exports

### Other Notable Dependencies
- **`framer-motion`** - Animations
- **`date-fns`** - Date manipulation
- **`zod`** - Schema validation
- **`next-pwa`** - PWA support

---

## SUMMARY BY FEATURE AREA

### High Impact Areas (Likely to be Simplified/Removed)

1. **Recipe Discovery & Management**
   - 5 pages, 3+ API routes, 4+ components, 4 database tables
   - Full CRUD system with ratings, favorites, filtering

2. **Grocery Lists**
   - 1 page, 3 API routes, 5+ components, 2 database tables
   - Multiple lists, exports, category management

3. **Exports**
   - Embedded in grocery lists, 1 API route, PDF library dependency
   - Premium feature

4. **Custom Ingredients**
   - 1-2 pages, 2 API routes, 1 component, 1 database table
   - Premium feature for creation/editing

5. **Advanced Analytics**
   - Multiple directories (may be partially deleted), 1+ API routes
   - Charts removed, simplified summaries remain

### Medium Impact Areas

6. **Meal Planning Calendar**
   - Embedded in dashboard, commented-out database tables
   - Minimal implementation

7. **Multi-Language (i18n)**
   - Embedded throughout, 3 translation files, 1 context provider
   - Used extensively across all pages

### Low Impact Areas (Core Features)

8. **Food Diary/Logging**
   - Core feature, likely to remain
   - Quick meal logger already simplified

9. **Gamification (XP/Streaks)**
   - Core feature, likely to remain
   - Recently refactored

10. **Goals System**
    - Core feature, likely to remain

---

## RECOMMENDATIONS FOR SIMPLIFICATION

### Priority 1: Remove/Simplify
- Recipe discovery system (if focusing on quick logging only)
- Grocery lists (if not core to "fastest food logging app")
- Export functionality (PDF/Word/CSV)
- Custom ingredients (if simplifying to basic logging)
- Advanced analytics (already partially removed)

### Priority 2: Evaluate
- Multi-language support (i18n) - Consider if English-only is acceptable
- Meal planning calendar - Already minimal, may be removable
- User preferences - Extensive fields, may be simplified

### Priority 3: Keep
- Food diary/logging (core)
- Gamification (XP/Streaks) (core)
- Goals (core)
- Basic dashboard (core)

---

**End of Inventory**

