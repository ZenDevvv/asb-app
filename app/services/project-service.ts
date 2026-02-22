import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { CreateProject, GetAllProjects, Project, UpdateProject } from "~/zod/project.zod";

const { PROJECT } = API_ENDPOINTS;

class ProjectService extends APIService {
	getAllProjects = async () => {
		try {
			const response: ApiResponse<GetAllProjects> = await apiClient.get(
				`${PROJECT.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getProjectById = async ({ projectId }: { projectId: string }) => {
		try {
			const response: ApiResponse<Project> = await apiClient.get(
				`${PROJECT.GET_BY_ID.replace(":id", projectId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createProject = async (data: CreateProject | FormData) => {
		try {
			let response: ApiResponse<Project>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(PROJECT.CREATE, data);
			} else {
				response = await apiClient.post(PROJECT.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateProject = async ({
		projectId,
		data,
	}: {
		projectId: string;
		data: UpdateProject | FormData;
	}) => {
		try {
			let response: ApiResponse<{ project: Project }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(PROJECT.UPDATE.replace(":id", projectId), data);
			} else {
				response = await apiClient.patch(PROJECT.UPDATE.replace(":id", projectId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteProject = async ({ projectId }: { projectId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				PROJECT.DELETE.replace(":id", projectId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new ProjectService();
