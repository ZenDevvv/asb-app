import pkg from "lodash";
const { debounce } = pkg;
import { useMemo, useState, useEffect, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import type { ApiQueryParams } from "~/services/api-service";

const getValidOrder = (order: string | null | undefined): "asc" | "desc" => {
	const validOrders: ("asc" | "desc")[] = ["asc", "desc"];
	return validOrders.includes(order as "asc" | "desc") ? (order as "asc" | "desc") : "asc";
};

const getParamsFromSearch = (searchParams: URLSearchParams): Partial<ApiQueryParams> => ({
	query: searchParams.get("search") ?? "",
	filter: searchParams.get("filter") ?? "",
	page: parseInt(searchParams.get("page") ?? "1", 10),
	sort: searchParams.get("sort") ?? "",
	order: getValidOrder(searchParams.get("order")),
});

export const useApiParams = (initialParams: ApiQueryParams = {}) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const paramsFromSearch = getParamsFromSearch(searchParams);

	// Helper function to combine filters
	const combineFilters = (initialFilter?: string, urlFilter?: string): string => {
		const filters = [initialFilter, urlFilter].filter(Boolean);
		return filters.join(",");
	};

	const [apiParams, setApiParams] = useState<ApiQueryParams>({
		...initialParams,
		...paramsFromSearch,
		fields: initialParams.fields ?? "",
		limit: initialParams.limit ?? 10,
		filter: combineFilters(initialParams.filter, paramsFromSearch.filter),
	});
	const [searchTerm, setSearchTerm] = useState(apiParams.query ?? "");

	// NEW: Sync apiParams and searchTerm whenever searchParams (URL) changes.
	// This handles external updates like filter changes from outside the hook.
	useEffect(() => {
		const newParamsFromSearch = getParamsFromSearch(searchParams);
		setApiParams((prev) => ({
			...prev,
			...newParamsFromSearch,
			// Preserve non-URL params like fields/limit from initial or prior state
			fields: prev.fields ?? initialParams.fields ?? "",
			limit: prev.limit ?? initialParams.limit ?? 10,
			// Combine initial filter with URL filter
			filter: combineFilters(initialParams.filter, newParamsFromSearch.filter),
		}));
		setSearchTerm(newParamsFromSearch.query ?? "");
	}, [searchParams, initialParams.fields, initialParams.limit, initialParams.filter]); // Dependencies: searchParams triggers the sync; initialParams for preservation

	// Debounced function to update apiParams.query and URL
	const debouncedUpdateSearch = useMemo(
		() =>
			debounce((value: string) => {
				setApiParams((prev) => ({ ...prev, query: value, page: 1 }));
				setSearchParams(
					(prev) => {
						const newParams = new URLSearchParams(prev);
						if (value) {
							newParams.set("search", value);
						} else {
							newParams.delete("search");
						}
						// newParams.set("page", "1");
						return newParams;
					},
					{ replace: true },
				);
			}, 500),
		[setSearchParams],
	);

	// Handle search input changes
	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value); // Update input immediately
		debouncedUpdateSearch(value); // Update apiParams.query and URL after debounce
	};

	// Update pagination
	const handlePageChange = (page: number) => {
		setApiParams((prev) => ({ ...prev, page }));
		setSearchParams(
			(prev) => {
				const newParams = new URLSearchParams(prev);
				newParams.set("page", page.toString());
				return newParams;
			},
			{ replace: true },
		);
	};

	// Increment page for infinite scrolling
	const incrementPage = () => {
		setApiParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }));
	};

	// Update filters and reset to first page
	const handleFilterChange = (filter: string) => {
		setApiParams((prev) => ({ ...prev, filter, page: 1 }));
		setSearchParams(
			(prev) => {
				const newParams = new URLSearchParams(prev);
				if (filter) {
					newParams.set("filter", filter);
				} else {
					newParams.delete("filter");
				}
				// newParams.set("page", "1");
				return newParams;
			},
			{ replace: true },
		);
	};

	return {
		apiParams,
		searchTerm,
		handleSearchChange,
		handlePageChange,
		incrementPage,
		handleFilterChange,
	};
};
