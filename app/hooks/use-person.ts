import { useMutation, useQuery } from "@tanstack/react-query";
import personService from "~/services/person-service";
import type { ApiQueryParams } from "~/services/api-service";
import type { CreatePerson, UpdatePerson } from "~/zod/person.zod";
import { queryClient } from "~/lib/query-client";

export const useGetPersons = (apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["persons", apiParams],
		queryFn: () => {
			return personService
				.select(apiParams?.fields || "")
				.search(apiParams?.query || "")
				.paginate(apiParams?.page || 1, apiParams?.limit || 10)
				.sort(apiParams?.sort, apiParams?.order)
				.filter(apiParams?.filter || "")
				.count(apiParams?.count ?? false)
				.document(apiParams?.document ?? true)
				.pagination(apiParams?.pagination ?? true)
				.getAllPersons();
		},
	});
};

export const useGetPersonById = (personId: string, apiParams?: ApiQueryParams) => {
	return useQuery({
		queryKey: ["person-by-id", personId, apiParams],
		queryFn: () => {
			return personService.select(apiParams?.fields || "").getPersonById({ personId });
		},
		enabled: !!personId,
	});
};

export const useCreatePerson = () => {
	return useMutation({
		mutationFn: (data: CreatePerson | FormData) => {
			return personService.createPerson(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["persons"] });
		},
	});
};

export const useUpdatePerson = () => {
	return useMutation({
		mutationFn: ({ personId, data }: { personId: string; data: UpdatePerson | FormData }) => {
			return personService.updatePerson({ personId, data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["persons"] });
		},
	});
};

export const useDeletePerson = () => {
	return useMutation({
		mutationFn: ({ personId }: { personId: string }) => {
			return personService.deletePerson({ personId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["persons"] });
		},
	});
};
