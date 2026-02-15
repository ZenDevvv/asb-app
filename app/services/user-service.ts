import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { loginResponse } from "~/types/auth";
import type { GetAllUsers } from "~/zod/user.zod";

const { USER } = API_ENDPOINTS;

class UserService extends APIService {
	getAllUsers = async () => {
		try {
			const response: ApiResponse<GetAllUsers> = await apiClient.get(
				`${USER.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching users:", error);
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "Error fetching users",
			);
		}
	};

	getUserById = async (userId: string) => {
		try {
			const response = await apiClient.get(
				`${USER.GET_BY_ID.replace(":id", userId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching user:", error);
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "Error fetching user data",
			);
		}
	};

	getCurrentUser = async () => {
		try {
			const response: ApiResponse<loginResponse> = await apiClient.get(USER.GET_CURRENT);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching current user:", error);
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "Error fetching current user",
			);
		}
	};

	createUser = async (data: object | FormData) => {
		try {
			let response;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(USER.CREATE, data);
			} else {
				response = await apiClient.post(USER.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			console.log(JSON.stringify(error));
			console.error("Error creating user:", error);
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "Error creating user",
			);
		}
	};

	updateUser = async (userId: string, data: object | FormData) => {
		try {
			let response;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(USER.UPDATE.replace(":id", userId), data);
			} else {
				response = await apiClient.patch(USER.UPDATE.replace(":id", userId), data);
			}
			return response.data;
		} catch (error: any) {
			console.error("Error updating user:", error);
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "Error updating user",
			);
		}
	};

	deleteUser = async (userId: string) => {
		try {
			const response = await apiClient.put(USER.DELETE.replace(":id", userId));
			return response.data;
		} catch (error: any) {
			console.error("Error deleting user:", error);
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "Error deleting user",
			);
		}
	};
}

export default new UserService();
