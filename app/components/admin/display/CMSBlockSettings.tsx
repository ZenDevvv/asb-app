import { useState } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { Textarea } from "~/components/ui/textarea";
import { FontFamilyModal } from "~/editor/FontFamilyModal";
import { resolveFontOption } from "~/editor/fontFamilyOptions";
import { cn } from "~/lib/utils";
import { useDisplayStore, type CMSBlock } from "~/stores/displayStore";
import type { BlockStyle } from "~/types/editor";

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

function getString(value: unknown, fallback = ""): string {
	return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback = 0): number {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function listItemsToText(value: unknown): string {
	if (!Array.isArray(value)) return "";
	return value
		.map((entry) => {
			if (!entry || typeof entry !== "object") return "";
			const textValue = (entry as { text?: unknown }).text;
			return typeof textValue === "string" ? textValue : "";
		})
		.filter((entry) => entry.trim().length > 0)
		.join("\n");
}

function textToListItems(value: string): Array<{ text: string }> {
	return value
		.split(/\r?\n/g)
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => ({ text: line }));
}

function timelineItemsToLines(value: unknown): string {
	if (!Array.isArray(value)) return "";

	return value
		.map((entry) => {
			if (!entry || typeof entry !== "object") return "";
			const item = entry as {
				title?: unknown;
				subtitle?: unknown;
				description?: unknown;
				icon?: unknown;
			};
			const title = typeof item.title === "string" ? item.title : "";
			const subtitle = typeof item.subtitle === "string" ? item.subtitle : "";
			const description = typeof item.description === "string" ? item.description : "";
			const icon = typeof item.icon === "string" ? item.icon : "schedule";
			return [title, subtitle, description, icon].join("|");
		})
		.filter((line) => line.trim().length > 0)
		.join("\n");
}

function linesToTimelineItems(value: string): Array<{
	title: string;
	subtitle: string;
	description: string;
	icon: string;
}> {
	return value
		.split(/\r?\n/g)
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line, index) => {
			const [title, subtitle, description, icon] = line
				.split("|")
				.map((segment) => segment.trim());
			return {
				title: title || `Timeline Item ${index + 1}`,
				subtitle: subtitle || "",
				description: description || "",
				icon: icon || "schedule",
			};
		});
}

function supportsFontOverride(type: CMSBlock["type"]): boolean {
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

function getContainerHorizontalAlignment(value: unknown): CMSContainerHorizontalAlignment {
	return value === "left" || value === "center" || value === "right" ? value : "left";
}

function getContainerVerticalAlignment(value: unknown): CMSContainerVerticalAlignment {
	return value === "top" || value === "middle" || value === "bottom" ? value : "top";
}

function renderContentFields(
	block: CMSBlock,
	updateProps: (props: Record<string, unknown>) => void,
	updateStyle: (style: Partial<BlockStyle>) => void,
) {
	if (block.type === "heading" || block.type === "text" || block.type === "badge") {
		const text = getString(block.props.text, "");
		const fontSize = getNumber(block.style.fontSizePx, block.type === "heading" ? 64 : 24);
		const textColor = getString(block.style.textColor, "#ffffff");

		return (
			<>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Text</span>
					{block.type === "heading" ? (
						<Input
							value={text}
							onChange={(event) => updateProps({ text: event.target.value })}
							className="bg-background"
						/>
					) : (
						<Textarea
							value={text}
							onChange={(event) => updateProps({ text: event.target.value })}
							className="min-h-20 bg-background"
						/>
					)}
				</label>

				<div className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">
						Font Size ({Math.round(fontSize)}px)
					</span>
					<Slider
						min={12}
						max={180}
						step={1}
						value={[fontSize]}
						onValueChange={(value) =>
							updateStyle({
								fontSize: "custom",
								fontSizePx: value[0] ?? fontSize,
							})
						}
					/>
				</div>

				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Text Color</span>
					<input
						type="color"
						value={textColor}
						onChange={(event) =>
							updateStyle({
								colorMode: "custom",
								textColor: event.target.value,
							})
						}
						className="h-10 w-full cursor-pointer rounded-md border border-input bg-background p-1"
					/>
				</label>
			</>
		);
	}

	if (block.type === "image" || block.type === "video") {
		const src = getString(block.props.src, "");
		const caption = getString(block.props.caption, "");
		const opacity = getNumber(block.style.opacity, 100);

		return (
			<>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">
						{block.type === "image" ? "Image URL" : "Video URL"}
					</span>
					<Input
						value={src}
						onChange={(event) => updateProps({ src: event.target.value })}
						placeholder="https://..."
						className="bg-background"
					/>
				</label>

				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Caption</span>
					<Input
						value={caption}
						onChange={(event) => updateProps({ caption: event.target.value })}
						className="bg-background"
					/>
				</label>

				<div className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">
						Opacity ({Math.round(opacity)}%)
					</span>
					<Slider
						min={0}
						max={100}
						step={1}
						value={[opacity]}
						onValueChange={(value) => updateStyle({ opacity: value[0] ?? opacity })}
					/>
				</div>
			</>
		);
	}

	if (block.type === "quote") {
		return (
			<>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Quote</span>
					<Textarea
						value={getString(block.props.text, "")}
						onChange={(event) => updateProps({ text: event.target.value })}
						className="min-h-20 bg-background"
					/>
				</label>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Attribution</span>
					<Input
						value={getString(block.props.attribution, "")}
						onChange={(event) => updateProps({ attribution: event.target.value })}
						className="bg-background"
					/>
				</label>
			</>
		);
	}

	if (block.type === "list") {
		return (
			<label className="space-y-1.5">
				<span className="text-xs font-medium text-muted-foreground">
					List Items (one per line)
				</span>
				<Textarea
					value={listItemsToText(block.props.items)}
					onChange={(event) =>
						updateProps({ items: textToListItems(event.target.value) })
					}
					className="min-h-24 bg-background"
				/>
			</label>
		);
	}

	if (block.type === "card") {
		return (
			<>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Title</span>
					<Input
						value={getString(block.props.title, "")}
						onChange={(event) => updateProps({ title: event.target.value })}
						className="bg-background"
					/>
				</label>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Description</span>
					<Textarea
						value={getString(block.props.text, "")}
						onChange={(event) => updateProps({ text: event.target.value })}
						className="min-h-20 bg-background"
					/>
				</label>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Image URL</span>
					<Input
						value={getString(block.props.imageSrc, "")}
						onChange={(event) => updateProps({ imageSrc: event.target.value })}
						className="bg-background"
					/>
				</label>
			</>
		);
	}

	if (block.type === "icon") {
		return (
			<label className="space-y-1.5">
				<span className="text-xs font-medium text-muted-foreground">Icon Name</span>
				<Input
					value={getString(block.props.icon, "star")}
					onChange={(event) => updateProps({ icon: event.target.value })}
					className="bg-background"
				/>
			</label>
		);
	}

	if (block.type === "date" || block.type === "countdown") {
		return (
			<>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Date</span>
					<Input
						type="date"
						value={getString(block.props.eventDate, "")}
						onChange={(event) => updateProps({ eventDate: event.target.value })}
						className="bg-background"
					/>
				</label>
				<label className="space-y-1.5">
					<span className="text-xs font-medium text-muted-foreground">Time</span>
					<Input
						type="time"
						value={getString(block.props.eventTime, "")}
						onChange={(event) => updateProps({ eventTime: event.target.value })}
						className="bg-background"
					/>
				</label>
				{block.type === "countdown" ? (
					<div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
						<label className="inline-flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(block.props.showDays ?? true)}
								onChange={(event) =>
									updateProps({ showDays: event.target.checked })
								}
							/>
							Show Days
						</label>
						<label className="inline-flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(block.props.showHours ?? true)}
								onChange={(event) =>
									updateProps({ showHours: event.target.checked })
								}
							/>
							Show Hours
						</label>
						<label className="inline-flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(block.props.showMinutes ?? true)}
								onChange={(event) =>
									updateProps({ showMinutes: event.target.checked })
								}
							/>
							Show Minutes
						</label>
						<label className="inline-flex items-center gap-2">
							<input
								type="checkbox"
								checked={Boolean(block.props.showSeconds ?? false)}
								onChange={(event) =>
									updateProps({ showSeconds: event.target.checked })
								}
							/>
							Show Seconds
						</label>
					</div>
				) : null}
			</>
		);
	}

	if (block.type === "timeline") {
		return (
			<label className="space-y-1.5">
				<span className="text-xs font-medium text-muted-foreground">
					Timeline (title|subtitle|description|icon per line)
				</span>
				<Textarea
					value={timelineItemsToLines(block.props.timeline)}
					onChange={(event) =>
						updateProps({ timeline: linesToTimelineItems(event.target.value) })
					}
					className="min-h-28 bg-background"
				/>
			</label>
		);
	}

	if (block.type === "spacer") {
		const height = getNumber(block.style.height, 32);
		return (
			<div className="space-y-1.5">
				<span className="text-xs font-medium text-muted-foreground">
					Height ({Math.round(height)}px)
				</span>
				<Slider
					min={8}
					max={500}
					step={2}
					value={[height]}
					onValueChange={(value) => updateStyle({ height: value[0] ?? height })}
				/>
			</div>
		);
	}

	if (block.type === "divider") {
		const opacity = getNumber(block.style.opacity, 20);
		return (
			<div className="space-y-1.5">
				<span className="text-xs font-medium text-muted-foreground">
					Opacity ({Math.round(opacity)}%)
				</span>
				<Slider
					min={0}
					max={100}
					step={1}
					value={[opacity]}
					onValueChange={(value) => updateStyle({ opacity: value[0] ?? opacity })}
				/>
			</div>
		);
	}

	return (
		<p className="text-xs text-muted-foreground">No extra properties for this block type.</p>
	);
}

export function CMSBlockSettings({ block, className }: CMSBlockSettingsProps) {
	const updateBlock = useDisplayStore((state) => state.updateBlock);
	const removeBlock = useDisplayStore((state) => state.removeBlock);
	const selectBlock = useDisplayStore((state) => state.selectBlock);
	const globalStyle = useDisplayStore((state) => state.globalStyle);
	const entry = BLOCK_REGISTRY[block.type];
	const [fontModalOpen, setFontModalOpen] = useState(false);
	const [fontModalTarget, setFontModalTarget] = useState<FontModalTarget>("fontFamily");
	const showFontOverride = supportsFontOverride(block.type);
	const isTimelineBlock = block.type === "timeline";

	const getFontState = (styleKey: FontModalTarget) => {
		const raw = block.style[styleKey];
		const overrideValue = typeof raw === "string" ? raw.trim() : "";
		const hasOverride = overrideValue.length > 0 && overrideValue !== globalStyle.fontFamily;
		const effectiveValue = hasOverride ? overrideValue : globalStyle.fontFamily;
		return {
			hasOverride,
			selectedFont: resolveFontOption(effectiveValue),
		};
	};

	const primaryFontState = getFontState("fontFamily");
	const secondaryFontState = getFontState("secondaryFontFamily");
	const effectiveFontValue =
		(fontModalTarget === "secondaryFontFamily"
			? getString(block.style.secondaryFontFamily, "")
			: getString(block.style.fontFamily, "")) || globalStyle.fontFamily;
	const fontModalDescription = isTimelineBlock
		? fontModalTarget === "secondaryFontFamily"
			? "Choose a font for subtitle and description text in this timeline block."
			: "Choose a font for title text in this timeline block."
		: "Choose a font for this block.";
	const horizontalContentAlignment = getContainerHorizontalAlignment(
		block.props.containerHorizontalAlign,
	);
	const verticalContentAlignment = getContainerVerticalAlignment(
		block.props.containerVerticalAlign,
	);
	const blockRotation = getNumber(block.style.tilt, 0);

	const updateSelectedProps = (props: Record<string, unknown>) => {
		updateBlock(block.id, { props });
	};

	const updateSelectedStyle = (style: Partial<BlockStyle>) => {
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
				<Button
					type="button"
					variant="destructive"
					size="sm"
					onClick={() => removeBlock(block.id)}
					className="h-8 px-2.5">
					<Trash2 className="h-3.5 w-3.5" />
					Delete
				</Button>
			</div>

			<div className="minimal-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-3">
				{showFontOverride ? (
					<div className="space-y-2 rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
							Typography
						</p>
						<div className="space-y-1.5">
							<label className="text-xs text-muted-foreground">
								{isTimelineBlock ? "Title Font" : "Font Family"}
							</label>
							<button
								type="button"
								onClick={() => openFontModal("fontFamily")}
								className="group flex w-full items-center justify-between rounded-xl border border-sidebar-border bg-background/50 px-3 py-2 text-left transition-colors hover:border-primary/40">
								<div>
									<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
										{primaryFontState.hasOverride
											? "Block Override"
											: "Using Global"}
									</p>
									<p
										className="text-sm text-sidebar-foreground"
										style={{
											fontFamily: primaryFontState.selectedFont.fontFamily,
										}}>
										{primaryFontState.selectedFont.label}
									</p>
								</div>
								<span
									className="material-symbols-outlined text-muted-foreground transition-colors group-hover:text-foreground"
									style={{ fontSize: 18 }}>
									tune
								</span>
							</button>
						</div>
						{isTimelineBlock ? (
							<div className="space-y-1.5">
								<label className="text-xs text-muted-foreground">
									Subtitle + Description Font
								</label>
								<button
									type="button"
									onClick={() => openFontModal("secondaryFontFamily")}
									className="group flex w-full items-center justify-between rounded-xl border border-sidebar-border bg-background/50 px-3 py-2 text-left transition-colors hover:border-primary/40">
									<div>
										<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
											{secondaryFontState.hasOverride
												? "Block Override"
												: "Using Global"}
										</p>
										<p
											className="text-sm text-sidebar-foreground"
											style={{
												fontFamily:
													secondaryFontState.selectedFont.fontFamily,
											}}>
											{secondaryFontState.selectedFont.label}
										</p>
									</div>
									<span
										className="material-symbols-outlined text-muted-foreground transition-colors group-hover:text-foreground"
										style={{ fontSize: 18 }}>
										tune
									</span>
								</button>
							</div>
						) : null}
					</div>
				) : null}

				{renderContentFields(block, updateSelectedProps, updateSelectedStyle)}

				<div className="space-y-2 rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
					<p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
						Position
					</p>
					<div className="space-y-1.5">
						<span className="text-xs text-muted-foreground">
							X ({block.x.toFixed(1)}%)
						</span>
						<Slider
							min={-200}
							max={200}
							step={0.5}
							value={[block.x]}
							onValueChange={(value) =>
								updateBlock(block.id, {
									x: value[0] ?? block.x,
								})
							}
						/>
					</div>
					<div className="space-y-1.5">
						<span className="text-xs text-muted-foreground">
							Y ({block.y.toFixed(1)}%)
						</span>
						<Slider
							min={-200}
							max={200}
							step={0.5}
							value={[block.y]}
							onValueChange={(value) =>
								updateBlock(block.id, {
									y: value[0] ?? block.y,
								})
							}
						/>
					</div>
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
											updateBlock(block.id, {
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
											updateBlock(block.id, {
												props: {
													containerVerticalAlign: option.value,
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
							Width ({block.w.toFixed(1)}%)
						</span>
						<Slider
							min={8}
							max={100}
							step={0.5}
							value={[block.w]}
							onValueChange={(value) =>
								updateBlock(block.id, {
									w: value[0] ?? block.w,
								})
							}
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
							onValueChange={(value) =>
								updateBlock(block.id, {
									h: value[0] ?? block.h,
								})
							}
						/>
					</div>
					<div className="space-y-1.5">
						<span className="text-xs text-muted-foreground">
							Rotation ({Math.round(blockRotation)}°)
						</span>
						<Slider
							min={-180}
							max={180}
							step={1}
							value={[blockRotation]}
							onValueChange={(value) =>
								updateBlock(block.id, {
									style: {
										tilt: value[0] ?? blockRotation,
									},
								})
							}
						/>
					</div>
				</div>
			</div>

			{showFontOverride ? (
				<FontFamilyModal
					open={fontModalOpen}
					onOpenChange={setFontModalOpen}
					value={effectiveFontValue}
					onApply={(fontFamily) =>
						updateSelectedStyle({
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
