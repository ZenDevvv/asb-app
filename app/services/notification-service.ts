import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { Pagination } from "~/zod/common.zod";
import type {
	CreateNotification,
	Notification,
	UpdateNotification,
} from "~/zod/notification.zod";

type GetAllNotifications = {
	notifications?: Notification[];
	pagination?: Pagination;
	count?: number;
	[key: string]: unknown;
};

const { NOTIFICATION } = API_ENDPOINTS;

class NotificationService extends APIService {
	getAllNotifications = async () => {
		try {
			const response: ApiResponse<GetAllNotifications> = await apiClient.get(
				`${NOTIFICATION.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getNotificationById = async ({ notificationId }: { notificationId: string }) => {
		try {
			const response: ApiResponse<Notification> = await apiClient.get(
				`${NOTIFICATION.GET_BY_ID.replace(":id", notificationId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createNotification = async (data: CreateNotification | FormData) => {
		try {
			let response: ApiResponse<Notification>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(NOTIFICATION.CREATE, data);
			} else {
				response = await apiClient.post(NOTIFICATION.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateNotification = async ({
		notificationId,
		data,
	}: {
		notificationId: string;
		data: UpdateNotification | FormData;
	}) => {
		try {
			let response: ApiResponse<{ notification: Notification }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(
					NOTIFICATION.UPDATE.replace(":id", notificationId),
					data,
				);
			} else {
				response = await apiClient.patch(NOTIFICATION.UPDATE.replace(":id", notificationId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteNotification = async ({ notificationId }: { notificationId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				NOTIFICATION.DELETE.replace(":id", notificationId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new NotificationService();
