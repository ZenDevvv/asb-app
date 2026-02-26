import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { Icon } from "~/components/ui/icon";
import { TemplateCard } from "~/components/user/TemplateCard";
import {
	useGetTemplateProjectById,
	useGetTemplateProjects,
	useForkTemplateProject,
} from "~/hooks/use-template-project";
import { useAuth } from "~/hooks/use-auth";
import {
	TEMPLATE_PROJECT_FIELDS,
	getTemplateCategoryLabel,
	getTemplateDescription,
	getTemplatePageCount,
	getTemplateStatusMeta,
} from "~/lib/template-project-utils";
import { cn } from "~/lib/utils";
import { SectionRenderer } from "~/sections/SectionRenderer";
import { DEFAULT_GLOBAL_STYLE } from "~/stores/editorStore";
import type { GlobalStyle, Section } from "~/types/editor";

type TemplatePagePreview = {
	id: string;
	name: string;
	slug: string;
	isDefault: boolean;
	sections: Section[];
};

const TEMPLATE_DETAILS_FIELDS =
	"id,name,description,category,thumbnail,createdById,pages,globalStyle,seo,isActive,usageCount,isDeleted,createdAt,updatedAt,createdBy";

const BORDER_RADIUS_VALUES: Array<GlobalStyle["borderRadius"]> = ["none", "sm", "md", "lg", "full"];

function formatAbsoluteDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
}

function formatRelativeTime(date: Date): string {
	const deltaMs = Date.now() - new Date(date).getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (deltaMs < minute) return "just now";
	if (deltaMs < hour) {
		const minutes = Math.max(1, Math.floor(deltaMs / minute));
		return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
	}
	if (deltaMs < day) {
		const hours = Math.max(1, Math.floor(deltaMs / hour));
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	}
	if (deltaMs < 30 * day) {
		const days = Math.max(1, Math.floor(deltaMs / day));
		return `${days} day${days === 1 ? "" : "s"} ago`;
	}

	const months = Math.max(1, Math.floor(deltaMs / (30 * day)));
	return `${months} month${months === 1 ? "" : "s"} ago`;
}

function isRenderableSection(value: unknown): value is Section {
	if (!value || typeof value !== "object") return false;
	const section = value as Partial<Section>;
	return (
		typeof section.id === "string" &&
		typeof section.type === "string" &&
		typeof section.label === "string" &&
		Array.isArray(section.groups) &&
		!!section.style &&
		typeof section.style === "object" &&
		typeof section.isVisible === "boolean"
	);
}

function normalizeTemplatePages(rawPages: unknown): TemplatePagePreview[] {
	if (!Array.isArray(rawPages) || rawPages.length === 0) {
		return [{ id: "page-1", name: "Home", slug: "/", isDefault: true, sections: [] }];
	}

	const pages = rawPages.map((rawPage, index) => {
		const page =
			rawPage && typeof rawPage === "object" ? (rawPage as Record<string, unknown>) : {};

		const sections = Array.isArray(page.sections)
			? page.sections.filter(isRenderableSection)
			: [];

		const name =
			typeof page.name === "string" && page.name.trim().length > 0
				? page.name.trim()
				: `Page ${index + 1}`;
		const slug =
			typeof page.slug === "string" && page.slug.trim().length > 0
				? page.slug.trim()
				: index === 0
					? "/"
					: `/page-${index + 1}`;
		const id =
			typeof page.id === "string" && page.id.trim().length > 0
				? page.id.trim()
				: `page-${index + 1}`;

		return {
			id,
			name,
			slug,
			isDefault: typeof page.isDefault === "boolean" ? page.isDefault : index === 0,
			sections,
		};
	});

	return pages.length > 0
		? pages
		: [{ id: "page-1", name: "Home", slug: "/", isDefault: true, sections: [] }];
}

function normalizeGlobalStyle(rawGlobalStyle: unknown): GlobalStyle {
	if (!rawGlobalStyle || typeof rawGlobalStyle !== "object") {
		return { ...DEFAULT_GLOBAL_STYLE };
	}

	const value = rawGlobalStyle as Partial<GlobalStyle>;
	const borderRadius =
		typeof value.borderRadius === "string" &&
		BORDER_RADIUS_VALUES.includes(value.borderRadius as GlobalStyle["borderRadius"])
			? (value.borderRadius as GlobalStyle["borderRadius"])
			: DEFAULT_GLOBAL_STYLE.borderRadius;

	return {
		fontFamily:
			typeof value.fontFamily === "string" && value.fontFamily.trim().length > 0
				? value.fontFamily
				: DEFAULT_GLOBAL_STYLE.fontFamily,
		primaryColor:
			typeof value.primaryColor === "string" && value.primaryColor.trim().length > 0
				? value.primaryColor
				: DEFAULT_GLOBAL_STYLE.primaryColor,
		colorScheme: "monochromatic",
		borderRadius,
		themeMode: value.themeMode === "light" ? "light" : "dark",
	};
}

function getSeoSummary(seo: unknown): string | null {
	if (!seo || typeof seo !== "object") return null;
	const summary = (seo as { summary?: unknown }).summary;
	if (typeof summary !== "string") return null;
	const trimmed = summary.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function getSeoTags(seo: unknown): string[] {
	if (!seo || typeof seo !== "object") return [];
	const tags = (seo as { tags?: unknown }).tags;
	if (!Array.isArray(tags)) return [];
	return tags
		.filter((tag): tag is string => typeof tag === "string")
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0)
		.slice(0, 12);
}

export function meta() {
	return [{ title: "Template Details - AppSiteBuilder" }];
}

export default function UserTemplateDetailsRoute() {
	const { templateId } = useParams<{ templateId: string }>();
	const navigate = useNavigate();
	const prefersReducedMotion = useReducedMotion();
	const { user } = useAuth();
	const { mutate: forkTemplate, isPending: isForking } = useForkTemplateProject();

	const {
		data: templateData,
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
	} = useGetTemplateProjectById(templateId ?? "", {
		fields: TEMPLATE_DETAILS_FIELDS,
	});

	const { data: suggestionsData, isLoading: isSuggestionsLoading } = useGetTemplateProjects({
		page: 1,
		limit: 40,
		fields: TEMPLATE_PROJECT_FIELDS,
		sort: "usageCount",
		order: "desc",
		document: true,
		pagination: false,
		count: false,
	});

	const pages = useMemo(() => normalizeTemplatePages(templateData?.pages), [templateData?.pages]);
	const globalStyle = useMemo(
		() => normalizeGlobalStyle(templateData?.globalStyle),
		[templateData?.globalStyle],
	);
	const categoryLabel = useMemo(
		() => getTemplateCategoryLabel(templateData?.category),
		[templateData?.category],
	);
	const description = useMemo(
		() => (templateData ? getTemplateDescription(templateData) : ""),
		[templateData],
	);
	const seoSummary = useMemo(() => getSeoSummary(templateData?.seo), [templateData?.seo]);
	const seoTags = useMemo(() => getSeoTags(templateData?.seo), [templateData?.seo]);
	const statusMeta = templateData ? getTemplateStatusMeta(templateData) : null;
	const themeClass = globalStyle.themeMode === "light" ? "light" : "dark";

	const ownerLabel =
		templateData?.createdBy?.userName ||
		templateData?.createdBy?.email ||
		templateData?.createdById ||
		"ASB admin";

	const suggestedTemplates = useMemo(() => {
		const templates = suggestionsData?.templateProjects ?? [];
		const available = templates.filter(
			(template) => !template.isDeleted && template.id !== templateData?.id,
		);
		if (!templateData) return available.slice(0, 3);

		const sameCategory = available.filter(
			(template) => getTemplateCategoryLabel(template.category) === categoryLabel,
		);
		const otherCategories = available.filter(
			(template) => getTemplateCategoryLabel(template.category) !== categoryLabel,
		);

		return [...sameCategory, ...otherCategories].slice(0, 3);
	}, [categoryLabel, suggestionsData?.templateProjects, templateData]);

	const pageCount =
		templateData && !templateData.isDeleted ? getTemplatePageCount(templateData) : pages.length;
	const usageCountLabel = templateData?.usageCount?.toLocaleString("en-US") ?? "0";

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
				<div className="space-y-4">
					<div className="h-36 animate-pulse rounded-[2rem] border border-border/60 bg-card/65" />
					<div className="h-[70vh] animate-pulse rounded-[2rem] border border-border/60 bg-card/65" />
					<div className="h-56 animate-pulse rounded-[2rem] border border-border/60 bg-card/65" />
				</div>
			</div>
		);
	}

	if (isError || !templateData) {
		return (
			<div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-6 py-10 md:px-10">
				<div className="w-full rounded-[2rem] border border-destructive/40 bg-destructive/10 p-7 text-left">
					<p className="text-sm font-semibold text-destructive">
						Template could not be loaded.
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						{error instanceof Error ? error.message : "Try refreshing this page."}
					</p>
					<div className="mt-6 flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => navigate("/user/dashboard")}
							className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/50">
							<Icon name="arrow_back" size={16} />
							Back to Dashboard
						</button>
						<button
							type="button"
							onClick={() => refetch()}
							disabled={isFetching}
							className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-60">
							<Icon
								name="refresh"
								size={16}
								className={cn(isFetching ? "animate-spin" : "")}
							/>
							Try Again
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative overflow-x-clip bg-background text-foreground">
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-24 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
				<div className="absolute -right-16 bottom-[-10rem] h-[26rem] w-[26rem] rounded-full bg-chart-5/10 blur-3xl" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.06),transparent_56%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.08),transparent_52%)]" />
			</div>

			<div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
				<motion.header
					initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.32, ease: "easeOut" }}
					className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/65 backdrop-blur-xl">
					<div className="relative px-6 py-6 md:px-8 md:py-8">
						<div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />

						<button
							type="button"
							onClick={() => navigate("/user/dashboard")}
							className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
							<Icon name="arrow_back" size={14} />
							Back to Dashboard
						</button>

						<div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
							<span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-3 py-1 font-medium text-muted-foreground">
								<Icon name="category" size={13} />
								{categoryLabel}
							</span>
							{statusMeta ? (
								<span
									className={cn(
										"inline-flex items-center gap-1 rounded-full border px-3 py-1 font-medium",
										statusMeta.chipClassName,
									)}>
									<Icon name="check_circle" size={13} />
									{statusMeta.label}
								</span>
							) : null}
							<span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-3 py-1 font-medium text-muted-foreground">
								<Icon name="schedule" size={13} />
								Updated {formatRelativeTime(templateData.updatedAt)}
							</span>
						</div>

						<div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
							<div className="min-w-0">
								<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
									{templateData.name}
								</h1>
								<p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
									{description}
								</p>
							</div>

							<div className="flex flex-wrap items-center gap-2 lg:justify-end">
								<button
									type="button"
									disabled={isForking || !user}
									onClick={() => {
										if (!templateId) return;
										forkTemplate(templateId, {
											onSuccess: (data) => {
												navigate(`/project/${data.slug}`);
											},
										});
									}}
									className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65">
									<Icon
										name={isForking ? "progress_activity" : "rocket_launch"}
										size={16}
										className={isForking ? "animate-spin" : ""}
									/>
									{isForking ? "Creating Project..." : "Use Template"}
								</button>
							</div>
						</div>

						<div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
							<div className="rounded-2xl border border-border/70 bg-card/75 px-4 py-3">
								<p className="text-xs uppercase tracking-widest text-muted-foreground">
									Usage
								</p>
								<p className="mt-1 text-xl font-semibold">{usageCountLabel}</p>
							</div>
							<div className="rounded-2xl border border-border/70 bg-card/75 px-4 py-3">
								<p className="text-xs uppercase tracking-widest text-muted-foreground">
									Pages
								</p>
								<p className="mt-1 text-xl font-semibold">{pageCount}</p>
							</div>
							<div className="rounded-2xl border border-border/70 bg-card/75 px-4 py-3">
								<p className="text-xs uppercase tracking-widest text-muted-foreground">
									Theme
								</p>
								<p className="mt-1 text-xl font-semibold">
									{globalStyle.themeMode === "light" ? "Light" : "Dark"}
								</p>
							</div>
							<div className="rounded-2xl border border-border/70 bg-card/75 px-4 py-3">
								<p className="text-xs uppercase tracking-widest text-muted-foreground">
									Primary Color
								</p>
								<div className="mt-1 flex items-center gap-2">
									<span
										className="inline-block h-4 w-4 rounded-full border border-border"
										style={{ backgroundColor: globalStyle.primaryColor }}
									/>
									<span className="text-sm font-medium uppercase">
										{globalStyle.primaryColor}
									</span>
								</div>
							</div>
						</div>
					</div>
				</motion.header>

				<motion.section
					initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.34, delay: 0.05, ease: "easeOut" }}
					className="mt-7 overflow-hidden rounded-[2rem] border border-border/60 bg-card/60 shadow-sm backdrop-blur-xl">
					<div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 px-6 py-4 md:px-8">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-primary">
								Template Preview
							</p>
							<h2 className="text-lg font-semibold tracking-tight sm:text-xl">
								Scrollable multi-page preview
							</h2>
						</div>
						<span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
							<Icon name="description" size={13} />
							{pages.length} {pages.length === 1 ? "page" : "pages"}
						</span>
					</div>

					<div
						className={cn(
							"minimal-scrollbar max-h-[74vh] overflow-y-auto p-4 md:p-6",
							themeClass,
						)}>
						<div className="space-y-6" style={{ fontFamily: globalStyle.fontFamily }}>
							{pages.map((page, pageIndex) => {
								const visibleSections = page.sections.filter(
									(section) => section.isVisible,
								);

								return (
									<motion.article
										key={page.id}
										initial={
											prefersReducedMotion ? undefined : { opacity: 0, y: 14 }
										}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true, amount: 0.18 }}
										transition={{
											duration: 0.28,
											delay: pageIndex * 0.04,
											ease: "easeOut",
										}}
										className="overflow-hidden rounded-2xl border border-border/70 bg-background/80">
										<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-card/80 px-4 py-3">
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-foreground">
													{page.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{page.slug}
												</p>
											</div>
											<div className="flex items-center gap-2 text-xs">
												{page.isDefault ? (
													<span className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 font-medium text-primary">
														Default
													</span>
												) : null}
												<span className="rounded-full border border-border px-2.5 py-1 font-medium text-muted-foreground">
													{visibleSections.length} visible sections
												</span>
											</div>
										</div>

										{visibleSections.length === 0 ? (
											<div className="flex min-h-40 items-center justify-center px-4 text-sm text-muted-foreground">
												This page has no visible sections.
											</div>
										) : (
											visibleSections.map((section, sectionIndex) => (
												<SectionRenderer
													key={section.id}
													section={section}
													sectionIndex={sectionIndex}
													globalStyle={globalStyle}
													isEditing={false}
													selectedGroupId={null}
													selectedBlockId={null}
												/>
											))
										)}
									</motion.article>
								);
							})}
						</div>
					</div>
				</motion.section>

				<motion.section
					initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.34, delay: 0.08, ease: "easeOut" }}
					className="mt-7 overflow-hidden rounded-[2rem] border border-border/60 bg-card/60 backdrop-blur-xl">
					<div className="border-b border-border/60 px-6 py-4 md:px-8">
						<p className="text-xs font-semibold uppercase tracking-widest text-primary">
							Template Details
						</p>
						<h2 className="text-lg font-semibold tracking-tight sm:text-xl">
							Metadata and publishing context
						</h2>
					</div>

					<div className="space-y-6 px-6 py-6 md:px-8">
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{[
								{ label: "Template ID", value: templateData.id },
								{ label: "Category", value: categoryLabel },
								{ label: "Created by", value: ownerLabel },
								{
									label: "Created at",
									value: formatAbsoluteDate(templateData.createdAt),
								},
								{
									label: "Last updated",
									value: formatAbsoluteDate(templateData.updatedAt),
								},
								{
									label: "Border radius",
									value: globalStyle.borderRadius.toUpperCase(),
								},
							].map((item) => (
								<div
									key={item.label}
									className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3">
									<p className="text-xs uppercase tracking-widest text-muted-foreground">
										{item.label}
									</p>
									<p className="mt-1 truncate text-sm font-medium text-foreground">
										{item.value}
									</p>
								</div>
							))}
						</div>

						<div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-4">
							<p className="text-xs font-semibold uppercase tracking-widest text-primary">
								SEO Summary
							</p>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{seoSummary ?? "No SEO summary has been added yet."}
							</p>

							<div className="mt-4 flex flex-wrap gap-2">
								{seoTags.length > 0 ? (
									seoTags.map((tag) => (
										<span
											key={tag}
											className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/65 px-3 py-1 text-xs font-medium text-muted-foreground">
											<Icon name="sell" size={12} />
											{tag}
										</span>
									))
								) : (
									<span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/65 px-3 py-1 text-xs font-medium text-muted-foreground">
										<Icon name="sell" size={12} />
										No tags yet
									</span>
								)}
							</div>
						</div>
					</div>
				</motion.section>

				<motion.section
					initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.34, delay: 0.11, ease: "easeOut" }}
					className="mt-7">
					<div className="mb-4 flex flex-wrap items-end justify-between gap-2">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-primary">
								Suggested Templates
							</p>
							<h2 className="text-lg font-semibold tracking-tight sm:text-xl">
								Explore related starting points
							</h2>
						</div>
					</div>

					{isSuggestionsLoading ? (
						<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className="overflow-hidden rounded-[1.65rem] border border-slate-800/75 bg-slate-950/80 shadow-xl shadow-black/20">
									<div className="h-24 animate-pulse bg-slate-800/85" />
									<div className="h-72 animate-pulse bg-slate-200/90" />
									<div className="h-12 animate-pulse border-t border-slate-700/70 bg-slate-900/85" />
								</div>
							))}
						</div>
					) : suggestedTemplates.length === 0 ? (
						<div className="rounded-[1.5rem] border border-border/70 bg-card/65 px-6 py-8 text-sm text-muted-foreground">
							No suggested templates are available right now.
						</div>
					) : (
						<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{suggestedTemplates.map((template, index) => (
								<TemplateCard
									key={template.id}
									template={template}
									custom={index}
									shouldLiftOnHover={!prefersReducedMotion}
									onClick={(id) => navigate(`/user/templates/${id}`)}
									onPreviewClick={(id) => navigate(`/view/${id}`)}
								/>
							))}
						</div>
					)}
				</motion.section>
			</div>
		</div>
	);
}
