"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Loader2, Eye, EyeOff, Info } from "lucide-react";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await signIn(email, password);
			router.push("/dashboard");
			router.refresh();
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to sign in";
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md animate-in fade-in-50 slide-in-from-bottom-4">
				<CardHeader className="space-y-1 text-center">
					<div className="flex justify-center mb-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<Ticket className="h-6 w-6" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
					<CardDescription>Sign in to your Ticket Kite admin account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={loading}
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-black hover:text-black"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}
						<div className="rounded-md bg-muted p-3 text-sm">
							<div className="flex items-start gap-2">
								<Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
								<div className="flex-1 space-y-1">
									<p className="font-medium text-muted-foreground">Login Hint:</p>
									<p className="text-xs text-muted-foreground">
										Email: <span className="font-mono">zain@maxenius.agency</span>
									</p>
									<p className="text-xs text-muted-foreground">
										Password: <span className="font-mono">zain@12</span>
									</p>
								</div>
							</div>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
