import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { CMSBlockRenderer } from "~/components/admin/display/CMSBlockRenderer";
import { useGetTemplateProjectById } from "~/hooks/use-template-project";
import { resolveTemplateEditorMode } from "~/lib/template-project-utils";
import { normalizeCmsPersistedState, type CMSBlock } from "~/stores/displayStore";
import { DEFAULT_GLOBAL_STYLE } from "~/stores/editorStore";

interface CanvasViewportSize {
	width: number;
	height: number;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function getBlockRotationDegrees(block: CMSBlock): number {
	const tilt = block.style.tilt;
	if (typeof tilt !== "number" || !Number.isFinite(tilt)) return 0;
	return clamp(tilt, -180, 180);
}

export default function CmsPublicTemplateViewPage() {
	const { templateId } = useParams<{ templateId: string }>();
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const [viewportSize, setViewportSize] = useState<CanvasViewportSize>({ width: 0, height: 0 });

	const {
		data: templateData,
		isLoading,
		isError,
	} = useGetTemplateProjectById(templateId ?? "", {
		fields: "id,name,editorMode,cmsState,globalStyle",
		isPublic: true,
	});

	useEffect(() => {
		if (isLoading) return;
		const element = viewportRef.current;
		if (!element || typeof ResizeObserver === "undefined") return;

		const initialBox = element.getBoundingClientRect();
		setViewportSize({
			width: initialBox.width,
			height: initialBox.height,
		});

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
	}, [isLoading]);

	const cmsState = useMemo(
		() => normalizeCmsPersistedState(templateData?.cmsState),
		[templateData?.cmsState],
	);
	const globalStyle = useMemo(() => {
		const value = templateData?.globalStyle;
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			return { ...DEFAULT_GLOBAL_STYLE };
		}
		return {
			...DEFAULT_GLOBAL_STYLE,
			...value,
			colorScheme: "monochromatic" as const,
			themeMode: (value as { themeMode?: unknown }).themeMode === "light" ? "light" : "dark",
		};
	}, [templateData?.globalStyle]);

	const fitScale = useMemo(() => {
		if (viewportSize.width <= 0 || viewportSize.height <= 0) return 1;
		const paddedWidth = Math.max(0, viewportSize.width - 32);
		const paddedHeight = Math.max(0, viewportSize.height - 32);
		return Math.min(
			paddedWidth / cmsState.resolution.width,
			paddedHeight / cmsState.resolution.height,
		);
	}, [
		cmsState.resolution.height,
		cmsState.resolution.width,
		viewportSize.height,
		viewportSize.width,
	]);

	const displayScale = useMemo(() => {
		// Read-only views should always fit the viewport; editor zoom is an authoring concern.
		return Math.max(0.05, fitScale);
	}, [fitScale]);

	const scaledCanvasWidth = Math.max(1, Math.round(cmsState.resolution.width * displayScale));
	const scaledCanvasHeight = Math.max(1, Math.round(cmsState.resolution.height * displayScale));

	const resolvedBackgroundColor =
		typeof cmsState.canvasBackground.color === "string" &&
		cmsState.canvasBackground.color.trim().length > 0
			? cmsState.canvasBackground.color
			: "#2f2f2f";
	const hasImageBackground =
		cmsState.canvasBackground.type === "image" &&
		cmsState.canvasBackground.imageUrl.trim().length > 0;
	const hasVideoBackground =
		cmsState.canvasBackground.type === "video" &&
		cmsState.canvasBackground.videoUrl.trim().length > 0;

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Loading...
			</div>
		);
	}

	if (!templateId) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Missing CMS template id.
			</div>
		);
	}

	if (isError || !templateData || resolveTemplateEditorMode(templateData) !== "cms") {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Template not found.
			</div>
		);
	}

	return (
		<div
			ref={viewportRef}
			className="minimal-scrollbar h-screen overflow-auto bg-background p-8">
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
							width: `${cmsState.resolution.width}px`,
							height: `${cmsState.resolution.height}px`,
							transform: `scale(${displayScale})`,
						}}>
						<div
							className="pointer-events-none absolute inset-0"
							style={{ backgroundColor: resolvedBackgroundColor }}
						/>
						{hasImageBackground ? (
							<img
								src={cmsState.canvasBackground.imageUrl}
								alt="Canvas background"
								className="pointer-events-none absolute inset-0 h-full w-full object-cover"
							/>
						) : null}
						{hasVideoBackground ? (
							<video
								src={cmsState.canvasBackground.videoUrl}
								autoPlay
								muted
								loop
								playsInline
								className="pointer-events-none absolute inset-0 h-full w-full object-cover"
							/>
						) : null}

						{cmsState.blocks.map((block) => (
							<div
								key={block.id}
								className="absolute overflow-hidden rounded-md"
								style={{
									left: `${block.x}%`,
									top: `${block.y}%`,
									width: `${block.w}%`,
									height: `${block.h}%`,
									transform: `rotate(${getBlockRotationDegrees(block)}deg)`,
									transformOrigin: "center center",
									zIndex:
										typeof block.style.zIndex === "number"
											? block.style.zIndex
											: 20,
								}}>
								<div className="h-full w-full overflow-hidden">
									<CMSBlockRenderer
										block={block}
										globalStyle={globalStyle}
										canvasHeight={cmsState.resolution.height}
										isEditing={false}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
