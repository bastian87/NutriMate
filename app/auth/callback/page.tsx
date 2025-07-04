"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase.from("users").select("id").eq("id", user.id).single();
      if (data) {
        router.push("/dashboard");
      } else {
        // Crear perfil automáticamente
        console.log('Datos del usuario para crear perfil:', { id: user.id, email: user.email, full_name: user.user_metadata?.full_name ?? null });
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name ?? null,
          }
        ]);
        if (insertError) {
          console.error('Error al crear perfil:', insertError);
        }
        router.push("/onboarding");
      }
    };
    checkUser();
  }, [router]);

  return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
} 