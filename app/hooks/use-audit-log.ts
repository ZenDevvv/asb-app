import { useMutation, useQuery } from "@tanstack/react-query";
import { type z } from "zod";
import auditLogService from "~/services/audit-log-service";
import type { ApiQueryParams } from "~/services/api-service";
import { queryClient } from "~/lib/query-client";
import { CreateAuditLogSchema, UpdateAuditLogSchema } from "~/zod/auditLog.zod";

type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;
type UpdateAuditLog = z.infer<typeof UpdateAuditLogSchema>;

export const useGetAuditLogs = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["audit-logs", apiParams],
		queryFn: () => {
			return auditLogService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllAuditLogs();
		},
	});
};

export const useGetAuditLogById = (auditLogId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["audit-log-by-id", auditLogId, apiParams],
		queryFn: () => {
			return auditLogService.select(apiParams?.fields || "").getAuditLogById({ auditLogId });
		},
		enabled: !!auditLogId,
	});
};

export const useCreateAuditLog = () => {
	return useMutation({
		mutationFn: (data: CreateAuditLog | FormData) => {
			return auditLogService.createAuditLog(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
		},
	});
};

export const useUpdateAuditLog = () => {
	return useMutation({
		mutationFn: ({ auditLogId, data }: { auditLogId: string; data: UpdateAuditLog | FormData }) => {
			return auditLogService.updateAuditLog({ auditLogId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
		},
	});
};

export const useDeleteAuditLog = () => {
	return useMutation({
		mutationFn: ({ auditLogId }: { auditLogId: string }) => {
			return auditLogService.deleteAuditLog({ auditLogId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
		},
	});
};
