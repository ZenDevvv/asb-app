import type { TemplateProject } from "~/zod/templateProject.zod";

export const TEMPLATE_PROJECT_FIELDS =
	"id,name,description,category,thumbnail,createdById,pages,globalStyle,seo,isActive,usageCount,isDeleted,createdAt,updatedAt,createdBy";

type TemplateTheme = {
	headerClassName: string;
	surfaceClassName: string;
	statusClassName: string;
	placeholderClassName: string;
};

const DEFAULT_CATEGORY = "General";

const TEMPLATE_THEME_BY_CATEGORY: Record<string, TemplateTheme> = {
	marketing: {
		headerClassName: "bg-gradient-to-r from-card via-chart-1/30 to-card",
		surfaceClassName: "bg-gradient-to-b from-slate-200 to-slate-100",
		statusClassName: "border-chart-1/35 bg-chart-1/15 text-chart-1",
		placeholderClassName: "bg-gradient-to-br from-rose-200/80 via-slate-100 to-cyan-200/70",
	},
	personal: {
		headerClassName: "bg-gradient-to-r from-card via-chart-5/28 to-card",
		surfaceClassName: "bg-gradient-to-b from-stone-200 to-stone-100",
		statusClassName: "border-chart-5/35 bg-chart-5/15 text-chart-5",
		placeholderClassName:
			"bg-gradient-to-br from-stone-300/90 via-stone-200/90 to-slate-200/75",
	},
	retail: {
		headerClassName: "bg-gradient-to-r from-card via-chart-2/28 to-card",
		surfaceClassName: "bg-gradient-to-b from-slate-200 to-slate-100",
		statusClassName: "border-chart-2/35 bg-chart-2/15 text-chart-2",
		placeholderClassName:
			"bg-gradient-to-br from-emerald-200/85 via-cyan-100/80 to-slate-200/70",
	},
	content: {
		headerClassName: "bg-gradient-to-r from-card via-chart-4/26 to-card",
		surfaceClassName: "bg-gradient-to-b from-slate-200 to-slate-100",
		statusClassName: "border-chart-4/35 bg-chart-4/15 text-chart-4",
		placeholderClassName:
			"bg-gradient-to-br from-orange-200/70 via-amber-100/75 to-slate-200/75",
	},
};

const DEFAULT_TEMPLATE_THEME: TemplateTheme = {
	headerClassName: "bg-gradient-to-r from-card via-primary/20 to-card",
	surfaceClassName: "bg-gradient-to-b from-slate-200 to-slate-100",
	statusClassName: "border-primary/35 bg-primary/15 text-primary",
	placeholderClassName: "bg-gradient-to-br from-slate-300/80 via-slate-200/90 to-slate-100",
};

type TemplateStatusMeta = {
	label: string;
	chipClassName: string;
};

const TEMPLATE_STATUS_META: Record<"active" | "draft" | "archived", TemplateStatusMeta> = {
	active: {
		label: "Active",
		chipClassName: "border-chart-2/35 bg-chart-2/20 text-chart-2",
	},
	draft: {
		label: "Draft",
		chipClassName: "border-chart-4/35 bg-chart-4/20 text-chart-4",
	},
	archived: {
		label: "Archived",
		chipClassName: "border-muted-foreground/35 bg-muted/80 text-muted-foreground",
	},
};

function getTemplateStatusKey(template: TemplateProject): "active" | "draft" | "archived" {
	if (template.isDeleted) return "archived";
	if (template.isActive) return "active";
	return "draft";
}

export function getTemplateStatusMeta(template: TemplateProject): TemplateStatusMeta {
	return TEMPLATE_STATUS_META[getTemplateStatusKey(template)];
}

export function getTemplateCategoryLabel(category?: string): string {
	const value = category?.trim();
	return value ? value : DEFAULT_CATEGORY;
}

export function getTemplateTheme(category?: string): TemplateTheme {
	const key = getTemplateCategoryLabel(category).toLowerCase();
	return TEMPLATE_THEME_BY_CATEGORY[key] ?? DEFAULT_TEMPLATE_THEME;
}

export function getTemplateDescription(template: TemplateProject): string {
	const description = template.description?.trim();
	if (description) return description;
	return `Prebuilt ${getTemplateCategoryLabel(template.category).toLowerCase()} template.`;
}

export function getTemplatePageCount(template: TemplateProject): number {
	if (Array.isArray(template.pages)) {
		return template.pages.length;
	}

	if (template.pages && typeof template.pages === "object") {
		const lengthValue = (template.pages as { length?: unknown }).length;
		if (typeof lengthValue === "number" && Number.isFinite(lengthValue) && lengthValue > 0) {
			return Math.floor(lengthValue);
		}
	}

	return 1;
}

export function getTemplateCategories(templates: TemplateProject[]): string[] {
	const categories = Array.from(
		new Set(templates.map((template) => getTemplateCategoryLabel(template.category))),
	);

	return ["All", ...categories];
}
