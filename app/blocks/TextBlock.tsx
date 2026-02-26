import type { BlockComponentProps } from "~/types/editor";
import { resolveTextColor } from "~/lib/blockColors";

const FONT_SIZE_MAP: Record<string, string> = {
	sm: "text-sm",
	base: "text-base",
	lg: "text-lg",
	xl: "text-xl",
	"2xl": "text-2xl",
	"3xl": "text-3xl",
	"4xl": "text-4xl",
	"5xl": "text-5xl",
};

const ICON_SIZE_MAP: Record<string, number> = {
	sm: 16,
	base: 18,
	lg: 20,
	xl: 22,
	"2xl": 24,
	"3xl": 28,
	"4xl": 32,
	"5xl": 36,
};

const TEXT_ALIGN_MAP: Record<string, string> = {
	left: "text-left",
	center: "text-center",
	right: "text-right",
};

const FONT_WEIGHT_MAP: Record<string, string> = {
	normal: "font-normal",
	medium: "font-medium",
	semibold: "font-semibold",
	bold: "font-bold",
};

const CUSTOM_TEXT_SIZE_MIN = 12;
const CUSTOM_TEXT_SIZE_MAX = 200;

export function TextBlock({ block, globalStyle }: BlockComponentProps) {
	const { text, iconLeft, iconRight } = block.props as {
		text: string;
		iconLeft?: string;
		iconRight?: string;
	};
	const s = block.style;
	const isCustomFontSize = s.fontSize === "custom";
	const customFontSizePx =
		typeof s.fontSizePx === "number" && Number.isFinite(s.fontSizePx)
			? Math.min(
					CUSTOM_TEXT_SIZE_MAX,
					Math.max(CUSTOM_TEXT_SIZE_MIN, Math.round(s.fontSizePx)),
				)
			: undefined;
	const iconSize =
		isCustomFontSize && typeof customFontSizePx === "number"
			? customFontSizePx
			: ICON_SIZE_MAP[s.fontSize || "base"] || ICON_SIZE_MAP.base;

	const classes = [
		!isCustomFontSize ? FONT_SIZE_MAP[s.fontSize || "base"] || "text-base" : "text-base",
		TEXT_ALIGN_MAP[s.textAlign || "left"] || "text-left",
		FONT_WEIGHT_MAP[s.fontWeight || "normal"] || "font-normal",
		"leading-relaxed",
	].join(" ");

	return (
		<p
			className={classes}
			style={{
				fontFamily: s.fontFamily || globalStyle.fontFamily,
				fontStyle: s.fontStyle || "normal",
				fontSize:
					isCustomFontSize && typeof customFontSizePx === "number"
						? `${customFontSizePx}px`
						: undefined,
				letterSpacing:
					typeof s.letterSpacing === "number" ? `${s.letterSpacing}px` : undefined,
				color: resolveTextColor(s, globalStyle),
				opacity: (s.opacity ?? 100) / 100,
				marginTop: s.marginTop ?? 0,
				marginBottom: s.marginBottom ?? 0,
			}}>
			{iconLeft ? (
				<span
					aria-hidden="true"
					className="material-symbols-outlined"
					style={{
						fontSize: iconSize,
						verticalAlign: "text-bottom",
						marginRight: "0.35em",
					}}>
					{iconLeft}
				</span>
			) : null}
			{text || "Body text goes here..."}
			{iconRight ? (
				<span
					aria-hidden="true"
					className="material-symbols-outlined"
					style={{
						fontSize: iconSize,
						verticalAlign: "text-bottom",
						marginLeft: "0.35em",
					}}>
					{iconRight}
				</span>
			) : null}
		</p>
	);
}
