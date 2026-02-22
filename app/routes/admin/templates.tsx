import { useMemo, useState } from "react";
import { Bell, MoreHorizontal, Plus, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import type { TemplateProject } from "~/zod/templateProject.zod";

type TemplateStatus = "active" | "draft" | "archived";
type TemplateTab = "all" | TemplateStatus;

type TemplateRow = {
	id: TemplateProject["id"];
	name: string;
	category: "Marketing" | "Personal" | "Retail" | "Content" | "Business";
	status: TemplateStatus;
	usageCount: number;
	updatedAt: Date;
	description?: string;
	isAiGenerated?: boolean;
	trend?: string;
	previewClassName: string;
};

const MOCK_TEMPLATE_PROJECTS: TemplateProject[] = [
	{
		id: "TPL-0192",
		name: "SaaS Landing Page v2",
		description: "High-converting SaaS template with hero, pricing, and feature sections.",
		category: "Marketing",
		thumbnail: "",
		createdById: "USR-0001",
		pages: [],
		globalStyle: {},
		seo: {},
		isActive: true,
		usageCount: 1240,
		isDeleted: false,
		createdAt: new Date("2026-01-10T08:20:00Z"),
		updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
	},
	{
		id: "TPL-0129",
		name: "Portfolio Minimal",
		description: "Simple portfolio for creators and freelancers.",
		category: "Personal",
		thumbnail: "",
		createdById: "USR-0001",
		pages: [],
		globalStyle: {},
		seo: {},
		isActive: true,
		usageCount: 856,
		isDeleted: false,
		createdAt: new Date("2025-12-05T07:10:00Z"),
		updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
	},
	{
		id: "TPL-0235",
		name: "E-commerce Starter",
		description: "Starter storefront with product and CTA sections.",
		category: "Retail",
		thumbnail: "",
		createdById: "USR-0001",
		pages: [],
		globalStyle: {},
		seo: {},
		isActive: false,
		usageCount: 0,
		isDeleted: false,
		createdAt: new Date("2026-02-01T10:00:00Z"),
		updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
	},
	{
		id: "TPL-0048",
		name: "Blog Classic",
		description: "Editorial-first blog design with reading-focused layout.",
		category: "Content",
		thumbnail: "",
		createdById: "USR-0001",
		pages: [],
		globalStyle: {},
		seo: {},
		isActive: true,
		usageCount: 2100,
		isDeleted: false,
		createdAt: new Date("2025-10-18T13:00:00Z"),
		updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
	},
	{
		id: "TPL-0013",
		name: "Agency Dark Mode",
		description: "Bold agency template with dark visuals.",
		category: "Business",
		thumbnail: "",
		createdById: "USR-0001",
		pages: [],
		globalStyle: {},
		seo: {},
		isActive: false,
		usageCount: 450,
		isDeleted: true,
		createdAt: new Date("2025-09-01T09:40:00Z"),
		updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
	},
];

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

const categoryClassName: Record<TemplateRow["category"], string> = {
	Marketing: "border-chart-1/50 bg-chart-1/12 text-chart-1",
	Personal: "border-chart-5/50 bg-chart-5/12 text-chart-5",
	Retail: "border-chart-4/50 bg-chart-4/12 text-chart-4",
	Content: "border-destructive/45 bg-destructive/12 text-destructive",
	Business: "border-chart-2/50 bg-chart-2/12 text-chart-2",
};

const tabs: Array<{ key: TemplateTab; label: string }> = [
	{ key: "all", label: "All Templates" },
	{ key: "active", label: "Active" },
	{ key: "draft", label: "Draft" },
	{ key: "archived", label: "Archived" },
];

export default function AdminTemplatesRoute() {
	const [selectedTab, setSelectedTab] = useState<TemplateTab>("all");
	const [searchQuery, setSearchQuery] = useState("");

	const templateRows = useMemo<TemplateRow[]>(() => {
		return MOCK_TEMPLATE_PROJECTS.map((template) => ({
			id: template.id,
			name: template.name,
			category: (template.category as TemplateRow["category"]) ?? "Business",
			status: getTemplateStatus(template),
			usageCount: template.usageCount,
			updatedAt: template.updatedAt,
			description: template.description,
			isAiGenerated:
				template.name.toLowerCase().includes("starter") ||
				template.name.toLowerCase().includes("v2"),
			trend:
				template.usageCount > 1000 ? "+12%" : template.usageCount > 100 ? "+5%" : undefined,
			previewClassName:
				template.category === "Marketing"
					? "from-chart-1/55 via-chart-5/35 to-chart-1/20"
					: template.category === "Personal"
						? "from-card via-chart-5/20 to-card"
						: template.category === "Retail"
							? "from-chart-4/40 via-muted to-card"
							: template.category === "Content"
								? "from-card via-card to-muted"
								: "from-black/80 via-chart-5/20 to-black/80",
		}));
	}, []);

	const summary = useMemo(() => {
		const active = templateRows.filter((row) => row.status === "active").length;
		const draft = templateRows.filter((row) => row.status === "draft").length;
		const archived = templateRows.filter((row) => row.status === "archived").length;
		return {
			all: templateRows.length,
			active,
			draft,
			archived,
		};
	}, [templateRows]);

	const filteredTemplates = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase();
		return templateRows.filter((template) => {
			const matchesTab = selectedTab === "all" ? true : template.status === selectedTab;
			const matchesSearch =
				normalizedSearch.length === 0
					? true
					: `${template.name} ${template.category} ${template.id} ${template.description ?? ""}`
							.toLowerCase()
							.includes(normalizedSearch);
			return matchesTab && matchesSearch;
		});
	}, [searchQuery, selectedTab, templateRows]);

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
								{filteredTemplates.length > 0 ? (
									filteredTemplates.map((template) => {
										const status = statusClassName[template.status];
										const categoryClasses =
											categoryClassName[template.category];

										return (
											<tr
												key={template.id}
												className="border-t border-border/80 text-sm text-foreground transition hover:bg-background/45">
												<td className="px-5 py-4">
													<div
														className={cn(
															"relative h-11 w-[54px] overflow-hidden rounded-md border border-border/70 bg-gradient-to-r",
															template.previewClassName,
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
													{template.isAiGenerated ? (
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
														{template.category}
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
														{template.trend ? (
															<span className="rounded-full bg-chart-2/20 px-2 py-0.5 text-xs font-medium text-chart-2">
																{template.trend}
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
		</div>
	);
}
