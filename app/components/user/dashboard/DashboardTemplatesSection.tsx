import type { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateCard } from "~/components/user/TemplateCard";
import { Icon } from "~/components/ui/icon";
import type { TemplateProject } from "~/zod/templateProject.zod";
import { fadeIn, fadeUp, stagger } from "./dashboard-constants";

interface DashboardTemplatesSectionProps {
	templatesRef: RefObject<HTMLElement | null>;
	templatesInView: boolean;
	prefersReducedMotion: boolean | null;
	activeCategory: string;
	templateCategories: string[];
	templateCount: number;
	filteredTemplates: TemplateProject[];
	isTemplatesLoading: boolean;
	isTemplatesError: boolean;
	templateLoadError: unknown;
	onResetCategory: () => void;
	onCategoryChange: (category: string) => void;
	onTemplateClick: (templateId: string) => void;
	onTemplatePreviewClick: (templateId: string) => void;
}

export function DashboardTemplatesSection({
	templatesRef,
	templatesInView,
	prefersReducedMotion,
	activeCategory,
	templateCategories,
	templateCount,
	filteredTemplates,
	isTemplatesLoading,
	isTemplatesError,
	templateLoadError,
	onResetCategory,
	onCategoryChange,
	onTemplateClick,
	onTemplatePreviewClick,
}: DashboardTemplatesSectionProps) {
	const safeFadeUp = prefersReducedMotion ? fadeIn : fadeUp;

	return (
		<motion.section
			ref={templatesRef}
			variants={stagger}
			initial="hidden"
			animate={templatesInView ? "show" : "hidden"}
			className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
			<motion.div variants={safeFadeUp} className="mb-8">
				<div className="mb-5 flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
							Templates
						</p>
						<h2 className="text-2xl font-bold tracking-tight">
							Start with something beautiful.
						</h2>
					</div>
					<button
						type="button"
						onClick={onResetCategory}
						className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-5 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground">
						<Icon name="grid_view" size={14} />
						Browse {templateCount.toLocaleString("en-US")}
						<Icon name="arrow_forward" size={14} />
					</button>
				</div>

				<div className="flex flex-wrap gap-2">
					{templateCategories.map((category) => (
						<button
							key={category}
							type="button"
							onClick={() => onCategoryChange(category)}
							className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
								activeCategory === category
									? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
									: "border border-border/60 bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
							}`}>
							{category}
						</button>
					))}
				</div>
			</motion.div>

			{isTemplatesLoading ? (
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
			) : isTemplatesError ? (
				<motion.div
					variants={safeFadeUp}
					className="rounded-3xl border border-destructive/35 bg-destructive/10 px-6 py-10 text-center">
					<p className="text-sm font-semibold text-destructive">
						Unable to load templates.
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{templateLoadError instanceof Error
							? templateLoadError.message
							: "Please try again shortly."}
					</p>
				</motion.div>
			) : filteredTemplates.length === 0 ? (
				<motion.div
					variants={safeFadeUp}
					className="rounded-3xl border border-border/60 bg-card/40 px-6 py-12 text-center">
					<p className="text-sm font-semibold text-foreground">
						No templates in this category.
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						Try another filter or check back later.
					</p>
				</motion.div>
			) : (
				<AnimatePresence mode="wait">
					<motion.div
						key={activeCategory}
						variants={stagger}
						initial="hidden"
						animate="show"
						exit={{ opacity: 0, transition: { duration: 0.15 } }}
						className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{filteredTemplates.map((template, index) => (
							<TemplateCard
								key={template.id}
								template={template}
								variants={safeFadeUp}
								custom={index}
								shouldLiftOnHover={!prefersReducedMotion}
								onClick={onTemplateClick}
								onPreviewClick={onTemplatePreviewClick}
							/>
						))}
					</motion.div>
				</AnimatePresence>
			)}

			<motion.div variants={safeFadeUp} className="mt-10 flex justify-center">
				<button
					type="button"
					onClick={onResetCategory}
					className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/60 px-7 py-3 text-sm font-semibold text-muted-foreground backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground active:scale-95">
					<Icon name="grid_view" size={16} />
					View {templateCount.toLocaleString("en-US")} templates
					<Icon name="arrow_forward" size={16} />
				</button>
			</motion.div>
		</motion.section>
	);
}
