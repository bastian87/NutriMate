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
          const { data: preferences } = await supabase
            .from("user_preferences")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();
          hasPreferences = !!preferences;
        }

        if (userProfile && userProfile.username && hasPreferences) {
          // Usuario ya tiene perfil completo, ir al dashboard
          console.log("✅ User has complete profile, redirecting to dashboard");
          router.push("/dashboard");
        } else {
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

          // Crear perfil completo para usuarios de OAuth
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

          // Crear preferencias por defecto para usuarios de OAuth
          const { error: preferencesError } = await supabase.from("user_preferences").insert([
            {
              user_id: session.user.id,
              age: 30,
              gender: 'male',
              height: 175,
              weight: 70,
              activity_level: 'moderate',
              health_goal: 'maintenance',
              calorie_target: 2000,
              dietary_preferences: [],
              excluded_ingredients: [],
              include_snacks: false,
              allergies: [],
              intolerances: [],
              max_prep_time: 60,
              macro_priority: 'balanced',
            }
          ]);

          if (preferencesError) {
            console.error('Error al crear preferencias:', preferencesError);
          }

          console.log("✅ OAuth user profile created, redirecting to dashboard");
          router.push("/dashboard");
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