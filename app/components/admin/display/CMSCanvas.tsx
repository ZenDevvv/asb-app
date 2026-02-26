import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { useDisplayStore, type CMSBlock } from "~/stores/displayStore";
import { CMSBlockRenderer } from "./CMSBlockRenderer";

interface CMSCanvasProps {
	className?: string;
}

interface CanvasViewportSize {
	width: number;
	height: number;
}

interface DragState {
	blockId: string;
	pointerId: number;
	startClientX: number;
	startClientY: number;
	startX: number;
	startY: number;
	startScale: number;
}

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface ResizeState {
	blockId: string;
	pointerId: number;
	handle: ResizeHandle;
	startClientX: number;
	startClientY: number;
	startX: number;
	startY: number;
	startW: number;
	startH: number;
	startScale: number;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

const RESIZE_HANDLES: ResizeHandle[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
const MIN_BLOCK_WIDTH = 8;
const MIN_BLOCK_HEIGHT = 6;

function getResizeHandleClass(handle: ResizeHandle): string {
	switch (handle) {
		case "n":
			return "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize";
		case "s":
			return "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize";
		case "e":
			return "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize";
		case "w":
			return "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize";
		case "ne":
			return "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize";
		case "nw":
			return "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize";
		case "se":
			return "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize";
		case "sw":
			return "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize";
		default:
			return "";
	}
}

export function CMSCanvas({ className }: CMSCanvasProps) {
	const resolution = useDisplayStore((state) => state.resolution);
	const zoom = useDisplayStore((state) => state.zoom);
	const blocks = useDisplayStore((state) => state.blocks);
	const canvasBackground = useDisplayStore((state) => state.canvasBackground);
	const selectedBlockId = useDisplayStore((state) => state.selectedBlockId);
	const globalStyle = useDisplayStore((state) => state.globalStyle);
	const selectBlock = useDisplayStore((state) => state.selectBlock);
	const updateBlock = useDisplayStore((state) => state.updateBlock);

	const viewportRef = useRef<HTMLDivElement | null>(null);
	const dragStateRef = useRef<DragState | null>(null);
	const resizeStateRef = useRef<ResizeState | null>(null);

	const [viewportSize, setViewportSize] = useState<CanvasViewportSize>({
		width: 0,
		height: 0,
	});
	const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
	const [resizingBlockId, setResizingBlockId] = useState<string | null>(null);

	useEffect(() => {
		const element = viewportRef.current;
		if (!element || typeof ResizeObserver === "undefined") return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const box = entry.contentRect;
			setViewportSize({
				width: box.width,
				height: box.height,
			});
		});

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const fitScale = useMemo(() => {
		if (viewportSize.width <= 0 || viewportSize.height <= 0) return 1;
		const paddedWidth = Math.max(0, viewportSize.width - 32);
		const paddedHeight = Math.max(0, viewportSize.height - 32);
		return Math.min(paddedWidth / resolution.width, paddedHeight / resolution.height);
	}, [resolution.height, resolution.width, viewportSize.height, viewportSize.width]);

	const displayScale = useMemo(() => {
		const zoomScale = zoom / 100;
		return Math.max(0.05, fitScale * zoomScale);
	}, [fitScale, zoom]);

	const resolvedBackgroundColor =
		typeof canvasBackground.color === "string" && canvasBackground.color.trim().length > 0
			? canvasBackground.color
			: "#2f2f2f";
	const hasImageBackground =
		canvasBackground.type === "image" && canvasBackground.imageUrl.trim().length > 0;
	const hasVideoBackground =
		canvasBackground.type === "video" && canvasBackground.videoUrl.trim().length > 0;

	const scaledCanvasWidth = Math.max(1, Math.round(resolution.width * displayScale));
	const scaledCanvasHeight = Math.max(1, Math.round(resolution.height * displayScale));

	const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			selectBlock(null);
		}
	};

	const handleViewportPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			selectBlock(null);
		}
	};

	const handleBlockPointerDown = (event: React.PointerEvent<HTMLDivElement>, block: CMSBlock) => {
		if (event.button !== 0) return;
		if (resizeStateRef.current) return;

		event.preventDefault();
		event.stopPropagation();

		dragStateRef.current = {
			blockId: block.id,
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startX: block.x,
			startY: block.y,
			startScale: displayScale,
		};
		setDraggingBlockId(block.id);
		selectBlock(block.id);
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handleBlockPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		const drag = dragStateRef.current;
		if (!drag) return;
		if (drag.pointerId !== event.pointerId) return;

		const deltaCanvasX = (event.clientX - drag.startClientX) / drag.startScale;
		const deltaCanvasY = (event.clientY - drag.startClientY) / drag.startScale;
		const nextX = drag.startX + (deltaCanvasX / resolution.width) * 100;
		const nextY = drag.startY + (deltaCanvasY / resolution.height) * 100;

		updateBlock(drag.blockId, { x: nextX, y: nextY });
	};

	const handleResizePointerDown = (
		event: React.PointerEvent<HTMLDivElement>,
		block: CMSBlock,
		handle: ResizeHandle,
	) => {
		if (event.button !== 0) return;

		event.preventDefault();
		event.stopPropagation();

		dragStateRef.current = null;
		setDraggingBlockId(null);
		resizeStateRef.current = {
			blockId: block.id,
			pointerId: event.pointerId,
			handle,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startX: block.x,
			startY: block.y,
			startW: block.w,
			startH: block.h,
			startScale: displayScale,
		};
		setResizingBlockId(block.id);
		selectBlock(block.id);
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handleResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		const resize = resizeStateRef.current;
		if (!resize) return;
		if (resize.pointerId !== event.pointerId) return;

		const deltaCanvasX = (event.clientX - resize.startClientX) / resize.startScale;
		const deltaCanvasY = (event.clientY - resize.startClientY) / resize.startScale;
		const deltaXPct = (deltaCanvasX / resolution.width) * 100;
		const deltaYPct = (deltaCanvasY / resolution.height) * 100;

		let nextX = resize.startX;
		let nextY = resize.startY;
		let nextW = resize.startW;
		let nextH = resize.startH;

		if (resize.handle.includes("e")) {
			nextW = clamp(resize.startW + deltaXPct, MIN_BLOCK_WIDTH, 100 - resize.startX);
		}
		if (resize.handle.includes("s")) {
			nextH = clamp(resize.startH + deltaYPct, MIN_BLOCK_HEIGHT, 100 - resize.startY);
		}
		if (resize.handle.includes("w")) {
			nextX = clamp(
				resize.startX + deltaXPct,
				0,
				resize.startX + resize.startW - MIN_BLOCK_WIDTH,
			);
			nextW = resize.startW - (nextX - resize.startX);
		}
		if (resize.handle.includes("n")) {
			nextY = clamp(
				resize.startY + deltaYPct,
				0,
				resize.startY + resize.startH - MIN_BLOCK_HEIGHT,
			);
			nextH = resize.startH - (nextY - resize.startY);
		}

		nextW = clamp(nextW, MIN_BLOCK_WIDTH, 100);
		nextH = clamp(nextH, MIN_BLOCK_HEIGHT, 100);
		nextX = clamp(nextX, 0, 100 - nextW);
		nextY = clamp(nextY, 0, 100 - nextH);

		updateBlock(resize.blockId, {
			x: nextX,
			y: nextY,
			w: nextW,
			h: nextH,
		});
	};

	const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
		const drag = dragStateRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		dragStateRef.current = null;
		setDraggingBlockId(null);
		event.currentTarget.releasePointerCapture(event.pointerId);
	};

	const endResize = (event: React.PointerEvent<HTMLDivElement>) => {
		const resize = resizeStateRef.current;
		if (!resize || resize.pointerId !== event.pointerId) return;
		resizeStateRef.current = null;
		setResizingBlockId(null);
		try {
			event.currentTarget.releasePointerCapture(event.pointerId);
		} catch {
			// Ignore release failures when pointer capture is already cleared.
		}
	};

	return (
		<div
			className={cn(
				"relative flex flex-1 flex-col overflow-hidden bg-background",
				className,
			)}>
			<div
				ref={viewportRef}
				className="minimal-scrollbar flex-1 overflow-auto p-8"
				onPointerDown={handleViewportPointerDown}>
				<div className="mx-auto flex min-h-full items-center justify-center">
					<div
						className="relative overflow-hidden rounded-xl border border-border/40 bg-black shadow-lg"
						style={{
							width: `${scaledCanvasWidth}px`,
							height: `${scaledCanvasHeight}px`,
						}}>
						<div
							className="absolute left-0 top-0 h-full w-full origin-top-left"
							style={{
								width: `${resolution.width}px`,
								height: `${resolution.height}px`,
								transform: `scale(${displayScale})`,
							}}
							onPointerDown={handleCanvasPointerDown}>
							<div
								className="pointer-events-none absolute inset-0"
								style={{ backgroundColor: resolvedBackgroundColor }}
							/>
							{hasImageBackground ? (
								<img
									src={canvasBackground.imageUrl}
									alt="Canvas background"
									className="pointer-events-none absolute inset-0 h-full w-full object-cover"
								/>
							) : null}
							{hasVideoBackground ? (
								<video
									src={canvasBackground.videoUrl}
									autoPlay
									muted
									loop
									playsInline
									className="pointer-events-none absolute inset-0 h-full w-full object-cover"
								/>
							) : null}
							<div
								className="pointer-events-none absolute inset-0 opacity-30"
								style={{
									backgroundImage:
										"linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
									backgroundSize: "48px 48px",
								}}
							/>

							{blocks.map((block) => {
								const isSelected = selectedBlockId === block.id;
								const isDragging = draggingBlockId === block.id;
								const isResizing = resizingBlockId === block.id;

								return (
									<div
										key={block.id}
										className={cn(
											"absolute select-none rounded-md border transition-shadow",
											isDragging ? "cursor-grabbing" : "cursor-grab",
											isSelected
												? "border-primary shadow-[0_0_0_1px_var(--primary)]"
												: "border-transparent hover:border-primary/60",
										)}
										style={{
											left: `${block.x}%`,
											top: `${block.y}%`,
											width: `${block.w}%`,
											height: `${block.h}%`,
											zIndex:
												typeof block.style.zIndex === "number"
													? block.style.zIndex
													: isSelected
														? 40
														: 20,
										}}
										onPointerDown={(event) =>
											handleBlockPointerDown(event, block)
										}
										onPointerMove={handleBlockPointerMove}
										onPointerUp={endDrag}
										onPointerCancel={endDrag}>
										<div className="pointer-events-none h-full w-full overflow-hidden">
											<CMSBlockRenderer
												block={block}
												globalStyle={globalStyle}
												canvasHeight={resolution.height}
											/>
										</div>

										{isSelected
											? RESIZE_HANDLES.map((handle) => (
													<div
														key={handle}
														role="button"
														tabIndex={-1}
														aria-label={`Resize ${handle}`}
														className={cn(
															"absolute z-50 h-3.5 w-3.5 rounded-full border border-primary bg-background shadow-sm",
															getResizeHandleClass(handle),
															isResizing
																? "opacity-100"
																: "opacity-90",
														)}
														onPointerDown={(event) =>
															handleResizePointerDown(
																event,
																block,
																handle,
															)
														}
														onPointerMove={handleResizePointerMove}
														onPointerUp={endResize}
														onPointerCancel={endResize}
													/>
												))
											: null}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			<div className="pointer-events-none absolute left-4 top-4 rounded-md border border-border bg-card/90 px-2 py-1 text-xs text-muted-foreground">
				{resolution.width}x{resolution.height} ({Math.round(displayScale * 100)}%)
			</div>
		</div>
	);
}
