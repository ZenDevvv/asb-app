import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useAuth } from "~/hooks/use-auth";
import { useNavigate, Link } from "react-router";
import { Icon } from "./icon";

export function LoginForm() {
	const { login, error } = useAuth();
	const navigate = useNavigate();

	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [keepLoggedIn, setKeepLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await login(identifier, password);
			if (response.user.subRole.includes("superadmin")) {
				navigate("/superadmin");
			} else if (response.user.subRole.includes("org_admin")) {
				navigate("/admin");
			}
		} catch (err) {
			console.error("Login failed:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-[400px] space-y-8">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
				<p className="text-sm text-muted-foreground">
					Please enter your details to sign in.
				</p>
			</div>

			<form onSubmit={handleLogin} className="space-y-5">
				{error && (
					<div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-500/10 dark:bg-red-900/20 dark:text-red-400">
						{error}
					</div>
				)}

				{/* Email */}
				<div className="space-y-2">
					<Label htmlFor="identifier" className="text-sm font-medium">
						Email Address
					</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg leading-none">
							<Icon name="mail" className="text-lg" />
						</span>
						<Input
							id="identifier"
							type="text"
							placeholder="student@1bis.edu"
							value={identifier}
							onChange={(e) => setIdentifier(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 bg-white dark:bg-gray-950 h-11"
						/>
					</div>
				</div>

				{/* Password */}
				<div className="space-y-2">
					<Label htmlFor="password" className="text-sm font-medium">
						Password
					</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg leading-none">
							<Icon name="lock" className="text-lg" />
						</span>
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 pr-10 bg-white dark:bg-gray-950 h-11"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-0 top-0 h-11 w-10 text-muted-foreground hover:bg-transparent"
							onClick={() => setShowPassword(!showPassword)}
							disabled={isLoading}>
							<span className="text-lg leading-none">
								<Icon
									name={showPassword ? "visibility" : "visibility_off"}
									className="text-lg"
								/>
							</span>
							<span className="sr-only">Toggle password visibility</span>
						</Button>
					</div>
				</div>

				{/* Keep logged in + Forgot */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Checkbox
							id="keep-logged-in"
							checked={keepLoggedIn}
							onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
						/>
						<Label
							htmlFor="keep-logged-in"
							className="text-sm font-normal text-muted-foreground cursor-pointer">
							Keep me logged in
						</Label>
					</div>
					<a
						href="#"
						className="text-sm font-medium text-primary hover:underline underline-offset-4">
						Forgot password?
					</a>
				</div>

				<Button type="submit" className="w-full h-11" disabled={isLoading} size="lg">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Signing in...
						</>
					) : (
						"Sign In"
					)}
				</Button>
			</form>

			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t border-border" />
				</div>
				<div className="relative flex justify-center text-xs">
					<span className="bg-white dark:bg-gray-950 px-3 text-muted-foreground">
						Or access via
					</span>
				</div>
			</div>

			{/* SSO */}
			<Button
				type="button"
				variant="outline"
				className="w-full h-11 gap-2"
				disabled={isLoading}>
				<span className="text-lg leading-none text-primary">
					<Icon name="passkey" className="text-lg" />
				</span>
				Single Sign-On (SSO)
			</Button>

			{/* Register CTA */}
			<p className="text-center text-sm text-muted-foreground">
				Don&apos;t have an account?{" "}
				<Link
					to="/register"
					className="font-medium text-primary hover:underline underline-offset-4">
					Create account
				</Link>
			</p>
		</div>
	);
}
