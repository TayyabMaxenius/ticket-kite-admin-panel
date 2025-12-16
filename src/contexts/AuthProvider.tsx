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
      // Strict validation - reject empty or whitespace-only values
      const trimmedEmail = email?.trim() || "";
      const trimmedPassword = password?.trim() || "";

      if (!trimmedEmail) {
        return { success: false, error: "Email is required." };
      }

      if (!trimmedPassword) {
        return { success: false, error: "Password is required." };
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { success: false, error: "Please enter a valid email address." };
      }

      // Find user by exact email match (case-insensitive)
      const user = SEED_USERS.find(
        (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase(),
      );

      if (!user) {
        return { success: false, error: "Invalid email or password." };
      }

      // Verify password matches exactly
      const expectedPassword = SEED_PASSWORDS[user.email];
      if (!expectedPassword || expectedPassword !== trimmedPassword) {
        return { success: false, error: "Invalid email or password." };
      }

      // All checks passed - authenticate user
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
