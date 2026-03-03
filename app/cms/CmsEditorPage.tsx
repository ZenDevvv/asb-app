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
import { useGetTemplateProjectById, useUpdateTemplateProject } from "~/hooks/use-template-project";
import { resolveTemplateEditorMode } from "~/lib/template-project-utils";
import { useDisplayStore, type CMSResolution } from "~/stores/displayStore";

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

	if (isAuthLoading || isTemplateLoading) {
		return <SplashScreen mode="editor" />;
	}

	if (!templateId) {
		return <CmsEditorMissingTemplateState />;
	}

	if (isTemplateError && !isHydrated) {
		return (
			<CmsEditorLoadErrorState
				error={templateError}
				onBackToTemplates={() => navigate("/admin/cms")}
			/>
		);
	}

	const templateName = templateData?.name ?? "CMS Template";

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			<CmsEditorHeader
				templateName={templateName}
				statusMessage={statusMessage}
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
				onBackToTemplates={() => navigate("/admin/cms")}
				onOpenPreview={() => navigate(`/admin/cms/preview/${templateId}`)}
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
