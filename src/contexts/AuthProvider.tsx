import React from "react";
import { AuthContext } from "./AuthContext";
import { SEED_USERS, SEED_PASSWORDS } from "../config/auth";
import type { AuthUser } from "../types/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null);

  const login = React.useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const user = SEED_USERS.find(
        (u) => u.email === email.trim().toLowerCase(),
      );
      if (!user) {
        return { success: false, error: "No user found with that email." };
      }

      const expectedPassword = SEED_PASSWORDS[user.email];
      if (!expectedPassword || expectedPassword !== password) {
        return { success: false, error: "Incorrect password." };
      }

      setCurrentUser(user);
      return { success: true };
    },
    [],
  );

  const logout = React.useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      currentUser,
      login,
      logout,
    }),
    [currentUser, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
