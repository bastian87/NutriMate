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
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
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
    } catch (error) {
      setPreferences(null);
      console.error("Error fetching user preferences:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && preferences === null) {
      fetchPreferences();
    } else if (!user && preferences !== null) {
      setPreferences(null);
      setLoading(false);
    } else if (!user) {
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