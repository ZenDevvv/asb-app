import {
	ArrowLeft,
	Download,
	Layers3,
	RotateCcw,
	ScreenShare,
	Sparkles,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
	CMS_PRESETS,
	CMS_TEMPLATE_LIBRARY,
	useDisplayStore,
	type CMSDisplaySnapshot,
	type CMSResolution,
} from "~/stores/displayStore";

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function isDebugQueryEnabled(value: string | null): boolean {
	if (!value) return false;
	const normalized = value.trim().toLowerCase();
	return normalized === "true" || normalized === "1" || normalized === "yes";
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

export default function CmsEditorPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { isLoading } = useAuth();

	const isHydrated = useDisplayStore((state) => state.isHydrated);
	const loadFromLocalStorage = useDisplayStore((state) => state.loadFromLocalStorage);
	const blocks = useDisplayStore((state) => state.blocks);
	const resolution = useDisplayStore((state) => state.resolution);
	const zoom = useDisplayStore((state) => state.zoom);
	const setResolution = useDisplayStore((state) => state.setResolution);
	const setZoom = useDisplayStore((state) => state.setZoom);
	const applyTemplate = useDisplayStore((state) => state.applyTemplate);
	const resetCanvas = useDisplayStore((state) => state.resetCanvas);
	const selectedBlockId = useDisplayStore((state) => state.selectedBlockId);
	const activeTemplateId = useDisplayStore((state) => state.activeTemplateId);
	const canvasBackground = useDisplayStore((state) => state.canvasBackground);
	const globalStyle = useDisplayStore((state) => state.globalStyle);
	const [presetOrientation, setPresetOrientation] = useState<PresetOrientation>(
		getOrientationFromResolution(resolution),
	);

	useEffect(() => {
		if (isHydrated) return;
		loadFromLocalStorage();
	}, [isHydrated, loadFromLocalStorage]);

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
	const activeTemplate = useMemo(
		() => CMS_TEMPLATE_LIBRARY.find((template) => template.id === activeTemplateId) ?? null,
		[activeTemplateId],
	);
	const isCustomPreset = selectedPresetLabel === "Custom";
	const orientation = presetOrientation;
	const isDebugMode = isDebugQueryEnabled(searchParams.get("debug"));

	const buildSnapshotForExport = (): CMSDisplaySnapshot => ({
		resolution,
		zoom,
		blocks,
		selectedBlockId,
		activeTemplateId,
		canvasBackground,
		globalStyle,
	});

	const handleTemplateChange = (templateId: string) => {
		if (!templateId || templateId === activeTemplateId) return;
		if (typeof window !== "undefined" && blocks.length > 0) {
			const confirmed = window.confirm(
				"Apply this template and replace all current CMS blocks?",
			);
			if (!confirmed) return;
		}
		applyTemplate(templateId);
	};

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

	const setOrientation = (target: "landscape" | "portrait") => {
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

	const handleDownloadDebugState = () => {
		if (typeof window === "undefined") return;

		const payload = {
			exportedAt: new Date().toISOString(),
			source: "asb-cms-debug",
			snapshot: buildSnapshotForExport(),
		};
		const json = JSON.stringify(payload, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const objectUrl = window.URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		const timestamp = new Date().toISOString().replace(/[:]/g, "-").replace(/[.]/g, "-");

		anchor.href = objectUrl;
		anchor.download = `cms-canvas-state-${timestamp}.json`;
		document.body.append(anchor);
		anchor.click();
		anchor.remove();
		window.URL.revokeObjectURL(objectUrl);
	};

	if (isLoading) {
		return <SplashScreen mode="editor" />;
	}

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			<header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar px-4 py-2">
				<div className="flex items-center gap-3">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => navigate("/admin")}
						className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
						title="Back to admin">
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<ScreenShare className="h-4 w-4" />
					</div>
					<div>
						<div className="text-sm font-semibold text-sidebar-foreground">
							CMS Editor
						</div>
						<div className="text-[10px] text-muted-foreground">
							{selectedBlockId ? "Editing selected block" : "Ready to add content"}
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
							Template
						</span>
						<Select
							value={activeTemplateId ?? undefined}
							onValueChange={handleTemplateChange}>
							<SelectTrigger
								size="sm"
								className="h-8 min-w-[220px] rounded-lg border-sidebar-border bg-sidebar-accent/30 text-xs text-sidebar-foreground hover:bg-sidebar-accent/50">
								<SelectValue placeholder="Select template" />
							</SelectTrigger>
							<SelectContent className="border-sidebar-border bg-sidebar text-sidebar-foreground">
								{CMS_TEMPLATE_LIBRARY.map((template) => (
									<SelectItem key={template.id} value={template.id}>
										{template.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-0.5">
						<Button
							type="button"
							size="sm"
							variant={orientation === "landscape" ? "default" : "ghost"}
							onClick={() => setOrientation("landscape")}
							className="h-7 rounded-lg px-2.5 text-xs">
							Landscape
						</Button>
						<Button
							type="button"
							size="sm"
							variant={orientation === "portrait" ? "default" : "ghost"}
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
								onChange={(event) =>
									handleCustomDimensionChange("width", event.target.value)
								}
								className="h-8 w-20 rounded-lg border-sidebar-border bg-sidebar-accent/30 text-xs"
							/>
							<span className="text-xs text-muted-foreground">x</span>
							<Input
								type="number"
								min={320}
								max={4320}
								value={resolution.height}
								onChange={(event) =>
									handleCustomDimensionChange("height", event.target.value)
								}
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

					<Button type="button" variant="destructive" size="sm" onClick={handleReset}>
						<RotateCcw className="h-3.5 w-3.5" />
						Reset
					</Button>

					{isDebugMode ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleDownloadDebugState}
							className="border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent/50">
							<Download className="h-3.5 w-3.5" />
							Export JSON
						</Button>
					) : null}
				</div>
			</header>

			<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
				<aside className="hidden h-full w-[240px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
					<div className="flex items-center justify-between px-4 pb-2 pt-4">
						<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
							CMS Overview
						</span>
					</div>
					<div className="minimal-scrollbar flex-1 space-y-2 overflow-y-auto px-3 pb-3">
						<div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
							<div className="flex items-center gap-2 text-xs text-sidebar-foreground">
								<Sparkles className="h-3.5 w-3.5 text-primary" />
								{activeTemplate ? activeTemplate.label : "No Template"}
							</div>
							<div className="mt-1 text-[11px] text-muted-foreground">
								{activeTemplate
									? activeTemplate.description
									: "Pick a template from the header to auto-seed blocks"}
							</div>
						</div>
						<div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
							<div className="flex items-center gap-2 text-xs text-sidebar-foreground">
								<Layers3 className="h-3.5 w-3.5 text-primary" />
								{blocks.length} blocks
							</div>
							<div className="mt-1 text-[11px] text-muted-foreground">
								Current canvas content
							</div>
						</div>
						<div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
							<div className="flex items-center gap-2 text-xs text-sidebar-foreground">
								<ScreenShare className="h-3.5 w-3.5 text-primary" />
								{resolution.width} x {resolution.height}
							</div>
							<div className="mt-1 text-[11px] text-muted-foreground">
								Display resolution
							</div>
						</div>
						<div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
							<div className="flex items-center gap-2 text-xs text-sidebar-foreground">
								<Sparkles className="h-3.5 w-3.5 text-primary" />
								{selectedBlockId ? "Settings Active" : "CMS Library Active"}
							</div>
							<div className="mt-1 text-[11px] text-muted-foreground">
								Right panel mode
							</div>
						</div>
					</div>
				</aside>

				<CMSCanvas />

				<CMSSidebar className="h-[44vh] w-full border-l-0 border-t border-sidebar-border lg:h-full lg:w-[320px] lg:border-l lg:border-t-0" />
			</div>
		</div>
	);
}
