"use client";

// Simple authentication utility using localStorage
// In production, replace this with your actual auth service

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: "admin" | "user";
}

const AUTH_KEY = "ticketkite_admin_auth";
const USER_KEY = "ticketkite_admin_user";

export function signIn(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    // Strict authentication - only two users allowed
    // In production, this should call your API
    if (!email || !password) {
      reject(new Error("Email and password are required"));
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();

    // Check for admin user
    if (
      normalizedEmail === "zain@maxenius.agency" &&
      normalizedPassword === "zain@12"
    ) {
      const user: User = {
        id: "1",
        email: normalizedEmail,
        name: "Zain",
        role: "admin",
      };

      localStorage.setItem(AUTH_KEY, "authenticated");
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Set cookie for middleware
      document.cookie = "auth=authenticated; path=/; max-age=86400"; // 24 hours
      document.cookie = "role=admin; path=/; max-age=86400"; // 24 hours

      setTimeout(() => resolve(user), 500); // Simulate API call
      return;
    }

    // Check for standard user
    if (
      normalizedEmail === "user@maxenius.agency" &&
      normalizedPassword === "user@12"
    ) {
      const user: User = {
        id: "2",
        email: normalizedEmail,
        name: "User",
        role: "user",
      };

      localStorage.setItem(AUTH_KEY, "authenticated");
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Set cookie for middleware
      document.cookie = "auth=authenticated; path=/; max-age=86400"; // 24 hours
      document.cookie = "role=user; path=/; max-age=86400"; // 24 hours

      setTimeout(() => resolve(user), 500); // Simulate API call
      return;
    }

    // Reject all other credentials
    reject(
      new Error(
        "Invalid email or password. Only authorized users can access this system."
      )
    );
  });
}

export function signOut(): Promise<void> {
  return new Promise((resolve) => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);

    // Remove cookie
    document.cookie = "auth=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";

    setTimeout(() => resolve(), 100);
  });
}

export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return getSession() === "authenticated";
}

export function updateUser(userData: Partial<User>): Promise<User> {
  return new Promise((resolve, reject) => {
    const currentUser = getUser();
    if (!currentUser) {
      reject(new Error("No user found"));
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      ...userData,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setTimeout(() => resolve(updatedUser), 300);
  });
}
