import { useMemo, useState } from "react";
import { Bell, MoreHorizontal, Plus, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { CreateTemplateModal } from "~/components/admin/CreateTemplateModal";
import { cn } from "~/lib/utils";
import { useGetTemplateProjects } from "~/hooks/use-template-project";
import type { TemplateProject } from "~/zod/templateProject.zod";

type TemplateStatus = "active" | "draft" | "archived";
type TemplateTab = "all" | TemplateStatus;

function getTemplateStatus(template: TemplateProject): TemplateStatus {
	if (template.isDeleted) return "archived";
	if (template.isActive) return "active";
	return "draft";
}

function formatRelativeTime(date: Date): string {
	const now = Date.now();
	const diffMs = Math.max(0, now - new Date(date).getTime());
	const hour = 60 * 60 * 1000;
	const day = 24 * hour;

	if (diffMs < day) {
		const hours = Math.max(1, Math.floor(diffMs / hour));
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	}
	if (diffMs < 7 * day) {
		const days = Math.floor(diffMs / day);
		return `${days} day${days === 1 ? "" : "s"} ago`;
	}
	if (diffMs < 30 * day) {
		const weeks = Math.floor(diffMs / (7 * day));
		return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
	}

	const months = Math.floor(diffMs / (30 * day));
	return `${months} month${months === 1 ? "" : "s"} ago`;
}

const statusClassName: Record<
	TemplateStatus,
	{
		label: string;
		dotClassName: string;
		textClassName: string;
	}
> = {
	active: {
		label: "Active",
		dotClassName: "bg-chart-2",
		textClassName: "text-foreground",
	},
	draft: {
		label: "Draft",
		dotClassName: "bg-chart-4",
		textClassName: "text-foreground",
	},
	archived: {
		label: "Archived",
		dotClassName: "bg-muted-foreground",
		textClassName: "text-muted-foreground",
	},
};

function getCategoryClassName(category?: string): string {
	switch (category) {
		case "Marketing":
			return "border-chart-1/50 bg-chart-1/12 text-chart-1";
		case "Personal":
			return "border-chart-5/50 bg-chart-5/12 text-chart-5";
		case "Retail":
			return "border-chart-4/50 bg-chart-4/12 text-chart-4";
		case "Content":
			return "border-destructive/45 bg-destructive/12 text-destructive";
		default:
			return "border-chart-2/50 bg-chart-2/12 text-chart-2";
	}
}

function getPreviewClassName(category?: string): string {
	switch (category) {
		case "Marketing":
			return "from-chart-1/55 via-chart-5/35 to-chart-1/20";
		case "Personal":
			return "from-card via-chart-5/20 to-card";
		case "Retail":
			return "from-chart-4/40 via-muted to-card";
		case "Content":
			return "from-card via-card to-muted";
		default:
			return "from-black/80 via-chart-5/20 to-black/80";
	}
}

const tabs: Array<{ key: TemplateTab; label: string }> = [
	{ key: "all", label: "All Templates" },
	{ key: "active", label: "Active" },
	{ key: "draft", label: "Draft" },
	{ key: "archived", label: "Archived" },
];

export default function AdminTemplatesRoute() {
	const [selectedTab, setSelectedTab] = useState<TemplateTab>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [createTemplateModalOpen, setCreateTemplateModalOpen] = useState(false);
	const fields =
		"id,name,description,category,thumbnail,createdById,pages,globalStyle,seo,isActive,usageCount,isDeleted,createdAt,updatedAt,createdBy";

	const { data, isLoading, isError, error } = useGetTemplateProjects({
		page: 1,
		limit: 100,
		fields,
		query: searchQuery.trim(),
		sort: "updatedAt",
		order: "desc",
		document: true,
		pagination: false,
		count: true,
	});

	const templateProjects = data?.templateProjects ?? [];

	const summary = useMemo(() => {
		const active = templateProjects.filter(
			(template) => getTemplateStatus(template) === "active",
		).length;
		const draft = templateProjects.filter(
			(template) => getTemplateStatus(template) === "draft",
		).length;
		const archived = templateProjects.filter(
			(template) => getTemplateStatus(template) === "archived",
		).length;
		return {
			all: data?.count ?? templateProjects.length,
			active,
			draft,
			archived,
		};
	}, [data?.count, templateProjects]);

	const filteredTemplates = useMemo(() => {
		return templateProjects.filter((template) => {
			const status = getTemplateStatus(template);
			return selectedTab === "all" ? true : status === selectedTab;
		});
	}, [selectedTab, templateProjects]);

	return (
		<div className="min-h-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-background to-background text-foreground shadow-xl">
			<header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 lg:px-6">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						Template Library
					</h1>
					<p className="mt-1 text-xs text-muted-foreground sm:text-sm">
						Manage and organize website templates for your users.
					</p>
				</div>
				<div className="flex items-center gap-2.5">
					<button
						type="button"
						className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						aria-label="Notifications">
						<Bell className="h-4 w-4" />
						<span className="absolute right-[8px] top-[8px] h-1.5 w-1.5 rounded-full bg-destructive" />
					</button>
					<button
						type="button"
						onClick={() => setCreateTemplateModalOpen(true)}
						className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
						<Plus className="h-4 w-4" />
						Create New Template
					</button>
				</div>
			</header>

			<div className="space-y-4 px-5 py-5 lg:px-6">
				<section className="rounded-2xl border border-border bg-card/65 p-3 shadow-sm">
					<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
						<label className="relative flex-1">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<input
								type="search"
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder="Search templates by name, tag, or ID..."
								className="h-12 w-full rounded-2xl border border-border bg-background/85 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
							/>
						</label>

						<div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-background/55 px-2 py-1.5">
							<div className="flex flex-wrap items-center gap-1">
								{tabs.map((tab) => {
									const isSelected = tab.key === selectedTab;
									const count = summary[tab.key];

									return (
										<button
											key={tab.key}
											type="button"
											onClick={() => setSelectedTab(tab.key)}
											aria-pressed={isSelected}
											className={cn(
												"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition",
												isSelected
													? "bg-card text-foreground shadow-sm"
													: "text-muted-foreground hover:text-foreground",
											)}>
											<span
												className={
													isSelected ? "font-semibold" : "font-medium"
												}>
												{tab.label}
											</span>
											<span
												className={cn(
													"text-xs",
													isSelected
														? "text-foreground/75"
														: "text-muted-foreground",
												)}>
												{count}
											</span>
										</button>
									);
								})}
							</div>
							<button
								type="button"
								className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/75 text-muted-foreground transition-colors hover:text-foreground"
								aria-label="Filter templates">
								<SlidersHorizontal className="h-4 w-4" />
							</button>
						</div>
					</div>
				</section>

				<section className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-sm">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[960px] border-separate border-spacing-0">
							<thead className="bg-sidebar-accent/65">
								<tr className="text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
									<th className="px-5 py-3.5 font-semibold">Preview</th>
									<th className="px-5 py-3.5 font-semibold">Template Name</th>
									<th className="px-5 py-3.5 font-semibold">Category</th>
									<th className="px-5 py-3.5 font-semibold">Status</th>
									<th className="px-5 py-3.5 font-semibold">Usage</th>
									<th className="px-5 py-3.5 font-semibold">Last Updated</th>
									<th className="px-5 py-3.5 font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody>
								{isLoading ? (
									<tr>
										<td
											className="px-5 py-12 text-center text-sm text-muted-foreground"
											colSpan={7}>
											Loading templates...
										</td>
									</tr>
								) : isError ? (
									<tr>
										<td
											className="px-5 py-12 text-center text-sm text-destructive"
											colSpan={7}>
											{error instanceof Error
												? error.message
												: "Failed to load templates."}
										</td>
									</tr>
								) : filteredTemplates.length > 0 ? (
									filteredTemplates.map((template) => {
										const status = statusClassName[getTemplateStatus(template)];
										const categoryClasses = getCategoryClassName(
											template.category,
										);
										const previewClassName = getPreviewClassName(
											template.category,
										);
										const isAiGenerated =
											template.name.toLowerCase().includes("starter") ||
											template.name.toLowerCase().includes("v2");
										const trend =
											template.usageCount > 1000
												? "+12%"
												: template.usageCount > 100
													? "+5%"
													: undefined;

										return (
											<tr
												key={template.id}
												className="border-t border-border/80 text-sm text-foreground transition hover:bg-background/45">
												<td className="px-5 py-4">
													<div
														className={cn(
															"relative h-11 w-[54px] overflow-hidden rounded-md border border-border/70 bg-gradient-to-r",
															previewClassName,
														)}>
														<div className="absolute inset-y-2 left-2 w-1.5 rounded-full bg-card/70" />
														<div className="absolute inset-y-3 left-5 w-4 rounded-sm bg-card/80" />
													</div>
												</td>
												<td className="px-5 py-4">
													<p className="font-semibold leading-tight text-foreground">
														{template.name}
													</p>
													<p className="mt-1 text-xs text-muted-foreground">
														{template.id}
													</p>
													{isAiGenerated ? (
														<p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
															<Sparkles className="h-3 w-3" />
															AI Generated
														</p>
													) : null}
												</td>
												<td className="px-5 py-4">
													<span
														className={cn(
															"inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
															categoryClasses,
														)}>
														{template.category || "Business"}
													</span>
												</td>
												<td className="px-5 py-4">
													<span
														className={cn(
															"inline-flex items-center gap-2 text-sm font-medium",
															status.textClassName,
														)}>
														<span
															className={cn(
																"h-2 w-2 rounded-full",
																status.dotClassName,
															)}
														/>
														{status.label}
													</span>
												</td>
												<td className="px-5 py-4">
													<div className="flex items-center gap-2">
														<p className="text-2xl font-semibold leading-none text-foreground">
															{template.usageCount.toLocaleString(
																"en-US",
															)}
														</p>
														{trend ? (
															<span className="rounded-full bg-chart-2/20 px-2 py-0.5 text-xs font-medium text-chart-2">
																{trend}
															</span>
														) : null}
													</div>
													<p className="mt-1 text-xs text-muted-foreground">
														installs
													</p>
												</td>
												<td className="px-5 py-4 text-sm text-muted-foreground">
													{formatRelativeTime(template.updatedAt)}
												</td>
												<td className="px-5 py-4">
													<button
														type="button"
														className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/70 text-muted-foreground transition-colors hover:text-foreground"
														aria-label={`Actions for ${template.name}`}>
														<MoreHorizontal className="h-4 w-4" />
													</button>
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td
											className="px-5 py-12 text-center text-sm text-muted-foreground"
											colSpan={7}>
											No templates match your current filters.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>

				<footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
					<p className="text-sm text-muted-foreground">
						Showing{" "}
						<span className="font-semibold text-foreground">
							{filteredTemplates.length === 0 ? 0 : 1}
						</span>{" "}
						to{" "}
						<span className="font-semibold text-foreground">
							{filteredTemplates.length}
						</span>{" "}
						of <span className="font-semibold text-foreground">{summary.all}</span>{" "}
						templates
					</p>
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
							Previous
						</button>
						<button
							type="button"
							className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-card/80">
							Next
						</button>
					</div>
				</footer>
			</div>

			<CreateTemplateModal
				open={createTemplateModalOpen}
				onOpenChange={setCreateTemplateModalOpen}
				fallbackCreatedById={templateProjects[0]?.createdById}
			/>
		</div>
	);
}
