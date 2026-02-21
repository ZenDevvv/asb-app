import { GroupRenderer } from "~/sections/GroupRenderer";
import { resolveSectionColorScheme } from "~/lib/colorSystem";
import type { BlockStyle, GlobalStyle, Section, SectionStyle } from "~/types/editor";

interface SectionRendererProps {
	section: Section;
	sectionIndex: number;
	globalStyle: GlobalStyle;
	isEditing: boolean;
	selectedGroupId: string | null;
	selectedBlockId: string | null;
	onGroupClick?: (groupId: string) => void;
	onBlockClick?: (groupId: string, blockId: string) => void;
	onUpdateBlockProp?: (groupId: string, blockId: string, key: string, value: unknown) => void;
	onUpdateBlockStyle?: (groupId: string, blockId: string, style: Partial<BlockStyle>) => void;
}

interface RgbColor {
	r: number;
	g: number;
	b: number;
}

function parseHexColor(value: string): RgbColor | null {
	const trimmed = value.trim();
	const expanded = trimmed.match(/^#([0-9a-fA-F]{3})$/)
		? trimmed.replace(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/, "#$1$1$2$2$3$3")
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

function clampByte(value: number): number {
	return Math.max(0, Math.min(255, Math.round(value)));
}

function toHex(value: number): string {
	return clampByte(value).toString(16).padStart(2, "0");
}

function rgbToHex(color: RgbColor): string {
	return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function mixColor(source: RgbColor, target: RgbColor, amount: number): RgbColor {
	const weight = Math.max(0, Math.min(1, amount));
	return {
		r: source.r + (target.r - source.r) * weight,
		g: source.g + (target.g - source.g) * weight,
		b: source.b + (target.b - source.b) * weight,
	};
}

function getLuminance(color: RgbColor): number {
	const toLinear = (channel: number) => {
		const normalized = channel / 255;
		return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
	};

	return 0.2126 * toLinear(color.r) + 0.7152 * toLinear(color.g) + 0.0722 * toLinear(color.b);
}

function lightenForLightMode(color: string): string {
	const parsed = parseHexColor(color);
	if (!parsed) return color;

	const luminance = getLuminance(parsed);
	if (luminance >= 0.84) return color;

	const mixAmount =
		luminance < 0.2 ? 0.92 : luminance < 0.35 ? 0.86 : luminance < 0.5 ? 0.78 : 0.64;
	return rgbToHex(mixColor(parsed, { r: 255, g: 255, b: 255 }, mixAmount));
}

function darkenForLightMode(color: string): string {
	const parsed = parseHexColor(color);
	if (!parsed) return color;

	const luminance = getLuminance(parsed);
	if (luminance <= 0.33) return color;

	const mixAmount =
		luminance > 0.9 ? 0.9 : luminance > 0.75 ? 0.8 : luminance > 0.6 ? 0.68 : 0.52;
	return rgbToHex(mixColor(parsed, { r: 16, g: 26, b: 22 }, mixAmount));
}

function toneAccentForLightMode(color: string): string {
	const parsed = parseHexColor(color);
	if (!parsed) return color;

	if (getLuminance(parsed) <= 0.68) return color;
	return rgbToHex(mixColor(parsed, { r: 12, g: 20, b: 16 }, 0.28));
}

function getRenderSectionStyle(
	section: Section,
	globalStyle: GlobalStyle,
	sectionIndex: number,
): SectionStyle {
	const style: SectionStyle = { ...section.style };
	const colorMode = style.colorMode ?? "global";

	if (colorMode !== "custom") {
		const scheme = resolveSectionColorScheme({
			primaryColor: globalStyle.primaryColor,
			themeMode: globalStyle.themeMode,
			colorScheme: globalStyle.colorScheme,
			sectionIndex,
		});

		style.colorMode = "global";
		style.textColor = scheme.textColor;
		style.accentColor = scheme.accentColor;

		if (style.backgroundType === "gradient") {
			style.gradientFrom = scheme.gradientFrom;
			style.gradientTo = scheme.gradientTo;
		} else if (style.backgroundType === "image") {
			style.backgroundColor = scheme.imageOverlay;
		} else {
			style.backgroundColor = scheme.backgroundColor;
		}

		return style;
	}

	if (globalStyle.themeMode !== "light") return style;

	style.textColor = darkenForLightMode(style.textColor || "#ffffff");
	style.accentColor = toneAccentForLightMode(
		style.accentColor || globalStyle.primaryColor || "#00e5a0",
	);

	if (style.backgroundColor) {
		style.backgroundColor = lightenForLightMode(style.backgroundColor);
	}

	if (style.gradientFrom) {
		style.gradientFrom = lightenForLightMode(style.gradientFrom);
	}
	if (style.gradientTo) {
		style.gradientTo = lightenForLightMode(style.gradientTo);
	}

	return style;
}

interface EffectPattern {
	image: string;
	size: string;
	position?: string;
}

function getEffectPattern(
	effect: SectionStyle["backgroundEffect"],
	themeMode: GlobalStyle["themeMode"],
): EffectPattern | null {
	if (!effect || effect === "none") return null;

	const isLight = themeMode === "light";

	if (effect === "dots") {
		const color = isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.12)";
		return {
			image: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
			size: "24px 24px",
		};
	}

	if (effect === "grid") {
		const color = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
		return {
			image: [
				`linear-gradient(${color} 1px, transparent 1px)`,
				`linear-gradient(90deg, ${color} 1px, transparent 1px)`,
			].join(", "),
			size: "40px 40px, 40px 40px",
		};
	}

	if (effect === "noise") {
		const opacity = isLight ? "0.04" : "0.06";
		const svg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='${opacity}'/%3E%3C/svg%3E`;
		return {
			image: `url("data:image/svg+xml,${svg}")`,
			size: "200px 200px",
		};
	}

	return null;
}

function getSectionBackground(
	sectionStyle: SectionStyle,
	themeMode: GlobalStyle["themeMode"],
): React.CSSProperties {
	const s = sectionStyle;
	const effect = getEffectPattern(s.backgroundEffect, themeMode);
	const style: React.CSSProperties = {
		paddingTop: s.paddingY ?? 80,
		paddingBottom: s.paddingY ?? 80,
	};

	if (s.backgroundType === "gradient" && s.gradientFrom && s.gradientTo) {
		const gradient = `linear-gradient(${s.gradientDirection || "to bottom"}, ${s.gradientFrom}, ${s.gradientTo})`;
		if (effect) {
			style.backgroundImage = `${effect.image}, ${gradient}`;
			style.backgroundSize = `${effect.size}, auto`;
		} else {
			style.background = gradient;
		}
	} else if (s.backgroundType === "image" && s.backgroundImage) {
		const imageLayer = `url(${s.backgroundImage})`;
		if (effect) {
			style.backgroundImage = `${effect.image}, ${imageLayer}`;
			style.backgroundSize = `${effect.size}, cover`;
			style.backgroundPosition = "left top, center";
		} else {
			style.backgroundImage = imageLayer;
			style.backgroundSize = "cover";
			style.backgroundPosition = "center";
		}
		if (s.backgroundColor) {
			style.backgroundColor = s.backgroundColor;
		}
	} else {
		style.backgroundColor =
			s.backgroundColor || (themeMode === "light" ? "#f3faf6" : "#0a0f0d");
		if (effect) {
			style.backgroundImage = effect.image;
			style.backgroundSize = effect.size;
		}
	}

	return style;
}

export function SectionRenderer({
	section,
	sectionIndex,
	globalStyle,
	isEditing,
	selectedGroupId,
	selectedBlockId,
	onGroupClick,
	onBlockClick,
	onUpdateBlockProp,
	onUpdateBlockStyle,
}: SectionRendererProps) {
	const renderSection: Section = {
		...section,
		style: getRenderSectionStyle(section, globalStyle, sectionIndex),
	};
	const orderedGroups = renderSection.groups.slice().sort((a, b) => a.order - b.order);
	const bgStyle = getSectionBackground(renderSection.style, globalStyle.themeMode);

	return (
		<section style={bgStyle}>
			<div className="mx-auto max-w-6xl px-6">
				<div className="space-y-8">
					{orderedGroups.map((group) => (
						<GroupRenderer
							key={group.id}
							section={renderSection}
							group={group}
							globalStyle={globalStyle}
							isEditing={isEditing}
							isGroupSelected={selectedGroupId === group.id}
							selectedBlockId={selectedBlockId}
							onGroupClick={() => onGroupClick?.(group.id)}
							onBlockClick={(blockId) => onBlockClick?.(group.id, blockId)}
							onUpdateBlockProp={(blockId, key, value) =>
								onUpdateBlockProp?.(group.id, blockId, key, value)
							}
							onUpdateBlockStyle={(blockId, style) =>
								onUpdateBlockStyle?.(group.id, blockId, style)
							}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
