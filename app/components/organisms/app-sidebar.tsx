import {
	LayoutDashboard,
	Package,
	ShoppingCart,
	Send,
	Barcode,
	FileText,
	Settings,
	ChevronRight,
	Building2,
	Package2,
	User,
	Factory,
	Layers,
	Tag,
	Building,
	Users,
	UserRound,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarHeader,
	SidebarFooter,
	SidebarTrigger,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatarFlat from "@/assets/images/avatarFlat.png";
import { useAuth } from "~/hooks/use-auth";
import osparLogo from "@/assets/images/ospar.jpg";

export function AppSidebar() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const sidebar = useSidebar();
	const { user } = useAuth();

	const isManagement = user.department.code === "PPPMG";
	const isOffice = user.department.code === "PPPOF";

	const navItems = [
		{
			title: "Overview",
			items: [
				{
					title: "Dashboard",
					href: `/dashboard`,
					icon: LayoutDashboard,
				},
			],
		},
		{
			title: "Inventory",
			items: [
				...(isManagement
					? [
							{
								title: "Products",
								href: `/inventory/products`,
								icon: Package,
							},
						]
					: []),
				{
					title: "Stock Record",
					href: `/inventory/stock-records`,
					icon: Layers,
				},
				{
					title: "Batch Record",
					href: `/inventory/batch-records`,
					icon: Tag,
				},
				{
					title: "Stock Movements",
					href: `/inventory/movement`,
					icon: Send,
				},
			],
		},
		{
			title: "Operations",
			items: [
				// ...(!isManagement
				// 	? [
				// 			{
				// 				title: "Delivery Request",
				// 				href: `/delivery-requests`,
				// 				icon: Building2,
				// 			},
				// 		]
				// 	: []),
				{
					title: "Delivery Request",
					href: `/delivery-requests`,
					icon: Building2,
				},
				{
					title: "Delivery Orders",
					href: `/delivery-orders`,
					icon: ShoppingCart,
				},
				{
					title: "Delivery Receipt",
					href: `/delivery-receipt`,
					icon: Package2,
				},
			],
		},
		{
			title: "Management",
			items: [
				...(isManagement
					? [
							{
								title: "Supplier",
								href: `/suppliers`,
								icon: Factory,
							},
						]
					: []),

				...(isManagement
					? [
							{
								title: "Departments",
								href: `/departments`,
								icon: Building,
							},
						]
					: []),
				...(isOffice
					? [
							{
								title: "Users",
								href: `/users`,
								icon: Users,
							},
						]
					: []),
				...(isManagement || isOffice
					? [
							{
								title: "Patients",
								href: `/patients`,
								icon: UserRound,
							},
						]
					: []),
				{
					title: "Reports",
					href: `/reports`,
					icon: FileText,
				},
				{
					title: "Settings",
					href: "/settings",
					icon: Settings,
				},
			],
		},
	];

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader
				className={`border-b border-sidebar-border ${sidebar.open ? "p-4" : ""} py-6`}>
				<div className="flex items-center justify-between w-full">
					{sidebar.open && (
						<div className="flex items-center gap-2">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<img src={osparLogo} alt="" />
							</div>
							<div className="flex flex-col">
								<span className="font-semibold text-sm">OSPAR Inventory</span>
								<span className="text-xs text-muted-foreground">
									{user?.department.name}
								</span>
							</div>
						</div>
					)}
					<SidebarTrigger className="cursor-pointer" />
				</div>
			</SidebarHeader>
			<SidebarContent>
				{navItems.map((section, index) => (
					<>
						{index > 0 && !sidebar.open && (
							<SidebarSeparator className="bg-gray-100/20 max-w-10 mx-auto" />
						)}
						<SidebarGroup key={section.title}>
							{sidebar.open && <SidebarGroupLabel>{section.title}</SidebarGroupLabel>}
							<SidebarGroupContent>
								<SidebarMenu>
									{section.items.map((item) => (
										<SidebarMenuItem key={item.href}>
											<SidebarMenuButton
												asChild
												isActive={pathname === item.href}>
												<Link to={item.href}>
													<item.icon className="size-4" />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</>
				))}
			</SidebarContent>
			<SidebarFooter className="border-t border-sidebar-border p-2 py-4">
				<button
					onClick={() => navigate(`/profile/user/${user?.id}`)}
					className={`cursor-pointer hover:bg-accent/10 rounded-lg py-2 w-full ${sidebar.open ? "px-2" : ""}`}>
					<div className="flex items-center gap-3 w-full">
						<Avatar className="size-8">
							<AvatarImage src={user?.avatar || avatarFlat} />
							{/* <AvatarFallback className="bg-muted text-muted-foreground">
								RC
							</AvatarFallback> */}
						</Avatar>
						{sidebar.open && (
							<div className="flex flex-col text-sm">
								<span className="font-medium">
									{user.person.personalInfo.firstName}{" "}
									{user.person.personalInfo.lastName}
								</span>
							</div>
						)}
						<User className="ml-auto size-4 text-muted-foreground" />
					</div>
				</button>
				{/* <SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className="justify-start cursor-pointer">
							
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu> */}
			</SidebarFooter>
		</Sidebar>
	);
}
