import { ArrowLeft, Loader2, Rocket, ScreenShare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CMSBlockRenderer } from "~/components/admin/display/CMSBlockRenderer";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";
import {
	useForkTemplateProject,
	useGetTemplateProjectById,
} from "~/hooks/use-template-project";
import { resolveTemplateEditorMode } from "~/lib/template-project-utils";
import { cn } from "~/lib/utils";
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

export default function UserCmsTemplateDetailsPage() {
	const navigate = useNavigate();
	const { templateId } = useParams<{ templateId: string }>();
	const { user, isLoading: isAuthLoading } = useAuth();
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const hasModeRedirectedRef = useRef(false);
	const [viewportSize, setViewportSize] = useState<CanvasViewportSize>({
		width: 0,
		height: 0,
	});
	const { mutate: forkTemplate, isPending: isForking } = useForkTemplateProject();

	const {
		data: templateData,
		isLoading,
		isError,
		error,
	} = useGetTemplateProjectById(templateId ?? "", {
		fields:
			"id,name,description,category,editorMode,cmsState,globalStyle,usageCount,updatedAt,isActive,isDeleted",
	});

	useEffect(() => {
		if (isAuthLoading) return;
		if (!user) {
			navigate("/login", { replace: true });
		}
	}, [isAuthLoading, navigate, user]);

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

	useEffect(() => {
		if (!templateData || !templateId) return;
		if (resolveTemplateEditorMode(templateData) === "cms") return;
		if (hasModeRedirectedRef.current) return;

		hasModeRedirectedRef.current = true;
		if (typeof window !== "undefined") {
			window.alert("This template uses website mode. Redirecting to website template details.");
		}
		navigate(`/user/templates/${templateId}`, { replace: true });
	}, [navigate, templateData, templateId]);

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
			themeMode:
				(value as { themeMode?: unknown }).themeMode === "light" ? "light" : "dark",
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
		const zoomScale = cmsState.zoom / 100;
		return Math.max(0.05, fitScale * zoomScale);
	}, [cmsState.zoom, fitScale]);

	const scaledCanvasWidth = Math.max(
		1,
		Math.round(cmsState.resolution.width * displayScale),
	);
	const scaledCanvasHeight = Math.max(
		1,
		Math.round(cmsState.resolution.height * displayScale),
	);

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
	const isViewer = user?.role === "viewer";

	if (isAuthLoading || isLoading) {
		return (
			<div className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10">
				<div className="h-[74vh] animate-pulse rounded-3xl border border-border bg-card/50" />
			</div>
		);
	}

	if (!templateId) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Missing CMS template id.
			</div>
		);
	}

	if (isError || !templateData) {
		return (
			<div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-10">
				<div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
					<div className="font-semibold">Unable to load CMS template</div>
					<div className="mt-2 text-muted-foreground">
						{error instanceof Error ? error.message : "Please try again."}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => navigate("/user/cms/templates")}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to CMS Templates
				</Button>
				<Button
					type="button"
					onClick={() => {
						if (!templateId || isViewer) return;
						forkTemplate(templateId, {
							onSuccess: (project) => {
								navigate(`/project/cms/${project.slug}`);
							},
						});
					}}
					disabled={isForking || isViewer}>
					{isForking ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Rocket className="mr-2 h-4 w-4" />
					)}
					{isViewer ? "Viewer cannot fork" : "Use This Template"}
				</Button>
			</div>

			<div className="overflow-hidden rounded-3xl border border-border/70 bg-card/60 backdrop-blur">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<ScreenShare className="h-4 w-4" />
						</div>
						<div className="min-w-0">
							<div className="truncate text-sm font-semibold text-foreground">
								{templateData.name}
							</div>
							<div className="truncate text-xs text-muted-foreground">
								{templateData.description || "CMS display template"}
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span className="rounded-full border border-border px-2 py-0.5">
							{templateData.category || "Display"}
						</span>
						<span className="rounded-full border border-border px-2 py-0.5">
							{templateData.usageCount} uses
						</span>
					</div>
				</div>

				<div ref={viewportRef} className="minimal-scrollbar h-[70vh] overflow-auto p-6">
					<div className="mx-auto flex min-h-full items-center justify-center">
						<div
							className="relative overflow-hidden rounded-xl border border-border/40 bg-black shadow-lg"
							style={{
								width: `${scaledCanvasWidth}px`,
								height: `${scaledCanvasHeight}px`,
							}}>
							<div
								className={cn("absolute left-0 top-0 h-full w-full origin-top-left")}
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
			</div>
		</div>
	);
}
