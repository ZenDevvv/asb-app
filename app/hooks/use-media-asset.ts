import { useMutation, useQuery } from "@tanstack/react-query";
import mediaAssetService from "~/services/media-asset-service";
import type { ApiQueryParams } from "~/services/api-service";
import type { CreateMediaAsset, UpdateMediaAsset } from "~/zod/mediaAsset.zod";
import { queryClient } from "~/lib/query-client";

export const useGetMediaAssets = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["media-assets", apiParams],
		queryFn: () => {
			return mediaAssetService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllMediaAssets();
		},
	});
};

export const useGetMediaAssetById = (mediaAssetId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["media-asset-by-id", mediaAssetId, apiParams],
		queryFn: () => {
			return mediaAssetService
				.select(apiParams?.fields || "")
				.getMediaAssetById({ mediaAssetId });
		},
		enabled: !!mediaAssetId,
	});
};

export const useCreateMediaAsset = () => {
	return useMutation({
		mutationFn: (data: CreateMediaAsset | FormData) => {
			return mediaAssetService.createMediaAsset(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["media-assets"] });
		},
	});
};

export const useUpdateMediaAsset = () => {
	return useMutation({
		mutationFn: ({
			mediaAssetId,
			data,
		}: {
			mediaAssetId: string;
			data: UpdateMediaAsset | FormData;
		}) => {
			return mediaAssetService.updateMediaAsset({ mediaAssetId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["media-assets"] });
		},
	});
};

export const useDeleteMediaAsset = () => {
	return useMutation({
		mutationFn: ({ mediaAssetId }: { mediaAssetId: string }) => {
			return mediaAssetService.deleteMediaAsset({ mediaAssetId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["media-assets"] });
		},
	});
};
