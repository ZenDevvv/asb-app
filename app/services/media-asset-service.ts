import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type {
	CreateMediaAsset,
	GetAllMediaAssets,
	MediaAsset,
	UpdateMediaAsset,
} from "~/zod/mediaAsset.zod";

const { MEDIA_ASSET } = API_ENDPOINTS;

class MediaAssetService extends APIService {
	getAllMediaAssets = async () => {
		try {
			const response: ApiResponse<GetAllMediaAssets> = await apiClient.get(
				`${MEDIA_ASSET.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getMediaAssetById = async ({ mediaAssetId }: { mediaAssetId: string }) => {
		try {
			const response: ApiResponse<MediaAsset> = await apiClient.get(
				`${MEDIA_ASSET.GET_BY_ID.replace(":id", mediaAssetId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createMediaAsset = async (data: CreateMediaAsset | FormData) => {
		try {
			let response: ApiResponse<MediaAsset>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(MEDIA_ASSET.CREATE, data);
			} else {
				response = await apiClient.post(MEDIA_ASSET.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updateMediaAsset = async ({
		mediaAssetId,
		data,
	}: {
		mediaAssetId: string;
		data: UpdateMediaAsset | FormData;
	}) => {
		try {
			let response: ApiResponse<{ mediaAsset: MediaAsset }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(
					MEDIA_ASSET.UPDATE.replace(":id", mediaAssetId),
					data,
				);
			} else {
				response = await apiClient.patch(MEDIA_ASSET.UPDATE.replace(":id", mediaAssetId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	deleteMediaAsset = async ({ mediaAssetId }: { mediaAssetId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.delete(
				MEDIA_ASSET.DELETE.replace(":id", mediaAssetId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new MediaAssetService();
