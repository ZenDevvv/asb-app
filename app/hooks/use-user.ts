import { useMutation, useQuery } from "@tanstack/react-query";
import userService from "~/services/user-service";
import type { ApiQueryParams } from "~/services/api-service";
import type { CreateUser, UpdateUser } from "~/zod/user.zod";
import { queryClient } from "~/lib/query-client";

// GET ALL
export const useGetUsers = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["users", apiParams],
		queryFn: () => {
			return userService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllUsers();
		},
	});
};

// GET BY ID
export const useGetUserById = (userId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["user-by-id", userId, apiParams],
		queryFn: () => {
			return userService.select(apiParams?.fields || "").getUserById(userId);
		},
		enabled: !!userId,
	});
};

// GET CURRENT USER
export const useGetCurrentUser = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["current-user", apiParams],
		queryFn: () => {
			return userService.select(apiParams?.fields || "").getCurrentUser();
		},
	});
};

// CREATE
export const useCreateUser = () => {
	return useMutation({
		mutationFn: (data: CreateUser | FormData) => {
			return userService.createUser(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["organization-by-id"] });
		},
	});
};

// UPDATE
export const useUpdateUser = () => {
	return useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: UpdateUser | FormData }) => {
			return userService.updateUser(userId, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["current-user"] });
		},
	});
};

// DELETE
export const useDeleteUser = () => {
	return useMutation({
		mutationFn: (userId: string) => {
			return userService.deleteUser(userId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
};
