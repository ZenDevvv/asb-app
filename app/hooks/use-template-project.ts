import { useMutation, useQuery } from "@tanstack/react-query";
import templateProjectService from "~/services/template-project-service";
import type { ApiQueryParams } from "~/services/api-service";
import type { CreateTemplateProject, UpdateTemplateProject } from "~/zod/templateProject.zod";
import { queryClient } from "~/lib/query-client";

export const useGetTemplateProjects = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["template-projects", apiParams],
		queryFn: () => {
			return templateProjectService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllTemplateProjects();
		},
	});
};

export const useGetTemplateProjectById = (
	templateProjectId: string,
	apiParams?: ApiQueryParams,
) => {
	return useQuery({
		queryKey: ["template-project-by-id", templateProjectId, apiParams],
		queryFn: () => {
			const service = templateProjectService.select(apiParams?.fields || "");
			if (apiParams?.isPublic) service.publicAccess();
			return service.getTemplateProjectById({ templateProjectId });
		},
		enabled: !!templateProjectId,
	});
};

export const useCreateTemplateProject = () => {
	return useMutation({
		mutationFn: (data: CreateTemplateProject | FormData) => {
			return templateProjectService.createTemplateProject(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["template-projects"] });
		},
	});
};

export const useUpdateTemplateProject = () => {
	return useMutation({
		mutationFn: ({
			templateProjectId,
			data,
		}: {
			templateProjectId: string;
			data: UpdateTemplateProject | FormData;
		}) => {
			return templateProjectService.updateTemplateProject({ templateProjectId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["template-projects"] });
		},
	});
};

export const useDeleteTemplateProject = () => {
	return useMutation({
		mutationFn: ({ templateProjectId }: { templateProjectId: string }) => {
			return templateProjectService.deleteTemplateProject({ templateProjectId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["template-projects"] });
		},
	});
};
