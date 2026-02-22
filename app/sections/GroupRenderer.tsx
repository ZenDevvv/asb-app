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
	onMoveBlockToSlot?: (blockId: string, slot: string) => void;
	onMoveBlockToSlotAtIndex?: (blockId: string, slot: string, targetIndex: number) => void;
}

interface FlowDropTarget {
	slot: string;
	targetIndex: number;
	lineTop: number;
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
	return "grid w-full gap-8 items-stretch";
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
	onMoveBlockToSlot,
	onMoveBlockToSlotAtIndex,
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
	const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const flowBlockRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const [draggingAbsoluteBlockId, setDraggingAbsoluteBlockId] = useState<string | null>(null);
	const [draggingFlowBlockId, setDraggingFlowBlockId] = useState<string | null>(null);
	const [flowDropTarget, setFlowDropTarget] = useState<FlowDropTarget | null>(null);
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
	const flowDragStateRef = useRef<{
		blockId: string;
		sourceSlot: string;
		startX: number;
		startY: number;
		isDragging: boolean;
	} | null>(null);
	const isDraggingAbsoluteBlock = draggingAbsoluteBlockId !== null;
	const isDraggingFlowBlock = draggingFlowBlockId !== null;
	const isDraggingBlock = isDraggingAbsoluteBlock || isDraggingFlowBlock;
	const hasSelectedBlockInGroup = Boolean(
		selectedBlockId && group.blocks.some((block) => block.id === selectedBlockId),
	);
	const isGroupLevelSelection = isGroupSelected && !hasSelectedBlockInGroup;
	const isBlockLevelSelection = isGroupSelected && hasSelectedBlockInGroup;
	const gridClasses = getLayoutGridClasses(layout);
	const slotContentAlignmentClass =
		layout.alignment === "center"
			? "justify-center"
			: layout.alignment === "bottom"
				? "justify-end"
				: "justify-start";
	const containerStyle = getGroupContainerStyle(
		group,
		globalStyle.themeMode,
		globalStyle.primaryColor,
	);
	const slotGap = GAP_MAP[group.style?.gap ?? ""] ?? "0px";
	const getSlotFromPointer = (clientX: number, clientY: number): string | null => {
		for (const slotName of layout.slots) {
			const slotElement = slotRefs.current[slotName];
			if (!slotElement) continue;
			const rect = slotElement.getBoundingClientRect();
			const isWithinSlot =
				clientX >= rect.left &&
				clientX <= rect.right &&
				clientY >= rect.top &&
				clientY <= rect.bottom;
			if (isWithinSlot) return slotName;
		}
		return null;
	};
	const getFlowDropTarget = (
		slotName: string,
		clientY: number,
		draggedBlockId: string,
	): FlowDropTarget => {
		const slotElement = slotRefs.current[slotName];
		if (!slotElement) {
			return { slot: slotName, targetIndex: 0, lineTop: 0 };
		}
		const slotRect = slotElement.getBoundingClientRect();
		const blocksInSlot = (blocksBySlot[slotName] ?? []).filter(
			(entry) => entry.id !== draggedBlockId,
		);
		if (blocksInSlot.length === 0) {
			return {
				slot: slotName,
				targetIndex: 0,
				lineTop: Math.max(16, Math.round(slotRect.height / 2)),
			};
		}

		const measuredBlocks = blocksInSlot
			.map((entry) => ({
				entry,
				rect: flowBlockRefs.current[entry.id]?.getBoundingClientRect() ?? null,
			}))
			.filter((item): item is { entry: Block; rect: DOMRect } => item.rect !== null);

		if (measuredBlocks.length === 0) {
			return {
				slot: slotName,
				targetIndex: 0,
				lineTop: Math.max(16, Math.round(slotRect.height / 2)),
			};
		}

		for (let index = 0; index < measuredBlocks.length; index += 1) {
			const blockRect = measuredBlocks[index].rect;
			const blockMidpoint = blockRect.top + blockRect.height / 2;
			if (clientY < blockMidpoint) {
				return {
					slot: slotName,
					targetIndex: index,
					lineTop: Math.round(blockRect.top - slotRect.top),
				};
			}
		}

		const lastBlockRect = measuredBlocks[measuredBlocks.length - 1].rect;
		return {
			slot: slotName,
			targetIndex: measuredBlocks.length,
			lineTop: Math.round(lastBlockRect.bottom - slotRect.top),
		};
	};

	useEffect(() => {
		if (!isEditing) return;

		const handlePointerMove = (event: PointerEvent) => {
			const container = sectionContentRef.current;
			if (!container) return;

			const dragState = dragStateRef.current;
			if (dragState) {
				const rect = container.getBoundingClientRect();
				const positionX = Math.round(event.clientX - rect.left - dragState.offsetX);
				const positionY = Math.round(event.clientY - rect.top - dragState.offsetY);
				if (positionX !== dragState.lastX || positionY !== dragState.lastY) {
					dragState.lastX = positionX;
					dragState.lastY = positionY;

					onUpdateBlockStyle?.(dragState.blockId, {
						positionX,
						positionY,
					});
				}
			}

			const flowDragState = flowDragStateRef.current;
			if (!flowDragState) return;

			if (!flowDragState.isDragging) {
				const deltaX = event.clientX - flowDragState.startX;
				const deltaY = event.clientY - flowDragState.startY;
				if (Math.hypot(deltaX, deltaY) < 6) return;
				flowDragState.isDragging = true;
				setDraggingFlowBlockId(flowDragState.blockId);
			}

			const hoveredSlot = getSlotFromPointer(event.clientX, event.clientY);
			const targetSlot = hoveredSlot ?? flowDragState.sourceSlot;
			const nextDropTarget = getFlowDropTarget(
				targetSlot,
				event.clientY,
				flowDragState.blockId,
			);
			setFlowDropTarget((current) => {
				if (
					current &&
					current.slot === nextDropTarget.slot &&
					current.targetIndex === nextDropTarget.targetIndex &&
					current.lineTop === nextDropTarget.lineTop
				) {
					return current;
				}
				return nextDropTarget;
			});
		};

		const commitFinalDragPosition = (event: PointerEvent) => {
			const dragState = dragStateRef.current;
			const container = sectionContentRef.current;
			if (!dragState || !container || !onUpdateBlockStyle) return;

			const rect = container.getBoundingClientRect();
			const positionX = Math.round(event.clientX - rect.left - dragState.offsetX);
			const positionY = Math.round(event.clientY - rect.top - dragState.offsetY);
			if (positionX === dragState.lastX && positionY === dragState.lastY) return;

			onUpdateBlockStyle(dragState.blockId, {
				positionX,
				positionY,
			});
		};

		const commitFlowBlockDrop = (event: PointerEvent) => {
			const flowDragState = flowDragStateRef.current;
			if (!flowDragState || !flowDragState.isDragging) return;
			if (!onMoveBlockToSlotAtIndex && !onMoveBlockToSlot) return;

			const dropSlot =
				getSlotFromPointer(event.clientX, event.clientY) ?? flowDragState.sourceSlot;
			const dropTarget = getFlowDropTarget(dropSlot, event.clientY, flowDragState.blockId);
			if (onMoveBlockToSlotAtIndex) {
				onMoveBlockToSlotAtIndex(
					flowDragState.blockId,
					dropTarget.slot,
					dropTarget.targetIndex,
				);
				return;
			}
			if (dropTarget.slot !== flowDragState.sourceSlot && onMoveBlockToSlot) {
				onMoveBlockToSlot(flowDragState.blockId, dropTarget.slot);
			}
		};

		const clearDragState = () => {
			dragStateRef.current = null;
			setDraggingAbsoluteBlockId(null);
			flowDragStateRef.current = null;
			setDraggingFlowBlockId(null);
			setFlowDropTarget(null);
		};

		const handlePointerUp = (event: PointerEvent) => {
			commitFinalDragPosition(event);
			commitFlowBlockDrop(event);
			clearDragState();
		};

		const handlePointerCancel = () => {
			clearDragState();
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("pointercancel", handlePointerCancel);

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("pointercancel", handlePointerCancel);
		};
	}, [
		blocksBySlot,
		isEditing,
		layout.slots,
		onMoveBlockToSlot,
		onMoveBlockToSlotAtIndex,
		onUpdateBlockStyle,
	]);

	useEffect(() => {
		if (!isDraggingBlock) return;

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
	}, [isDraggingBlock]);

	return (
		<div
			className={`relative transition-colors ${isEditing ? "cursor-pointer" : ""} ${
				isGroupLevelSelection
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
			{isEditing && isBlockLevelSelection && (
				<div
					className="pointer-events-none absolute inset-0 z-[1] border border-dashed border-primary/60"
					style={{ borderRadius: "inherit" }}
				/>
			)}

			<div ref={sectionContentRef} className="relative">
				<div
					className={`${gridClasses} ${isDraggingBlock ? "pointer-events-none" : ""}`}
					style={{
						gridTemplateColumns: layout.spans.map((s) => `${s}fr`).join(" "),
						direction: layout.reversed ? "rtl" : "ltr",
					}}>
					{layout.slots.map((slotName) => {
						const isActiveFlowDropSlot =
							isDraggingFlowBlock && flowDropTarget?.slot === slotName;

						return (
							<div
								key={slotName}
								ref={(element) => {
									slotRefs.current[slotName] = element;
								}}
								className={`relative flex min-h-full flex-col rounded-md transition-colors ${slotContentAlignmentClass} ${
									isActiveFlowDropSlot
										? "bg-primary/10 ring-2 ring-primary/50"
										: ""
								}`}
								style={{ direction: "ltr", gap: slotGap }}>
								{blocksBySlot[slotName]?.map((block) => {
									const isBlockSelected = block.id === selectedBlockId;
									const canDragSelectedFlowBlock =
										isEditing &&
										isBlockSelected &&
										Boolean(onMoveBlockToSlotAtIndex || onMoveBlockToSlot);

									return (
										<div
											key={block.id}
											ref={(element) => {
												flowBlockRefs.current[block.id] = element;
											}}
											className={`relative rounded-md transition-all ${
												canDragSelectedFlowBlock
													? "cursor-grab active:cursor-grabbing touch-none"
													: isEditing
														? "cursor-pointer"
														: ""
											} ${
												isDraggingFlowBlock &&
												draggingFlowBlockId !== block.id
													? "pointer-events-none"
													: ""
											} ${
												isDraggingFlowBlock &&
												draggingFlowBlockId === block.id
													? "opacity-70"
													: ""
											} ${
												isBlockSelected
													? "ring-2 ring-primary/60 ring-offset-1 ring-offset-transparent"
													: isEditing && !isDraggingBlock
														? "hover:ring-1 hover:ring-primary/20"
														: ""
											}`}
											onPointerDown={(event) => {
												if (!canDragSelectedFlowBlock) return;
												if (
													event.pointerType === "mouse" &&
													event.button !== 0
												)
													return;
												event.preventDefault();
												event.stopPropagation();
												const nextDropTarget = getFlowDropTarget(
													block.slot,
													event.clientY,
													block.id,
												);
												flowDragStateRef.current = {
													blockId: block.id,
													sourceSlot: block.slot,
													startX: event.clientX,
													startY: event.clientY,
													isDragging: false,
												};
												setFlowDropTarget(nextDropTarget);
											}}
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
								{isDraggingFlowBlock && flowDropTarget?.slot === slotName && (
									<div
										className="pointer-events-none absolute left-2 right-2 z-[3]"
										style={{ top: `${flowDropTarget.lineTop}px` }}>
										<div className="h-[2px] rounded-full bg-primary shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" />
									</div>
								)}
							</div>
						);
					})}
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
								(isDraggingAbsoluteBlock && draggingAbsoluteBlockId !== block.id) ||
								isDraggingFlowBlock
									? "pointer-events-none"
									: ""
							} ${
								isBlockSelected
									? "ring-2 ring-primary/60 ring-offset-1 ring-offset-transparent rounded-md"
									: isEditing && !isDraggingBlock
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
