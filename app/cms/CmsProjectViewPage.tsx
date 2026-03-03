import { ArrowLeft, Edit3, ScreenShare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CMSBlockRenderer } from "~/components/admin/display/CMSBlockRenderer";
import { SplashScreen } from "~/components/admin/splash-screen";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";
import { useGetProjectBySlug } from "~/hooks/use-project";
import { resolveProjectEditorMode } from "~/lib/template-project-utils";
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

export default function CmsProjectViewPage() {
	const navigate = useNavigate();
	const { slug } = useParams<{ slug: string }>();
	const { user, isLoading: isAuthLoading } = useAuth();
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const hasModeRedirectedRef = useRef(false);
	const [viewportSize, setViewportSize] = useState<CanvasViewportSize>({
		width: 0,
		height: 0,
	});

	const {
		data: projectData,
		isLoading,
		isError,
		error,
	} = useGetProjectBySlug(slug ?? "", {
		fields: "id,name,slug,editorMode,cmsState,globalStyle,updatedAt",
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
		if (!projectData || !slug) return;
		if (resolveProjectEditorMode(projectData) === "cms") return;
		if (hasModeRedirectedRef.current) return;

		hasModeRedirectedRef.current = true;
		if (typeof window !== "undefined") {
			window.alert("This project uses website mode. Redirecting to website editor.");
		}
		navigate(`/project/${slug}`, { replace: true });
	}, [navigate, projectData, slug]);

	const cmsState = useMemo(
		() => normalizeCmsPersistedState(projectData?.cmsState),
		[projectData?.cmsState],
	);
	const globalStyle = useMemo(() => {
		const value = projectData?.globalStyle;
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			return { ...DEFAULT_GLOBAL_STYLE };
		}
		return {
			...DEFAULT_GLOBAL_STYLE,
			...value,
			colorScheme: "monochromatic" as const,
			themeMode: (value as { themeMode?: unknown }).themeMode === "light" ? "light" : "dark",
		};
	}, [projectData?.globalStyle]);

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

	if (isAuthLoading || isLoading) {
		return <SplashScreen mode="editor" />;
	}

	if (!slug) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Missing CMS project slug.
			</div>
		);
	}

	if (isError || !projectData) {
		return (
			<div className="flex h-screen items-center justify-center bg-background px-4">
				<div className="w-full max-w-xl rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
					<div className="font-semibold">Unable to load CMS view</div>
					<div className="mt-2 text-muted-foreground">
						{error instanceof Error ? error.message : "Please try again."}
					</div>
					<div className="mt-4">
						<Button type="button" onClick={() => navigate("/user/dashboard")}>
							Back to Dashboard
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			<header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar px-4 py-2">
				<div className="flex items-center gap-3">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => navigate(`/project/cms/${slug}`)}
						className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
						title="Back to CMS project editor">
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<ScreenShare className="h-4 w-4" />
					</div>
					<div>
						<div className="text-sm font-semibold text-sidebar-foreground">
							{projectData.name}
						</div>
						<div className="text-[10px] text-muted-foreground">
							Read-only CMS project view
						</div>
					</div>
				</div>
				{user?.role !== "viewer" ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => navigate(`/project/cms/${slug}`)}>
						<Edit3 className="h-3.5 w-3.5" />
						Open Editor
					</Button>
				) : null}
			</header>

			<div ref={viewportRef} className="minimal-scrollbar flex-1 overflow-auto p-8">
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
		</div>
	);
}
