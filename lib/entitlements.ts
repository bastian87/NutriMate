/**
 * Centralized entitlements module - Single source of truth for Free vs Premium features
 * 
 * This module defines all feature keys and their access rules in one place.
 * All other modules should import from here instead of hardcoding values.
 */

export type FeatureKey = 
  | 'monthly_analytics'
  | 'analytics.trends'
  | 'favorites'
  | 'custom_ingredients'
  | 'recipes.private_edit'
  | 'themes.extras'
  | 'ads'

export interface FeatureAccess {
  canAccess: boolean
  reason?: string
  upgradeRequired?: boolean
}

export interface UsageLimits {
  favorites: {
    max: number
  }
  customRecipes: {
    max: number
  }
}

/**
 * Centralized usage limits
 * All hardcoded values should reference these constants
 */
export const USAGE_LIMITS: UsageLimits = {
  favorites: {
    max: 10 // Free users can save up to 10 favorite recipes
  },
  customRecipes: {
    max: 999999 // Free users can create unlimited custom recipes
  }
}

/**
 * Premium-only features
 * These features are only available to Premium subscribers
 */
export const PREMIUM_FEATURES: FeatureKey[] = [
  'monthly_analytics',
  'analytics.trends',
  'custom_ingredients',
  'themes.extras',
  'ads'
]

/**
 * Free features
 * These features are available to all users
 */
export const FREE_FEATURES: FeatureKey[] = [
  'favorites',
  'recipes.private_edit'
]

/**
 * Check if a feature is premium-only
 */
export function isPremiumFeature(feature: FeatureKey): boolean {
  return PREMIUM_FEATURES.includes(feature)
}

/**
 * Check if a feature is free
 */
export function isFreeFeature(feature: FeatureKey): boolean {
  return FREE_FEATURES.includes(feature)
}

/**
 * Get feature access details for a specific feature
 * This is the single source of truth for feature access logic
 */
export function getFeatureAccess(
  feature: FeatureKey,
  isPremium: boolean,
  usage?: { favorites: { saved: number } }
): FeatureAccess {
  // Free features are always accessible
  if (isFreeFeature(feature)) {
    return { canAccess: true }
  }

  // Premium features require premium subscription
  if (isPremiumFeature(feature)) {
    if (!isPremium) {
      return {
        canAccess: false,
        reason: 'This feature requires a Premium subscription',
        upgradeRequired: true
      }
    }
    return { canAccess: true }
  }

  // Handle usage limits for free features
  if (feature === 'favorites' && usage) {
    const { saved } = usage.favorites
    if (saved >= USAGE_LIMITS.favorites.max) {
      return {
        canAccess: false,
        reason: `You've reached the limit of ${USAGE_LIMITS.favorites.max} favorite recipes. Upgrade to Premium for unlimited favorites.`,
        upgradeRequired: true
      }
    }
  }

  return { canAccess: true }
}

/**
 * Legacy key mapping
 * Maps old feature keys to new standardized keys
 */
export const LEGACY_KEY_MAPPING: Record<string, FeatureKey> = {
  'monthly_summary': 'monthly_analytics',
  'advanced_meal_planning': 'monthly_analytics', // Redirect to analytics
  'unlimited_meal_plans': 'monthly_analytics', // Redirect to analytics
  'create_meal_plans': 'monthly_analytics', // Redirect to analytics
  'basic_meal_planning': 'monthly_analytics' // Redirect to analytics
}

/**
 * Convert legacy key to new standardized key
 */
export function normalizeFeatureKey(key: string): FeatureKey {
  return LEGACY_KEY_MAPPING[key] || key as FeatureKey
}

/**
 * Get all feature keys (for validation)
 */
export function getAllFeatureKeys(): FeatureKey[] {
  return [...PREMIUM_FEATURES, ...FREE_FEATURES]
}

/**
 * Validate that a feature key is valid
 */
export function isValidFeatureKey(key: string): key is FeatureKey {
  return getAllFeatureKeys().includes(key as FeatureKey)
}

/**
 * Get usage limit for a specific feature and user type
 */
export function getLimit(feature: string, isPremium: boolean = false): number {
  switch (feature) {
    case 'favorites':
      return USAGE_LIMITS.favorites.max
    case 'customRecipes':
      return USAGE_LIMITS.customRecipes.max
    default:
      return 0
  }
}
