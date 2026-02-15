// API Client with fetch and credentials included
export interface ApiResponse<T = any> {
	data: T;
	message?: string;
	status: number;
}

export interface ApiError {
	message: string;
	status: number;
	data?: any;
}

export interface RequestConfig {
	headers?: Record<string, string>;
	withCredentials?: boolean;
	timeout?: number;
}

class ApiClient {
	private baseURL: string;
	private defaultHeaders: Record<string, string>;

	constructor(baseURL: string = "") {
		this.baseURL = baseURL;
		this.defaultHeaders = {
			"Content-Type": "application/json",
		};
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit & RequestConfig = {},
	): Promise<ApiResponse<T>> {
		const { withCredentials = true, timeout = 10000, headers = {}, ...fetchOptions } = options;

		const url = `${this.baseURL}${endpoint}`;

		// Don't add default headers if body is FormData
		const isFormData = fetchOptions.body instanceof FormData;
		const requestHeaders = isFormData ? headers : { ...this.defaultHeaders, ...headers };

		const config: RequestInit = {
			...fetchOptions,
			headers: requestHeaders,
			credentials: withCredentials ? "include" : "omit",
		};

		// No need for authorization header since we're using httpOnly cookies

		try {
			// const controller = new AbortController();
			// const timeoutId = setTimeout(() => controller.abort(), timeout);

			const response = await fetch(url, {
				...config,
				// signal: controller.signal,
			});

			// clearTimeout(timeoutId);

			let data;
			const contentType = response.headers.get("content-type");

			if (contentType && contentType.includes("application/json")) {
				data = await response.json();
			} else {
				data = await response.text();
			}

			if (!response.ok) {
				throw {
					message: data?.message || `HTTP error! status: ${response.status}`,
					status: response.status,
					data,
				} as ApiError;
			}

			// Extract data from the response wrapper if it exists
			// Your API returns { status, message, data }, we want just the data
			const responseData = data?.data !== undefined ? data.data : data;

			return {
				data: responseData,
				status: response.status,
				message: data?.message,
			};
		} catch (error: any) {
			// if (error.name === "AbortError") {
			// 	throw {
			// 		message: "Request timeout",
			// 		status: 408,
			// 	} as ApiError;
			// }

			if (error.status) {
				throw error as ApiError;
			}

			throw {
				message: error.message || "Network error",
				status: 0,
			} as ApiError;
		}
	}

	// Authentication is handled via httpOnly cookies with credentials: 'include'

	public async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { method: "GET", ...config });
	}

	public async post<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
			...config,
		});
	}

	public async postFormData<T>(
		endpoint: string,
		data?: FormData,
		config?: RequestConfig,
	): Promise<ApiResponse<T>> {
		const { headers = {}, ...restConfig } = config || {};
		// Don't set Content-Type header for FormData - let browser set it with boundary
		const formDataHeaders = { ...headers };
		delete formDataHeaders["Content-Type"];

		return this.request<T>(endpoint, {
			method: "POST",
			body: data,
			headers: formDataHeaders,
			...restConfig,
		});
	}

	public async patchFormData<T>(
		endpoint: string,
		data?: FormData,
		config?: RequestConfig,
	): Promise<ApiResponse<T>> {
		const { headers = {}, ...restConfig } = config || {};
		// Don't set Content-Type header for FormData - let browser set it with boundary
		const formDataHeaders = { ...headers };
		delete formDataHeaders["Content-Type"];

		return this.request<T>(endpoint, {
			method: "PATCH",
			body: data,
			headers: formDataHeaders,
			...restConfig,
		});
	}

	public async patch<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
			...config,
		});
	}

	public async put<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
			...config,
		});
	}

	public async delete<T>(
		endpoint: string,
		config?: RequestConfig & { data?: any },
	): Promise<ApiResponse<T>> {
		const { data, ...restConfig } = config || {};
		return this.request<T>(endpoint, {
			method: "DELETE",
			body: data ? JSON.stringify(data) : undefined,
			...restConfig,
		});
	}
}

// Create and export the API client instance
const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";
export const apiClient = new ApiClient(baseURL);

// Export the class for potential custom instances
export { ApiClient };
