import { useMemo, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "~/lib/utils";

type PaginationItem = number | "ellipsis";
type ButtonVariant = ComponentProps<typeof Button>["variant"];
type ButtonSize = ComponentProps<typeof Button>["size"];
type PaginationDisplayMode = "simple" | "adaptive";

type TablePaginationProps = {
	currentPage: number;
	onPageChange: (page: number) => void;
	totalItems: number;
	pageSize: number;
	currentPageItemCount: number;
	totalPages?: number;
	isLoading?: boolean;
	isUpdating?: boolean;
	loadingText?: string;
	displayMode?: PaginationDisplayMode;
	maxVisiblePages?: number;
	className?: string;
	summaryClassName?: string;
	controlsClassName?: string;
	buttonVariant?: ButtonVariant;
	activeButtonVariant?: ButtonVariant;
	buttonSize?: ButtonSize;
	iconSize?: number;
	navButtonClassName?: string;
	pageButtonClassName?: string;
	activePageButtonClassName?: string;
	inactivePageButtonClassName?: string;
};

function getSimplePageItems(totalPages: number): PaginationItem[] {
	const items: PaginationItem[] = [1, 2, 3].filter((page) => page <= totalPages);
	if (totalPages > 3) {
		items.push("ellipsis");
		items.push(totalPages);
	}
	return items;
}

function getAdaptivePageItems(
	currentPage: number,
	totalPages: number,
	maxVisiblePages: number,
): PaginationItem[] {
	if (totalPages <= maxVisiblePages) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const innerWindow = maxVisiblePages - 2;
	let start = Math.max(2, currentPage - Math.floor(innerWindow / 2));
	let end = start + innerWindow - 1;

	if (end > totalPages - 1) {
		end = totalPages - 1;
		start = end - innerWindow + 1;
	}

	const items: PaginationItem[] = [1];

	if (start > 2) {
		items.push("ellipsis");
	}

	for (let page = start; page <= end; page += 1) {
		items.push(page);
	}

	if (end < totalPages - 1) {
		items.push("ellipsis");
	}

	items.push(totalPages);
	return items;
}

export function TablePagination({
	currentPage,
	onPageChange,
	totalItems,
	pageSize,
	currentPageItemCount,
	totalPages,
	isLoading = false,
	isUpdating = false,
	loadingText = "Loading...",
	displayMode = "adaptive",
	maxVisiblePages = 7,
	className,
	summaryClassName,
	controlsClassName,
	buttonVariant = "outline",
	activeButtonVariant = "default",
	buttonSize = "icon",
	iconSize = 18,
	navButtonClassName,
	pageButtonClassName,
	activePageButtonClassName,
	inactivePageButtonClassName,
}: TablePaginationProps) {
	const resolvedPageSize = Math.max(1, pageSize);
	const resolvedTotalPages = Math.max(1, totalPages ?? Math.ceil(totalItems / resolvedPageSize));
	const boundedCurrentPage = Math.min(Math.max(1, currentPage), resolvedTotalPages);
	const showingFrom =
		currentPageItemCount === 0 ? 0 : (boundedCurrentPage - 1) * resolvedPageSize + 1;
	const showingTo = currentPageItemCount === 0 ? 0 : showingFrom + currentPageItemCount - 1;

	const paginationItems = useMemo(() => {
		if (displayMode === "simple") {
			return getSimplePageItems(resolvedTotalPages);
		}

		return getAdaptivePageItems(
			boundedCurrentPage,
			resolvedTotalPages,
			Math.max(5, maxVisiblePages),
		);
	}, [boundedCurrentPage, displayMode, maxVisiblePages, resolvedTotalPages]);

	const changePage = (nextPage: number) => {
		const boundedPage = Math.min(Math.max(1, nextPage), resolvedTotalPages);
		if (boundedPage !== currentPage) {
			onPageChange(boundedPage);
		}
	};

	return (
		<div
			className={cn(
				"flex items-center justify-between border-t border-border/50 px-6 py-4",
				className,
			)}>
			<p className={cn("text-sm text-muted-foreground", summaryClassName)}>
				{isLoading ? (
					loadingText
				) : (
					<>
						Showing <span className="font-medium text-foreground">{showingFrom}</span>{" "}
						to <span className="font-medium text-foreground">{showingTo}</span> of{" "}
						<span className="font-medium text-foreground">{totalItems}</span> results
					</>
				)}
				{isUpdating && !isLoading ? " (Updating...)" : ""}
			</p>
			<div className={cn("flex items-center gap-1", controlsClassName)}>
				<Button
					variant={buttonVariant}
					size={buttonSize}
					className={navButtonClassName}
					disabled={boundedCurrentPage === 1}
					onClick={() => changePage(boundedCurrentPage - 1)}>
					<Icon name="chevron_left" size={iconSize} />
				</Button>

				{paginationItems.map((item, index) =>
					item === "ellipsis" ? (
						<span
							key={`ellipsis-${index}`}
							className="px-1 text-xs text-muted-foreground">
							...
						</span>
					) : (
						<Button
							key={item}
							variant={
								item === boundedCurrentPage ? activeButtonVariant : buttonVariant
							}
							size={buttonSize}
							className={cn(
								pageButtonClassName,
								item === boundedCurrentPage
									? activePageButtonClassName
									: inactivePageButtonClassName,
							)}
							onClick={() => changePage(item)}>
							{item}
						</Button>
					),
				)}

				<Button
					variant={buttonVariant}
					size={buttonSize}
					className={navButtonClassName}
					disabled={boundedCurrentPage === resolvedTotalPages}
					onClick={() => changePage(boundedCurrentPage + 1)}>
					<Icon name="chevron_right" size={iconSize} />
				</Button>
			</div>
		</div>
	);
}
