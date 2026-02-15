import { NavLink } from "react-router";
import {
	LayoutDashboard,
	BookOpen,
	Layers,
	Megaphone,
	GraduationCap,
	Users,
	UserCog,
	FolderTree,
	Building2,
	FileStack,
	CalendarRange,
	UserPlus,
	CalendarDays,
	Award,
	TrendingUp,
	AlertTriangle,
	BarChart3,
	Languages,
	Settings,
	LogOut,
	X,
	User,
	ChevronUp,
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

interface OrgAdminSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

const mainNavItems = [
	{ href: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
	{ href: "/admin/courses", icon: BookOpen, label: "Courses", end: false },
	{ href: "/admin/sections", icon: Layers, label: "Sections", end: false },
	{ href: "/admin/announcements", icon: Megaphone, label: "Announcements", end: false },
];

const peopleNavItems = [
	{ href: "/admin/instructors", icon: GraduationCap, label: "Instructors", end: false },
	{ href: "/admin/students", icon: Users, label: "Students", end: false },
	{ href: "/admin/user-management", icon: UserCog, label: "User Management", end: false },
];

const academicNavItems = [
	{ href: "/admin/categories", icon: FolderTree, label: "Categories", end: false },
	{ href: "/admin/faculties", icon: Building2, label: "Faculties", end: false },
	{ href: "/admin/programs", icon: FileStack, label: "Programs", end: false },
	{ href: "/admin/academic-terms", icon: CalendarRange, label: "Academic Terms", end: false },
	{ href: "/admin/enrollment", icon: UserPlus, label: "Enrollment", end: false },
	{ href: "/admin/academic-calendar", icon: CalendarDays, label: "Academic Calendar", end: false },
];

const performanceNavItems = [
	{ href: "/admin/instructor-performance", icon: Award, label: "Instructor Performance", end: false },
	{ href: "/admin/student-performance", icon: TrendingUp, label: "Student Performance", end: false },
	{ href: "/admin/at-risk-students", icon: AlertTriangle, label: "At-Risk Students", end: false },
	{ href: "/admin/reports", icon: BarChart3, label: "Reports", end: false },
];

const settingsNavItems = [
	{ href: "/admin/terminology", icon: Languages, label: "Terminology", end: false },
	{ href: "/admin/settings", icon: Settings, label: "Settings", end: false },
];

const navSections = [
	{ label: null, items: mainNavItems },
	{ label: "People", items: peopleNavItems },
	{ label: "Academic", items: academicNavItems },
	{ label: "Performance", items: performanceNavItems },
	{ label: "Settings", items: settingsNavItems },
];

export function OrgAdminSidebar({ isOpen, onClose }: OrgAdminSidebarProps) {
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
					{navSections.map((section, sectionIndex) => (
						<div key={section.label ?? "main"} className={sectionIndex > 0 ? "mt-6" : undefined}>
							{section.label && (
								<p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">
									{section.label}
								</p>
							)}
							<div className="flex flex-col gap-1">
								{section.items.map((item) => (
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
					))}
				</div>

				{/* Sidebar Footer — Profile */}
				<div className="border-t border-white/10 p-3 min-w-[16rem] shrink-0">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/10">
								<Avatar className="size-9">
									<AvatarImage src="" alt="Org Admin" />
									<AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
										OA
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="truncate text-sm font-medium text-white">
										Org Admin
									</p>
									<p className="truncate text-xs text-white/50">admin@org.com</p>
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
