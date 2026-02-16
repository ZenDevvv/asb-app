import { GroupRenderer } from "~/sections/GroupRenderer";
import type { BlockStyle, GlobalStyle, Section, SectionStyle } from "~/types/editor";

interface SectionRendererProps {
	section: Section;
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

	const mixAmount = luminance > 0.9 ? 0.9 : luminance > 0.75 ? 0.8 : luminance > 0.6 ? 0.68 : 0.52;
	return rgbToHex(mixColor(parsed, { r: 16, g: 26, b: 22 }, mixAmount));
}

function toneAccentForLightMode(color: string): string {
	const parsed = parseHexColor(color);
	if (!parsed) return color;

	if (getLuminance(parsed) <= 0.68) return color;
	return rgbToHex(mixColor(parsed, { r: 12, g: 20, b: 16 }, 0.28));
}

function getRenderSectionStyle(section: Section, globalStyle: GlobalStyle): SectionStyle {
	const style: SectionStyle = { ...section.style };
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

function getSectionBackground(
	sectionStyle: SectionStyle,
	themeMode: GlobalStyle["themeMode"],
): React.CSSProperties {
	const s = sectionStyle;
	const style: React.CSSProperties = {
		paddingTop: s.paddingY ?? 80,
		paddingBottom: s.paddingY ?? 80,
	};

	if (s.backgroundType === "gradient" && s.gradientFrom && s.gradientTo) {
		style.background = `linear-gradient(${s.gradientDirection || "to bottom"}, ${s.gradientFrom}, ${s.gradientTo})`;
	} else if (s.backgroundType === "image" && s.backgroundImage) {
		style.backgroundImage = `url(${s.backgroundImage})`;
		style.backgroundSize = "cover";
		style.backgroundPosition = "center";
		if (s.backgroundColor) {
			style.backgroundColor = s.backgroundColor;
		}
	} else {
		style.backgroundColor = s.backgroundColor || (themeMode === "light" ? "#f3faf6" : "#0a0f0d");
	}

	return style;
}

export function SectionRenderer({
	section,
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
		style: getRenderSectionStyle(section, globalStyle),
	};
	const orderedGroups = renderSection.groups.slice().sort((a, b) => a.order - b.order);
	const hasNavbarLayout =
		renderSection.type === "navbar" ||
		orderedGroups.some((group) => group.layout.id.startsWith("nav-"));
	const bgStyle = getSectionBackground(renderSection.style, globalStyle.themeMode);

	return (
		<section
			className={hasNavbarLayout ? "border-b border-border/60" : undefined}
			style={bgStyle}>
			<div className={hasNavbarLayout ? "mx-auto max-w-7xl px-6" : "mx-auto max-w-6xl px-6"}>
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
