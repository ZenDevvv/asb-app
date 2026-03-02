import {
	AlertTriangle,
	ArrowLeft,
	Eye,
	Loader2,
	RotateCcw,
	Save,
	ScreenShare,
	WifiOff,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CMSCanvas } from "~/components/admin/display/CMSCanvas";
import { CMSSidebar } from "~/components/admin/display/CMSSidebar";
import { SplashScreen } from "~/components/admin/splash-screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { useAuth } from "~/hooks/use-auth";
import {
	useGetTemplateProjectById,
	useUpdateTemplateProject,
} from "~/hooks/use-template-project";
import { resolveTemplateEditorMode } from "~/lib/template-project-utils";
import {
	CMS_PRESETS,
	useDisplayStore,
	type CMSResolution,
} from "~/stores/displayStore";

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function getPresetLabel(width: number, height: number): string {
	const bySize = CMS_PRESETS.find(
		(preset) => preset.label !== "Custom" && preset.width === width && preset.height === height,
	);
	return bySize ? bySize.label : "Custom";
}

type PresetOrientation = "landscape" | "portrait";

function getOrientationFromResolution(resolution: CMSResolution): PresetOrientation {
	return resolution.width >= resolution.height ? "landscape" : "portrait";
}

const LANDSCAPE_PRESETS = CMS_PRESETS.filter(
	(preset) => preset.label !== "Custom" && preset.width >= preset.height,
);

const PORTRAIT_PRESETS = CMS_PRESETS.filter(
	(preset) => preset.label !== "Custom" && preset.width < preset.height,
);

function createSaveHash(params: {
	resolution: CMSResolution;
	zoom: number;
	blocks: unknown;
	activeTemplateId: string | null;
	canvasBackground: unknown;
	globalStyle: unknown;
}): string {
	return JSON.stringify({
		resolution: params.resolution,
		zoom: params.zoom,
		blocks: params.blocks,
		activeTemplateId: params.activeTemplateId,
		canvasBackground: params.canvasBackground,
		globalStyle: params.globalStyle,
	});
}

export default function CmsEditorPage() {
	const navigate = useNavigate();
	const { templateId } = useParams<{ templateId: string }>();
	const { user, isLoading: isAuthLoading } = useAuth();
	const { mutateAsync: updateTemplate, isPending: isSaving } = useUpdateTemplateProject();

	const {
		data: templateData,
		isLoading: isTemplateLoading,
		isError: isTemplateError,
		error: templateError,
	} = useGetTemplateProjectById(templateId ?? "", {
		fields: "id,name,editorMode,cmsState,globalStyle,updatedAt",
	});

	const isHydrated = useDisplayStore((state) => state.isHydrated);
	const selectedBlockId = useDisplayStore((state) => state.selectedBlockId);
	const resolution = useDisplayStore((state) => state.resolution);
	const zoom = useDisplayStore((state) => state.zoom);
	const blocks = useDisplayStore((state) => state.blocks);
	const activeTemplateId = useDisplayStore((state) => state.activeTemplateId);
	const canvasBackground = useDisplayStore((state) => state.canvasBackground);
	const globalStyle = useDisplayStore((state) => state.globalStyle);
	const setResolution = useDisplayStore((state) => state.setResolution);
	const setZoom = useDisplayStore((state) => state.setZoom);
	const resetCanvas = useDisplayStore((state) => state.resetCanvas);
	const hydrateFromServer = useDisplayStore((state) => state.hydrateFromServer);
	const hydrateFromLocalDraft = useDisplayStore((state) => state.hydrateFromLocalDraft);
	const saveDraftToLocalStorage = useDisplayStore((state) => state.saveDraftToLocalStorage);

	const [presetOrientation, setPresetOrientation] = useState<PresetOrientation>(
		getOrientationFromResolution(resolution),
	);
	const [statusMessage, setStatusMessage] = useState("Waiting for changes");
	const [offlineDraftRecovered, setOfflineDraftRecovered] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const isModeRedirectedRef = useRef(false);
	const hasHydratedRef = useRef(false);
	const hasDraftRecoveryAttemptedRef = useRef(false);
	const lastSavedHashRef = useRef<string>("");
	const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		hasHydratedRef.current = false;
		hasDraftRecoveryAttemptedRef.current = false;
		isModeRedirectedRef.current = false;
		lastSavedHashRef.current = "";
		setOfflineDraftRecovered(false);
		setSaveError(null);
		setStatusMessage("Waiting for changes");
		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
			autosaveTimerRef.current = null;
		}
	}, [templateId]);

	useEffect(() => {
		if (isAuthLoading) return;
		if (!user) {
			navigate("/login", { replace: true });
			return;
		}
		if (user.role !== "admin") {
			navigate("/user/dashboard", { replace: true });
		}
	}, [isAuthLoading, navigate, user]);

	useEffect(() => {
		if (!templateId || !templateData || hasHydratedRef.current) return;

		if (resolveTemplateEditorMode(templateData) !== "cms") {
			if (!isModeRedirectedRef.current) {
				isModeRedirectedRef.current = true;
				if (typeof window !== "undefined") {
					window.alert("This template uses website mode. Redirecting to Website Editor.");
				}
				navigate(`/editor/${templateId}`, { replace: true });
			}
			return;
		}

		hydrateFromServer({
			templateId,
			cmsState: templateData.cmsState,
			globalStyle: templateData.globalStyle,
		});

		const state = useDisplayStore.getState();
		lastSavedHashRef.current = createSaveHash({
			resolution: state.resolution,
			zoom: state.zoom,
			blocks: state.blocks,
			activeTemplateId: state.activeTemplateId,
			canvasBackground: state.canvasBackground,
			globalStyle: state.globalStyle,
		});
		hasHydratedRef.current = true;
		setStatusMessage("Synced from server");
		setSaveError(null);
	}, [hydrateFromServer, navigate, templateData, templateId]);

	useEffect(() => {
		if (!templateId || !isTemplateError || hasDraftRecoveryAttemptedRef.current) return;

		hasDraftRecoveryAttemptedRef.current = true;
		const recovered = hydrateFromLocalDraft({ templateId });
		if (recovered) {
			hasHydratedRef.current = true;
			setOfflineDraftRecovered(true);
			setStatusMessage("Recovered local draft (offline)");
			setSaveError("Unable to load template from server. Editing local fallback draft.");

			const state = useDisplayStore.getState();
			lastSavedHashRef.current = createSaveHash({
				resolution: state.resolution,
				zoom: state.zoom,
				blocks: state.blocks,
				activeTemplateId: state.activeTemplateId,
				canvasBackground: state.canvasBackground,
				globalStyle: state.globalStyle,
			});
		}
	}, [hydrateFromLocalDraft, isTemplateError, templateId]);

	useEffect(() => {
		setPresetOrientation(getOrientationFromResolution(resolution));
	}, [resolution]);

	const orientationPresets = useMemo(
		() => (presetOrientation === "landscape" ? LANDSCAPE_PRESETS : PORTRAIT_PRESETS),
		[presetOrientation],
	);

	const selectedPresetLabel = useMemo(() => {
		const selected = orientationPresets.find(
			(preset) => preset.width === resolution.width && preset.height === resolution.height,
		);
		return selected?.label ?? "Custom";
	}, [orientationPresets, resolution.height, resolution.width]);

	const selectedPresetTriggerLabel = useMemo(
		() => getPresetLabel(resolution.width, resolution.height),
		[resolution.height, resolution.width],
	);

	const isCustomPreset = selectedPresetLabel === "Custom";

	const currentSaveHash = useMemo(
		() =>
			createSaveHash({
				resolution,
				zoom,
				blocks,
				activeTemplateId,
				canvasBackground,
				globalStyle,
			}),
		[activeTemplateId, blocks, canvasBackground, globalStyle, resolution, zoom],
	);

	const saveNow = useCallback(async () => {
		if (!templateId) return;
		if (!hasHydratedRef.current) return;

		const state = useDisplayStore.getState();
		const nextHash = createSaveHash({
			resolution: state.resolution,
			zoom: state.zoom,
			blocks: state.blocks,
			activeTemplateId: state.activeTemplateId,
			canvasBackground: state.canvasBackground,
			globalStyle: state.globalStyle,
		});
		if (nextHash === lastSavedHashRef.current) return;

		setStatusMessage("Saving to server...");
		setSaveError(null);
		state.saveDraftToLocalStorage(templateId);

		try {
			const response = await updateTemplate({
				templateProjectId: templateId,
				data: {
					editorMode: "cms",
					cmsState: state.exportForServer(),
					globalStyle: state.globalStyle,
				},
			});

			lastSavedHashRef.current = nextHash;
			setStatusMessage("Saved to server");
			setOfflineDraftRecovered(false);

			if (response?.templateProject?.updatedAt) {
				const timestamp = new Date(response.templateProject.updatedAt).toLocaleTimeString();
				setStatusMessage(`Saved ${timestamp}`);
			}
		} catch (error) {
			state.saveDraftToLocalStorage(templateId);
			setOfflineDraftRecovered(true);
			setStatusMessage("Offline draft saved");
			setSaveError(error instanceof Error ? error.message : "Failed to save CMS template.");
		}
	}, [templateId, updateTemplate]);

	const scheduleAutosave = useCallback(() => {
		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
		}
		autosaveTimerRef.current = setTimeout(() => {
			void saveNow();
		}, 3000);
	}, [saveNow]);

	useEffect(() => {
		if (!templateId || !isHydrated || !hasHydratedRef.current) return;
		saveDraftToLocalStorage(templateId);
		if (currentSaveHash === lastSavedHashRef.current) return;
		scheduleAutosave();
	}, [currentSaveHash, isHydrated, saveDraftToLocalStorage, scheduleAutosave, templateId]);

	useEffect(() => {
		return () => {
			if (autosaveTimerRef.current) {
				clearTimeout(autosaveTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
			event.preventDefault();
			if (autosaveTimerRef.current) {
				clearTimeout(autosaveTimerRef.current);
			}
			void saveNow();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [saveNow]);

	const handlePresetChange = (value: string) => {
		if (value === "Custom") {
			setResolution({
				label: "Custom",
				width: resolution.width,
				height: resolution.height,
			});
			return;
		}

		const preset = orientationPresets.find((entry) => entry.label === value);
		if (!preset) return;
		setResolution(preset);
	};

	const handleCustomDimensionChange = (key: "width" | "height", raw: string) => {
		const parsed = Number.parseInt(raw, 10);
		if (!Number.isFinite(parsed)) return;

		setResolution({
			label: "Custom",
			width: key === "width" ? clamp(parsed, 320, 7680) : clamp(resolution.width, 320, 7680),
			height: key === "height" ? clamp(parsed, 320, 4320) : clamp(resolution.height, 320, 4320),
		});
	};

	const setOrientation = (target: PresetOrientation) => {
		setPresetOrientation(target);
		const currentOrientation = getOrientationFromResolution(resolution);
		if (currentOrientation === target) return;

		const fallbackPreset = target === "landscape" ? LANDSCAPE_PRESETS[0] : PORTRAIT_PRESETS[0];
		if (fallbackPreset) {
			setResolution(fallbackPreset);
		}
	};

	const handleReset = () => {
		if (typeof window === "undefined") return;
		const confirmed = window.confirm("Clear all blocks from this CMS canvas?");
		if (confirmed) {
			resetCanvas();
		}
	};

	if (isAuthLoading || isTemplateLoading) {
		return <SplashScreen mode="editor" />;
	}

	if (!templateId) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Missing CMS template id.
			</div>
		);
	}

	if (isTemplateError && !isHydrated) {
		return (
			<div className="flex h-screen items-center justify-center bg-background px-4">
				<div className="w-full max-w-xl rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
					<div className="font-semibold">Unable to load CMS template</div>
					<div className="mt-2 text-muted-foreground">
						{templateError instanceof Error ? templateError.message : "Please try again."}
					</div>
					<div className="mt-4">
						<Button type="button" onClick={() => navigate("/admin/cms")}>
							Back to CMS Templates
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const templateName = templateData?.name ?? "CMS Template";

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			<header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-2">
				<div className="flex items-center gap-3">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => navigate("/admin/cms")}
						className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
						title="Back to CMS templates">
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<ScreenShare className="h-4 w-4" />
					</div>
					<div>
						<div className="text-sm font-semibold text-sidebar-foreground">{templateName}</div>
						<div className="text-[10px] text-muted-foreground">{statusMessage}</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-0.5">
						<Button
							type="button"
							size="sm"
							variant={presetOrientation === "landscape" ? "default" : "ghost"}
							onClick={() => setOrientation("landscape")}
							className="h-7 rounded-lg px-2.5 text-xs">
							Landscape
						</Button>
						<Button
							type="button"
							size="sm"
							variant={presetOrientation === "portrait" ? "default" : "ghost"}
							onClick={() => setOrientation("portrait")}
							className="h-7 rounded-lg px-2.5 text-xs">
							Portrait
						</Button>
					</div>

					<Select value={selectedPresetLabel} onValueChange={handlePresetChange}>
						<SelectTrigger
							size="sm"
							className="h-8 rounded-lg border-sidebar-border bg-sidebar-accent/30 text-xs text-sidebar-foreground hover:bg-sidebar-accent/50">
							<SelectValue>{selectedPresetTriggerLabel}</SelectValue>
						</SelectTrigger>
						<SelectContent className="border-sidebar-border bg-sidebar text-sidebar-foreground">
							{orientationPresets.map((preset) => (
								<SelectItem key={preset.label} value={preset.label}>
									{preset.label}
								</SelectItem>
							))}
							<SelectItem value="Custom">Custom</SelectItem>
						</SelectContent>
					</Select>

					{isCustomPreset ? (
						<div className="flex items-center gap-1">
							<Input
								type="number"
								min={320}
								max={7680}
								value={resolution.width}
								onChange={(event) => handleCustomDimensionChange("width", event.target.value)}
								className="h-8 w-20 rounded-lg border-sidebar-border bg-sidebar-accent/30 text-xs"
							/>
							<span className="text-xs text-muted-foreground">x</span>
							<Input
								type="number"
								min={320}
								max={4320}
								value={resolution.height}
								onChange={(event) => handleCustomDimensionChange("height", event.target.value)}
								className="h-8 w-20 rounded-lg border-sidebar-border bg-sidebar-accent/30 text-xs"
							/>
						</div>
					) : null}

					<div className="flex items-center rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-0.5">
						<button
							type="button"
							onClick={() => setZoom(zoom - 10)}
							className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
							<ZoomOut className="h-3.5 w-3.5" />
						</button>
						<span className="min-w-[44px] text-center text-xs font-medium text-sidebar-foreground">
							{zoom}%
						</span>
						<button
							type="button"
							onClick={() => setZoom(zoom + 10)}
							className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
							<ZoomIn className="h-3.5 w-3.5" />
						</button>
					</div>

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => navigate(`/admin/cms/view/${templateId}`)}>
						<Eye className="h-3.5 w-3.5" />
						Preview
					</Button>

					<Button type="button" variant="outline" size="sm" onClick={() => void saveNow()}>
						{isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
						Save
					</Button>

					<Button type="button" variant="destructive" size="sm" onClick={handleReset}>
						<RotateCcw className="h-3.5 w-3.5" />
						Reset
					</Button>
				</div>
			</header>

			{saveError ? (
				<div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
					{offlineDraftRecovered ? <WifiOff className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
					<span>{saveError}</span>
				</div>
			) : null}

			<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
				<CMSCanvas />
				<CMSSidebar className="h-[44vh] w-full border-l-0 border-t border-sidebar-border lg:h-full lg:w-[320px] lg:border-l lg:border-t-0" />
			</div>

			{selectedBlockId ? null : (
				<div className="border-t border-sidebar-border bg-sidebar/80 px-4 py-1.5 text-[10px] text-muted-foreground">
					Tip: select a block to edit content/style. Press Ctrl/Cmd+S to save immediately.
				</div>
			)}
		</div>
	);
}
