import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { TemplateCard } from "~/components/user/TemplateCard";
import { Icon } from "~/components/ui/icon";
import { useAuth } from "~/hooks/use-auth";
import { useForkTemplateProject, useGetTemplateProjects } from "~/hooks/use-template-project";
import {
	CMS_TEMPLATE_FILTER,
	TEMPLATE_PROJECT_FIELDS,
	WEBSITE_TEMPLATE_FILTER,
} from "~/lib/template-project-utils";
import type { TemplateProject } from "~/zod/templateProject.zod";

type TemplateModeFilter = "all" | "website" | "cms";

type TemplateWithMode = {
	mode: "website" | "cms";
	template: TemplateProject;
};

export function meta() {
	return [{ title: "Templates - AppSiteBuilder" }];
}

export default function UserTemplatesRoute() {
	const navigate = useNavigate();
	const prefersReducedMotion = useReducedMotion();
	const { user } = useAuth();
	const [query, setQuery] = useState("");
	const [modeFilter, setModeFilter] = useState<TemplateModeFilter>("all");
	const [forkingTemplateId, setForkingTemplateId] = useState<string | null>(null);
	const { mutate: forkTemplate, isPending: isForking } = useForkTemplateProject();

	const websiteQuery = useGetTemplateProjects({
		page: 1,
		limit: 80,
		fields: TEMPLATE_PROJECT_FIELDS,
		query: query.trim(),
		filter: WEBSITE_TEMPLATE_FILTER,
		sort: "usageCount",
		order: "desc",
		document: true,
		pagination: false,
		count: true,
	});

	const cmsQuery = useGetTemplateProjects({
		page: 1,
		limit: 80,
		fields: TEMPLATE_PROJECT_FIELDS,
		query: query.trim(),
		filter: CMS_TEMPLATE_FILTER,
		sort: "usageCount",
		order: "desc",
		document: true,
		pagination: false,
		count: true,
	});

	const websiteTemplates = useMemo(() => {
		const items = websiteQuery.data?.templateProjects ?? [];
		const nonDeleted = items.filter((item) => !item.isDeleted);
		const active = nonDeleted.filter((item) => item.isActive);
		return active.length > 0 ? active : nonDeleted;
	}, [websiteQuery.data?.templateProjects]);

	const cmsTemplates = useMemo(() => {
		const items = cmsQuery.data?.templateProjects ?? [];
		const nonDeleted = items.filter((item) => !item.isDeleted);
		const active = nonDeleted.filter((item) => item.isActive);
		return active.length > 0 ? active : nonDeleted;
	}, [cmsQuery.data?.templateProjects]);

	const allTemplates = useMemo<TemplateWithMode[]>(
		() =>
			[
				...websiteTemplates.map((template) => ({ mode: "website" as const, template })),
				...cmsTemplates.map((template) => ({ mode: "cms" as const, template })),
			].sort((a, b) => {
				const usageDelta = (b.template.usageCount ?? 0) - (a.template.usageCount ?? 0);
				if (usageDelta !== 0) return usageDelta;
				return (
					new Date(b.template.updatedAt).getTime() -
					new Date(a.template.updatedAt).getTime()
				);
			}),
		[websiteTemplates, cmsTemplates],
	);

	const filteredTemplates = useMemo(() => {
		if (modeFilter === "all") return allTemplates;
		return allTemplates.filter((entry) => entry.mode === modeFilter);
	}, [allTemplates, modeFilter]);

	const isLoading = websiteQuery.isLoading || cmsQuery.isLoading;
	const hasError = websiteQuery.isError || cmsQuery.isError;
	const errorMessage =
		(websiteQuery.error instanceof Error && websiteQuery.error.message) ||
		(cmsQuery.error instanceof Error && cmsQuery.error.message) ||
		"Failed to load templates.";
	const isViewer = user?.role === "viewer";

	return (
		<div className="mx-auto min-h-full w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
			<section className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-primary">
							Template Library
						</p>
						<h1 className="text-3xl font-bold tracking-tight">
							Website + CMS Templates
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Find a starting point, then fork it into your own project.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{(
							[
								["all", "All", allTemplates.length],
								["website", "Website", websiteTemplates.length],
								["cms", "CMS", cmsTemplates.length],
							] as const
						).map(([mode, label, count]) => (
							<button
								key={mode}
								type="button"
								onClick={() => setModeFilter(mode)}
								className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
									modeFilter === mode
										? "border-primary/40 bg-primary/15 text-primary"
										: "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
								}`}>
								{label} ({count})
							</button>
						))}
					</div>
				</div>

				<div className="mt-4">
					<label className="sr-only" htmlFor="template-search">
						Search templates
					</label>
					<div className="relative max-w-md">
						<Icon
							name="search"
							size={16}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							id="template-search"
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search website and CMS templates"
							className="h-10 w-full rounded-2xl border border-input bg-input/30 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
						/>
					</div>
				</div>
			</section>

			<section className="mt-6 rounded-2xl border border-border/70 bg-card/40 p-5">
				{isLoading ? (
					<div className="py-12 text-center text-sm text-muted-foreground">
						Loading templates...
					</div>
				) : hasError ? (
					<div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-8 text-center text-sm text-destructive">
						{errorMessage}
					</div>
				) : filteredTemplates.length === 0 ? (
					<div className="py-12 text-center">
						<div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
							<Icon name="grid_view" size={28} />
						</div>
						<h2 className="text-lg font-semibold">No templates found</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Try a different search or mode filter.
						</p>
					</div>
				) : (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{filteredTemplates.map(({ mode, template }, index) => {
							const detailRoute =
								mode === "cms"
									? `/user/cms/templates/${template.id}`
									: `/user/templates/${template.id}`;
							const previewRoute =
								mode === "cms"
									? `/user/cms/templates/${template.id}`
									: `/view/${template.id}`;
							const isForkingThis = isForking && forkingTemplateId === template.id;
							return (
								<motion.div
									key={template.id}
									initial={
										prefersReducedMotion ? undefined : { opacity: 0, y: 10 }
									}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.24,
										delay: prefersReducedMotion ? 0 : index * 0.03,
										ease: "easeOut",
									}}
									className="space-y-2">
									<TemplateCard
										template={template}
										onClick={() => navigate(detailRoute)}
										onPreviewClick={() => navigate(previewRoute)}
										shouldLiftOnHover={!prefersReducedMotion}
									/>

									<div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/55 px-3 py-2">
										<div className="flex flex-wrap items-center gap-2 text-xs">
											<span
												className={`rounded-full border px-2.5 py-0.5 font-medium uppercase tracking-wide ${
													mode === "cms"
														? "border-chart-5/40 bg-chart-5/15 text-chart-5"
														: "border-chart-2/40 bg-chart-2/15 text-chart-2"
												}`}>
												{mode}
											</span>
											<span className="rounded-full border border-border/70 bg-background/65 px-2.5 py-0.5 text-muted-foreground">
												{(template.usageCount ?? 0).toLocaleString("en-US")}{" "}
												uses
											</span>
										</div>

										<button
											type="button"
											disabled={isViewer || isForking}
											onClick={() => {
												setForkingTemplateId(template.id);
												forkTemplate(template.id, {
													onSuccess: (project) => {
														navigate(
															mode === "cms"
																? `/project/cms/${project.slug}`
																: `/project/${project.slug}`,
														);
													},
													onSettled: () => {
														setForkingTemplateId(null);
													},
												});
											}}
											className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
											<Icon
												name={
													isForkingThis
														? "progress_activity"
														: "rocket_launch"
												}
												size={14}
												className={isForkingThis ? "animate-spin" : ""}
											/>
											{isViewer
												? "Viewer only"
												: isForkingThis
													? "Forking..."
													: "Use"}
										</button>
									</div>
								</motion.div>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}
