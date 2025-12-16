import type { AuthUser } from "../types/auth";

export const SEED_USERS: AuthUser[] = [
  { email: "admin@ticketkite.com", name: "Admin", role: "admin" },
  { email: "user@ticketkite.com", name: "Malik", role: "user" },
];

export const SEED_PASSWORDS: Record<string, string> = {
  "admin@ticketkite.com": "admin123",
  "user@ticketkite.com": "user123",
};
