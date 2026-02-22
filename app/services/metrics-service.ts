import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { Pagination } from "~/zod/common.zod";
import type {
	CollectMetrics,
	CreateTemplate as CreateMetrics,
	Metrics,
	UpdateTemplate as UpdateMetrics,
} from "~/zod/metrics.zod";

type GetAllMetrics = {
	metrics?: Metrics[];
	metricss?: Metrics[];
	pagination?: Pagination;
	count?: number;
	[key: string]: unknown;
};

const { METRICS } = API_ENDPOINTS;

class MetricsService extends APIService {
	getAllMetrics = async () => {
		try {
			const response: ApiResponse<GetAllMetrics> = await apiClient.get(
				`${METRICS.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getMetricsById = async ({ metricsId }: { metricsId: string }) => {
		try {
			const response: ApiResponse<Metrics> = await apiClient.get(
				`${METRICS.GET_BY_ID.replace(":id", metricsId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createMetrics = async (data: CreateMetrics | FormData) => {
		try {
			let response: ApiResponse<Metrics>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(METRICS.CREATE, data);
			} else {
				response = await apiClient.post(METRICS.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateMetrics = async ({
		metricsId,
		data,
	}: {
		metricsId: string;
		data: UpdateMetrics | FormData;
	}) => {
		try {
			let response: ApiResponse<{ metrics: Metrics }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(METRICS.UPDATE.replace(":id", metricsId), data);
			} else {
				response = await apiClient.patch(METRICS.UPDATE.replace(":id", metricsId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteMetrics = async ({ metricsId }: { metricsId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				METRICS.DELETE.replace(":id", metricsId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	collectMetrics = async (data: CollectMetrics) => {
		try {
			const response: ApiResponse<Record<string, unknown>> = await apiClient.post(
				METRICS.COLLECT,
				data,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new MetricsService();
