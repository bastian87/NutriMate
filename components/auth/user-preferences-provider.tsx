"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { userService } from "@/lib/services/user-service";
import type { UserPreferences } from "@/lib/types/database";

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  fetchPreferences: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  
  // Inicializar con datos de localStorage si existen
  const getInitialPreferences = (): UserPreferences | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem("userPreferences");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (error) {
      console.error("Error reading preferences from localStorage:", error);
    }
    return null;
  };

  const [preferences, setPreferences] = useState<UserPreferences | null>(getInitialPreferences);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await userService.getUserPreferences(user.id);
      setPreferences(
        data
          ? {
              ...data,
              dietary_preferences: data.dietary_preferences ?? [],
              excluded_ingredients: data.excluded_ingredients ?? [],
              allergies: data.allergies ?? [],
              intolerances: data.intolerances ?? [],
            }
          : null
      );
      
      // Guardar en localStorage
      if (data) {
        localStorage.setItem("userPreferences", JSON.stringify({
          ...data,
          dietary_preferences: data.dietary_preferences ?? [],
          excluded_ingredients: data.excluded_ingredients ?? [],
          allergies: data.allergies ?? [],
          intolerances: data.intolerances ?? [],
        }));
      } else {
        localStorage.removeItem("userPreferences");
      }
    } catch (error) {
      setPreferences(null);
      console.error("Error fetching user preferences:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && preferences === null) {
      // Cargar en background sin bloquear la UI
      fetchPreferences();
    } else if (!user && preferences !== null) {
      setPreferences(null);
      setLoading(false);
    } else if (!user) {
      setLoading(false);
    } else {
      // Si ya tenemos preferencias del localStorage, no mostrar loading
      setLoading(false);
    }
  }, [user, fetchPreferences, preferences]);

  return (
    <UserPreferencesContext.Provider value={{ preferences, loading, fetchPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
} 