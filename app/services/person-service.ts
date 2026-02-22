import { APIService } from "./api-service";
import { apiClient, type ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/configs/endpoints";
import type { Pagination } from "~/zod/common.zod";
import type { CreatePerson, Person, UpdatePerson } from "~/zod/person.zod";

type GetAllPersons = {
	persons?: Person[];
	person?: Person[];
	pagination?: Pagination;
	count?: number;
	[key: string]: unknown;
};

const { PERSON } = API_ENDPOINTS;

class PersonService extends APIService {
	getAllPersons = async () => {
		try {
			const response: ApiResponse<GetAllPersons> = await apiClient.get(
				`${PERSON.GET_ALL}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	getPersonById = async ({ personId }: { personId: string }) => {
		try {
			const response: ApiResponse<Person> = await apiClient.get(
				`${PERSON.GET_BY_ID.replace(":id", personId)}${this.getQueryString()}`,
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	createPerson = async (data: CreatePerson | FormData) => {
		try {
			let response: ApiResponse<Person>;
			if (data instanceof FormData) {
				response = await apiClient.postFormData(PERSON.CREATE, data);
			} else {
				response = await apiClient.post(PERSON.CREATE, data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	updatePerson = async ({
		personId,
		data,
	}: {
		personId: string;
		data: UpdatePerson | FormData;
	}) => {
		try {
			let response: ApiResponse<{ person: Person }>;
			if (data instanceof FormData) {
				response = await apiClient.patchFormData(PERSON.UPDATE.replace(":id", personId), data);
			} else {
				response = await apiClient.patch(PERSON.UPDATE.replace(":id", personId), data);
			}
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};

	// The backend currently uses PATCH for remove on /person/:id.
	deletePerson = async ({ personId }: { personId: string }) => {
		try {
			const response: ApiResponse<Record<string, never>> = await apiClient.patch(
				PERSON.DELETE.replace(":id", personId),
			);
			return response.data;
		} catch (error: any) {
			throw new Error(
				error.data?.errors?.[0]?.message || error.message || "An error has occurred",
			);
		}
	};
}

export default new PersonService();
