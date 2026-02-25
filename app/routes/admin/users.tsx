import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "~/components/ui/icon";
import { useGetUsers } from "~/hooks/use-user";
import {
	formatRelativeTime,
	formatUserJoinedDate,
	getUserDisplayName,
	getUserInitials,
	getUserLoginMethodMeta,
	getUserOrganizationName,
	getUserRoleMeta,
	getUserStatusCounts,
	getUserStatusMeta,
	USER_FIELDS,
	USER_STATUS_FILTER_LABELS,
	USER_STATUS_FILTERS,
	type UserStatusFilter,
} from "~/lib/user-utils";
import { cn } from "~/lib/utils";
import type { User } from "~/zod/user.zod";

const PAGE_SIZE = 10;

export default function AdminUsersRoute() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
	const [currentPage, setCurrentPage] = useState(1);

	const { data, isLoading, isError, error, refetch, isFetching } = useGetUsers({
		page: 1,
		limit: 300,
		fields: USER_FIELDS,
		sort: "updatedAt",
		order: "desc",
		document: true,
		pagination: false,
		count: true,
	});

	const users: User[] = data?.users ?? [];

	const statusCounts = useMemo(() => {
		return getUserStatusCounts(users);
	}, [users]);

	const filteredUsers = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return users.filter((user) => {
			if (statusFilter !== "all" && user.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			const loginMethod = getUserLoginMethodMeta(user.loginMethod);
			const searchableValue = [
				getUserDisplayName(user),
				user.email,
				user.userName ?? "",
				getUserOrganizationName(user),
				user.role,
				user.status,
				loginMethod.label,
			]
				.join(" ")
				.toLowerCase();

			return searchableValue.includes(normalizedQuery);
		});
	}, [searchQuery, statusFilter, users]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

	useEffect(() => {
		setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
	}, [totalPages]);

	const startIndex = (currentPage - 1) * PAGE_SIZE;
	const pagedUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
	const rangeStart = filteredUsers.length === 0 ? 0 : startIndex + 1;
	const rangeEnd = startIndex + pagedUsers.length;
	const activeRatio =
		statusCounts.all === 0 ? 0 : Math.round((statusCounts.active / statusCounts.all) * 100);

	const summaryCards = [
		{
			title: "Total Accounts",
			value: statusCounts.all.toLocaleString("en-US"),
			description: `${statusCounts.archived.toLocaleString("en-US")} archived profiles`,
			iconName: "groups",
			toneClassName: "from-chart-5/25 to-transparent",
		},
		{
			title: "Active Users",
			value: statusCounts.active.toLocaleString("en-US"),
			description: `${activeRatio}% of the user base is currently active`,
			iconName: "verified_user",
			toneClassName: "from-chart-2/25 to-transparent",
		},
		{
			title: "Need Attention",
			value: statusCounts.suspended.toLocaleString("en-US"),
			description: `${statusCounts.inactive.toLocaleString("en-US")} inactive accounts`,
			iconName: "warning",
			toneClassName: "from-destructive/20 to-transparent",
		},
		{
			title: "Visible Results",
			value: filteredUsers.length.toLocaleString("en-US"),
			description: "Search and status filters applied",
			iconName: "manage_search",
			toneClassName: "from-chart-1/25 to-transparent",
		},
	];

	return (
		<div className="relative min-h-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-background to-background text-foreground shadow-xl">
			<div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-chart-1/15 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-chart-5/20 blur-3xl" />

			<header className="relative flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5 lg:px-6">
				<div>
					<p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
						<Icon name="monitoring" size={14} />
						User Operations
					</p>
					<h1 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						User Command Center
					</h1>
					<p className="mt-1 max-w-xl text-sm text-muted-foreground">
						Track account health, search identities, and monitor role and status
						distribution from one control surface.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<div className="rounded-2xl border border-border bg-card/80 px-4 py-2">
						<p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
							Active Ratio
						</p>
						<p className="mt-0.5 text-lg font-semibold text-foreground">
							{activeRatio}%
						</p>
					</div>
					<button
						type="button"
						onClick={() => void refetch()}
						className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-background/80 px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
						<Icon
							name="refresh"
							size={16}
							className={cn(isFetching ? "animate-spin" : undefined)}
						/>
						Sync
					</button>
				</div>
			</header>

			<section className="grid gap-3 px-5 pt-5 sm:grid-cols-2 xl:grid-cols-4 lg:px-6">
				{summaryCards.map((card, index) => (
					<motion.article
						key={card.title}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
						className="group relative overflow-hidden rounded-2xl border border-border bg-card/75 p-4 shadow-sm">
						<div
							className={cn(
								"pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
								card.toneClassName,
							)}
						/>
						<div className="relative">
							<div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/80 text-primary">
								<Icon name={card.iconName} size={18} />
							</div>
							<p className="mt-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
								{card.title}
							</p>
							<p className="mt-1 text-2xl font-semibold text-foreground">
								{card.value}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
						</div>
					</motion.article>
				))}
			</section>

			<section className="px-5 py-4 lg:px-6">
				<div className="rounded-2xl border border-border bg-card/70 p-3 shadow-sm">
					<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
						<label className="relative flex-1">
							<Icon
								name="search"
								size={18}
								className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<input
								type="search"
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder="Search by name, email, organization, role..."
								className="h-11 w-full rounded-2xl border border-border bg-background/85 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
							/>
						</label>

						<div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-background/60 p-1">
							{USER_STATUS_FILTERS.map((status) => {
								const isSelected = status === statusFilter;
								const count = statusCounts[status];

								return (
									<button
										key={status}
										type="button"
										onClick={() => setStatusFilter(status)}
										aria-pressed={isSelected}
										className={cn(
											"inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition",
											isSelected
												? "bg-card text-foreground shadow-sm"
												: "text-muted-foreground hover:text-foreground",
										)}>
										<span
											className={
												isSelected ? "font-semibold" : "font-medium"
											}>
											{USER_STATUS_FILTER_LABELS[status]}
										</span>
										<span className="text-xs text-muted-foreground">
											{count}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			<section className="px-5 pb-5 lg:px-6">
				<div className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-sm">
					<div className="overflow-x-auto minimal-scrollbar">
						<table className="w-full min-w-[1040px] border-separate border-spacing-0">
							<thead className="bg-sidebar-accent/65">
								<tr className="text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
									<th className="px-5 py-3.5 font-semibold">User</th>
									<th className="px-5 py-3.5 font-semibold">Role</th>
									<th className="px-5 py-3.5 font-semibold">Status</th>
									<th className="px-5 py-3.5 font-semibold">Organization</th>
									<th className="px-5 py-3.5 font-semibold">Login Method</th>
									<th className="px-5 py-3.5 font-semibold">Last Active</th>
									<th className="px-5 py-3.5 font-semibold">Joined</th>
								</tr>
							</thead>
							<tbody>
								{isLoading ? (
									<tr>
										<td
											colSpan={7}
											className="px-5 py-12 text-center text-sm text-muted-foreground">
											<div className="inline-flex items-center gap-2">
												<Icon
													name="progress_activity"
													className="animate-spin"
												/>
												Loading users...
											</div>
										</td>
									</tr>
								) : isError ? (
									<tr>
										<td
											colSpan={7}
											className="px-5 py-12 text-center text-sm text-destructive">
											<div className="space-y-3">
												<p>
													{error instanceof Error
														? error.message
														: "Failed to load users."}
												</p>
												<button
													type="button"
													onClick={() => void refetch()}
													className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-1.5 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
													<Icon name="refresh" size={15} />
													Try Again
												</button>
											</div>
										</td>
									</tr>
								) : pagedUsers.length > 0 ? (
									pagedUsers.map((user, index) => {
										const roleMeta = getUserRoleMeta(user.role);
										const statusMeta = getUserStatusMeta(user.status);
										const loginMethodMeta = getUserLoginMethodMeta(
											user.loginMethod,
										);

										return (
											<motion.tr
												key={user.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													duration: 0.24,
													delay: index * 0.03,
													ease: "easeOut",
												}}
												className="border-t border-border/80 text-sm text-foreground transition hover:bg-background/45">
												<td className="px-5 py-4">
													<div className="flex items-center gap-3">
														<div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-xs font-semibold text-primary">
															{user.avatar ? (
																<img
																	src={user.avatar}
																	alt={`${getUserDisplayName(user)} avatar`}
																	className="h-full w-full object-cover"
																/>
															) : (
																<span>{getUserInitials(user)}</span>
															)}
															<span
																className={cn(
																	"absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
																	statusMeta.dotClassName,
																)}
															/>
														</div>
														<div className="min-w-0">
															<p className="truncate font-semibold text-foreground">
																{getUserDisplayName(user)}
															</p>
															<p className="truncate text-xs text-muted-foreground">
																{user.email}
															</p>
														</div>
													</div>
												</td>
												<td className="px-5 py-4">
													<span
														className={cn(
															"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
															roleMeta.chipClassName,
														)}>
														<Icon name={roleMeta.iconName} size={13} />
														{roleMeta.label}
													</span>
												</td>
												<td className="px-5 py-4">
													<span
														className={cn(
															"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
															statusMeta.chipClassName,
														)}>
														<Icon
															name={statusMeta.iconName}
															size={13}
														/>
														{statusMeta.label}
													</span>
												</td>
												<td className="px-5 py-4">
													<p className="font-medium text-foreground">
														{getUserOrganizationName(user)}
													</p>
													<p className="text-xs text-muted-foreground">
														{user.userName
															? `@${user.userName}`
															: user.id}
													</p>
												</td>
												<td className="px-5 py-4">
													<span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
														<Icon
															name={loginMethodMeta.iconName}
															size={14}
														/>
														{loginMethodMeta.label}
													</span>
												</td>
												<td className="px-5 py-4 text-sm text-muted-foreground">
													{formatRelativeTime(user.lastLogin)}
												</td>
												<td className="px-5 py-4 text-sm text-muted-foreground">
													{formatUserJoinedDate(user.createdAt)}
												</td>
											</motion.tr>
										);
									})
								) : (
									<tr>
										<td
											colSpan={7}
											className="px-5 py-12 text-center text-sm text-muted-foreground">
											<div className="space-y-2">
												<p>No users match your current filters.</p>
												<button
													type="button"
													onClick={() => {
														setSearchQuery("");
														setStatusFilter("all");
													}}
													className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-1.5 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
													<Icon name="filter_alt_off" size={15} />
													Clear Filters
												</button>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					<footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
						<p className="text-sm text-muted-foreground">
							Showing{" "}
							<span className="font-semibold text-foreground">{rangeStart}</span> to{" "}
							<span className="font-semibold text-foreground">{rangeEnd}</span> of{" "}
							<span className="font-semibold text-foreground">
								{filteredUsers.length.toLocaleString("en-US")}
							</span>{" "}
							users
						</p>

						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={currentPage <= 1}
								onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
								className={cn(
									"rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors",
									currentPage <= 1
										? "cursor-not-allowed text-muted-foreground/55"
										: "text-muted-foreground hover:text-foreground",
								)}>
								Previous
							</button>
							<span className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-foreground">
								Page {currentPage} / {totalPages}
							</span>
							<button
								type="button"
								disabled={currentPage >= totalPages}
								onClick={() =>
									setCurrentPage((page) => Math.min(totalPages, page + 1))
								}
								className={cn(
									"rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors",
									currentPage >= totalPages
										? "cursor-not-allowed text-muted-foreground/55"
										: "text-muted-foreground hover:text-foreground",
								)}>
								Next
							</button>
						</div>
					</footer>
				</div>
			</section>
		</div>
	);
}
