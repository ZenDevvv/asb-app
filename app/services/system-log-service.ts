import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { Pagination } from "~/zod/common.zod";
import type { CreateSystemLog, SystemLog, UpdateSystemLog } from "~/zod/systemLog.zod";

type GetAllSystemLogs = {
	systemLogs?: SystemLog[];
	pagination?: Pagination;
	count?: number;
	[key: string]: unknown;
};

const { SYSTEM_LOG } = API_ENDPOINTS;

class SystemLogService extends APIService {
	getAllSystemLogs = async () => {
		try {
			const response: ApiResponse<GetAllSystemLogs> = await apiClient.get(
				`${SYSTEM_LOG.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getSystemLogById = async ({ systemLogId }: { systemLogId: string }) => {
		try {
			const response: ApiResponse<SystemLog> = await apiClient.get(
				`${SYSTEM_LOG.GET_BY_ID.replace(":id", systemLogId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createSystemLog = async (data: CreateSystemLog | FormData) => {
		try {
			let response: ApiResponse<SystemLog>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(SYSTEM_LOG.CREATE, data);
			} else {
				response = await apiClient.post(SYSTEM_LOG.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateSystemLog = async ({
		systemLogId,
		data,
	}: {
		systemLogId: string;
		data: UpdateSystemLog | FormData;
	}) => {
		try {
			let response: ApiResponse<{ systemLog: SystemLog }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(
					SYSTEM_LOG.UPDATE.replace(":id", systemLogId),
					data,
				);
			} else {
				response = await apiClient.patch(SYSTEM_LOG.UPDATE.replace(":id", systemLogId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteSystemLog = async ({ systemLogId }: { systemLogId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				SYSTEM_LOG.DELETE.replace(":id", systemLogId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new SystemLogService();
