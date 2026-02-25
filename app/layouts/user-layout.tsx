import { Outlet, Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useAuth } from "~/hooks/use-auth";
import { SplashScreen } from "@/components/admin/splash-screen";
import { Icon } from "~/components/ui/icon";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name?: string, email?: string): string {
	const src = name || email || "";
	if (!src) return "??";
	return src.slice(0, 2).toUpperCase();
}

// ─── User Menu ────────────────────────────────────────────────────────────────
function UserMenu({
	user,
	onLogout,
}: {
	user: { userName?: string; email: string; avatar?: string } | null;
	onLogout: () => void;
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const initials = getInitials(user?.userName, user?.email);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-label="User menu"
				className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary ring-2 ring-transparent transition-all hover:ring-primary/50 focus-visible:outline-none"
			>
				{user?.avatar ? (
					<img src={user.avatar} alt={initials} className="h-9 w-9 rounded-full object-cover" />
				) : (
					<span>{initials}</span>
				)}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, scale: 0.94, y: 6 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.94, y: 6 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-xl shadow-black/20 backdrop-blur-xl"
					>
						{/* User info */}
						<div className="border-b border-border/60 px-4 py-3">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
									{user?.avatar ? (
										<img
											src={user.avatar}
											alt=""
											className="h-9 w-9 rounded-full object-cover"
										/>
									) : (
										initials
									)}
								</div>
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold">
										{user?.userName || user?.email?.split("@")[0]}
									</p>
									<p className="truncate text-xs text-muted-foreground">{user?.email}</p>
								</div>
							</div>
						</div>

						{/* Menu items */}
						<div className="p-1.5">
							{[
								{ icon: "person", label: "Profile" },
								{ icon: "settings", label: "Settings" },
								{ icon: "help", label: "Help & Docs" },
							].map(({ icon, label }) => (
								<button
									key={label}
									type="button"
									className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-primary/10 hover:text-foreground"
								>
									<Icon name={icon} size={15} />
									{label}
								</button>
							))}
						</div>

						<div className="border-t border-border/60 p-1.5">
							<button
								type="button"
								onClick={() => {
									setOpen(false);
									onLogout();
								}}
								className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
							>
								<Icon name="logout" size={15} />
								Sign Out
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function UserLayout() {
	const { user, isLoading, logout } = useAuth();
	const navigate = useNavigate();
	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		if (!isLoading && !user) {
			navigate("/login");
		}
	}, [user, isLoading, navigate]);

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	if (isLoading) {
		return <SplashScreen />;
	}

	if (!user) {
		return null;
	}

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			<div className="flex-1 flex flex-col min-w-0 h-full">
				{/* ── Header ──────────────────────────────────────────── */}
				<motion.header
					className="shrink-0 border-b border-border/40 bg-background/75 backdrop-blur-xl z-50"
					initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
				>
					<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-10">
						{/* Logo */}
						<Link to="/" className="flex items-center gap-2.5">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/40">
								<Icon name="auto_awesome" size={16} filled />
							</div>
							<span className="text-lg font-bold tracking-tight">
								AppSite<span className="text-primary">Builder</span>
							</span>
						</Link>

						{/* Nav */}
						<nav className="hidden items-center gap-1 md:flex">
							{[
								{ label: "Dashboard", icon: "dashboard", active: true },
								{ label: "My Projects", icon: "folder_open", active: false },
								{ label: "Templates", icon: "grid_view", active: false },
								{ label: "Settings", icon: "settings", active: false },
							].map(({ label, icon, active }) => (
								<button
									key={label}
									type="button"
									className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
										active
											? "bg-primary/15 text-primary"
											: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
									}`}
								>
									<Icon name={icon} size={14} />
									{label}
								</button>
							))}
						</nav>

						{/* Right actions */}
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={() => navigate("/editor")}
								className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/20 sm:flex"
							>
								<Icon name="add" size={15} />
								New Project
							</button>

							<button
								type="button"
								className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/50 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
							>
								<Icon name="notifications" size={18} />
								<span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
							</button>

							<UserMenu user={user} onLogout={handleLogout} />
						</div>
					</div>
				</motion.header>

				{/* ── Page content ────────────────────────────────────── */}
				<main className="minimal-scrollbar flex-1 overflow-y-auto">
					<Outlet />
					<footer className="border-t border-border/40 bg-background/50 backdrop-blur-xl">
						<div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5 md:px-10">
							<div className="flex items-center gap-2">
								<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
									<Icon name="auto_awesome" size={12} filled />
								</div>
								<span className="text-sm font-semibold">
									AppSite<span className="text-primary">Builder</span>
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								&copy; {new Date().getFullYear()} AppSiteBuilder | All rights reserved.
							</p>
							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								{["Privacy", "Terms", "Help"].map((l) => (
									<span
										key={l}
										className="cursor-default transition-colors hover:text-foreground"
									>
										{l}
									</span>
								))}
							</div>
						</div>
					</footer>
				</main>
			</div>
		</div>
	);
}
