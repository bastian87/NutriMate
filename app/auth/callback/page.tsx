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

        // Verificar si el usuario ya tiene perfil completo
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id, username, full_name")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error checking user profile:", profileError);
        }

        // Verificar si el usuario tiene preferencias (indicador de perfil completo)
        let hasPreferences = false;
        if (userProfile) {
          const { data: preferences, error: prefsError } = await supabase
            .from("user_preferences")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (prefsError) {
            console.log("⚠️ Error checking preferences:", prefsError);
          }
          hasPreferences = !!preferences;
        }

        console.log("🔍 Profile check results:", { 
          userProfile: !!userProfile, 
          hasUsername: !!userProfile?.username, 
          hasPreferences,
          userProfileData: userProfile
        });

        // Lógica simple: si el perfil está incompleto, ir al onboarding
        // Si el perfil está completo, ir al dashboard
        if (userProfile && userProfile.username && hasPreferences) {
          // Usuario tiene perfil completo, ir al dashboard
          console.log("✅ User has complete profile, redirecting to dashboard");
          router.push("/dashboard");
        } else {
          // Usuario necesita completar su perfil, ir al onboarding
          console.log("🔄 User needs to complete profile, redirecting to onboarding");
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