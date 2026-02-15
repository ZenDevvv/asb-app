import { ArrowUpIcon, ArrowDownIcon, SearchIcon, XIcon, Funnel } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export type SortDirection = "asc" | "desc" | null;

export interface ColumnFilter {
	key?: string;
	value: string;
	label: string;
}

export interface DataTableColumn<T> {
	key: keyof T;
	label: string;
	sortable?: boolean;
	filterable?: boolean;
	filterOptions?: ColumnFilter[];
	searchable?: boolean;
	render?: (value: T[keyof T], row: T) => React.ReactNode;
	className?: string;
	cellClassName?: string;
}

export interface DataTableProps<T> {
	columns: DataTableColumn<T>[];
	data: T[];
	className?: string;
	onRowClick?: (row: T) => void;
	variant?: "default" | "organizations";
}

interface ColumnState {
	sortDirection: SortDirection;
	selectedFilters: string[];
}

// Helper: Parse filter param into a Map
function parseFilterParam(filterParam: string): Map<string, string[]> {
	const filterMap = new Map<string, string[]>();
	filterParam
		.split(",")
		.filter((p) => p.includes(":"))
		.forEach((pair) => {
			const [key, val] = pair.split(":", 2);
			if (key && val) {
				if (!filterMap.has(key)) filterMap.set(key, []);
				filterMap.get(key)!.push(val);
			}
		});
	return filterMap;
}

// Helper: Get selected filters for a column from URL params
function getSelectedFiltersForColumn<T>(
	col: DataTableColumn<T>,
	filterMap: Map<string, string[]>,
): string[] {
	const colKey = String(col.key);
	if (!col.filterOptions) return filterMap.get(colKey) || [];

	return col.filterOptions
		.filter((option) => {
			const filterKey = option.key || colKey;
			return filterMap.get(filterKey)?.includes(option.value);
		})
		.map((option) => option.value);
}

// Helper: Build column states from URL params
function buildColumnStates<T>(
	columns: DataTableColumn<T>[],
	searchParams: URLSearchParams,
): Record<string, ColumnState> {
	const sortKey = searchParams.get("sort");
	const order = searchParams.get("order");
	const filterMap = parseFilterParam(searchParams.get("filter") || "");

	const states: Record<string, ColumnState> = {};
	columns.forEach((col) => {
		const key = String(col.key);
		states[key] = {
			sortDirection:
				sortKey === key && (order === "asc" || order === "desc")
					? (order as SortDirection)
					: null,
			selectedFilters: getSelectedFiltersForColumn(col, filterMap),
		};
	});
	return states;
}

export function DataTable<T extends Record<string, any>>({
	columns,
	data,
	className,
	onRowClick,
	variant = "default",
}: DataTableProps<T>) {
	const [searchParams, setSearchParams] = useSearchParams();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
	const [columnStates, setColumnStates] = useState(() =>
		buildColumnStates(columns, searchParams),
	);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	useEffect(() => {
		setSearchQuery(searchParams.get("search") || "");
		setColumnStates(buildColumnStates(columns, searchParams));
	}, [searchParams, columns]);

	const handleSortClick = (columnKey: string, direction: "asc" | "desc") => {
		setColumnStates((prev) => {
			const newState = { ...prev };
			Object.keys(newState).forEach((key) => {
				newState[key] = { ...newState[key], sortDirection: null };
			});
			newState[columnKey] = { ...newState[columnKey], sortDirection: direction };
			return newState;
		});
		setSearchParams((prev) => {
			const newParams = new URLSearchParams(prev);
			newParams.set("sort", columnKey);
			newParams.set("order", direction);
			return newParams;
		});
	};

	const handleFilterChange = (columnKey: string, value: string, checked: boolean) => {
		setColumnStates((prev) => {
			const currentFilters = prev[columnKey].selectedFilters;
			const newFilters = checked
				? currentFilters.includes(value)
					? currentFilters
					: [...currentFilters, value]
				: currentFilters.filter((v) => v !== value);

			const newState = {
				...prev,
				[columnKey]: { ...prev[columnKey], selectedFilters: newFilters },
			};

			// Build filter param string
			const filterParts: string[] = [];
			columns.forEach((col) => {
				const colKey = String(col.key);
				newState[colKey].selectedFilters.forEach((v) => {
					const filterOption = col.filterOptions?.find((opt) => opt.value === v);
					const filterKey = filterOption?.key || colKey;
					filterParts.push(`${filterKey}:${v}`);
				});
			});

			setSearchParams((currentParams) => {
				const newParams = new URLSearchParams(currentParams);
				if (filterParts.length > 0) {
					newParams.set("filter", filterParts.join(","));
				} else {
					newParams.delete("filter");
				}
				return newParams;
			});

			return newState;
		});
	};

	const handleClearFilters = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setColumnStates((prev) => {
			const newState = { ...prev };
			Object.keys(newState).forEach((key) => {
				newState[key] = { sortDirection: null, selectedFilters: [] };
			});
			return newState;
		});
		setSearchQuery("");
		setSearchParams((prev) => {
			const newParams = new URLSearchParams(prev);
			["sort", "order", "search", "filter"].forEach((key) => newParams.delete(key));
			return newParams;
		});
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);

		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(() => {
			setSearchParams((prev) => {
				const newParams = new URLSearchParams(prev);
				if (value) {
					newParams.set("search", value);
				} else {
					newParams.delete("search");
				}
				return newParams;
			});
		}, 500);
	};

	return (
		<div className={cn("rounded-md border-none bg-card", className)}>
			<Table>
				<TableHeader>
					<TableRow
						className={cn(
							variant === "organizations" && "hover:bg-transparent",
						)}>
						{columns.map((column) => {
							const state = columnStates[String(column.key)];
							const hasFilters =
								column.filterable && (column.filterOptions?.length ?? 0) > 0;
							const hasFeatures = column.sortable || column.searchable || hasFilters;
							const hasActiveState =
								state?.sortDirection !== null ||
								state?.selectedFilters.length > 0 ||
								(column.searchable && !!searchQuery);

							if (!hasFeatures) {
								return (
									<TableHead
										key={String(column.key)}
										className={cn(
											variant === "organizations" &&
												"text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											column.className,
										)}>
										{column.label}
									</TableHead>
								);
							}

							return (
								<TableHead
									key={String(column.key)}
									className={cn(
										"p-0",
										variant === "organizations" &&
											"text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										column.className,
									)}>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className={cn(
													"relative h-10 w-full justify-between gap-1 px-4 font-medium hover:text-foreground hover:bg-muted cursor-pointer group rounded-none",
													variant === "organizations" &&
														"h-auto py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-transparent",
													hasActiveState && "text-primary font-bold",
												)}>
												<span className="flex items-center gap-2">
													{column.label}
												</span>
												<Funnel
													className={cn(
														"h-3 w-3 absolute right-2 hidden group-hover:flex",
														hasActiveState && "text-primary flex",
													)}
												/>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="start"
											className="w-56 bg-popover">
											{/* Sort Options */}
											{column.sortable && (
												<>
													<DropdownMenuItem
														className={cn(
															"cursor-pointer",
															state?.sortDirection === "asc" &&
																"text-primary",
														)}
														onClick={() =>
															handleSortClick(
																String(column.key),
																"asc",
															)
														}>
														<ArrowUpIcon
															className={cn(
																"mr-2 h-4 w-4",
																state?.sortDirection === "asc" &&
																	"text-primary",
															)}
														/>
														Sort Ascending
													</DropdownMenuItem>
													<DropdownMenuItem
														className={cn(
															"cursor-pointer",
															state?.sortDirection === "desc" &&
																"text-primary",
														)}
														onClick={() =>
															handleSortClick(
																String(column.key),
																"desc",
															)
														}>
														<ArrowDownIcon
															className={cn(
																"mr-2 h-4 w-4",
																state?.sortDirection === "desc" &&
																	"text-primary",
															)}
														/>
														Sort Descending
													</DropdownMenuItem>
												</>
											)}

											{column.sortable &&
												(column.searchable || hasFilters) && (
													<DropdownMenuSeparator />
												)}

											{/* Search Input */}
											{column.searchable && (
												<div className="p-2">
													<div className="relative">
														<SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
														<Input
															placeholder={`Search ${column.label.toLowerCase()}...`}
															value={searchQuery}
															className="pl-8 h-9 bg-background"
															onChange={handleSearchChange}
															onClick={(e) => e.stopPropagation()}
														/>
													</div>
												</div>
											)}

											{column.searchable && hasFilters && (
												<DropdownMenuSeparator />
											)}

											{/* Filter Options */}
											{hasFilters && (
												<div className="p-2 max-h-48 overflow-y-auto">
													<div className="text-xs font-medium text-muted-foreground mb-2 px-2">
														Filter Options
													</div>
													{column.filterOptions!.map((option) => {
														const checked =
															state?.selectedFilters.includes(
																option.value,
															) || false;
														return (
															<div
																key={option.value}
																className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
																onClick={() =>
																	handleFilterChange(
																		String(column.key),
																		option.value,
																		!checked,
																	)
																}>
																<Checkbox
																	checked={checked}
																	onCheckedChange={(checked) =>
																		handleFilterChange(
																			String(column.key),
																			option.value,
																			!!checked,
																		)
																	}
																/>
																<span className="text-sm">
																	{option.label}
																</span>
															</div>
														);
													})}
												</div>
											)}

											{/* Clear Filters */}
											{hasActiveState && (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="cursor-pointer text-destructive focus:text-destructive"
														onClick={handleClearFilters}>
														<XIcon className="mr-2 h-4 w-4" />
														Clear Filters
													</DropdownMenuItem>
												</>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableHead>
							);
						})}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.length === 0 ? (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results found
							</TableCell>
						</TableRow>
					) : (
						data.map((row, rowIndex) => (
							<TableRow
								key={rowIndex}
								className={cn(
									variant === "organizations" && "hover:bg-muted/30",
									onRowClick && "cursor-pointer",
								)}
								onClick={() => onRowClick?.(row)}>
								{columns.map((column) => (
									<TableCell
										key={String(column.key)}
										className={cn(
											variant === "organizations" && "py-3",
											column.cellClassName,
										)}>
										{column.render
											? column.render(row[column.key], row)
											: String(row[column.key] || "")}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
