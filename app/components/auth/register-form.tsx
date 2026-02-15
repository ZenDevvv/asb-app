import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { Icon } from "./icon";
import { useAuth, useRegister } from "~/hooks/use-auth";
import type { Register } from "~/zod/auth.zod";

type UserRole = "student" | "instructor";

export function RegisterForm() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const { mutate: register, isPending: isLoading } = useRegister();

	const [role, setRole] = useState<UserRole>("student");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [userName, setUserName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleRegister = (e: React.FormEvent) => {
		e.preventDefault();

		const payload: Register = {
			email,
			password,
			userName,
			role: "user",
			subRole: role,
			person: {
				personalInfo: {
					firstName,
					lastName,
				},
			},
		};

		register(payload, {
			onSuccess: async () => {
				await login(email, password);
				navigate("/admin");
			},
		});
	};

	return (
		<div className="w-full max-w-[400px] space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					Create your account
				</h2>
				<p className="text-sm text-muted-foreground">
					Fill in the details below to get started.
				</p>
			</div>

			<form onSubmit={handleRegister} className="space-y-4">
				{/* Role selector */}
				<div className="space-y-2">
					<Label className="text-sm font-medium">I am a</Label>
					<div className="grid grid-cols-2 gap-3">
						<button
							type="button"
							onClick={() => setRole("student")}
							className={`flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
								role === "student"
									? "border-primary bg-primary/5 text-primary"
									: "border-border text-muted-foreground hover:border-primary/40"
							}`}>
							<span className="text-xl leading-none">
								<Icon name="school" className="text-xl" />
							</span>
							Student
						</button>
						<button
							type="button"
							onClick={() => setRole("instructor")}
							className={`flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
								role === "instructor"
									? "border-primary bg-primary/5 text-primary"
									: "border-border text-muted-foreground hover:border-primary/40"
							}`}>
							<span className="text-xl leading-none">
								<Icon name="person" className="text-xl" />
							</span>
							Instructor
						</button>
					</div>
				</div>

				{/* Name row */}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-2">
						<Label htmlFor="reg-first-name" className="text-sm font-medium">
							First Name
						</Label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg leading-none">
								<Icon name="badge" className="text-lg" />
							</span>
							<Input
								id="reg-first-name"
								type="text"
								placeholder="John"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
								disabled={isLoading}
								className="pl-10 bg-white dark:bg-gray-950 h-11"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="reg-last-name" className="text-sm font-medium">
							Last Name
						</Label>
						<Input
							id="reg-last-name"
							type="text"
							placeholder="Doe"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
							disabled={isLoading}
							className="bg-white dark:bg-gray-950 h-11"
						/>
					</div>
				</div>

				{/* Username */}
				<div className="space-y-2">
					<Label htmlFor="reg-username" className="text-sm font-medium">
						Username
					</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg leading-none">
							<Icon name="person" className="text-lg" />
						</span>
						<Input
							id="reg-username"
							type="text"
							placeholder="johndoe"
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 bg-white dark:bg-gray-950 h-11"
						/>
					</div>
				</div>

				{/* Email */}
				<div className="space-y-2">
					<Label htmlFor="reg-email" className="text-sm font-medium">
						Email Address
					</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg leading-none">
							<Icon name="mail" className="text-lg" />
						</span>
						<Input
							id="reg-email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 bg-white dark:bg-gray-950 h-11"
						/>
					</div>
				</div>

				{/* Password */}
				<div className="space-y-2">
					<Label htmlFor="reg-password" className="text-sm font-medium">
						Password
					</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg leading-none">
							<Icon name="lock" className="text-lg" />
						</span>
						<Input
							id="reg-password"
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

				{/* Confirm Password */}
				<div className="space-y-2">
					<Label htmlFor="reg-confirm-password" className="text-sm font-medium">
						Confirm Password
					</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg leading-none">
							<Icon name="lock" className="text-lg" />
						</span>
						<Input
							id="reg-confirm-password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 bg-white dark:bg-gray-950 h-11"
						/>
					</div>
				</div>

				<Button type="submit" className="w-full h-11" disabled={isLoading} size="lg">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating account...
						</>
					) : (
						"Create Account"
					)}
				</Button>
			</form>

			{/* Login CTA */}
			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link
					to="/login"
					className="font-medium text-primary hover:underline underline-offset-4">
					Sign in
				</Link>
			</p>
		</div>
	);
}
