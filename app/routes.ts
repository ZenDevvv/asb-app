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
			route("projects", "routes/user/projects.tsx"),
			route("templates", "routes/user/templates.tsx"),
			route("templates/:templateId", "routes/user/template-details.tsx"),
			route("cms/templates", "routes/user/cms-templates.tsx"),
			route("cms/templates/:templateId", "routes/user/cms-template-details.tsx"),
			route("settings", "routes/user/settings.tsx"),
		]),
	),
	layout(
		"layouts/admin-layout.tsx",
		prefix("admin", [
			route("/", "routes/admin/dashboard.tsx"),
			route("templates", "routes/admin/templates.tsx"),
			route("users", "routes/admin/users.tsx"),
			route("cms", "routes/admin/cms.tsx"),
		]),
	),
	route("/admin/cms/editor/:templateId", "routes/admin/cms-editor.tsx"),
	route("/admin/cms/view/:templateId", "routes/admin/cms-view.tsx"),
	route("/cms", "routes/cms.tsx"),
	route("/admin/display", "routes/admin/display.tsx"),
	route("/project/:slug", "routes/project/editor.tsx"),
	route("/project/cms/:slug", "routes/project/cms-editor.tsx"),
	route("/project/cms/view/:slug", "routes/project/cms-view.tsx"),
	route("/editor/:templateId", "routes/editor/template.tsx"),
	route("/editor", "routes/editor/index.tsx"),
	route("/editor/preview", "routes/editor/preview.tsx"),
	route("/rsvp/:slug", "routes/rsvp.$slug.tsx"),
	route("/view/:templateId", "routes/view/template.tsx"),
] satisfies RouteConfig;
