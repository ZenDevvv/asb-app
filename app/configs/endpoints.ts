export const API_ENDPOINTS = {
	BASE_URL: import.meta.env.VITE_BASE_URL || "http://localhost:3000/api",

	// Auth API endpoints
	AUTH: {
		LOGIN: "/auth/login",
		LOGOUT: "/auth/logout",
		REGISTER: "/auth/register",
	},

	// User API endpoints
	USER: {
		GET_ALL: "/user",
		GET_BY_ID: "/user/:id",
		GET_CURRENT: "/user/current",
		CREATE: "/user",
		UPDATE: "/user/:id",
		DELETE: "/user/:id", // Soft delete
	},

	// Person API endpoints
	PERSON: {
		GET_ALL: "/person",
		GET_BY_ID: "/person/:id",
		CREATE: "/person",
		UPDATE: "/person/:id",
		DELETE: "/person/:id", // Soft delete
	},

	ORGANIZATION: {
		GET_ALL: "/organization",
		GET_BY_ID: "/organization/:id",
		CREATE: "/organization",
		UPDATE: "/organization/:id",
		DELETE: "/organization/:id", // Soft delete
	},

	ACTIVITY_LOG: {
		GET_ALL: "/activityLog",
		GET_BY_ID: "/activityLog/:id",
		CREATE: "/activityLog",
		UPDATE: "/activityLog/:id",
		DELETE: "/activityLog/:id",
	},

	AUDIT_LOG: {
		GET_ALL: "/auditLog",
		GET_BY_ID: "/auditLog/:id",
		CREATE: "/auditLog",
		UPDATE: "/auditLog/:id",
		DELETE: "/auditLog/:id",
	},

	MEDIA_ASSET: {
		GET_ALL: "/mediaAsset",
		GET_BY_ID: "/mediaAsset/:id",
		CREATE: "/mediaAsset",
		UPDATE: "/mediaAsset/:id",
		DELETE: "/mediaAsset/:id",
	},

	METRICS: {
		GET_ALL: "/metrics",
		GET_BY_ID: "/metrics/:id",
		CREATE: "/metrics",
		UPDATE: "/metrics/:id",
		DELETE: "/metrics/:id",
		COLLECT: "/metrics/collect",
	},

	NOTIFICATION: {
		GET_ALL: "/notification",
		GET_BY_ID: "/notification/:id",
		CREATE: "/notification",
		UPDATE: "/notification/:id",
		DELETE: "/notification/:id",
	},

	PROJECT: {
		GET_ALL: "/project",
		GET_BY_ID: "/project/:id",
		CREATE: "/project",
		UPDATE: "/project/:id",
		DELETE: "/project/:id",
	},

	SYSTEM_LOG: {
		GET_ALL: "/systemLog",
		GET_BY_ID: "/systemLog/:id",
		CREATE: "/systemLog",
		UPDATE: "/systemLog/:id",
		DELETE: "/systemLog/:id",
	},

	TEMPLATE_PROJECT: {
		GET_ALL: "/templateProject",
		GET_BY_ID: "/templateProject/:id",
		CREATE: "/templateProject",
		UPDATE: "/templateProject/:id",
		DELETE: "/templateProject/:id",
	},

	COURSE: {
		GET_ALL: "/course",
		GET_BY_ID: "/course/:id",
		CREATE: "/course",
		UPDATE: "/course/:id",
		DELETE: "/course/:id", // Soft delete
	},
};
