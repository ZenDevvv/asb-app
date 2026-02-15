import { NavLink } from "react-router";
import {
	LayoutDashboard,
	Building2,
	UsersRound,
	ShieldCheck,
	ScrollText,
	Settings,
	LogOut,
	X,
	User,
	ChevronUp,
	Activity,
	Megaphone,
	BarChart3,
	ToggleRight,
	Mail,
	Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

const mainNavItems = [
	{ href: "/superadmin", icon: LayoutDashboard, label: "Dashboard", end: true },
	{
		href: "/superadmin/organizations",
		icon: Building2,
		label: "Organizations",
		end: false,
	},
	{
		href: "/superadmin/user-management",
		icon: UsersRound,
		label: "User Management",
		end: false,
	},
	{
		href: "/superadmin/announcements",
		icon: Megaphone,
		label: "Announcements",
		end: false,
	},
	{
		href: "/superadmin/platform-analytics",
		icon: BarChart3,
		label: "Platform Analytics",
		end: false,
	},
];

const logsNavItems = [
	{
		href: "/superadmin/activity-logs",
		icon: Activity,
		label: "Activity Logs",
		end: false,
	},
	{
		href: "/superadmin/audit-logs",
		icon: ScrollText,
		label: "Audit Logs",
		end: false,
	},
];

const systemNavItems = [
	{
		href: "/superadmin/feature-flags",
		icon: ToggleRight,
		label: "Feature Flags",
		end: false,
	},
	{
		href: "/superadmin/email-templates",
		icon: Mail,
		label: "Email Templates",
		end: false,
	},
	{
		href: "/superadmin/maintenance",
		icon: Wrench,
		label: "Maintenance",
		end: false,
	},
	{
		href: "/superadmin/settings",
		icon: Settings,
		label: "Settings",
		end: false,
	},
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
	return (
		<>
			{/* Mobile Sidebar Overlay */}
			<div
				className={cn(
					"fixed inset-0 z-40 bg-black/50 lg:hidden",
					isOpen ? "block" : "hidden",
				)}
				onClick={onClose}
			/>

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 border-r border-sidebar-border transition-all duration-300 ease-in-out h-screen flex flex-col",
					"bg-[#1e1e2d] dark:bg-[#151521]",
					"lg:static lg:translate-x-0",
					isOpen
						? "w-64 translate-x-0"
						: "w-64 -translate-x-full lg:w-0 lg:overflow-hidden lg:border-r-0",
				)}>
				{/* Sidebar Header */}
				<div className="flex h-16 items-center border-b border-white/10 px-6 min-w-[16rem] shrink-0">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
							1B
						</div>
						<span className="text-lg font-bold text-white">1BIS LMS</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="ml-auto text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
						onClick={onClose}>
						<X className="h-5 w-5" />
					</Button>
				</div>

				{/* Nav Items */}
				<div className="flex-1 overflow-y-auto px-3 py-4 min-w-[16rem]">
					{/* Main Nav */}
					<div className="flex flex-col gap-1">
						{mainNavItems.map((item) => (
							<NavLink
								key={item.href}
								to={item.href}
								end={item.end}
								className={({ isActive }) =>
									cn(
										"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-white/70 hover:bg-white/10 hover:text-white",
									)
								}>
								<item.icon className="h-[18px] w-[18px]" />
								{item.label}
							</NavLink>
						))}
					</div>

					{/* Logs Section */}
					<div className="mt-6">
						<p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">
							Logs
						</p>
						<div className="flex flex-col gap-1">
							{logsNavItems.map((item) => (
								<NavLink
									key={item.href}
									to={item.href}
									end={item.end}
									className={({ isActive }) =>
										cn(
											"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
											isActive
												? "bg-primary text-primary-foreground"
												: "text-white/70 hover:bg-white/10 hover:text-white",
										)
									}>
									<item.icon className="h-[18px] w-[18px]" />
									{item.label}
								</NavLink>
							))}
						</div>
					</div>

					{/* System Section */}
					<div className="mt-6">
						<p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">
							System
						</p>
						<div className="flex flex-col gap-1">
							{systemNavItems.map((item) => (
								<NavLink
									key={item.href}
									to={item.href}
									end={item.end}
									className={({ isActive }) =>
										cn(
											"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
											isActive
												? "bg-primary text-primary-foreground"
												: "text-white/70 hover:bg-white/10 hover:text-white",
										)
									}>
									<item.icon className="h-[18px] w-[18px]" />
									{item.label}
								</NavLink>
							))}
						</div>
					</div>
				</div>

				{/* Sidebar Footer — Profile */}
				<div className="border-t border-white/10 p-3 min-w-[16rem] shrink-0">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/10">
								<Avatar className="size-9">
									<AvatarImage src="" alt="Super Admin" />
									<AvatarFallback className="bg-amber-600 text-white text-xs font-semibold">
										SA
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="truncate text-sm font-medium text-white">
										Super Admin
									</p>
									<p className="truncate text-xs text-white/50">admin@1bis.com</p>
								</div>
								<ChevronUp className="h-4 w-4 shrink-0 text-white/40" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							side="top"
							align="start"
							className="w-56 bg-[#1e1e2d] border-white/10 text-white"
							sideOffset={8}>
							<DropdownMenuItem className="gap-2 cursor-pointer text-white/80 hover:text-white focus:bg-white/10 focus:text-white">
								<User className="h-4 w-4" />
								Profile Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator className="bg-white/10" />
							<DropdownMenuItem
								className="gap-2 cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
								asChild>
								<a href="/login">
									<LogOut className="h-4 w-4" />
									Log Out
								</a>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</aside>
		</>
	);
}
