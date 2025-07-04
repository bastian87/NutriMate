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

        // Verificar si el usuario ya tiene perfil
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error checking user profile:", profileError);
        }

        if (userProfile) {
          // Usuario ya tiene perfil, ir al dashboard
          router.push("/dashboard");
        } else {
          // Crear perfil automáticamente para usuarios de OAuth
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name ?? null,
            }
          ]);
          
          if (insertError) {
            console.error('Error al crear perfil:', insertError);
          }
          
          // Ir al onboarding para completar preferencias
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