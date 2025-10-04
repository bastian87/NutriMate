/**
 * API-level premium guards for server-side feature protection
 * 
 * This module provides server-side guards that must be used in API routes
 * to ensure premium features are properly protected at the API level.
 * Client-side checks are not sufficient for security.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/subscription-service'
import { FeatureKey, normalizeFeatureKey, isPremiumFeature, getFeatureAccess } from '@/lib/entitlements'

export interface ApiGuardResult {
  success: boolean
  response?: NextResponse
  userId?: string
  isPremium?: boolean
}

/**
 * Premium guard for API routes
 * 
 * @param request - NextRequest object
 * @param feature - Feature key to check access for
 * @returns Guard result with success status and optional response
 */
export async function requirePremiumFeature(
  request: NextRequest,
  feature: string
): Promise<ApiGuardResult> {
  try {
    // Get user ID from request
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication required', code: 'AUTH_REQUIRED' },
          { status: 401 }
        )
      }
    }

    // Normalize feature key
    const normalizedFeature = normalizeFeatureKey(feature)
    
    // Check if feature requires premium
    if (!isPremiumFeature(normalizedFeature)) {
      return {
        success: true,
        userId: user.id,
        isPremium: false
      }
    }

    // Get user subscription
    const subscription = await getUserSubscription(user.id)
    const isPremium = !!(subscription && subscription.plan === 'premium' && 
                        (subscription.status === 'active' || subscription.status === 'trialing'))

    if (!isPremium) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: 'premium_only',
            feature: normalizedFeature,
            message: 'This feature is available for Premium users only.',
            plan: 'free',
            status: 403
          },
          { status: 403 }
        ),
        userId: user.id,
        isPremium: false
      }
    }

    return {
      success: true,
      userId: user.id,
      isPremium: true
    }

  } catch (error) {
    console.error('API guard error:', error)
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Internal server error', code: 'GUARD_ERROR' },
        { status: 500 }
      )
    }
  }
}

/**
 * Usage limit guard for API routes
 * 
 * @param request - NextRequest object
 * @param feature - Feature key to check usage limits for
 * @param currentUsage - Current usage count
 * @returns Guard result with success status and optional response
 */
export async function requireUsageLimit(
  request: NextRequest,
  feature: string,
  currentUsage: number
): Promise<ApiGuardResult> {
  try {
    // Get user ID from request
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication required', code: 'AUTH_REQUIRED' },
          { status: 401 }
        )
      }
    }

    // Get user subscription
    const subscription = await getUserSubscription(user.id)
    const isPremium = !!(subscription && subscription.plan === 'premium' && 
                        (subscription.status === 'active' || subscription.status === 'trialing'))

    // Premium users have unlimited access
    if (isPremium) {
      return {
        success: true,
        userId: user.id,
        isPremium: true
      }
    }

    // Normalize feature key
    const normalizedFeature = normalizeFeatureKey(feature)
    
    // Check usage limits for free users
    const access = getFeatureAccess(normalizedFeature, false, { favorites: { saved: currentUsage } })
    
    if (!access.canAccess) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: access.reason || 'Usage limit exceeded', 
            code: 'USAGE_LIMIT_EXCEEDED',
            feature: normalizedFeature,
            currentUsage,
            upgradeUrl: '/pricing'
          },
          { status: 403 }
        ),
        userId: user.id,
        isPremium: false
      }
    }

    return {
      success: true,
      userId: user.id,
      isPremium: false
    }

  } catch (error) {
    console.error('Usage limit guard error:', error)
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Internal server error', code: 'GUARD_ERROR' },
        { status: 500 }
      )
    }
  }
}

/**
 * Authentication guard for API routes
 * 
 * @param request - NextRequest object
 * @returns Guard result with success status and optional response
 */
export async function requireAuth(request: NextRequest): Promise<ApiGuardResult> {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication required', code: 'AUTH_REQUIRED' },
          { status: 401 }
        )
      }
    }

    return {
      success: true,
      userId: user.id
    }

  } catch (error) {
    console.error('Auth guard error:', error)
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Internal server error', code: 'GUARD_ERROR' },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper to create a guarded API handler
 * 
 * @param feature - Feature key to guard
 * @param handler - Original handler function
 * @returns Guarded handler function
 */
export function withPremiumGuard<T extends any[]>(
  feature: string,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const guard = await requirePremiumFeature(request, feature)
    
    if (!guard.success) {
      return guard.response!
    }

    // Add user context to request
    ;(request as any).userId = guard.userId
    ;(request as any).isPremium = guard.isPremium

    return handler(request, ...args)
  }
}

/**
 * Helper to create a usage-limited API handler
 * 
 * @param feature - Feature key to guard
 * @param getCurrentUsage - Function to get current usage count
 * @param handler - Original handler function
 * @returns Guarded handler function
 */
export function withUsageGuard<T extends any[]>(
  feature: string,
  getCurrentUsage: (request: NextRequest) => Promise<number>,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const currentUsage = await getCurrentUsage(request)
    const guard = await requireUsageLimit(request, feature, currentUsage)
    
    if (!guard.success) {
      return guard.response!
    }

    // Add user context to request
    ;(request as any).userId = guard.userId
    ;(request as any).isPremium = guard.isPremium

    return handler(request, ...args)
  }
}
