import { useMutation, useQuery } from "@tanstack/react-query";
import metricsService from "~/services/metrics-service";
import type { ApiQueryParams } from "~/services/api-service";
import type {
	CollectMetrics,
	CreateTemplate as CreateMetrics,
	UpdateTemplate as UpdateMetrics,
} from "~/zod/metrics.zod";
import { queryClient } from "~/lib/query-client";

export const useGetMetrics = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["metrics", apiParams],
		queryFn: () => {
			return metricsService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllMetrics();
		},
	});
};

export const useGetMetricsById = (metricsId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["metrics-by-id", metricsId, apiParams],
		queryFn: () => {
			return metricsService.select(apiParams?.fields || "").getMetricsById({ metricsId });
		},
		enabled: !!metricsId,
	});
};

export const useCreateMetrics = () => {
	return useMutation({
		mutationFn: (data: CreateMetrics | FormData) => {
			return metricsService.createMetrics(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["metrics"] });
		},
	});
};

export const useUpdateMetrics = () => {
	return useMutation({
		mutationFn: ({ metricsId, data }: { metricsId: string; data: UpdateMetrics | FormData }) => {
			return metricsService.updateMetrics({ metricsId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["metrics"] });
		},
	});
};

export const useDeleteMetrics = () => {
	return useMutation({
		mutationFn: ({ metricsId }: { metricsId: string }) => {
			return metricsService.deleteMetrics({ metricsId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["metrics"] });
		},
	});
};

export const useCollectMetrics = () => {
	return useMutation({
		mutationFn: (data: CollectMetrics) => {
			return metricsService.collectMetrics(data);
		},
	});
};
