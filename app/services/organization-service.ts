import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type {
	CreateOrganization,
	GetAllOrganizations,
	OrganizationWithRelation,
	UpdateOrganization,
} from "~/zod/organization.zod";

const { ORGANIZATION } = API_ENDPOINTS;

class OrganizationService extends APIService {
	getAllOrganizations = async () => {
		try {
			const response: ApiResponse<GetAllOrganizations> = await apiClient.get(
				`${ORGANIZATION.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getOrganizationById = async ({ organizationId }: { organizationId: string }) => {
		try {
			const response: ApiResponse<OrganizationWithRelation> = await apiClient.get(
				`${ORGANIZATION.GET_BY_ID.replace(":id", organizationId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createOrganization = async (data: CreateOrganization | FormData) => {
		try {
			let response: ApiResponse<OrganizationWithRelation>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(ORGANIZATION.CREATE, data);
			} else {
				response = await apiClient.post(ORGANIZATION.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateOrganization = async ({
		organizationId,
		data,
	}: {
		organizationId: string;
		data: UpdateOrganization | FormData;
	}) => {
		try {
			let response: ApiResponse<{ organization: OrganizationWithRelation }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(
					ORGANIZATION.UPDATE.replace(":id", organizationId),
					data,
				);
			} else {
				response = await apiClient.patch(
					ORGANIZATION.UPDATE.replace(":id", organizationId),
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

	deleteOrganization = async ({ organizationId }: { organizationId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				ORGANIZATION.DELETE.replace(":id", organizationId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new OrganizationService();
