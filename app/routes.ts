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
		"layouts/user-layout.tsx",
		prefix("user", [
			route("dashboard", "routes/user/dashboard.tsx"),
		]),
	),
	layout(
		"layouts/admin-layout.tsx",
		prefix("admin", [
			route("/", "routes/admin/dashboard.tsx"),
			route("templates", "routes/admin/templates.tsx"),
			route("users", "routes/admin/users.tsx"),
		]),
	),
	route("/editor/:templateId", "routes/editor/template.tsx"),
	route("/editor", "routes/editor/index.tsx"),
	route("/editor/preview", "routes/editor/preview.tsx"),
	route("/view/:templateId", "routes/view/template.tsx"),
] satisfies RouteConfig;
