import { GroupRenderer } from "~/sections/GroupRenderer";
import { resolveSectionColorScheme } from "~/lib/colorSystem";
import { cn } from "~/lib/utils";
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
	onMoveBlockToSlot?: (groupId: string, blockId: string, slot: string) => void;
	onMoveBlockToSlotAtIndex?: (
		groupId: string,
		blockId: string,
		slot: string,
		targetIndex: number,
	) => void;
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

	// Custom background colors are used exactly as chosen — no light-mode transformation.
	// Only transform background colors when in global mode (handled above).

	return style;
}

interface EffectPattern {
	image: string;
	size: string;
	position?: string;
}

const DEFAULT_EFFECT_INTENSITY = 40;

function clampPercent(value: unknown, fallback = DEFAULT_EFFECT_INTENSITY): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	return Math.max(0, Math.min(100, value));
}

function toAlpha(value: number): string {
	return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function getEffectPattern(
	effect: SectionStyle["backgroundEffect"],
	themeMode: GlobalStyle["themeMode"],
	intensityValue: SectionStyle["backgroundEffectIntensity"],
	overlayColorValue: SectionStyle["backgroundEffectColor"],
): EffectPattern | null {
	if (!effect || effect === "none") return null;

	const isLight = themeMode === "light";
	const intensity = clampPercent(intensityValue) / 100;

	if (effect === "dots") {
		const alpha = isLight ? 0.2 * intensity : 0.24 * intensity;
		const color = isLight
			? `rgba(0,0,0,${toAlpha(alpha)})`
			: `rgba(255,255,255,${toAlpha(alpha)})`;
		return {
			image: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
			size: "24px 24px",
			position: "left top",
		};
	}

	if (effect === "grid") {
		const alpha = isLight ? 0.14 * intensity : 0.16 * intensity;
		const color = isLight
			? `rgba(0,0,0,${toAlpha(alpha)})`
			: `rgba(255,255,255,${toAlpha(alpha)})`;
		return {
			image: [
				`linear-gradient(${color} 1px, transparent 1px)`,
				`linear-gradient(90deg, ${color} 1px, transparent 1px)`,
			].join(", "),
			size: "40px 40px, 40px 40px",
			position: "left top, left top",
		};
	}

	if (effect === "overlay" || effect === "dim") {
		const overlayColor = parseHexColor(overlayColorValue || "#000000") || {
			r: 0,
			g: 0,
			b: 0,
		};
		const alpha = toAlpha(0.7 * intensity);
		return {
			image: `linear-gradient(rgba(${overlayColor.r},${overlayColor.g},${overlayColor.b},${alpha}), rgba(${overlayColor.r},${overlayColor.g},${overlayColor.b},${alpha}))`,
			size: "auto",
			position: "left top",
		};
	}

	if (effect === "vignette") {
		const edgeAlpha = toAlpha((isLight ? 0.42 : 0.58) * intensity);
		const midAlpha = toAlpha((isLight ? 0.12 : 0.18) * intensity);
		return {
			image: `radial-gradient(ellipse at center, rgba(0,0,0,0) 36%, rgba(0,0,0,${midAlpha}) 72%, rgba(0,0,0,${edgeAlpha}) 100%)`,
			size: "cover",
			position: "center",
		};
	}

	return null;
}

function getSectionBackground(
	sectionStyle: SectionStyle,
	themeMode: GlobalStyle["themeMode"],
): React.CSSProperties {
	const s = sectionStyle;
	const effect = getEffectPattern(
		s.backgroundEffect,
		themeMode,
		s.backgroundEffectIntensity,
		s.backgroundEffectColor,
	);
	const style: React.CSSProperties = {
		paddingTop: s.paddingY ?? 80,
		paddingBottom: s.paddingY ?? 80,
	};

	if (s.backgroundType === "gradient" && s.gradientFrom && s.gradientTo) {
		const gradient = `linear-gradient(${s.gradientDirection || "to bottom"}, ${s.gradientFrom}, ${s.gradientTo})`;
		if (effect) {
			style.backgroundImage = `${effect.image}, ${gradient}`;
			style.backgroundSize = `${effect.size}, auto`;
			style.backgroundPosition = `${effect.position || "left top"}, center`;
		} else {
			style.background = gradient;
		}
	} else if (s.backgroundType === "image" && s.backgroundImage) {
		const imageLayer = `url(${s.backgroundImage})`;
		if (effect) {
			style.backgroundImage = `${effect.image}, ${imageLayer}`;
			style.backgroundSize = `${effect.size}, cover`;
			style.backgroundPosition = `${effect.position || "left top"}, center`;
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
			style.backgroundPosition = effect.position || "left top";
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
	onMoveBlockToSlot,
	onMoveBlockToSlotAtIndex,
}: SectionRendererProps) {
	const renderSection: Section = {
		...section,
		style: getRenderSectionStyle(section, globalStyle, sectionIndex),
	};
	const orderedGroups = renderSection.groups.slice().sort((a, b) => a.order - b.order);
	const bgStyle = getSectionBackground(renderSection.style, globalStyle.themeMode);
	const sectionStyle: React.CSSProperties = renderSection.style.fullHeight
		? { ...bgStyle, minHeight: "100vh", display: "flex", flexDirection: "column" }
		: bgStyle;
	const groupStackAlignmentClass =
		renderSection.style.groupVerticalAlign === "center"
			? "justify-center"
			: renderSection.style.groupVerticalAlign === "bottom"
				? "justify-end"
				: "justify-start";

	return (
		<section style={sectionStyle}>
			<div
				className={cn(
					"mx-auto w-full max-w-6xl px-6",
					renderSection.style.fullHeight ? "flex flex-1" : "",
				)}>
				<div
					className={cn(
						"flex w-full flex-col gap-8",
						groupStackAlignmentClass,
						renderSection.style.fullHeight ? "flex-1" : "",
					)}>
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
							onMoveBlockToSlot={(blockId, slot) =>
								onMoveBlockToSlot?.(group.id, blockId, slot)
							}
							onMoveBlockToSlotAtIndex={(blockId, slot, targetIndex) =>
								onMoveBlockToSlotAtIndex?.(group.id, blockId, slot, targetIndex)
							}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
