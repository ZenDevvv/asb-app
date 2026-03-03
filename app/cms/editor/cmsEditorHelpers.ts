import { CMS_PRESETS, type CMSResolution } from "~/stores/displayStore";

export type PresetOrientation = "landscape" | "portrait";

export const LANDSCAPE_PRESETS = CMS_PRESETS.filter(
	(preset) => preset.label !== "Custom" && preset.width >= preset.height,
);

export const PORTRAIT_PRESETS = CMS_PRESETS.filter(
	(preset) => preset.label !== "Custom" && preset.width < preset.height,
);

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function getPresetLabel(width: number, height: number): string {
	const bySize = CMS_PRESETS.find(
		(preset) => preset.label !== "Custom" && preset.width === width && preset.height === height,
	);
	return bySize ? bySize.label : "Custom";
}

export function getOrientationFromResolution(resolution: CMSResolution): PresetOrientation {
	return resolution.width >= resolution.height ? "landscape" : "portrait";
}

interface SaveHashInput {
	resolution: CMSResolution;
	zoom: number;
	blocks: unknown;
	activeTemplateId: string | null;
	canvasBackground: unknown;
	globalStyle: unknown;
}

export function createSaveHash(params: SaveHashInput): string {
	return JSON.stringify({
		resolution: params.resolution,
		zoom: params.zoom,
		blocks: params.blocks,
		activeTemplateId: params.activeTemplateId,
		canvasBackground: params.canvasBackground,
		globalStyle: params.globalStyle,
	});
}
