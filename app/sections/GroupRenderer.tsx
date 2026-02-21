import { useEffect, useMemo, useRef, useState } from "react";
import { BlockRenderer } from "~/blocks/BlockRenderer";
import { hexToRgba } from "~/lib/colorSystem";
import type {
	Block,
	BlockStyle,
	GlobalStyle,
	Group,
	LayoutTemplate,
	Section,
} from "~/types/editor";

interface GroupRendererProps {
	section: Section;
	group: Group;
	globalStyle: GlobalStyle;
	isEditing: boolean;
	isGroupSelected: boolean;
	selectedBlockId: string | null;
	onGroupClick?: () => void;
	onBlockClick?: (blockId: string) => void;
	onUpdateBlockProp?: (blockId: string, key: string, value: unknown) => void;
	onUpdateBlockStyle?: (blockId: string, style: Partial<BlockStyle>) => void;
}

function isAbsoluteBlock(block: Block): boolean {
	return block.style.positionMode === "absolute";
}

function groupBlocksBySlot(blocks: Block[] | undefined): Record<string, Block[]> {
	const groups: Record<string, Block[]> = {};
	if (!blocks || !Array.isArray(blocks)) return groups;
	for (const block of blocks) {
		if (isAbsoluteBlock(block)) continue;
		if (!groups[block.slot]) {
			groups[block.slot] = [];
		}
		groups[block.slot].push(block);
	}
	for (const slot of Object.keys(groups)) {
		groups[slot].sort((a, b) => a.order - b.order);
	}
	return groups;
}

function getLayoutGridClasses(layout: LayoutTemplate): string {
	const base = "grid w-full gap-8";
	const alignment =
		layout.alignment === "center"
			? "items-center"
			: layout.alignment === "bottom"
				? "items-end"
				: "items-start";
	return `${base} ${alignment}`;
}

const SURFACE_BORDER_RADIUS_MAP: Record<string, number> = { none: 0, sm: 8, md: 12, lg: 16 };
const GAP_MAP: Record<string, string> = { sm: "4px", md: "12px", lg: "24px", xl: "40px" };

function getGroupContainerStyle(
	group: Group,
	themeMode: GlobalStyle["themeMode"],
	accentColor: string,
): React.CSSProperties {
	const surface = group.style?.surface ?? "none";
	const isActive = surface !== "none";
	const isDark = themeMode !== "light";
	const innerPadding = isActive ? 24 : 0;
	const borderRadius = isActive
		? (SURFACE_BORDER_RADIUS_MAP[group.style?.borderRadius ?? "md"] ?? 12)
		: 4;

	const style: React.CSSProperties = {
		paddingTop: (group.style?.paddingTop ?? 0) + innerPadding,
		paddingBottom: (group.style?.paddingBottom ?? 0) + innerPadding,
		borderRadius,
		...(isActive ? { paddingLeft: innerPadding, paddingRight: innerPadding } : {}),
	};

	if (!isActive) return style;

	if (surface === "card") {
		style.backgroundColor = hexToRgba(accentColor, isDark ? 0.12 : 0.11);
		style.border = `1px solid ${hexToRgba(accentColor, isDark ? 0.3 : 0.24)}`;
	} else if (surface === "glass") {
		style.backgroundColor = hexToRgba(accentColor, isDark ? 0.18 : 0.2);
		style.backdropFilter = "blur(12px)";
		(style as Record<string, unknown>).WebkitBackdropFilter = "blur(12px)";
		style.border = `1px solid ${hexToRgba(accentColor, isDark ? 0.34 : 0.26)}`;
	} else if (surface === "bordered") {
		style.border = `1px solid ${hexToRgba(accentColor, isDark ? 0.36 : 0.28)}`;
	}

	return style;
}

export function GroupRenderer({
	section,
	group,
	globalStyle,
	isEditing,
	isGroupSelected,
	selectedBlockId,
	onGroupClick,
	onBlockClick,
	onUpdateBlockProp,
	onUpdateBlockStyle,
}: GroupRendererProps) {
	const layout = group.layout;
	const blocksBySlot = useMemo(() => groupBlocksBySlot(group.blocks), [group.blocks]);
	const absoluteBlocks = useMemo(
		() =>
			group.blocks
				.filter((block) => isAbsoluteBlock(block))
				.sort((a, b) => {
					const zA = a.style.zIndex ?? 20;
					const zB = b.style.zIndex ?? 20;
					if (zA !== zB) return zA - zB;
					return a.order - b.order;
				}),
		[group.blocks],
	);
	const sectionContentRef = useRef<HTMLDivElement | null>(null);
	const [draggingAbsoluteBlockId, setDraggingAbsoluteBlockId] = useState<string | null>(null);
	const [absoluteMinWidthByBlockId, setAbsoluteMinWidthByBlockId] = useState<
		Record<string, number>
	>({});
	const dragStateRef = useRef<{
		blockId: string;
		offsetX: number;
		offsetY: number;
		lastX: number;
		lastY: number;
	} | null>(null);
	const isDraggingAbsoluteBlock = draggingAbsoluteBlockId !== null;
	const gridClasses = getLayoutGridClasses(layout);
	const sectionAccent = section.style.accentColor || globalStyle.primaryColor;
	const containerStyle = getGroupContainerStyle(group, globalStyle.themeMode, sectionAccent);
	const slotGap = GAP_MAP[group.style?.gap ?? ""] ?? "0px";

	useEffect(() => {
		if (!isEditing || !onUpdateBlockStyle) return;

		const handlePointerMove = (event: PointerEvent) => {
			const dragState = dragStateRef.current;
			const container = sectionContentRef.current;
			if (!dragState || !container) return;

			const rect = container.getBoundingClientRect();
			const positionX = Math.round(event.clientX - rect.left - dragState.offsetX);
			const positionY = Math.round(event.clientY - rect.top - dragState.offsetY);
			if (positionX === dragState.lastX && positionY === dragState.lastY) return;
			dragState.lastX = positionX;
			dragState.lastY = positionY;

			onUpdateBlockStyle(dragState.blockId, {
				positionX,
				positionY,
			});
		};

		const commitFinalDragPosition = (event: PointerEvent) => {
			const dragState = dragStateRef.current;
			const container = sectionContentRef.current;
			if (!dragState || !container) return;

			const rect = container.getBoundingClientRect();
			const positionX = Math.round(event.clientX - rect.left - dragState.offsetX);
			const positionY = Math.round(event.clientY - rect.top - dragState.offsetY);
			if (positionX === dragState.lastX && positionY === dragState.lastY) return;

			onUpdateBlockStyle(dragState.blockId, {
				positionX,
				positionY,
			});
		};

		const handlePointerUp = (event: PointerEvent) => {
			commitFinalDragPosition(event);
			dragStateRef.current = null;
			setDraggingAbsoluteBlockId(null);
		};

		const handlePointerCancel = () => {
			dragStateRef.current = null;
			setDraggingAbsoluteBlockId(null);
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("pointercancel", handlePointerCancel);

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("pointercancel", handlePointerCancel);
		};
	}, [isEditing, onUpdateBlockStyle]);

	useEffect(() => {
		if (!isDraggingAbsoluteBlock) return;

		const originalUserSelect = document.body.style.userSelect;
		const originalWebkitUserSelect =
			document.body.style.getPropertyValue("-webkit-user-select");

		document.body.style.userSelect = "none";
		document.body.style.setProperty("-webkit-user-select", "none");

		return () => {
			document.body.style.userSelect = originalUserSelect;
			if (originalWebkitUserSelect) {
				document.body.style.setProperty("-webkit-user-select", originalWebkitUserSelect);
			} else {
				document.body.style.removeProperty("-webkit-user-select");
			}
		};
	}, [isDraggingAbsoluteBlock]);

	return (
		<div
			className={`relative transition-colors ${isEditing ? "cursor-pointer" : ""} ${
				isGroupSelected
					? "ring-1 ring-primary/60 ring-offset-1 ring-offset-transparent"
					: ""
			}`}
			style={containerStyle}
			onClick={(e) => {
				if (isEditing && onGroupClick) {
					e.stopPropagation();
					onGroupClick();
				}
			}}>
			{isEditing && isGroupSelected && (
				<div className="pointer-events-none absolute -top-2 left-3 z-[2] rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground shadow">
					Group
				</div>
			)}

			<div ref={sectionContentRef} className="relative">
				<div
					className={`${gridClasses} ${isDraggingAbsoluteBlock ? "pointer-events-none" : ""}`}
					style={{
						gridTemplateColumns: layout.spans.map((s) => `${s}fr`).join(" "),
						direction: layout.reversed ? "rtl" : "ltr",
					}}>
					{layout.slots.map((slotName) => (
						<div
							key={slotName}
							className="flex flex-col"
							style={{ direction: "ltr", gap: slotGap }}>
							{blocksBySlot[slotName]?.map((block) => {
								const isBlockSelected = block.id === selectedBlockId;

								return (
									<div
										key={block.id}
										className={`relative transition-all ${
											isEditing ? "cursor-pointer" : ""
										} ${
											isBlockSelected
												? "ring-2 ring-primary/60 ring-offset-1 ring-offset-transparent rounded-md"
												: isEditing && !isDraggingAbsoluteBlock
													? "hover:ring-1 hover:ring-primary/20 rounded-md"
													: ""
										}`}
										onClick={(e) => {
											if (isEditing && onBlockClick) {
												e.stopPropagation();
												onBlockClick(block.id);
											}
										}}>
										<BlockRenderer
											block={block}
											sectionStyle={section.style}
											globalStyle={globalStyle}
											isEditing={isEditing}
											isSelected={isBlockSelected}
											onUpdateProp={(key, value) =>
												onUpdateBlockProp?.(block.id, key, value)
											}
										/>
									</div>
								);
							})}

							{isEditing &&
								(!blocksBySlot[slotName] ||
									blocksBySlot[slotName].length === 0) && (
									<div className="flex min-h-[60px] items-center justify-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground/70">
										{slotName}
									</div>
								)}
						</div>
					))}
				</div>

				{absoluteBlocks.map((block) => {
					const isBlockSelected = block.id === selectedBlockId;
					const positionX = block.style.positionX ?? 0;
					const positionY = block.style.positionY ?? 0;
					const zIndex = block.style.zIndex ?? 20;
					const absoluteScale = block.style.scale ?? 100;

					return (
						<div
							key={block.id}
							className={`absolute transition-all ${
								isEditing ? "cursor-grab active:cursor-grabbing touch-none" : ""
							} ${
								isDraggingAbsoluteBlock && draggingAbsoluteBlockId !== block.id
									? "pointer-events-none"
									: ""
							} ${
								isBlockSelected
									? "ring-2 ring-primary/60 ring-offset-1 ring-offset-transparent rounded-md"
									: isEditing && !isDraggingAbsoluteBlock
										? "hover:ring-1 hover:ring-primary/20 rounded-md"
										: ""
							}`}
							style={{
								left: positionX,
								top: positionY,
								zIndex,
								transform: `scale(${absoluteScale / 100})`,
								transformOrigin: "top left",
								minWidth: absoluteMinWidthByBlockId[block.id]
									? `${absoluteMinWidthByBlockId[block.id]}px`
									: undefined,
							}}
							onPointerDown={(event) => {
								if (!isEditing || !onUpdateBlockStyle) return;
								event.preventDefault();
								event.stopPropagation();
								event.currentTarget.setPointerCapture(event.pointerId);

								const measuredWidth = event.currentTarget.offsetWidth;
								if (measuredWidth > 0) {
									setAbsoluteMinWidthByBlockId((prev) => {
										if (prev[block.id] === measuredWidth) return prev;
										return { ...prev, [block.id]: measuredWidth };
									});
								}

								const container = sectionContentRef.current;
								if (!container) return;

								const rect = container.getBoundingClientRect();
								dragStateRef.current = {
									blockId: block.id,
									offsetX: event.clientX - rect.left - positionX,
									offsetY: event.clientY - rect.top - positionY,
									lastX: positionX,
									lastY: positionY,
								};
								setDraggingAbsoluteBlockId(block.id);
							}}
							onClick={(e) => {
								if (isEditing && onBlockClick) {
									e.stopPropagation();
									onBlockClick(block.id);
								}
							}}>
							{isBlockSelected && (
								<div className="pointer-events-none absolute -top-2 -right-2 z-[1] rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground shadow">
									Abs
								</div>
							)}
							<BlockRenderer
								block={block}
								sectionStyle={section.style}
								globalStyle={globalStyle}
								isEditing={isEditing}
								isSelected={isBlockSelected}
								onUpdateProp={(key, value) =>
									onUpdateBlockProp?.(block.id, key, value)
								}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
