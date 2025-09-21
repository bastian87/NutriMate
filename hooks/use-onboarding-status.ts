"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface OnboardingStatus {
  isLoading: boolean
  needsOnboarding: boolean
  isComplete: boolean
}

export function useOnboardingStatus(user: User | null) {
  const [status, setStatus] = useState<OnboardingStatus>({
    isLoading: true,
    needsOnboarding: false,
    isComplete: false
  })

  useEffect(() => {
    if (!user) {
      setStatus({
        isLoading: false,
        needsOnboarding: false,
        isComplete: false
      })
      return
    }

    const checkOnboardingStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true }))

        // Verificar metadata del usuario primero
        const onboardingComplete = user.user_metadata?.onboarding_complete === true
        
        if (onboardingComplete) {
          setStatus({
            isLoading: false,
            needsOnboarding: false,
            isComplete: true
          })
          return
        }

        // Verificar si existe perfil en public.users
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, username')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Error checking user profile:', profileError)
          setStatus({
            isLoading: false,
            needsOnboarding: true,
            isComplete: false
          })
          return
        }

        // Si no existe perfil o no tiene username, necesita onboarding
        if (!profile || !profile.username) {
          setStatus({
            isLoading: false,
            needsOnboarding: true,
            isComplete: false
          })
          return
        }

        // Verificar si tiene preferencias
        const { data: preferences, error: prefsError } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (prefsError) {
          console.error('Error checking user preferences:', prefsError)
          setStatus({
            isLoading: false,
            needsOnboarding: true,
            isComplete: false
          })
          return
        }

        // Si no tiene preferencias, necesita onboarding
        if (!preferences) {
          setStatus({
            isLoading: false,
            needsOnboarding: true,
            isComplete: false
          })
          return
        }

        // Si llegamos aquí, el perfil está completo
        setStatus({
          isLoading: false,
          needsOnboarding: false,
          isComplete: true
        })

      } catch (error) {
        console.error('Error in checkOnboardingStatus:', error)
        setStatus({
          isLoading: false,
          needsOnboarding: true,
          isComplete: false
        })
      }
    }

    checkOnboardingStatus()
  }, [user])

  return status
}
