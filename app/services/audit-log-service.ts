import { type z } from "zod";
import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { Pagination } from "~/zod/common.zod";
import { AuditLogSchema, CreateAuditLogSchema, UpdateAuditLogSchema } from "~/zod/auditLog.zod";

type AuditLog = z.infer<typeof AuditLogSchema>;
type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;
type UpdateAuditLog = z.infer<typeof UpdateAuditLogSchema>;

type GetAllAuditLogs = {
	auditLogs?: AuditLog[];
	pagination?: Pagination;
	count?: number;
	[key: string]: unknown;
};

const { AUDIT_LOG } = API_ENDPOINTS;

class AuditLogService extends APIService {
	getAllAuditLogs = async () => {
		try {
			const response: ApiResponse<GetAllAuditLogs> = await apiClient.get(
				`${AUDIT_LOG.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getAuditLogById = async ({ auditLogId }: { auditLogId: string }) => {
		try {
			const response: ApiResponse<AuditLog> = await apiClient.get(
				`${AUDIT_LOG.GET_BY_ID.replace(":id", auditLogId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createAuditLog = async (data: CreateAuditLog | FormData) => {
		try {
			let response: ApiResponse<AuditLog>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(AUDIT_LOG.CREATE, data);
			} else {
				response = await apiClient.post(AUDIT_LOG.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateAuditLog = async ({
		auditLogId,
		data,
	}: {
		auditLogId: string;
		data: UpdateAuditLog | FormData;
	}) => {
		try {
			let response: ApiResponse<{ auditLog: AuditLog }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(AUDIT_LOG.UPDATE.replace(":id", auditLogId), data);
			} else {
				response = await apiClient.patch(AUDIT_LOG.UPDATE.replace(":id", auditLogId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteAuditLog = async ({ auditLogId }: { auditLogId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				AUDIT_LOG.DELETE.replace(":id", auditLogId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new AuditLogService();
