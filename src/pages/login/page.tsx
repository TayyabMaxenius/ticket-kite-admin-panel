import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authError, setAuthError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);

    // Client-side validation
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setAuthError("Email is required.");
      return;
    }

    if (!trimmedPassword) {
      setAuthError("Password is required.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    // Password minimum length check
    if (trimmedPassword.length < 3) {
      setAuthError("Password must be at least 3 characters.");
      return;
    }

    const result = await login(trimmedEmail, trimmedPassword);
    if (!result.success) {
      setAuthError(result.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/60 text-foreground">
      <div className="w-full max-w-md rounded-2xl border bg-card/90 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              TicketKite
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight">
              Admin panel access
            </h1>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            TK
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setAuthError(null);
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError(null);
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter your password"
              autoComplete="current-password"
              minLength={3}
            />
          </div>

          {authError ? (
            <p className="text-xs font-medium text-destructive">{authError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Try{" "}
              <span className="font-medium">
                admin@ticketkite.com / admin123
              </span>{" "}
              or{" "}
              <span className="font-medium">user@ticketkite.com / user123</span>
              .
            </p>
          )}

          <button
            type="submit"
            className="mt-1 inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
