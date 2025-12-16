export type Role = "admin" | "user";

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
}
