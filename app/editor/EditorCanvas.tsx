import { useEffect, useRef } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { SectionRenderer } from "~/sections/SectionRenderer";
import { cn } from "~/lib/utils";

export function EditorCanvas() {
	const sections = useEditorStore((s) => s.sections);
	const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
	const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
	const selectSection = useEditorStore((s) => s.selectSection);
	const selectBlock = useEditorStore((s) => s.selectBlock);
	const updateBlockProp = useEditorStore((s) => s.updateBlockProp);
	const updateBlockStyle = useEditorStore((s) => s.updateBlockStyle);
	const globalStyle = useEditorStore((s) => s.globalStyle);
	const device = useEditorStore((s) => s.device);
	const zoom = useEditorStore((s) => s.zoom);
	const setZoom = useEditorStore((s) => s.setZoom);
	const canvasScrollRef = useRef<HTMLDivElement | null>(null);
	const previousSelectedSectionIdRef = useRef<string | null>(selectedSectionId);

	const canvasWidth = device === "mobile" ? "375px" : "100%";
	const maxWidth = device === "mobile" ? "375px" : "1440px";

	useEffect(() => {
		const previousSelectedSectionId = previousSelectedSectionIdRef.current;
		previousSelectedSectionIdRef.current = selectedSectionId;

		if (!selectedSectionId || !canvasScrollRef.current) return;
		if (previousSelectedSectionId === selectedSectionId) return;

		const container = canvasScrollRef.current;
		const target = container.querySelector<HTMLElement>(
			`[data-section-id="${selectedSectionId}"]`,
		);
		if (!target) return;

		const containerRect = container.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();
		const margin = 24;
		const isAboveViewport = targetRect.top < containerRect.top + margin;
		const isBelowViewport = targetRect.bottom > containerRect.bottom - margin;

		if (isAboveViewport || isBelowViewport) {
			target.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "nearest",
			});
		}
	}, [selectedSectionId]);

	return (
		<div className="relative flex flex-1 flex-col bg-background overflow-hidden">
			<div
				ref={canvasScrollRef}
				className="flex-1 overflow-auto p-8 minimal-scrollbar"
				onClick={(e) => {
					if (e.target === e.currentTarget) selectSection(null);
				}}>
				<div
					className="mx-auto transition-all duration-200"
					style={{
						width: canvasWidth,
						maxWidth,
						transform: `scale(${zoom / 100})`,
						transformOrigin: "top center",
					}}>
					<div className="overflow-hidden rounded-xl border border-border/40 shadow-lg">
						{sections.length === 0 && (
							<div className="flex h-[400px] flex-col items-center justify-center text-muted-foreground">
								<span
									className="material-symbols-outlined mb-3"
									style={{ fontSize: 48 }}>
									web
								</span>
								<p className="text-sm font-medium">No sections yet</p>
								<p className="text-xs">
									Add a section from the left panel to get started
								</p>
							</div>
						)}

						{sections.map((section) => {
							if (!section.isVisible) return null;

							const registry = SECTION_REGISTRY[section.type];
							if (!registry) return null;

							const isSelected = section.id === selectedSectionId;

							return (
								<div
									key={section.id}
									data-section-id={section.id}
									className={cn(
										"relative cursor-pointer transition-all",
										isSelected && "ring-2 ring-primary ring-offset-0",
									)}
									onClick={(e) => {
										e.stopPropagation();
										selectSection(section.id);
									}}>
									{isSelected && (
										<div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
											<div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground shadow-md">
												<span
													className="material-symbols-outlined"
													style={{ fontSize: 12 }}>
													{registry.icon}
												</span>
												{registry.label}
											</div>
										</div>
									)}

									<SectionRenderer
										section={section}
										globalStyle={globalStyle}
										isEditing={true}
										selectedBlockId={selectedBlockId}
										onBlockClick={(blockId) => {
											selectBlock(section.id, blockId);
										}}
										onUpdateBlockProp={(blockId, key, value) => {
											updateBlockProp(section.id, blockId, key, value);
										}}
										onUpdateBlockStyle={(blockId, style) => {
											updateBlockStyle(section.id, blockId, style);
										}}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Zoom controls */}
			<div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-card/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
				<button
					onClick={() => setZoom(zoom - 10)}
					disabled={zoom <= 50}
					className="flex size-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						remove
					</span>
				</button>
				<span className="min-w-[40px] text-center text-xs font-medium text-foreground">
					{zoom}%
				</span>
				<button
					onClick={() => setZoom(zoom + 10)}
					disabled={zoom >= 150}
					className="flex size-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						add
					</span>
				</button>
			</div>
		</div>
	);
}
