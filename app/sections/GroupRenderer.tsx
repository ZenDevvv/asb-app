import { useEffect, useMemo, useRef, useState } from "react";
import { BlockRenderer } from "~/blocks/BlockRenderer";
import type { Block, BlockStyle, GlobalStyle, Group, LayoutTemplate, Section } from "~/types/editor";

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

function getLayoutGridClasses(layout: LayoutTemplate, sectionType: Section["type"]): string {
	const isNavbarLayout = sectionType === "navbar" || layout.id.startsWith("nav-");
	const base = isNavbarLayout ? "grid w-full gap-4" : "grid w-full gap-8";
	const alignment =
		layout.alignment === "center"
			? "items-center"
			: layout.alignment === "bottom"
				? "items-end"
				: "items-start";

	const direction = layout.direction === "row-reverse" ? "direction-rtl" : "";

	if (layout.columns === 1) {
		return `${base} grid-cols-1 ${alignment}`;
	}

	if (layout.columns === 2) {
		const colClass =
			layout.distribution === "60-40"
				? "grid-cols-[3fr_2fr]"
				: layout.distribution === "40-60"
					? "grid-cols-[2fr_3fr]"
					: layout.distribution === "30-70"
						? "grid-cols-[3fr_7fr]"
						: layout.distribution === "70-30"
							? "grid-cols-[7fr_3fr]"
							: "grid-cols-2";
		return `${base} ${colClass} ${alignment} ${direction}`;
	}

	if (layout.columns === 3) {
		if (layout.distribution === "25-50-25") {
			return `${base} grid-cols-[1fr_2fr_1fr] ${alignment}`;
		}
		if (layout.distribution === "20-60-20") {
			return `${base} grid-cols-[1fr_3fr_1fr] ${alignment}`;
		}
		return `${base} grid-cols-3 ${alignment}`;
	}

	return `${base} grid-cols-1`;
}

function getGroupPadding(group: Group): React.CSSProperties {
	return {
		paddingTop: group.style?.paddingTop ?? 0,
		paddingBottom: group.style?.paddingBottom ?? 0,
	};
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
	const isNavbar = section.type === "navbar" || layout.id.startsWith("nav-");
	const gridClasses = getLayoutGridClasses(layout, section.type);
	const groupPadding = getGroupPadding(group);

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
			className={`relative rounded-md transition-colors ${isEditing ? "cursor-pointer" : ""} ${
				isGroupSelected ? "ring-1 ring-primary/60 ring-offset-1 ring-offset-transparent" : ""
			}`}
			style={groupPadding}
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
						direction: layout.direction === "row-reverse" ? "rtl" : "ltr",
					}}>
					{layout.slots.map((slotName) => (
						<div key={slotName} className="flex flex-col" style={{ direction: "ltr" }}>
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
											onUpdateProp={(key, value) => onUpdateBlockProp?.(block.id, key, value)}
										/>
									</div>
								);
							})}

							{isEditing &&
								(!blocksBySlot[slotName] || blocksBySlot[slotName].length === 0) && (
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
								onUpdateProp={(key, value) => onUpdateBlockProp?.(block.id, key, value)}
							/>
						</div>
					);
				})}
			</div>

			{isEditing && isNavbar && (
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/60" />
			)}
		</div>
	);
}
