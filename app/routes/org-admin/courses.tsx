import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search, Download, Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "~/components/molecule/data-table-updated";
import { TablePagination } from "~/components/molecule/table-pagination";
import { useGetCourses } from "~/hooks/use-course";
import { useApiParams } from "~/hooks/util-hooks/use-api-params";
import type { Course } from "~/zod/course.zod";
import { formatDate } from "~/utils/organization-utils";

const PAGE_SIZE = 5;
const COURSE_FIELDS =
	"id,title,code,description,status,level,creditHours,thumbnail,syllabus,version,orgId,facultyId,programId,categoryId,isDeleted,createdBy,updatedBy,createdAt,updatedAt,organization,faculty,program,category";

type CourseStatus = Course["status"];
type CourseLevel = Course["level"];

type CourseRow = {
	id: string;
	code: string;
	title: string;
	description: string;
	category: string;
	level: CourseLevel;
	creditHours: number | null;
	updatedAt: string | Date | null | undefined;
	updatedBy: string;
	status: CourseStatus;
};

const statusBadge: Record<CourseStatus, string> = {
	active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
	archived:
		"border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
	draft: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
	pending_approval:
		"border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
};

const statusLabel: Record<CourseStatus, string> = {
	active: "Active",
	archived: "Archived",
	draft: "Draft",
	pending_approval: "Pending Approval",
};

const levelLabel: Record<CourseLevel, string> = {
	beginner: "Beginner",
	intermediate: "Intermediate",
	advanced: "Advanced",
	all_levels: "All Levels",
};

const buildCourseFilter = (level: string, categoryId: string, status: string) => {
	const filters: string[] = [];
	if (level !== "all") filters.push(`level:${level}`);
	if (categoryId !== "all") filters.push(`categoryId:${categoryId}`);
	if (status !== "all") filters.push(`status:${status}`);
	return filters.join(",");
};

const formatUpdatedBy = (updatedBy: string) => {
	if (!updatedBy || updatedBy === "-") return "-";
	return updatedBy.length > 8 ? `${updatedBy.slice(0, 8)}...` : updatedBy;
};

export default function OrgAdminCourses() {
	const [, setSearchParams] = useSearchParams();
	const [levelFilter, setLevelFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");

	const { apiParams, searchTerm, handleSearchChange, handlePageChange, handleFilterChange } =
		useApiParams({
			limit: PAGE_SIZE,
			count: true,
			fields: COURSE_FIELDS,
		});

	const { data, isLoading, isFetching, isError, error } = useGetCourses(apiParams);
	const courses = data?.courses ?? [];

	const categoryOptions = useMemo(() => {
		const options = new Map<string, string>();
		courses.forEach((course) => {
			if (course.categoryId) {
				options.set(course.categoryId, course.category?.name ?? course.categoryId);
			}
		});
		if (categoryFilter !== "all" && !options.has(categoryFilter)) {
			options.set(categoryFilter, categoryFilter);
		}
		return Array.from(options.entries())
			.map(([id, name]) => ({ id, name }))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [courses, categoryFilter]);

	const handleLevelFilterChange = (value: string) => {
		setLevelFilter(value);
		handleFilterChange(buildCourseFilter(value, categoryFilter, statusFilter));
	};

	const handleCategoryFilterChange = (value: string) => {
		setCategoryFilter(value);
		handleFilterChange(buildCourseFilter(levelFilter, value, statusFilter));
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		handleFilterChange(buildCourseFilter(levelFilter, categoryFilter, value));
	};

	const hasActiveFilters =
		searchTerm || levelFilter !== "all" || categoryFilter !== "all" || statusFilter !== "all";

	const resetFilters = () => {
		setLevelFilter("all");
		setCategoryFilter("all");
		setStatusFilter("all");
		setSearchParams(
			(prev) => {
				const nextParams = new URLSearchParams(prev);
				nextParams.delete("search");
				nextParams.delete("filter");
				nextParams.delete("page");
				return nextParams;
			},
			{ replace: true },
		);
	};

	const courseRows = useMemo<CourseRow[]>(
		() =>
			courses.map((course) => ({
				id: course.id,
				code: course.code,
				title: course.title,
				description: course.description || "-",
				category: course.category?.name || "-",
				level: course.level,
				creditHours: course.creditHours ?? null,
				updatedAt: course.updatedAt,
				updatedBy: course.updatedBy || "-",
				status: course.status,
			})),
		[courses],
	);

	const totalResults = data?.count ?? data?.pagination?.total ?? courseRows.length;
	const totalPages = data?.pagination?.totalPages ?? 1;

	const courseColumns = useMemo<DataTableColumn<CourseRow>[]>(
		() => [
			{
				key: "code",
				label: "Code",
				className: "pl-6 w-24",
				cellClassName: "pl-6 py-4",
				render: (_, course) => (
					<span className="text-sm text-muted-foreground">{course.code}</span>
				),
			},
			{
				key: "title",
				label: "Course Name",
				cellClassName: "py-4",
				render: (_, course) => (
					<div>
						<p className="text-sm font-medium text-primary hover:underline cursor-pointer">
							{course.title}
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">{course.description}</p>
					</div>
				),
			},
			{
				key: "category",
				label: "Category",
				cellClassName: "py-4",
				render: (_, course) => (
					<span className="text-sm text-foreground">{course.category}</span>
				),
			},
			{
				key: "level",
				label: "Level",
				cellClassName: "py-4",
				render: (_, course) => (
					<span className="text-sm text-foreground">{levelLabel[course.level]}</span>
				),
			},
			{
				key: "creditHours",
				label: "Credits",
				cellClassName: "py-4",
				render: (_, course) => (
					<span className="text-sm text-foreground">
						{course.creditHours == null ? "-" : course.creditHours}
					</span>
				),
			},
			{
				key: "updatedAt",
				label: "Last Updated",
				cellClassName: "py-4",
				render: (_, course) => (
					<div>
						<p className="text-sm text-foreground">{formatDate(course.updatedAt)}</p>
						<p className="text-xs text-muted-foreground">
							by {formatUpdatedBy(course.updatedBy)}
						</p>
					</div>
				),
			},
			{
				key: "status",
				label: "Status",
				className: "text-center",
				cellClassName: "py-4 text-center",
				render: (_, course) => (
					<Badge className={`text-[11px] ${statusBadge[course.status]}`}>
						{statusLabel[course.status]}
					</Badge>
				),
			},
		],
		[],
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Course Catalog
					</h1>
					<p className="text-sm text-muted-foreground">
						Manage academic structures, prerequisites, and course offerings.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline" size="sm" className="gap-2">
						<Download className="size-4" />
						Export CSV
					</Button>
					<Button size="sm" className="gap-2">
						<Plus className="size-4" />
						Create Course
					</Button>
				</div>
			</div>

			{/* Filters */}
			<Card className="border-border/50">
				<CardContent className="p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1 max-w-xs">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search by name, code or keyword..."
								value={searchTerm}
								onChange={handleSearchChange}
								className="pl-9 h-9"
							/>
						</div>
						<Select value={levelFilter} onValueChange={handleLevelFilterChange}>
							<SelectTrigger className="w-36 h-9">
								<SelectValue placeholder="All Levels" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Levels</SelectItem>
								<SelectItem value="beginner">{levelLabel.beginner}</SelectItem>
								<SelectItem value="intermediate">
									{levelLabel.intermediate}
								</SelectItem>
								<SelectItem value="advanced">{levelLabel.advanced}</SelectItem>
								<SelectItem value="all_levels">{levelLabel.all_levels}</SelectItem>
							</SelectContent>
						</Select>
						<Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
							<SelectTrigger className="w-40 h-9">
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categoryOptions.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={statusFilter} onValueChange={handleStatusFilterChange}>
							<SelectTrigger className="w-36 h-9">
								<SelectValue placeholder="All Statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="active">{statusLabel.active}</SelectItem>
								<SelectItem value="archived">{statusLabel.archived}</SelectItem>
								<SelectItem value="draft">{statusLabel.draft}</SelectItem>
								<SelectItem value="pending_approval">
									{statusLabel.pending_approval}
								</SelectItem>
							</SelectContent>
						</Select>
						{hasActiveFilters && (
							<Button
								variant="link"
								size="sm"
								className="text-primary shrink-0"
								onClick={resetFilters}>
								Reset Filters
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Table */}
			<Card className="border-border/50">
				<CardContent className="p-0">
					{isError && (
						<p className="px-6 py-4 text-sm text-destructive">
							{error instanceof Error ? error.message : "Failed to load courses."}
						</p>
					)}

					<DataTable
						columns={courseColumns}
						data={isLoading ? [] : courseRows}
						variant="organizations"
						className="rounded-none"
					/>

					{/* Pagination */}
					{(isLoading || totalResults > 0) && (
						<TablePagination
							currentPage={apiParams.page ?? 1}
							onPageChange={handlePageChange}
							totalItems={totalResults}
							totalPages={totalPages}
							pageSize={PAGE_SIZE}
							currentPageItemCount={courseRows.length}
							isLoading={isLoading}
							isUpdating={isFetching}
							loadingText="Loading courses..."
							buttonVariant="outline"
							activeButtonVariant="default"
							summaryClassName="text-sm"
							navButtonClassName="size-8"
							pageButtonClassName="size-8 text-xs"
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
