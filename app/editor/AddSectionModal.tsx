import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { cn } from "~/lib/utils";
import { useEditorStore } from "~/stores/editorStore";
import type { SectionType } from "~/types/editor";

interface AddSectionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type SectionPresetCategory = "starter" | "navigation" | "marketing" | "trust" | "support";

interface SectionPreset {
	id: SectionType;
	type: SectionType;
	label: string;
	description: string;
	icon: string;
	category: SectionPresetCategory;
	searchTerms: string[];
}

const SECTION_PRESET_ORDER: SectionType[] = [
	"custom",
	"navbar",
	"hero",
	"features",
	"cta",
	"testimonials",
	"faq",
	"footer",
];

const SECTION_PRESET_META: Record<
	SectionType,
	{ category: SectionPresetCategory; searchTerms: string[] }
> = {
	custom: { category: "starter", searchTerms: ["blank", "empty", "from scratch", "custom"] },
	navbar: { category: "navigation", searchTerms: ["navigation", "menu", "header", "links"] },
	hero: { category: "marketing", searchTerms: ["hero", "headline", "intro", "banner"] },
	features: { category: "marketing", searchTerms: ["features", "benefits", "grid"] },
	cta: { category: "marketing", searchTerms: ["cta", "call to action", "conversion"] },
	testimonials: {
		category: "trust",
		searchTerms: ["testimonials", "reviews", "proof", "quotes"],
	},
	faq: { category: "support", searchTerms: ["faq", "questions", "support", "help"] },
	footer: { category: "navigation", searchTerms: ["footer", "links", "legal", "bottom"] },
};

const SECTION_CATEGORY_ORDER: SectionPresetCategory[] = [
	"starter",
	"navigation",
	"marketing",
	"trust",
	"support",
];

const SECTION_CATEGORY_META: Record<
	SectionPresetCategory,
	{ label: string; sectionLabel: string; icon: string }
> = {
	starter: { label: "Starter", sectionLabel: "Starter Presets", icon: "rocket_launch" },
	navigation: { label: "Navigation", sectionLabel: "Navigation Presets", icon: "menu" },
	marketing: { label: "Marketing", sectionLabel: "Marketing Presets", icon: "campaign" },
	trust: { label: "Trust", sectionLabel: "Trust Presets", icon: "thumb_up" },
	support: { label: "Support", sectionLabel: "Support Presets", icon: "help" },
};

const PRESET_ACCENT_CLASSES: Record<SectionType, string> = {
	custom: "from-slate-950/70 via-emerald-950/60 to-slate-900/80",
	navbar: "from-slate-950/70 via-cyan-950/60 to-slate-900/80",
	hero: "from-slate-950/70 via-indigo-950/60 to-slate-900/80",
	features: "from-slate-950/70 via-teal-950/60 to-slate-900/80",
	cta: "from-slate-950/70 via-emerald-950/60 to-slate-900/80",
	testimonials: "from-slate-950/70 via-sky-950/60 to-slate-900/80",
	faq: "from-slate-950/70 via-zinc-900/70 to-slate-900/80",
	footer: "from-slate-950/70 via-cyan-950/40 to-slate-900/80",
};

export function AddSectionModal({ open, onOpenChange }: AddSectionModalProps) {
	const addSection = useEditorStore((s) => s.addSection);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPresetId, setSelectedPresetId] = useState<SectionType | null>(null);
	const [activeCategory, setActiveCategory] = useState<SectionPresetCategory | "all">("all");

	const presets = useMemo(
		() =>
			SECTION_PRESET_ORDER.reduce<SectionPreset[]>((acc, type) => {
				const entry = SECTION_REGISTRY[type];
				if (!entry) return acc;

				const meta = SECTION_PRESET_META[type];
				acc.push({
					id: type,
					type,
					label: entry.label,
					description: entry.description,
					icon: entry.icon,
					category: meta.category,
					searchTerms: meta.searchTerms,
				});
				return acc;
			}, []),
		[],
	);

	const normalizedQuery = searchQuery.trim().toLowerCase();

	const filteredPresets = useMemo(() => {
		if (!normalizedQuery) return presets;

		return presets.filter((preset) => {
			return (
				preset.label.toLowerCase().includes(normalizedQuery) ||
				preset.description.toLowerCase().includes(normalizedQuery) ||
				preset.searchTerms.some((term) => term.toLowerCase().includes(normalizedQuery))
			);
		});
	}, [presets, normalizedQuery]);

	const categoryCounts = useMemo(
		() =>
			SECTION_CATEGORY_ORDER.reduce(
				(acc, category) => {
					acc[category] = filteredPresets.filter(
						(preset) => preset.category === category,
					).length;
					return acc;
				},
				{} as Record<SectionPresetCategory, number>,
			),
		[filteredPresets],
	);

	const displayPresets = useMemo(() => {
		if (activeCategory === "all") return filteredPresets;
		return filteredPresets.filter((preset) => preset.category === activeCategory);
	}, [activeCategory, filteredPresets]);

	const activeCategoryLabel =
		activeCategory === "all"
			? "All Presets"
			: SECTION_CATEGORY_META[activeCategory].sectionLabel;

	useEffect(() => {
		if (!open) return;
		setSearchQuery("");
		setActiveCategory("all");
		setSelectedPresetId(presets[0]?.id ?? null);
	}, [open, presets]);

	useEffect(() => {
		if (activeCategory === "all") return;
		if (categoryCounts[activeCategory] > 0) return;
		setActiveCategory("all");
	}, [activeCategory, categoryCounts]);

	useEffect(() => {
		if (!selectedPresetId) return;
		if (displayPresets.some((preset) => preset.id === selectedPresetId)) return;
		setSelectedPresetId(displayPresets[0]?.id ?? null);
	}, [displayPresets, selectedPresetId]);

	const handleAdd = () => {
		if (!selectedPresetId) return;
		addSection(selectedPresetId);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="max-w-6xl overflow-hidden rounded-3xl border-border bg-gradient-to-br from-sidebar via-card to-sidebar p-0">
				<div className="flex h-[80vh] min-h-[580px] flex-col">
					<DialogHeader className="border-b border-border px-4 pb-4 pt-5 sm:px-6">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<DialogTitle className="text-3xl font-semibold tracking-tight text-foreground">
									Add New Section
								</DialogTitle>
								<p className="mt-1 text-sm text-muted-foreground">
									Pick a preset. After insertion, the section name is fully
									editable in Section Settings.
								</p>
							</div>
							<div className="flex items-center gap-2">
								<div className="relative w-full sm:w-72">
									<span
										className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
										style={{ fontSize: 18 }}>
										search
									</span>
									<input
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search presets..."
										className="h-10 w-full rounded-xl border border-border bg-input pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
									/>
								</div>
								<button
									type="button"
									onClick={() => onOpenChange(false)}
									className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
									aria-label="Close add section modal">
									<span
										className="material-symbols-outlined"
										style={{ fontSize: 20 }}>
										close
									</span>
								</button>
							</div>
						</div>
					</DialogHeader>

					<div className="flex min-h-0 flex-1 flex-col md:flex-row">
						<aside className="w-full border-b border-border p-4 md:w-64 md:border-b-0 md:border-r">
							<div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
								Categories
							</div>

							<div className="minimal-scrollbar flex gap-1.5 overflow-x-auto md:block md:space-y-1.5">
								<CategoryButton
									label="All"
									icon="apps"
									count={filteredPresets.length}
									isActive={activeCategory === "all"}
									onClick={() => setActiveCategory("all")}
								/>

								{SECTION_CATEGORY_ORDER.map((category) => {
									const meta = SECTION_CATEGORY_META[category];
									const count = categoryCounts[category];
									return (
										<CategoryButton
											key={category}
											label={meta.label}
											icon={meta.icon}
											count={count}
											isActive={activeCategory === category}
											onClick={() => setActiveCategory(category)}
											disabled={count === 0}
										/>
									);
								})}
							</div>
						</aside>

						<div className="flex min-h-0 min-w-0 flex-1 flex-col">
							<div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
								<h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
									{activeCategoryLabel}
								</h3>
								<span className="text-xs text-muted-foreground">
									{displayPresets.length} preset
									{displayPresets.length === 1 ? "" : "s"}
								</span>
							</div>

							<div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
								{displayPresets.length === 0 ? (
									<div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10">
										<div className="text-center">
											<div className="text-sm font-medium text-foreground">
												No presets found
											</div>
											<div className="text-xs text-muted-foreground">
												Try a different search term or category.
											</div>
										</div>
									</div>
								) : (
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
										{displayPresets.map((preset) => {
											const isSelected = preset.id === selectedPresetId;
											const groupCount = getPresetGroupCount(preset.type);
											const blockCount = getPresetBlockCount(preset.type);
											return (
												<button
													key={preset.id}
													type="button"
													onClick={() => setSelectedPresetId(preset.id)}
													className={cn(
														"group rounded-2xl border p-3 text-left transition-colors",
														isSelected
															? "border-primary/80 bg-primary/10"
															: "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
													)}>
													<div
														className={cn(
															"relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br",
															PRESET_ACCENT_CLASSES[preset.type],
														)}>
														<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_60%)]" />
														<div className="relative z-10 p-3">
															<div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
																<span>{preset.label}</span>
																{isSelected && (
																	<span className="rounded-full bg-primary px-2 py-0.5 text-[9px] text-primary-foreground">
																		Selected
																	</span>
																)}
															</div>
															<PresetPreview type={preset.type} />
														</div>
													</div>

													<div className="mt-3 flex items-start justify-between gap-3">
														<div className="min-w-0">
															<div className="truncate text-sm font-semibold text-foreground">
																{preset.label}
															</div>
															<div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
																{preset.description}
															</div>
															<div className="mt-2 text-[11px] text-muted-foreground">
																{groupCount} group
																{groupCount === 1 ? "" : "s"} |{" "}
																{blockCount} block
																{blockCount === 1 ? "" : "s"}
															</div>
														</div>
														<span
															className={cn(
																"material-symbols-outlined mt-0.5 shrink-0",
																isSelected
																	? "text-primary"
																	: "text-muted-foreground",
															)}
															style={{ fontSize: 18 }}>
															{isSelected
																? "check_circle"
																: "radio_button_unchecked"}
														</span>
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-2 border-t border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
						<div className="text-xs text-muted-foreground">
							Blank Section starts empty with one group and no blocks.
						</div>
						<div className="flex items-center gap-2 self-end sm:self-auto">
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted/30">
								Cancel
							</button>
							<button
								type="button"
								onClick={handleAdd}
								disabled={!selectedPresetId}
								className={cn(
									"flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
									selectedPresetId
										? "bg-primary text-primary-foreground hover:bg-primary/90"
										: "cursor-not-allowed bg-muted text-muted-foreground",
								)}>
								<span
									className="material-symbols-outlined"
									style={{ fontSize: 16 }}>
									add
								</span>
								Add Section
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

interface CategoryButtonProps {
	label: string;
	icon: string;
	count: number;
	isActive: boolean;
	onClick: () => void;
	disabled?: boolean;
}

function CategoryButton({
	label,
	icon,
	count,
	isActive,
	onClick,
	disabled = false,
}: CategoryButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"flex min-w-[120px] shrink-0 items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors md:w-full md:min-w-0",
				isActive
					? "bg-primary/15 text-primary"
					: "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
				disabled && "cursor-not-allowed opacity-40",
			)}>
			<span className="flex items-center gap-2">
				<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
					{icon}
				</span>
				{label}
			</span>
			<span
				className={cn(
					"rounded-full px-2 py-0.5 text-[11px] font-medium",
					isActive ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground",
				)}>
				{count}
			</span>
		</button>
	);
}

function PresetPreview({ type }: { type: SectionType }) {
	if (type === "navbar") {
		return (
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<div className="h-2 w-12 rounded-full bg-white/70" />
					<div className="h-1.5 w-20 rounded-full bg-white/40" />
				</div>
				<div className="h-6 rounded-lg border border-white/15 bg-black/20" />
			</div>
		);
	}

	if (type === "hero") {
		return (
			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-1.5">
					<div className="h-2 w-14 rounded-full bg-white/70" />
					<div className="h-2 w-11 rounded-full bg-white/50" />
					<div className="h-1.5 w-9 rounded-full bg-primary/80" />
				</div>
				<div className="h-12 rounded-lg border border-white/15 bg-black/20" />
			</div>
		);
	}

	if (type === "features" || type === "testimonials") {
		return (
			<div className="grid grid-cols-3 gap-2">
				<div className="h-12 rounded-lg border border-white/15 bg-black/20" />
				<div className="h-12 rounded-lg border border-white/15 bg-black/20" />
				<div className="h-12 rounded-lg border border-white/15 bg-black/20" />
			</div>
		);
	}

	if (type === "cta") {
		return (
			<div className="space-y-2">
				<div className="h-2 w-20 rounded-full bg-white/70" />
				<div className="h-1.5 w-24 rounded-full bg-white/45" />
				<div className="h-5 w-16 rounded-full bg-primary/80" />
			</div>
		);
	}

	if (type === "faq" || type === "footer") {
		return (
			<div className="space-y-1.5">
				<div className="h-6 rounded-lg border border-white/15 bg-black/20" />
				<div className="h-6 rounded-lg border border-white/15 bg-black/20" />
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="h-3 w-14 rounded-full bg-white/65" />
			<div className="h-12 rounded-lg border border-dashed border-white/25 bg-black/10" />
		</div>
	);
}

function getPresetGroupCount(type: SectionType): number {
	const entry = SECTION_REGISTRY[type];
	if (!entry) return 0;
	return entry.defaultGroups?.length ?? 1;
}

function getPresetBlockCount(type: SectionType): number {
	const entry = SECTION_REGISTRY[type];
	if (!entry) return 0;
	if (entry.defaultGroups?.length) {
		return entry.defaultGroups.reduce((sum, group) => sum + group.blocks.length, 0);
	}
	return entry.defaultBlocks.length;
}
