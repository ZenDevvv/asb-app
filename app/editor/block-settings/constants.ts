import type { Block } from "~/types/editor";

export const CUSTOM_TEXT_SIZE_MIN = 12;
export const CUSTOM_TEXT_SIZE_MAX = 200;
export const CUSTOM_DIVIDER_WIDTH_MIN = 40;
export const CUSTOM_DIVIDER_WIDTH_MAX = 1600;

export const FONT_SIZE_PRESET_TO_PX: Record<string, number> = {
	sm: 14,
	base: 16,
	lg: 18,
	xl: 20,
	"2xl": 24,
	"3xl": 30,
	"4xl": 36,
	"5xl": 48,
};

export const CUSTOM_TEXT_SIZE_DEFAULT_BY_BLOCK: Partial<Record<Block["type"], number>> = {
	heading: 36,
	text: 16,
};

export const WIDTH_PRESET_TO_PX: Record<string, number> = {
	auto: 240,
	sm: 384,
	md: 448,
	lg: 512,
	full: 720,
};
