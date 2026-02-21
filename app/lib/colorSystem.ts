import type { GlobalStyle } from "~/types/editor";

interface RgbColor {
	r: number;
	g: number;
	b: number;
}

export interface SectionColorSchemeTokens {
	accentColor: string;
	textColor: string;
	backgroundColor: string;
	gradientFrom: string;
	gradientTo: string;
	imageOverlay: string;
}

const FALLBACK_PRIMARY_COLOR = "#00e5a0";
const DARK_MIX_TARGET: RgbColor = { r: 8, g: 16, b: 13 };
const DARK_SECTION_TARGET: RgbColor = { r: 6, g: 12, b: 10 };
const LIGHT_TEXT_TARGET: RgbColor = { r: 14, g: 24, b: 20 };
const LIGHT_SURFACE_TARGET: RgbColor = { r: 244, g: 250, b: 247 };

function clampUnit(value: number): number {
	return Math.max(0, Math.min(1, value));
}

function clampByte(value: number): number {
	return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHexColor(value: string): RgbColor | null {
	const trimmed = value.trim();
	const expanded = trimmed.match(/^#([0-9a-fA-F]{3})$/)
		? trimmed.replace(
				/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,
				"#$1$1$2$2$3$3",
			)
		: trimmed;
	const match = expanded.match(/^#([0-9a-fA-F]{6})$/);
	if (!match) return null;

	const hex = match[1];
	return {
		r: Number.parseInt(hex.slice(0, 2), 16),
		g: Number.parseInt(hex.slice(2, 4), 16),
		b: Number.parseInt(hex.slice(4, 6), 16),
	};
}

function toHex(value: number): string {
	return clampByte(value).toString(16).padStart(2, "0");
}

function rgbToHex(color: RgbColor): string {
	return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function mixColor(source: RgbColor, target: RgbColor, amount: number): RgbColor {
	const weight = clampUnit(amount);
	return {
		r: source.r + (target.r - source.r) * weight,
		g: source.g + (target.g - source.g) * weight,
		b: source.b + (target.b - source.b) * weight,
	};
}

function getLuminance(color: RgbColor): number {
	const toLinear = (channel: number) => {
		const normalized = channel / 255;
		return normalized <= 0.03928
			? normalized / 12.92
			: ((normalized + 0.055) / 1.055) ** 2.4;
	};

	return (
		0.2126 * toLinear(color.r) +
		0.7152 * toLinear(color.g) +
		0.0722 * toLinear(color.b)
	);
}

export function normalizeHexColor(
	value: string | null | undefined,
	fallback: string = FALLBACK_PRIMARY_COLOR,
): string {
	const parsed = value ? parseHexColor(value) : null;
	if (parsed) return rgbToHex(parsed);

	const parsedFallback = parseHexColor(fallback);
	return parsedFallback ? rgbToHex(parsedFallback) : FALLBACK_PRIMARY_COLOR;
}

export function hexToRgba(value: string, alpha: number): string {
	const normalized = normalizeHexColor(value);
	const parsed = parseHexColor(normalized);
	if (!parsed) return `rgba(0, 229, 160, ${clampUnit(alpha)})`;

	return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${clampUnit(alpha)})`;
}

function toneAccentColor(primary: RgbColor, themeMode: GlobalStyle["themeMode"]): string {
	const luminance = getLuminance(primary);

	if (themeMode === "light") {
		if (luminance > 0.66) {
			return rgbToHex(mixColor(primary, DARK_MIX_TARGET, 0.36));
		}
		if (luminance < 0.22) {
			return rgbToHex(mixColor(primary, { r: 255, g: 255, b: 255 }, 0.16));
		}
		return rgbToHex(primary);
	}

	if (luminance < 0.2) {
		return rgbToHex(mixColor(primary, { r: 214, g: 255, b: 241 }, 0.34));
	}
	if (luminance > 0.82) {
		return rgbToHex(mixColor(primary, DARK_MIX_TARGET, 0.24));
	}
	return rgbToHex(primary);
}

function deriveMonochromaticSectionColors(
	primary: RgbColor,
	themeMode: GlobalStyle["themeMode"],
	sectionIndex: number,
): SectionColorSchemeTokens {
	const isDark = themeMode !== "light";
	const toneIndex = sectionIndex % 2 === 0 ? 0 : 1;

	if (isDark) {
		const backgroundMix = toneIndex === 0 ? 0.9 : 0.84;
		return {
			accentColor: toneAccentColor(primary, themeMode),
			textColor: rgbToHex(mixColor(primary, { r: 255, g: 255, b: 255 }, 0.9)),
			backgroundColor: rgbToHex(mixColor(primary, DARK_SECTION_TARGET, backgroundMix)),
			gradientFrom: rgbToHex(mixColor(primary, DARK_SECTION_TARGET, 0.88)),
			gradientTo: rgbToHex(mixColor(primary, DARK_SECTION_TARGET, 0.74)),
			imageOverlay: rgbToHex(mixColor(primary, DARK_SECTION_TARGET, 0.92)),
		};
	}

	const backgroundMix = toneIndex === 0 ? 0.94 : 0.88;
	return {
		accentColor: toneAccentColor(primary, themeMode),
		textColor: rgbToHex(mixColor(primary, LIGHT_TEXT_TARGET, 0.84)),
		backgroundColor: rgbToHex(mixColor(primary, LIGHT_SURFACE_TARGET, backgroundMix)),
		gradientFrom: rgbToHex(mixColor(primary, { r: 255, g: 255, b: 255 }, 0.92)),
		gradientTo: rgbToHex(mixColor(primary, LIGHT_SURFACE_TARGET, 0.78)),
		imageOverlay: rgbToHex(mixColor(primary, { r: 255, g: 255, b: 255 }, 0.9)),
	};
}

export function resolveSectionColorScheme({
	primaryColor,
	themeMode,
	colorScheme,
	sectionIndex,
}: {
	primaryColor: string;
	themeMode: GlobalStyle["themeMode"];
	colorScheme: GlobalStyle["colorScheme"];
	sectionIndex: number;
}): SectionColorSchemeTokens {
	const normalizedPrimary = normalizeHexColor(primaryColor);
	const parsedPrimary = parseHexColor(normalizedPrimary);

	if (!parsedPrimary) {
		return deriveMonochromaticSectionColors(
			parseHexColor(FALLBACK_PRIMARY_COLOR)!,
			themeMode,
			sectionIndex,
		);
	}

	switch (colorScheme) {
		case "monochromatic":
		default:
			return deriveMonochromaticSectionColors(parsedPrimary, themeMode, sectionIndex);
	}
}
