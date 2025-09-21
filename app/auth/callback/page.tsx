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
          hasPreferences 
        });

        if (userProfile && userProfile.username && hasPreferences) {
          // Usuario ya tiene perfil completo, ir al dashboard
          console.log("✅ User has complete profile, redirecting to dashboard");
          router.push("/dashboard");
        } else if (userProfile && userProfile.username && !hasPreferences) {
          // Usuario existe pero no tiene preferencias, ir a onboarding
          console.log("🔄 User exists but needs preferences, redirecting to onboarding");
          router.push("/onboarding");
        } else {
          // Usuario no existe, crear perfil básico y ir a onboarding
          console.log("🔄 Creating basic OAuth user profile...");
          
          // Generar username único para usuarios de OAuth
          const baseUsername = session.user.user_metadata?.preferred_username ?? 
                              session.user.email?.split('@')[0] ?? 
                              'user';
          
          // Verificar si el username está disponible, si no, agregar números
          let username = baseUsername;
          let counter = 1;
          while (true) {
            const { data: existingUser } = await supabase
              .from("users")
              .select("id")
              .eq("username", username)
              .maybeSingle();
            
            if (!existingUser) break;
            username = `${baseUsername}${counter}`;
            counter++;
          }

          // Crear solo el perfil básico (sin preferencias)
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name ?? null,
              username: username,
            }
          ]);
          
          if (insertError) {
            console.error('Error al crear perfil:', insertError);
            router.push("/login");
            return;
          }

          console.log("✅ Basic OAuth user profile created, redirecting to onboarding");
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