import { useMutation, useQuery } from "@tanstack/react-query";
import systemLogService from "~/services/system-log-service";
import type { ApiQueryParams } from "~/services/api-service";
import type { CreateSystemLog, UpdateSystemLog } from "~/zod/systemLog.zod";
import { queryClient } from "~/lib/query-client";

export const useGetSystemLogs = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["system-logs", apiParams],
		queryFn: () => {
			return systemLogService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllSystemLogs();
		},
	});
};

export const useGetSystemLogById = (systemLogId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["system-log-by-id", systemLogId, apiParams],
		queryFn: () => {
			return systemLogService.select(apiParams?.fields || "").getSystemLogById({ systemLogId });
		},
		enabled: !!systemLogId,
	});
};

export const useCreateSystemLog = () => {
	return useMutation({
		mutationFn: (data: CreateSystemLog | FormData) => {
			return systemLogService.createSystemLog(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["system-logs"] });
		},
	});
};

export const useUpdateSystemLog = () => {
	return useMutation({
		mutationFn: ({
			systemLogId,
			data,
		}: {
			systemLogId: string;
			data: UpdateSystemLog | FormData;
		}) => {
			return systemLogService.updateSystemLog({ systemLogId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["system-logs"] });
		},
	});
};

export const useDeleteSystemLog = () => {
	return useMutation({
		mutationFn: ({ systemLogId }: { systemLogId: string }) => {
			return systemLogService.deleteSystemLog({ systemLogId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["system-logs"] });
		},
	});
};
