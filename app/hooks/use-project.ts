import { useMutation, useQuery } from "@tanstack/react-query";
import projectService from "~/services/project-service";
import type { ApiQueryParams } from "~/services/api-service";
import type { CreateProject, UpdateProject } from "~/zod/project.zod";
import { queryClient } from "~/lib/query-client";

export const useGetProjects = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["projects", apiParams],
		queryFn: () => {
			return projectService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllProjects();
		},
	});
};

export const useGetProjectById = (projectId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["project-by-id", projectId, apiParams],
		queryFn: () => {
			return projectService.select(apiParams?.fields || "").getProjectById({ projectId });
		},
		enabled: !!projectId,
	});
};

export const useGetProjectBySlug = (slug: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["project-by-slug", slug, apiParams],
		queryFn: async () => {
			const result = await projectService
				.select(apiParams?.fields || "")
				.filter(`slug:${slug}`)
				.paginate(1, 1)
				.getAllProjects();
			return result?.projects?.[0] ?? null;
		},
		enabled: !!slug,
	});
};

export const useCreateProject = () => {
	return useMutation({
		mutationFn: (data: CreateProject | FormData) => {
			return projectService.createProject(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
};

export const useUpdateProject = () => {
	return useMutation({
		mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProject | FormData }) => {
			return projectService.updateProject({ projectId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({ queryKey: ["project-by-slug"] });
			queryClient.invalidateQueries({ queryKey: ["project-by-id"] });
		},
	});
};

export const useDeleteProject = () => {
	return useMutation({
		mutationFn: ({ projectId }: { projectId: string }) => {
			return projectService.deleteProject({ projectId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
};
