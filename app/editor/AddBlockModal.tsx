import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { cn } from "~/lib/utils";
import { useEditorStore } from "~/stores/editorStore";
import type { BlockCategory, BlockType, SectionType } from "~/types/editor";

interface AddBlockModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	sectionId: string;
	sectionType: SectionType;
	groupId: string;
	groupSlots: string[];
}

const BLOCK_CATEGORY_ORDER: BlockCategory[] = ["basic", "media", "layout", "content"];

const BLOCK_CATEGORY_META: Record<
	BlockCategory,
	{ label: string; sectionLabel: string; icon: string }
> = {
	basic: { label: "Basic", sectionLabel: "Basic Elements", icon: "text_fields" },
	media: { label: "Media", sectionLabel: "Media", icon: "perm_media" },
	layout: { label: "Layout", sectionLabel: "Layout", icon: "view_column" },
	content: { label: "Content", sectionLabel: "Content", icon: "dashboard_customize" },
};

export function AddBlockModal({
	open,
	onOpenChange,
	sectionId,
	sectionType,
	groupId,
	groupSlots,
}: AddBlockModalProps) {
	const addBlock = useEditorStore((s) => s.addBlock);
	const registry = SECTION_REGISTRY[sectionType];
	const allowedTypes = registry?.allowedBlockTypes || [];
	const [selectedSlot, setSelectedSlot] = useState(groupSlots[0] || "main");
	const [addAsAbsolute, setAddAsAbsolute] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState<BlockType | null>(null);
	const [activeCategory, setActiveCategory] = useState<BlockCategory | "all">("all");

	const targetSlot = useMemo(() => {
		if (groupSlots.includes(selectedSlot)) return selectedSlot;
		return groupSlots[0] || "main";
	}, [groupSlots, selectedSlot]);

	const allowedBlocks = useMemo(
		() =>
			allowedTypes.reduce<
				{ type: BlockType; label: string; icon: string; category: BlockCategory }[]
			>((acc, type) => {
				const entry = BLOCK_REGISTRY[type];
				if (!entry) return acc;

				acc.push({
					type,
					label: entry.label,
					icon: entry.icon,
					category: entry.category,
				});
				return acc;
			}, []),
		[allowedTypes],
	);

	const normalizedQuery = searchQuery.trim().toLowerCase();

	const filteredBlocks = useMemo(() => {
		if (!normalizedQuery) return allowedBlocks;

		return allowedBlocks.filter((block) => {
			const categoryLabel = BLOCK_CATEGORY_META[block.category].label.toLowerCase();
			return (
				block.label.toLowerCase().includes(normalizedQuery) ||
				categoryLabel.includes(normalizedQuery)
			);
		});
	}, [allowedBlocks, normalizedQuery]);

	const groupedBlocks = useMemo(() => {
		const grouped: Record<BlockCategory, { type: BlockType; label: string; icon: string }[]> = {
			basic: [],
			media: [],
			layout: [],
			content: [],
		};

		filteredBlocks.forEach((block) => {
			grouped[block.category].push({
				type: block.type,
				label: block.label,
				icon: block.icon,
			});
		});

		return grouped;
	}, [filteredBlocks]);

	const categoryCounts = useMemo(
		() =>
			BLOCK_CATEGORY_ORDER.reduce(
				(acc, category) => {
					acc[category] = groupedBlocks[category].length;
					return acc;
				},
				{} as Record<BlockCategory, number>,
			),
		[groupedBlocks],
	);

	const visibleCategories = useMemo(
		() => BLOCK_CATEGORY_ORDER.filter((category) => categoryCounts[category] > 0),
		[categoryCounts],
	);

	const displayCategories =
		activeCategory === "all"
			? visibleCategories
			: visibleCategories.filter((category) => category === activeCategory);

	const displayBlockTypes = useMemo(
		() =>
			displayCategories.flatMap((category) =>
				groupedBlocks[category].map((block) => block.type),
			),
		[displayCategories, groupedBlocks],
	);

	useEffect(() => {
		if (!open) return;
		setSelectedSlot((prev) => (groupSlots.includes(prev) ? prev : groupSlots[0] || "main"));
		setAddAsAbsolute(false);
		setSearchQuery("");
		setSelectedType(null);
		setActiveCategory("all");
	}, [open, groupSlots]);

	useEffect(() => {
		if (activeCategory === "all") return;
		if (categoryCounts[activeCategory] > 0) return;
		setActiveCategory("all");
	}, [activeCategory, categoryCounts]);

	useEffect(() => {
		if (!selectedType) return;
		if (displayBlockTypes.includes(selectedType)) return;
		setSelectedType(null);
	}, [displayBlockTypes, selectedType]);

	const handleAdd = (type: BlockType) => {
		addBlock(sectionId, groupId, type, targetSlot, { addAsAbsolute });
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
									Add New Block
								</DialogTitle>
								<p className="mt-1 text-sm text-muted-foreground">
									Choose a block and insert it into the selected group.
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
										placeholder="Search elements..."
										className="h-10 w-full rounded-xl border border-border bg-input pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
									/>
								</div>
								<button
									type="button"
									onClick={() => onOpenChange(false)}
									className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
									aria-label="Close add block modal">
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
						<aside className="w-full border-b border-border p-4 md:w-56 md:border-b-0 md:border-r">
							<div className="mb-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground/80 uppercase">
								Elements
							</div>

							<div className="minimal-scrollbar flex gap-1.5 overflow-x-auto md:block md:space-y-1.5">
								<CategoryButton
									label="All"
									icon="apps"
									count={filteredBlocks.length}
									isActive={activeCategory === "all"}
									onClick={() => setActiveCategory("all")}
								/>

								{BLOCK_CATEGORY_ORDER.map((category) => {
									const meta = BLOCK_CATEGORY_META[category];
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
							<div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-3 sm:px-5">
								{groupSlots.length > 1 && (
									<div className="flex flex-wrap items-center gap-1.5">
										<span className="text-xs font-medium text-muted-foreground">
											Column
										</span>
										{groupSlots.map((slot) => {
											const isActive = slot === targetSlot;
											return (
												<button
													key={slot}
													type="button"
													onClick={() => setSelectedSlot(slot)}
													className={cn(
														"rounded-lg border px-2 py-1.5 text-[11px] transition-colors",
														isActive
															? "border-primary bg-primary/10 text-primary"
															: "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
													)}>
													{formatSlotLabel(slot)}
												</button>
											);
										})}
									</div>
								)}

								<button
									type="button"
									onClick={() => setAddAsAbsolute((prev) => !prev)}
									className={cn(
										"ml-auto flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors",
										addAsAbsolute
											? "border-primary bg-primary/10 text-primary"
											: "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
									)}>
									<span
										className="material-symbols-outlined"
										style={{ fontSize: 14 }}>
										{addAsAbsolute ? "check_circle" : "radio_button_unchecked"}
									</span>
									Add as absolute block
								</button>
							</div>

							<div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
								{displayCategories.length === 0 && (
									<div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10">
										<div className="text-center">
											<div className="text-sm font-medium text-foreground">
												No blocks found
											</div>
											<div className="text-xs text-muted-foreground">
												Try a different search term.
											</div>
										</div>
									</div>
								)}

								{displayCategories.map((category) => (
									<section key={category} className="mb-6 last:mb-0">
										<h3 className="mb-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
											{BLOCK_CATEGORY_META[category].sectionLabel}
										</h3>

										<div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
											{groupedBlocks[category].map((block) => {
												const isSelected = block.type === selectedType;
												return (
													<button
														key={block.type}
														type="button"
														onClick={() => setSelectedType(block.type)}
														className={cn(
															"group flex min-h-[124px] flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition-colors",
															isSelected
																? "border-primary/80 bg-primary/10"
																: "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
														)}>
														<div
															className={cn(
																"flex size-11 items-center justify-center rounded-xl",
																isSelected
																	? "bg-primary/20 text-primary"
																	: "bg-muted/60 text-muted-foreground group-hover:text-foreground",
															)}>
															<span
																className="material-symbols-outlined"
																style={{ fontSize: 20 }}>
																{block.icon}
															</span>
														</div>
														<span className="text-sm font-medium text-foreground">
															{block.label}
														</span>
													</button>
												);
											})}
										</div>
									</section>
								))}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-2 border-t border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
						<div className="text-xs text-muted-foreground">Press Esc to cancel</div>
						<div className="flex items-center gap-2 self-end sm:self-auto">
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted/30">
								Cancel
							</button>
							<button
								type="button"
								onClick={() => selectedType && handleAdd(selectedType)}
								disabled={!selectedType}
								className={cn(
									"flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
									selectedType
										? "bg-primary text-primary-foreground hover:bg-primary/90"
										: "cursor-not-allowed bg-muted text-muted-foreground",
								)}>
								<span
									className="material-symbols-outlined"
									style={{ fontSize: 16 }}>
									add
								</span>
								Insert Block
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
				"flex min-w-[120px] shrink-0 items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors md:min-w-0 md:w-full",
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

function formatSlotLabel(slot: string): string {
	if (slot === "main") return "Main";
	if (slot === "left") return "Left";
	if (slot === "right") return "Right";
	const colMatch = /^col-(\d+)$/.exec(slot);
	if (colMatch) return `Column ${colMatch[1]}`;
	return slot.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
