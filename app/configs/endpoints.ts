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

	COURSE: {
		GET_ALL: "/course",
		GET_BY_ID: "/course/:id",
		CREATE: "/course",
		UPDATE: "/course/:id",
		DELETE: "/course/:id", // Soft delete
	},
};
