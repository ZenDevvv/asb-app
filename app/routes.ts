import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

const authRoutes: RouteConfig = [
	route("/login", "routes/auth/login.tsx"),
	route("/register", "routes/auth/register.tsx"),
];

// Main routes
export default [
	index("routes/landing.tsx"),
	layout("layouts/auth-layout.tsx", authRoutes),
	layout(
		"layouts/admin-layout.tsx",
		prefix("superadmin", [
			route("/", "routes/superadmin/dashboard.tsx"),
			route("/organizations", "routes/superadmin/organizations.tsx"),
			route("/organizations/:id", "routes/superadmin/organization-details.tsx"),
			route("/user-management", "routes/superadmin/user-management.tsx"),
			route("/announcements", "routes/superadmin/announcements.tsx"),
			route("/platform-analytics", "routes/superadmin/platform-analytics.tsx"),
			route("/activity-logs", "routes/superadmin/activity-logs.tsx"),
			route("/audit-logs", "routes/superadmin/audit-logs.tsx"),
			route("/feature-flags", "routes/superadmin/feature-flags.tsx"),
			route("/email-templates", "routes/superadmin/email-templates.tsx"),
			route("/maintenance", "routes/superadmin/maintenance.tsx"),
			route("/settings", "routes/superadmin/settings.tsx"),
		]),
	),
	layout(
		"layouts/org-admin-layout.tsx",
		prefix("admin", [
			route("/", "routes/org-admin/dashboard.tsx"),
			route("/courses", "routes/org-admin/courses.tsx"),
		]),
	),
] satisfies RouteConfig;
