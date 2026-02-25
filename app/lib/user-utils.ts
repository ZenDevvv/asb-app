import type { User } from "~/zod/user.zod";

export const USER_FIELDS =
	"id,avatar,userName,email,password,role,status,isDeleted,lastLogin,loginMethod,createdAt,updatedAt,personId,orgId,person,organization";

export const USER_STATUS_FILTERS = ["all", "active", "inactive", "suspended", "archived"] as const;

export type UserStatusFilter = (typeof USER_STATUS_FILTERS)[number];

export const USER_STATUS_FILTER_LABELS: Record<UserStatusFilter, string> = {
	all: "All",
	active: "Active",
	inactive: "Inactive",
	suspended: "Suspended",
	archived: "Archived",
};

type StatusMeta = {
	label: string;
	iconName: string;
	dotClassName: string;
	chipClassName: string;
};

type RoleMeta = {
	label: string;
	iconName: string;
	chipClassName: string;
};

type LoginMethodMeta = {
	label: string;
	iconName: string;
};

type DateInput = Date | string | null | undefined;

const USER_STATUS_META: Record<User["status"], StatusMeta> = {
	active: {
		label: "Active",
		iconName: "check_circle",
		dotClassName: "bg-chart-2",
		chipClassName: "border-chart-2/35 bg-chart-2/12 text-chart-2",
	},
	inactive: {
		label: "Inactive",
		iconName: "pause_circle",
		dotClassName: "bg-chart-5",
		chipClassName: "border-chart-5/35 bg-chart-5/12 text-chart-5",
	},
	suspended: {
		label: "Suspended",
		iconName: "do_not_disturb_on",
		dotClassName: "bg-destructive",
		chipClassName: "border-destructive/40 bg-destructive/10 text-destructive",
	},
	archived: {
		label: "Archived",
		iconName: "inventory_2",
		dotClassName: "bg-muted-foreground",
		chipClassName: "border-border bg-muted text-muted-foreground",
	},
};

const USER_ROLE_META: Record<User["role"], RoleMeta> = {
	admin: {
		label: "Admin",
		iconName: "shield_person",
		chipClassName: "border-chart-1/40 bg-chart-1/12 text-chart-1",
	},
	user: {
		label: "User",
		iconName: "person",
		chipClassName: "border-chart-4/40 bg-chart-4/12 text-chart-4",
	},
	viewer: {
		label: "Viewer",
		iconName: "visibility",
		chipClassName: "border-border bg-muted text-muted-foreground",
	},
};

const LOGIN_METHOD_MAP: Record<string, LoginMethodMeta> = {
	email: { label: "Email", iconName: "mail" },
	password: { label: "Password", iconName: "password" },
	google: { label: "Google", iconName: "g_translate" },
	github: { label: "GitHub", iconName: "code" },
	microsoft: { label: "Microsoft", iconName: "desktop_windows" },
	apple: { label: "Apple", iconName: "smartphone" },
	magic_link: { label: "Magic Link", iconName: "mark_email_unread" },
};

const normalizeWord = (value: string): string =>
	value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const toDate = (value: DateInput): Date | null => {
	if (!value) {
		return null;
	}

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

export function getUserStatusMeta(status: User["status"]): StatusMeta {
	return USER_STATUS_META[status];
}

export function getUserRoleMeta(role: User["role"]): RoleMeta {
	return USER_ROLE_META[role];
}

export function getUserLoginMethodMeta(loginMethod?: string): LoginMethodMeta {
	if (!loginMethod || !loginMethod.trim()) {
		return LOGIN_METHOD_MAP.email;
	}

	const normalized = loginMethod.trim().toLowerCase().replace(/\s+/g, "_");
	return (
		LOGIN_METHOD_MAP[normalized] ?? {
			label: normalizeWord(loginMethod.trim()),
			iconName: "passkey",
		}
	);
}

export function getUserDisplayName(user: User): string {
	const firstName = user.person?.personalInfo.firstName?.trim();
	const lastName = user.person?.personalInfo.lastName?.trim();
	const fullName = [firstName, lastName].filter(Boolean).join(" ");

	if (fullName) {
		return fullName;
	}

	const userName = user.userName?.trim();
	if (userName) {
		return userName;
	}

	const emailPrefix = user.email.split("@")[0]?.trim();
	return emailPrefix || "Unknown User";
}

export function getUserInitials(user: User): string {
	const displayName = getUserDisplayName(user);
	const words = displayName.split(/[\s._-]+/).filter(Boolean);

	if (words.length === 0) {
		return "U";
	}

	if (words.length === 1) {
		return words[0].slice(0, 2).toUpperCase();
	}

	return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function getUserOrganizationName(user: User): string {
	return user.organization?.name ?? "Independent";
}

export function formatRelativeTime(value: DateInput): string {
	const date = toDate(value);
	if (!date) {
		return "No activity";
	}

	const diffMs = Date.now() - date.getTime();
	if (diffMs <= 0) {
		return "Just now";
	}

	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (diffMs < hour) {
		const minutes = Math.max(1, Math.floor(diffMs / minute));
		return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
	}

	if (diffMs < day) {
		const hours = Math.floor(diffMs / hour);
		return `${hours} hr${hours === 1 ? "" : "s"} ago`;
	}

	if (diffMs < 7 * day) {
		const days = Math.floor(diffMs / day);
		return `${days} day${days === 1 ? "" : "s"} ago`;
	}

	const weeks = Math.floor(diffMs / (7 * day));
	if (weeks < 5) {
		return `${weeks} wk${weeks === 1 ? "" : "s"} ago`;
	}

	const months = Math.floor(diffMs / (30 * day));
	return `${months} mo${months === 1 ? "" : "s"} ago`;
}

export function formatUserJoinedDate(value: DateInput): string {
	const date = toDate(value);
	if (!date) {
		return "N/A";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

export function getUserStatusCounts(users: User[]): Record<UserStatusFilter, number> {
	const counts: Record<UserStatusFilter, number> = {
		all: users.length,
		active: 0,
		inactive: 0,
		suspended: 0,
		archived: 0,
	};

	for (const user of users) {
		counts[user.status] += 1;
	}

	return counts;
}
