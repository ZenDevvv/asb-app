export type Employee = {
	id: string;
	name: string;
	email: string;
	department: string;
	status: "active" | "inactive" | "on_leave";
	creditLimit: number;
	usedAmount: number;
	joinDate: string;
};

export type PurchaseRequest = {
	id: string;
	employeeId: string;
	employeeName: string;
	productName: string;
	amount: number;
	status: "pending" | "approved" | "rejected";
	date: string;
	installments: number;
};

export type DashboardStats = {
	totalOutstanding: number;
	activeUsers: number;
	monthlyVolume: number;
	pendingApprovals: number;
	totalOrganizations: number;
	totalUsers: number;
	activeUsersToday: number;
	systemHealth: number;
};

export type Organization = {
	id: string;
	name: string;
	domain: string;
	initials: string;
	color: string;
	status: "active" | "pending" | "inactive";
	students: number;
	createdAt: string;
	adminName: string;
	adminEmail: string;
	adminInitials: string;
	storageUsed: number;
	storageTotal: number;
	storageUnit: string;
	enabled: boolean;
};

export type SystemHealthMetric = {
	label: string;
	value: number;
	unit: string;
	detail?: string;
	color: string;
};

export const MOCK_EMPLOYEES: Employee[] = [
	{
		id: "EMP-001",
		name: "Alice Johnson",
		email: "alice.j@example.com",
		department: "Engineering",
		status: "active",
		creditLimit: 5000,
		usedAmount: 1200,
		joinDate: "2023-01-15",
	},
	{
		id: "EMP-002",
		name: "Bob Smith",
		email: "bob.s@example.com",
		department: "Marketing",
		status: "active",
		creditLimit: 3000,
		usedAmount: 2800,
		joinDate: "2023-03-10",
	},
	{
		id: "EMP-003",
		name: "Charlie Brown",
		email: "charlie.b@example.com",
		department: "Sales",
		status: "on_leave",
		creditLimit: 4000,
		usedAmount: 0,
		joinDate: "2022-11-05",
	},
	{
		id: "EMP-004",
		name: "Diana Prince",
		email: "diana.p@example.com",
		department: "Engineering",
		status: "active",
		creditLimit: 6000,
		usedAmount: 4500,
		joinDate: "2021-06-20",
	},
	{
		id: "EMP-005",
		name: "Evan Wright",
		email: "evan.w@example.com",
		department: "HR",
		status: "inactive",
		creditLimit: 2000,
		usedAmount: 500,
		joinDate: "2024-01-02",
	},
];

export const MOCK_REQUESTS: PurchaseRequest[] = [
	{
		id: "REQ-1001",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "MacBook Pro M3",
		amount: 2499,
		status: "pending",
		date: "2024-03-15",
		installments: 12,
	},
	{
		id: "REQ-1002",
		employeeId: "EMP-002",
		employeeName: "Bob Smith",
		productName: "iPhone 15 Pro",
		amount: 1199,
		status: "approved",
		date: "2024-03-14",
		installments: 6,
	},
	{
		id: "REQ-1003",
		employeeId: "EMP-004",
		employeeName: "Diana Prince",
		productName: "Dell UltraSharp Monitor",
		amount: 800,
		status: "rejected",
		date: "2024-03-10",
		installments: 3,
	},
	{
		id: "REQ-1004",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "Standing Desk",
		amount: 650,
		status: "pending",
		date: "2024-03-16",
		installments: 6,
	},{
		id: "REQ-1001",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "MacBook Pro M3",
		amount: 2499,
		status: "pending",
		date: "2024-03-15",
		installments: 12,
	},
	{
		id: "REQ-1002",
		employeeId: "EMP-002",
		employeeName: "Bob Smith",
		productName: "iPhone 15 Pro",
		amount: 1199,
		status: "approved",
		date: "2024-03-14",
		installments: 6,
	},
	{
		id: "REQ-1003",
		employeeId: "EMP-004",
		employeeName: "Diana Prince",
		productName: "Dell UltraSharp Monitor",
		amount: 800,
		status: "rejected",
		date: "2024-03-10",
		installments: 3,
	},
	{
		id: "REQ-1004",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "Standing Desk",
		amount: 650,
		status: "pending",
		date: "2024-03-16",
		installments: 6,
	},{
		id: "REQ-1001",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "MacBook Pro M3",
		amount: 2499,
		status: "pending",
		date: "2024-03-15",
		installments: 12,
	},
	{
		id: "REQ-1002",
		employeeId: "EMP-002",
		employeeName: "Bob Smith",
		productName: "iPhone 15 Pro",
		amount: 1199,
		status: "approved",
		date: "2024-03-14",
		installments: 6,
	},
	{
		id: "REQ-1003",
		employeeId: "EMP-004",
		employeeName: "Diana Prince",
		productName: "Dell UltraSharp Monitor",
		amount: 800,
		status: "rejected",
		date: "2024-03-10",
		installments: 3,
	},
	{
		id: "REQ-1004",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "Standing Desk",
		amount: 650,
		status: "pending",
		date: "2024-03-16",
		installments: 6,
	},{
		id: "REQ-1001",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "MacBook Pro M3",
		amount: 2499,
		status: "pending",
		date: "2024-03-15",
		installments: 12,
	},
	{
		id: "REQ-1002",
		employeeId: "EMP-002",
		employeeName: "Bob Smith",
		productName: "iPhone 15 Pro",
		amount: 1199,
		status: "approved",
		date: "2024-03-14",
		installments: 6,
	},
	{
		id: "REQ-1003",
		employeeId: "EMP-004",
		employeeName: "Diana Prince",
		productName: "Dell UltraSharp Monitor",
		amount: 800,
		status: "rejected",
		date: "2024-03-10",
		installments: 3,
	},
	{
		id: "REQ-1004",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "Standing Desk",
		amount: 650,
		status: "pending",
		date: "2024-03-16",
		installments: 6,
	},{
		id: "REQ-1001",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "MacBook Pro M3",
		amount: 2499,
		status: "pending",
		date: "2024-03-15",
		installments: 12,
	},
	{
		id: "REQ-1002",
		employeeId: "EMP-002",
		employeeName: "Bob Smith",
		productName: "iPhone 15 Pro",
		amount: 1199,
		status: "approved",
		date: "2024-03-14",
		installments: 6,
	},
	{
		id: "REQ-1003",
		employeeId: "EMP-004",
		employeeName: "Diana Prince",
		productName: "Dell UltraSharp Monitor",
		amount: 800,
		status: "rejected",
		date: "2024-03-10",
		installments: 3,
	},
	{
		id: "REQ-1004",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "Standing Desk",
		amount: 650,
		status: "pending",
		date: "2024-03-16",
		installments: 6,
	},{
		id: "REQ-1001",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "MacBook Pro M3",
		amount: 2499,
		status: "pending",
		date: "2024-03-15",
		installments: 12,
	},
	{
		id: "REQ-1002",
		employeeId: "EMP-002",
		employeeName: "Bob Smith",
		productName: "iPhone 15 Pro",
		amount: 1199,
		status: "approved",
		date: "2024-03-14",
		installments: 6,
	},
	{
		id: "REQ-1003",
		employeeId: "EMP-004",
		employeeName: "Diana Prince",
		productName: "Dell UltraSharp Monitor",
		amount: 800,
		status: "rejected",
		date: "2024-03-10",
		installments: 3,
	},
	{
		id: "REQ-1004",
		employeeId: "EMP-001",
		employeeName: "Alice Johnson",
		productName: "Standing Desk",
		amount: 650,
		status: "pending",
		date: "2024-03-16",
		installments: 6,
	},
];

export const MOCK_STATS: DashboardStats = {
	totalOutstanding: 125000,
	activeUsers: 142,
	monthlyVolume: 45000,
	pendingApprovals: 5,
	totalOrganizations: 124,
	totalUsers: 45200,
	activeUsersToday: 12350,
	systemHealth: 99.9,
};

export const MOCK_ORGANIZATIONS: Organization[] = [
	{
		id: "ORG-1002",
		name: "Lincoln High School",
		domain: "lincoln.edu",
		initials: "LH",
		color: "bg-indigo-500",
		status: "active",
		students: 1240,
		createdAt: "2 hours ago",
		adminName: "John Doe",
		adminEmail: "john.d@lincoln.edu",
		adminInitials: "JD",
		storageUsed: 450,
		storageTotal: 1000,
		storageUnit: "GB",
		enabled: true,
	},
	{
		id: "ORG-3341",
		name: "State University",
		domain: "state.edu",
		initials: "SU",
		color: "bg-blue-500",
		status: "active",
		students: 15000,
		createdAt: "5 hours ago",
		adminName: "Sarah Smith",
		adminEmail: "s.smith@state.edu",
		adminInitials: "SS",
		storageUsed: 4200,
		storageTotal: 10000,
		storageUnit: "GB",
		enabled: true,
	},
	{
		id: "ORG-0056",
		name: "Westside Academy",
		domain: "westside.edu",
		initials: "WA",
		color: "bg-emerald-500",
		status: "inactive",
		students: 450,
		createdAt: "1 day ago",
		adminName: "Mike Ross",
		adminEmail: "m.ross@westside.edu",
		adminInitials: "MR",
		storageUsed: 120,
		storageTotal: 500,
		storageUnit: "GB",
		enabled: false,
	},
	{
		id: "ORG-8902",
		name: "Global Institute",
		domain: "globalinst.com",
		initials: "GI",
		color: "bg-amber-500",
		status: "active",
		students: 5600,
		createdAt: "2 days ago",
		adminName: "David Kim",
		adminEmail: "admin@globalinst.com",
		adminInitials: "DK",
		storageUsed: 1800,
		storageTotal: 2000,
		storageUnit: "GB",
		enabled: true,
	},
];

export const MOCK_SYSTEM_HEALTH: SystemHealthMetric[] = [
	{
		label: "Server Uptime",
		value: 99.99,
		unit: "%",
		detail: "Last downtime: 42 days ago",
		color: "bg-emerald-500",
	},
	{
		label: "Avg. API Response",
		value: 124,
		unit: "ms",
		detail: "Peak latency: 320ms at 09:00 AM",
		color: "bg-primary",
	},
	{
		label: "Database Load",
		value: 45,
		unit: "%",
		color: "bg-amber-500",
	},
];

export type Product = {
	id: string;
	name: string;
	category: string;
	price: number;
	vendor: string;
	status: "active" | "draft" | "archived";
	stock: number;
	image?: string;
};

export const MOCK_PRODUCTS: Product[] = [
	{
		id: "PROD-001",
		name: "MacBook Pro M3",
		category: "Electronics",
		price: 2499.0,
		vendor: "Tech Supply Co.",
		status: "active",
		stock: 45,
		image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop",
	},
	{
		id: "PROD-002",
		name: "Ergonomic Office Chair",
		category: "Furniture",
		price: 599.0,
		vendor: "Home Comforts",
		status: "active",
		stock: 12,
		image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop",
	},
	{
		id: "PROD-003",
		name: "iPhone 15 Pro",
		category: "Electronics",
		price: 1199.0,
		vendor: "Tech Supply Co.",
		status: "active",
		stock: 8,
		image: "https://images.unsplash.com/photo-1696426718956-8219488a0715?q=80&w=1000&auto=format&fit=crop",
	},
	{
		id: "PROD-004",
		name: "Wireless Noise Cancelling Headphones",
		category: "Electronics",
		price: 349.0,
		vendor: "Audio Experts",
		status: "draft",
		stock: 0,
		image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
	},
];

export type OrgAdmin = {
	id: string;
	name: string;
	email: string;
	initials: string;
	color: string;
	role: "owner" | "admin" | "manager";
	status: "active" | "inactive" | "pending";
	organizationId: string;
	organizationName: string;
	organizationInitials: string;
	organizationColor: string;
	lastLogin: string;
	addedAt: string;
};

export const MOCK_ORG_ADMINS: OrgAdmin[] = [
	{
		id: "OA-001",
		name: "John Doe",
		email: "john.d@lincoln.edu",
		initials: "JD",
		color: "bg-blue-500",
		role: "owner",
		status: "active",
		organizationId: "ORG-1002",
		organizationName: "Lincoln High School",
		organizationInitials: "LH",
		organizationColor: "bg-indigo-500",
		lastLogin: "2 hours ago",
		addedAt: "Jan 15, 2025",
	},
	{
		id: "OA-002",
		name: "Sarah Smith",
		email: "s.smith@state.edu",
		initials: "SS",
		color: "bg-violet-500",
		role: "owner",
		status: "active",
		organizationId: "ORG-3341",
		organizationName: "State University",
		organizationInitials: "SU",
		organizationColor: "bg-blue-500",
		lastLogin: "5 hours ago",
		addedAt: "Mar 02, 2025",
	},
	{
		id: "OA-003",
		name: "Mike Ross",
		email: "m.ross@westside.edu",
		initials: "MR",
		color: "bg-emerald-500",
		role: "admin",
		status: "inactive",
		organizationId: "ORG-0056",
		organizationName: "Westside Academy",
		organizationInitials: "WA",
		organizationColor: "bg-emerald-500",
		lastLogin: "30 days ago",
		addedAt: "Nov 10, 2024",
	},
	{
		id: "OA-004",
		name: "David Kim",
		email: "admin@globalinst.com",
		initials: "DK",
		color: "bg-amber-500",
		role: "owner",
		status: "active",
		organizationId: "ORG-8902",
		organizationName: "Global Institute",
		organizationInitials: "GI",
		organizationColor: "bg-amber-500",
		lastLogin: "1 hour ago",
		addedAt: "Jun 20, 2024",
	},
	{
		id: "OA-005",
		name: "Emily Chen",
		email: "e.chen@lincoln.edu",
		initials: "EC",
		color: "bg-pink-500",
		role: "admin",
		status: "active",
		organizationId: "ORG-1002",
		organizationName: "Lincoln High School",
		organizationInitials: "LH",
		organizationColor: "bg-indigo-500",
		lastLogin: "12 hours ago",
		addedAt: "Sep 01, 2025",
	},
	{
		id: "OA-006",
		name: "Robert Garcia",
		email: "r.garcia@state.edu",
		initials: "RG",
		color: "bg-cyan-500",
		role: "manager",
		status: "active",
		organizationId: "ORG-3341",
		organizationName: "State University",
		organizationInitials: "SU",
		organizationColor: "bg-blue-500",
		lastLogin: "3 days ago",
		addedAt: "Jul 14, 2025",
	},
	{
		id: "OA-007",
		name: "Lisa Wang",
		email: "l.wang@globalinst.com",
		initials: "LW",
		color: "bg-red-500",
		role: "admin",
		status: "pending",
		organizationId: "ORG-8902",
		organizationName: "Global Institute",
		organizationInitials: "GI",
		organizationColor: "bg-amber-500",
		lastLogin: "Never",
		addedAt: "Feb 08, 2026",
	},
	{
		id: "OA-008",
		name: "James Wilson",
		email: "j.wilson@state.edu",
		initials: "JW",
		color: "bg-indigo-500",
		role: "manager",
		status: "active",
		organizationId: "ORG-3341",
		organizationName: "State University",
		organizationInitials: "SU",
		organizationColor: "bg-blue-500",
		lastLogin: "1 day ago",
		addedAt: "Oct 22, 2025",
	},
];
