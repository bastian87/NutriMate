"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener la sesión actual después del OAuth
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          router.push("/login");
          return;
        }

        if (!session?.user) {
          router.push("/login");
          return;
        }

        // Verificar si viene del onboarding
        const urlParams = new URLSearchParams(window.location.search);
        const fromOnboarding = urlParams.get('onboarding') === 'true';
        const encodedData = urlParams.get('data');

        if (fromOnboarding) {
          console.log("🔄 Coming from onboarding, finalizing profile...");
          
          let onboardingData = {};
          
          // Si hay datos codificados en la URL, usarlos
          if (encodedData) {
            try {
              onboardingData = JSON.parse(decodeURIComponent(encodedData));
              console.log("📋 Using onboarding data from URL:", onboardingData);
            } catch (error) {
              console.error("❌ Error parsing onboarding data from URL:", error);
              // Fallback: intentar obtener datos del localStorage
              const savedData = localStorage.getItem('nutrimate_onboarding_data');
              if (savedData) {
                try {
                  onboardingData = JSON.parse(savedData);
                  console.log("📋 Using onboarding data from localStorage:", onboardingData);
                } catch (localError) {
                  console.error("❌ Error parsing localStorage data:", localError);
                }
              }
            }
          } else {
            // Fallback: obtener datos del localStorage
            const savedData = localStorage.getItem('nutrimate_onboarding_data');
            if (savedData) {
              try {
                onboardingData = JSON.parse(savedData);
                console.log("📋 Using onboarding data from localStorage:", onboardingData);
              } catch (error) {
                console.error("❌ Error parsing localStorage data:", error);
              }
            }
          }
          
          // Finalizar el perfil con los datos del onboarding
          const finalizeResponse = await fetch('/api/profile/finalize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(onboardingData)
          });

          if (finalizeResponse.ok) {
            console.log("✅ Profile finalized successfully");
            router.push("/dashboard");
          } else {
            console.error("❌ Error finalizing profile");
            router.push("/onboarding");
          }
          return;
        }

        // Verificar si el onboarding está completo en los metadatos del usuario
        const onboardingComplete = session.user.user_metadata?.onboarding_complete === true;

        console.log("🔍 Onboarding check results:", { 
          onboardingComplete,
          userMetadata: session.user.user_metadata
        });

        // Si el onboarding está completo, ir al dashboard
        // Si no, ir al onboarding
        if (onboardingComplete) {
          console.log("✅ Onboarding complete, redirecting to dashboard");
          router.push("/dashboard");
        } else {
          console.log("🔄 Onboarding incomplete, redirecting to onboarding");
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completando autenticación...</p>
      </div>
    </div>
  );
} 