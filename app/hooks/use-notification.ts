import { useMutation, useQuery } from "@tanstack/react-query";
import notificationService from "~/services/notification-service";
import type { ApiQueryParams } from "~/services/api-service";
import type { CreateNotification, UpdateNotification } from "~/zod/notification.zod";
import { queryClient } from "~/lib/query-client";

export const useGetNotifications = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["notifications", apiParams],
		queryFn: () => {
			return notificationService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllNotifications();
		},
	});
};

export const useGetNotificationById = (notificationId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["notification-by-id", notificationId, apiParams],
		queryFn: () => {
			return notificationService
				.select(apiParams?.fields || "")
				.getNotificationById({ notificationId });
		},
		enabled: !!notificationId,
	});
};

export const useCreateNotification = () => {
	return useMutation({
		mutationFn: (data: CreateNotification | FormData) => {
			return notificationService.createNotification(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
};

export const useUpdateNotification = () => {
	return useMutation({
		mutationFn: ({
			notificationId,
			data,
		}: {
			notificationId: string;
			data: UpdateNotification | FormData;
		}) => {
			return notificationService.updateNotification({ notificationId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
};

export const useDeleteNotification = () => {
	return useMutation({
		mutationFn: ({ notificationId }: { notificationId: string }) => {
			return notificationService.deleteNotification({ notificationId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
};
