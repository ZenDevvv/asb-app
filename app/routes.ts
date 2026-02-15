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
		prefix("admin", [
			route("/", "routes/admin/dashboard.tsx"),
		]),
	),
] satisfies RouteConfig;
