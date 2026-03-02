import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CmsEditorHeader } from "~/cms/editor/CmsEditorHeader";
import { CmsEditorStatusBanner } from "~/cms/editor/CmsEditorStatusBanner";
import {
	CmsEditorLoadErrorState,
	CmsEditorMissingTemplateState,
} from "~/cms/editor/CmsEditorStates";
import {
	LANDSCAPE_PRESETS,
	PORTRAIT_PRESETS,
	clamp,
	createSaveHash,
	getOrientationFromResolution,
	getPresetLabel,
	type PresetOrientation,
} from "~/cms/editor/cmsEditorHelpers";
import { CMSCanvas } from "~/components/admin/display/CMSCanvas";
import { CMSSidebar } from "~/components/admin/display/CMSSidebar";
import { SplashScreen } from "~/components/admin/splash-screen";
import { useAuth } from "~/hooks/use-auth";
import { useGetProjectBySlug, useUpdateProject } from "~/hooks/use-project";
import { resolveProjectEditorMode } from "~/lib/template-project-utils";
import { useDisplayStore } from "~/stores/displayStore";

export default function CmsProjectEditorPage() {
	const navigate = useNavigate();
	const { slug } = useParams<{ slug: string }>();
	const { user, isLoading: isAuthLoading } = useAuth();
	const { mutateAsync: updateProject, isPending: isSaving } = useUpdateProject();

	const {
		data: projectData,
		isLoading: isProjectLoading,
		isError: isProjectError,
		error: projectError,
	} = useGetProjectBySlug(slug ?? "", {
		fields: "id,name,slug,editorMode,cmsState,globalStyle,updatedAt",
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

	const hasHydratedRef = useRef(false);
	const hasDraftRecoveryAttemptedRef = useRef(false);
	const lastSavedHashRef = useRef<string>("");
	const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasModeRedirectedRef = useRef(false);
	const draftStorageKey = slug ? `project:${slug}` : null;

	useEffect(() => {
		hasHydratedRef.current = false;
		hasDraftRecoveryAttemptedRef.current = false;
		hasModeRedirectedRef.current = false;
		lastSavedHashRef.current = "";
		setOfflineDraftRecovered(false);
		setSaveError(null);
		setStatusMessage("Waiting for changes");
		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
			autosaveTimerRef.current = null;
		}
	}, [slug]);

	useEffect(() => {
		if (isAuthLoading) return;
		if (!user) {
			navigate("/login", { replace: true });
			return;
		}
		if (user.role === "viewer" && slug) {
			navigate(`/project/cms/view/${slug}`, { replace: true });
		}
	}, [isAuthLoading, navigate, slug, user]);

	useEffect(() => {
		if (!slug || !draftStorageKey || !projectData || hasHydratedRef.current) return;

		if (resolveProjectEditorMode(projectData) !== "cms") {
			if (!hasModeRedirectedRef.current) {
				hasModeRedirectedRef.current = true;
				if (typeof window !== "undefined") {
					window.alert("This project uses website mode. Redirecting to website editor.");
				}
				navigate(`/project/${slug}`, { replace: true });
			}
			return;
		}

		hydrateFromServer({
			templateId: draftStorageKey,
			cmsState: projectData.cmsState,
			globalStyle: projectData.globalStyle,
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
	}, [draftStorageKey, hydrateFromServer, navigate, projectData, slug]);

	useEffect(() => {
		if (!draftStorageKey || !isProjectError || hasDraftRecoveryAttemptedRef.current) return;

		hasDraftRecoveryAttemptedRef.current = true;
		const recovered = hydrateFromLocalDraft({ templateId: draftStorageKey });
		if (recovered) {
			hasHydratedRef.current = true;
			setOfflineDraftRecovered(true);
			setStatusMessage("Recovered local draft (offline)");
			setSaveError("Unable to load project from server. Editing local fallback draft.");

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
	}, [draftStorageKey, hydrateFromLocalDraft, isProjectError]);

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
		if (!draftStorageKey || !projectData?.id) return;
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
		state.saveDraftToLocalStorage(draftStorageKey);

		try {
			const response = await updateProject({
				projectId: projectData.id,
				data: {
					editorMode: "cms",
					cmsState: state.exportForServer(),
					globalStyle: state.globalStyle,
				},
			});

			lastSavedHashRef.current = nextHash;
			setStatusMessage("Saved to server");
			setOfflineDraftRecovered(false);

			if (response?.project?.updatedAt) {
				const timestamp = new Date(response.project.updatedAt).toLocaleTimeString();
				setStatusMessage(`Saved ${timestamp}`);
			}
		} catch (error) {
			state.saveDraftToLocalStorage(draftStorageKey);
			setOfflineDraftRecovered(true);
			setStatusMessage("Offline draft saved");
			setSaveError(error instanceof Error ? error.message : "Failed to save CMS project.");
		}
	}, [draftStorageKey, projectData?.id, updateProject]);

	const scheduleAutosave = useCallback(() => {
		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
		}
		autosaveTimerRef.current = setTimeout(() => {
			void saveNow();
		}, 3000);
	}, [saveNow]);

	useEffect(() => {
		if (!draftStorageKey || !isHydrated || !hasHydratedRef.current) return;
		saveDraftToLocalStorage(draftStorageKey);
		if (currentSaveHash === lastSavedHashRef.current) return;
		scheduleAutosave();
	}, [
		currentSaveHash,
		draftStorageKey,
		isHydrated,
		saveDraftToLocalStorage,
		scheduleAutosave,
	]);

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
			height:
				key === "height" ? clamp(parsed, 320, 4320) : clamp(resolution.height, 320, 4320),
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

	if (isAuthLoading || isProjectLoading) {
		return <SplashScreen mode="editor" />;
	}

	if (!slug || !draftStorageKey) {
		return <CmsEditorMissingTemplateState />;
	}

	if ((isProjectError || !projectData) && !isHydrated) {
		return (
			<CmsEditorLoadErrorState
				error={projectError}
				onBackToTemplates={() => navigate("/user/cms/templates")}
			/>
		);
	}

	const projectName = projectData?.name ?? "CMS Project";

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			<CmsEditorHeader
				templateName={projectName}
				statusMessage={statusMessage}
				backButtonTitle="Back to Dashboard"
				presetOrientation={presetOrientation}
				onSetOrientation={setOrientation}
				selectedPresetLabel={selectedPresetLabel}
				selectedPresetTriggerLabel={selectedPresetTriggerLabel}
				orientationPresets={orientationPresets}
				isCustomPreset={isCustomPreset}
				resolution={resolution}
				onPresetChange={handlePresetChange}
				onCustomDimensionChange={handleCustomDimensionChange}
				zoom={zoom}
				onZoomChange={setZoom}
				isSaving={isSaving}
				onBackToTemplates={() => navigate("/user/dashboard")}
				onOpenPreview={() => navigate(`/project/cms/view/${slug}`)}
				onSave={() => void saveNow()}
				onReset={handleReset}
			/>

			<CmsEditorStatusBanner
				saveError={saveError}
				offlineDraftRecovered={offlineDraftRecovered}
			/>

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
