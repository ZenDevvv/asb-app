import { useMemo, useState } from "react";
import { ChevronLeft, Copy, Trash2 } from "lucide-react";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { FontFamilyModal } from "~/editor/FontFamilyModal";
import { cn } from "~/lib/utils";
import { useDisplayStore, type CMSBlock } from "~/stores/displayStore";
import type { Block, BlockStyle } from "~/types/editor";
import { CollapsiblePanel } from "~/editor/block-settings/CollapsiblePanel";
import { ColorsPanel } from "~/editor/block-settings/ColorsPanel";
import { ContentPanel } from "~/editor/block-settings/ContentPanel";
import { SpacingPanel } from "~/editor/block-settings/SpacingPanel";
import { StylePanel } from "~/editor/block-settings/StylePanel";
import { VariantPanel } from "~/editor/block-settings/VariantPanel";

interface CMSBlockSettingsProps {
	block: CMSBlock;
	className?: string;
}

type FontModalTarget = "fontFamily" | "secondaryFontFamily";
type CMSContainerHorizontalAlignment = "left" | "center" | "right";
type CMSContainerVerticalAlignment = "top" | "middle" | "bottom";

const HORIZONTAL_ALIGNMENT_OPTIONS: Array<{
	value: CMSContainerHorizontalAlignment;
	label: string;
	icon: string;
}> = [
	{ value: "left", label: "Left", icon: "format_align_left" },
	{ value: "center", label: "Center", icon: "format_align_center" },
	{ value: "right", label: "Right", icon: "format_align_right" },
];

const VERTICAL_ALIGNMENT_OPTIONS: Array<{
	value: CMSContainerVerticalAlignment;
	label: string;
	icon: string;
}> = [
	{ value: "top", label: "Top", icon: "vertical_align_top" },
	{ value: "middle", label: "Middle", icon: "vertical_align_center" },
	{ value: "bottom", label: "Bottom", icon: "vertical_align_bottom" },
];

function getContainerHorizontalAlignment(block: CMSBlock): CMSContainerHorizontalAlignment {
	const value = block.props.containerHorizontalAlign;
	return value === "left" || value === "center" || value === "right" ? value : "left";
}

function getContainerVerticalAlignment(block: CMSBlock): CMSContainerVerticalAlignment {
	const value = block.props.containerVerticalAlign;
	return value === "top" || value === "middle" || value === "bottom" ? value : "top";
}

function toEditorBlock(block: CMSBlock): Block {
	return {
		id: block.id,
		type: block.type as Block["type"],
		slot: "main",
		order: 0,
		props: block.props,
		style: block.style as BlockStyle,
	};
}

function getNumber(value: unknown, fallback = 0): number {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function supportsTypographyOverride(type: CMSBlock["type"]): boolean {
	return (
		type === "heading" ||
		type === "text" ||
		type === "badge" ||
		type === "list" ||
		type === "quote" ||
		type === "card" ||
		type === "image" ||
		type === "video" ||
		type === "date" ||
		type === "countdown" ||
		type === "timeline"
	);
}

function usesSharedStylePanelTypography(type: CMSBlock["type"]): boolean {
	return (
		type === "heading" ||
		type === "text" ||
		type === "image" ||
		type === "video" ||
		type === "date" ||
		type === "countdown" ||
		type === "timeline"
	);
}

function CMSPositionPanel({
	block,
	onUpdate,
}: {
	block: CMSBlock;
	onUpdate: (patch: {
		props?: Record<string, unknown>;
		style?: Partial<BlockStyle>;
		x?: number;
		y?: number;
		w?: number;
		h?: number;
	}) => void;
}) {
	const blockRotation = getNumber(block.style.tilt, 0);
	const horizontalContentAlignment = getContainerHorizontalAlignment(block);
	const verticalContentAlignment = getContainerVerticalAlignment(block);
	const showContainerAlignmentControls = block.type !== "image" && block.type !== "video";

	return (
		<CollapsiblePanel title="Position" defaultOpen={false}>
			<div className="space-y-3">
				<div className="space-y-1.5">
					<span className="text-xs text-muted-foreground">X ({block.x.toFixed(1)}%)</span>
					<Slider
						min={-200}
						max={200}
						step={0.5}
						value={[block.x]}
						onValueChange={(value) => onUpdate({ x: value[0] ?? block.x })}
					/>
				</div>

				<div className="space-y-1.5">
					<span className="text-xs text-muted-foreground">Y ({block.y.toFixed(1)}%)</span>
					<Slider
						min={-200}
						max={200}
						step={0.5}
						value={[block.y]}
						onValueChange={(value) => onUpdate({ y: value[0] ?? block.y })}
					/>
				</div>

				{showContainerAlignmentControls ? (
					<>
						<div className="space-y-1.5">
							<span className="text-xs text-muted-foreground">
								Container Horizontal Align
							</span>
							<div className="grid grid-cols-3 gap-2">
								{HORIZONTAL_ALIGNMENT_OPTIONS.map((option) => {
									const isActive = horizontalContentAlignment === option.value;
									return (
										<Button
											key={option.value}
											type="button"
											size="sm"
											variant={isActive ? "default" : "outline"}
											aria-label={`Align content ${option.label.toLowerCase()}`}
											title={option.label}
											onClick={() =>
												onUpdate({
													props: {
														containerHorizontalAlign: option.value,
													},
												})
											}
											className="h-8 px-0">
											<span
												className="material-symbols-outlined"
												style={{ fontSize: 18 }}>
												{option.icon}
											</span>
										</Button>
									);
								})}
							</div>
						</div>

						<div className="space-y-1.5">
							<span className="text-xs text-muted-foreground">
								Container Vertical Align
							</span>
							<div className="grid grid-cols-3 gap-2">
								{VERTICAL_ALIGNMENT_OPTIONS.map((option) => {
									const isActive = verticalContentAlignment === option.value;
									return (
										<Button
											key={option.value}
											type="button"
											size="sm"
											variant={isActive ? "default" : "outline"}
											aria-label={`Align content ${option.label.toLowerCase()}`}
											title={option.label}
											onClick={() =>
												onUpdate({
													props: { containerVerticalAlign: option.value },
												})
											}
											className="h-8 px-0">
											<span
												className="material-symbols-outlined"
												style={{ fontSize: 18 }}>
												{option.icon}
											</span>
										</Button>
									);
								})}
							</div>
						</div>
					</>
				) : null}

				<div className="space-y-1.5">
					<span className="text-xs text-muted-foreground">
						Width ({block.w.toFixed(1)}%)
					</span>
					<Slider
						min={8}
						max={100}
						step={0.5}
						value={[block.w]}
						onValueChange={(value) => onUpdate({ w: value[0] ?? block.w })}
					/>
				</div>

				<div className="space-y-1.5">
					<span className="text-xs text-muted-foreground">
						Height ({block.h.toFixed(1)}%)
					</span>
					<Slider
						min={6}
						max={100}
						step={0.5}
						value={[block.h]}
						onValueChange={(value) => onUpdate({ h: value[0] ?? block.h })}
					/>
				</div>

				<div className="space-y-1.5">
					<span className="text-xs text-muted-foreground">
						Rotation ({Math.round(blockRotation)}deg)
					</span>
					<Slider
						min={-180}
						max={180}
						step={1}
						value={[blockRotation]}
						onValueChange={(value) =>
							onUpdate({ style: { tilt: value[0] ?? blockRotation } })
						}
					/>
				</div>
			</div>
		</CollapsiblePanel>
	);
}

export function CMSBlockSettings({ block, className }: CMSBlockSettingsProps) {
	const updateBlock = useDisplayStore((state) => state.updateBlock);
	const duplicateBlock = useDisplayStore((state) => state.duplicateBlock);
	const removeBlock = useDisplayStore((state) => state.removeBlock);
	const selectBlock = useDisplayStore((state) => state.selectBlock);
	const globalStyle = useDisplayStore((state) => state.globalStyle);
	const entry = BLOCK_REGISTRY[block.type];
	const [fontModalOpen, setFontModalOpen] = useState(false);
	const [fontModalTarget, setFontModalTarget] = useState<FontModalTarget>("fontFamily");

	const editorBlock = useMemo(() => toEditorBlock(block), [block]);
	const isMediaVisualBlock = block.type === "image" || block.type === "video";
	const styleFields = entry?.editableStyles ?? [];
	const visualStyles = isMediaVisualBlock
		? styleFields.filter((styleField) => styleField.group !== "caption")
		: styleFields;
	const captionStyles = isMediaVisualBlock
		? styleFields.filter((styleField) => styleField.group === "caption")
		: [];
	const supportsFontOverride = supportsTypographyOverride(block.type);
	const stylePanelSupportsFontOverride = usesSharedStylePanelTypography(block.type);
	const needsStandaloneFontPanel = supportsFontOverride && !stylePanelSupportsFontOverride;
	const effectiveFontValue =
		(fontModalTarget === "secondaryFontFamily"
			? (block.style.secondaryFontFamily as string | undefined)
			: (block.style.fontFamily as string | undefined)) || globalStyle.fontFamily;
	const fontModalDescription =
		block.type === "timeline"
			? fontModalTarget === "secondaryFontFamily"
				? "Choose a font for subtitle and description text in this timeline block."
				: "Choose a font for title text in this timeline block."
			: "Choose a font for this block.";

	if (!entry) return null;

	const handlePropChange = (key: string, value: unknown) => {
		updateBlock(block.id, { props: { [key]: value } });
	};

	const handleStyleChange = (style: Partial<BlockStyle>) => {
		updateBlock(block.id, { style });
	};

	const openFontModal = (target: FontModalTarget) => {
		setFontModalTarget(target);
		setFontModalOpen(true);
	};

	return (
		<section className={cn("flex h-full flex-col", className)}>
			<div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
				<div className="flex min-w-0 items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => selectBlock(null)}
						className="h-8 w-8 shrink-0 p-0"
						aria-label="Back to CMS Library">
						<ChevronLeft className="h-3.5 w-3.5" />
					</Button>
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-sidebar-foreground">
							{entry.label} Settings
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Editing block #{block.id.slice(0, 6)}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => duplicateBlock(block.id)}
						className="h-8 w-8 p-0"
						aria-label="Duplicate block"
						title="Duplicate block">
						<Copy className="h-3.5 w-3.5" />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => removeBlock(block.id)}
						className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
						aria-label="Delete block"
						title="Delete block">
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>

			<div className="minimal-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-3">
				<VariantPanel
					variantConfig={entry.variantConfig}
					blockProps={editorBlock.props}
					onPropChange={handlePropChange}
				/>

				{needsStandaloneFontPanel ? (
					<CollapsiblePanel title="Typography" defaultOpen>
						<button
							type="button"
							onClick={() => openFontModal("fontFamily")}
							className="group flex w-full items-center justify-between rounded-xl border border-border bg-input/50 px-3 py-2 text-left transition-colors hover:border-primary/40">
							<div>
								<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
									Font Family
								</p>
								<p
									className="text-sm text-foreground"
									style={{ fontFamily: effectiveFontValue }}>
									{effectiveFontValue}
								</p>
							</div>
							<span
								className="material-symbols-outlined text-muted-foreground transition-colors group-hover:text-foreground"
								style={{ fontSize: 18 }}>
								tune
							</span>
						</button>
					</CollapsiblePanel>
				) : null}

				<ContentPanel
					editableProps={entry.editableProps}
					blockProps={editorBlock.props}
					onPropChange={handlePropChange}
				/>

				{isMediaVisualBlock ? (
					<>
						<StylePanel
							block={editorBlock}
							editableStyles={visualStyles}
							defaultStyle={entry.defaultStyle}
							globalFontFamily={globalStyle.fontFamily}
							globalBorderRadius={globalStyle.borderRadius}
							showFontOverride={false}
							onStyleChange={handleStyleChange}
							onOpenFontModal={openFontModal}
						/>
						{captionStyles.length > 0 ? (
							<StylePanel
								block={editorBlock}
								editableStyles={captionStyles}
								defaultStyle={entry.defaultStyle}
								globalFontFamily={globalStyle.fontFamily}
								globalBorderRadius={globalStyle.borderRadius}
								title="Caption"
								defaultOpen={false}
								onStyleChange={handleStyleChange}
								onOpenFontModal={openFontModal}
							/>
						) : null}
					</>
				) : (
					<StylePanel
						block={editorBlock}
						editableStyles={visualStyles}
						defaultStyle={entry.defaultStyle}
						globalFontFamily={globalStyle.fontFamily}
						globalBorderRadius={globalStyle.borderRadius}
						onStyleChange={handleStyleChange}
						onOpenFontModal={openFontModal}
					/>
				)}

				<ColorsPanel
					block={editorBlock}
					colorOptions={entry.colorOptions}
					globalStyle={globalStyle}
					onStyleChange={handleStyleChange}
				/>

				<SpacingPanel blockStyle={editorBlock.style} onStyleChange={handleStyleChange} />

				<CMSPositionPanel block={block} onUpdate={updateBlock.bind(null, block.id)} />
			</div>

			{supportsFontOverride ? (
				<FontFamilyModal
					open={fontModalOpen}
					onOpenChange={setFontModalOpen}
					value={effectiveFontValue}
					onApply={(fontFamily) =>
						handleStyleChange({
							[fontModalTarget]:
								fontFamily === globalStyle.fontFamily ? "" : fontFamily,
						} as Partial<BlockStyle>)
					}
					title="Typography Settings"
					description={fontModalDescription}
					applyLabel="Apply Font"
				/>
			) : null}
		</section>
	);
}
