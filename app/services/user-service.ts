import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { CreateUser, GetAllUsers, UpdateUser, User } from "~/zod/user.zod";

const { USER } = API_ENDPOINTS;

class UserService extends APIService {
	getAllUsers = async () => {
		try {
			const response: ApiResponse<GetAllUsers> = await apiClient.get(
				`${USER.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getUserById = async (userId: string) => {
		try {
			const response: ApiResponse<User> = await apiClient.get(
				`${USER.GET_BY_ID.replace(":id", userId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getCurrentUser = async () => {
		try {
			const response: ApiResponse<{ user: User }> = await apiClient.get(USER.GET_CURRENT);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createUser = async (data: CreateUser | FormData) => {
		try {
			let response: ApiResponse<User>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(USER.CREATE, data);
			} else {
				response = await apiClient.post(USER.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateUser = async (userId: string, data: UpdateUser | FormData) => {
		try {
			let response: ApiResponse<{ user: User }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(USER.UPDATE.replace(":id", userId), data);
			} else {
				response = await apiClient.patch(USER.UPDATE.replace(":id", userId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteUser = async (userId: string) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				USER.DELETE.replace(":id", userId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new UserService();
