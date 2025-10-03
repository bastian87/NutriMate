// Simple in-memory cache for client-side data
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Get cache size for debugging
  size(): number {
    return this.cache.size
  }
}

export const cache = new SimpleCache()

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  DASHBOARD_DATA: 'dashboard_data',
  RECIPES: 'recipes',
  INGREDIENTS: 'ingredients',
  FOOD_ENTRIES: 'food_entries',
  GROCERY_LIST: 'grocery_list',
  MEAL_PLANS: 'meal_plans'
} as const

// Helper function to create cache key with user ID
export function createUserCacheKey(baseKey: string, userId: string): string {
  return `${baseKey}_${userId}`
}

// Helper function to create cache key with filters
export function createFilteredCacheKey(baseKey: string, filters: Record<string, any>): string {
  const filterString = JSON.stringify(filters)
  return `${baseKey}_${btoa(filterString)}`
}
