import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type {
	CreateTemplateProject,
	GetAllTemplateProjects,
	TemplateProject,
	UpdateTemplateProject,
} from "~/zod/templateProject.zod";

const { TEMPLATE_PROJECT } = API_ENDPOINTS;

class TemplateProjectService extends APIService {
	getAllTemplateProjects = async () => {
		try {
			const response: ApiResponse<GetAllTemplateProjects> = await apiClient.get(
				`${TEMPLATE_PROJECT.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getTemplateProjectById = async ({ templateProjectId }: { templateProjectId: string }) => {
		try {
			const response: ApiResponse<TemplateProject> = await apiClient.get(
				`${TEMPLATE_PROJECT.GET_BY_ID.replace(":id", templateProjectId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createTemplateProject = async (data: CreateTemplateProject | FormData) => {
		try {
			let response: ApiResponse<TemplateProject>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(TEMPLATE_PROJECT.CREATE, data);
			} else {
				response = await apiClient.post(TEMPLATE_PROJECT.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateTemplateProject = async ({
		templateProjectId,
		data,
	}: {
		templateProjectId: string;
		data: UpdateTemplateProject | FormData;
	}) => {
		try {
			let response: ApiResponse<{ templateProject: TemplateProject }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(
					TEMPLATE_PROJECT.UPDATE.replace(":id", templateProjectId),
					data,
				);
			} else {
				response = await apiClient.patch(
					TEMPLATE_PROJECT.UPDATE.replace(":id", templateProjectId),
					data,
				);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteTemplateProject = async ({ templateProjectId }: { templateProjectId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				TEMPLATE_PROJECT.DELETE.replace(":id", templateProjectId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new TemplateProjectService();
