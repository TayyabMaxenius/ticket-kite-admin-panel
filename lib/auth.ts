"use client";

// Simple authentication utility using localStorage
// In production, replace this with your actual auth service

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

const AUTH_KEY = "ticketkite_admin_auth";
const USER_KEY = "ticketkite_admin_user";

export function signIn(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    // Simple demo authentication
    // In production, this should call your API
    if (email && password) {
      const user: User = {
        id: "1",
        email: email,
        name: "Admin User",
      };

      localStorage.setItem(AUTH_KEY, "authenticated");
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Set cookie for middleware
      document.cookie = "auth=authenticated; path=/; max-age=86400"; // 24 hours

      setTimeout(() => resolve(user), 500); // Simulate API call
    } else {
      reject(new Error("Invalid credentials"));
    }
  });
}

export function signOut(): Promise<void> {
  return new Promise((resolve) => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);

    // Remove cookie
    document.cookie = "auth=; path=/; max-age=0";

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
