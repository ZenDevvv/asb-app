import { NavLink } from "react-router";
import {
	LayoutGrid,
	Layers,
	Users,
	BarChart3,
	Settings,
	Bot,
	LogOut,
	X,
	UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "~/hooks/use-auth";

interface AdminSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

const mainNavItems = [
	{ href: "/admin", icon: LayoutGrid, label: "Overview", end: true },
	{ href: "/admin/templates", icon: Layers, label: "Templates", end: false },
	{ href: "/admin/users", icon: Users, label: "Users", end: false },
	{ href: "/admin/analytics", icon: BarChart3, label: "Analytics", end: false },
];

const systemNavItems = [
	{
		href: "/admin/system-settings",
		icon: Settings,
		label: "System Settings",
		end: false,
	},
	{
		href: "/admin/ai-configurations",
		icon: Bot,
		label: "AI Configurations",
		end: false,
	},
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
	const { logout } = useAuth();
	const handleLogout = () => {
		void logout();
	};

	return (
		<>
			<div
				className={cn(
					"fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden",
					isOpen ? "block" : "hidden",
				)}
				onClick={onClose}
			/>

			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border",
					"bg-gradient-to-b from-sidebar via-sidebar to-background text-sidebar-foreground",
					"transition-transform duration-300 ease-out lg:static lg:translate-x-0",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}>
				<div className="flex items-center gap-3 px-5 pb-5 pt-6">
					<div className="relative shrink-0">
						<div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-primary shadow-sm">
							<UserRound className="h-4 w-4" />
						</div>
						<span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-sidebar bg-primary" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-base font-semibold leading-tight text-sidebar-foreground">
							Admin Panel
						</p>
						<p className="mt-0.5 text-xs leading-tight text-sidebar-foreground/65">
							Super Admin
						</p>
					</div>
					<button
						type="button"
						className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
						onClick={onClose}>
						<X className="h-4 w-4" />
					</button>
				</div>

				<nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
					<div className="space-y-1">
						{mainNavItems.map((item) => (
							<NavLink
								key={item.href}
								to={item.href}
								end={item.end}
								className={({ isActive }) =>
									cn(
										"relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
										isActive
											? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:top-2 before:h-7 before:w-1 before:rounded-r-full before:bg-primary"
											: "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
									)
								}>
								<item.icon className="h-4 w-4 shrink-0" />
								{item.label}
							</NavLink>
						))}
					</div>

					<div className="border-t border-sidebar-border" />

					<div className="space-y-1">
						{systemNavItems.map((item) => (
							<NavLink
								key={item.href}
								to={item.href}
								end={item.end}
								className={({ isActive }) =>
									cn(
										"relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
										isActive
											? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:top-2 before:h-7 before:w-1 before:rounded-r-full before:bg-primary"
											: "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
									)
								}>
								<item.icon className="h-4 w-4 shrink-0" />
								{item.label}
							</NavLink>
						))}
					</div>
				</nav>

				<div className="px-4 pb-4 pt-2">
					<button
						type="button"
						onClick={handleLogout}
						className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground">
						<LogOut className="h-4 w-4 shrink-0" />
						Log Out
					</button>
				</div>
			</aside>
		</>
	);
}
