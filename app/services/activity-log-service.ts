import { type z } from "zod";
import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { Pagination } from "~/zod/common.zod";
import {
	ActivityLogSchema,
	CreateActivityLogSchema,
	UpdateActivityLogSchema,
} from "~/zod/activityLog.zod";

type ActivityLog = z.infer<typeof ActivityLogSchema>;
type CreateActivityLog = z.infer<typeof CreateActivityLogSchema>;
type UpdateActivityLog = z.infer<typeof UpdateActivityLogSchema>;

type GetAllActivityLogs = {
	activityLogs?: ActivityLog[];
	pagination?: Pagination;
	count?: number;
	[key: string]: unknown;
};

const { ACTIVITY_LOG } = API_ENDPOINTS;

class ActivityLogService extends APIService {
	getAllActivityLogs = async () => {
		try {
			const response: ApiResponse<GetAllActivityLogs> = await apiClient.get(
				`${ACTIVITY_LOG.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getActivityLogById = async ({ activityLogId }: { activityLogId: string }) => {
		try {
			const response: ApiResponse<ActivityLog> = await apiClient.get(
				`${ACTIVITY_LOG.GET_BY_ID.replace(":id", activityLogId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createActivityLog = async (data: CreateActivityLog | FormData) => {
		try {
			let response: ApiResponse<ActivityLog>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(ACTIVITY_LOG.CREATE, data);
			} else {
				response = await apiClient.post(ACTIVITY_LOG.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateActivityLog = async ({
		activityLogId,
		data,
	}: {
		activityLogId: string;
		data: UpdateActivityLog | FormData;
	}) => {
		try {
			let response: ApiResponse<{ activityLog: ActivityLog }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(
					ACTIVITY_LOG.UPDATE.replace(":id", activityLogId),
					data,
				);
			} else {
				response = await apiClient.patch(ACTIVITY_LOG.UPDATE.replace(":id", activityLogId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteActivityLog = async ({ activityLogId }: { activityLogId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				ACTIVITY_LOG.DELETE.replace(":id", activityLogId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new ActivityLogService();
