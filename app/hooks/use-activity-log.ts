import { useMutation, useQuery } from "@tanstack/react-query";
import { type z } from "zod";
import activityLogService from "~/services/activity-log-service";
import type { ApiQueryParams } from "~/services/api-service";
import { queryClient } from "~/lib/query-client";
import { CreateActivityLogSchema, UpdateActivityLogSchema } from "~/zod/activityLog.zod";

type CreateActivityLog = z.infer<typeof CreateActivityLogSchema>;
type UpdateActivityLog = z.infer<typeof UpdateActivityLogSchema>;

export const useGetActivityLogs = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["activity-logs", apiParams],
		queryFn: () => {
			return activityLogService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllActivityLogs();
		},
	});
};

export const useGetActivityLogById = (activityLogId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["activity-log-by-id", activityLogId, apiParams],
		queryFn: () => {
			return activityLogService
				.select(apiParams?.fields || "")
				.getActivityLogById({ activityLogId });
		},
		enabled: !!activityLogId,
	});
};

export const useCreateActivityLog = () => {
	return useMutation({
		mutationFn: (data: CreateActivityLog | FormData) => {
			return activityLogService.createActivityLog(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
		},
	});
};

export const useUpdateActivityLog = () => {
	return useMutation({
		mutationFn: ({
			activityLogId,
			data,
		}: {
			activityLogId: string;
			data: UpdateActivityLog | FormData;
		}) => {
			return activityLogService.updateActivityLog({ activityLogId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
		},
	});
};

export const useDeleteActivityLog = () => {
	return useMutation({
		mutationFn: ({ activityLogId }: { activityLogId: string }) => {
			return activityLogService.deleteActivityLog({ activityLogId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
		},
	});
};
