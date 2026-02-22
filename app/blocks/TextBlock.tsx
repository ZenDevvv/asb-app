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

const TEXT_ALIGN_MAP: Record<string, string> = {
	left: "text-left",
	center: "text-center",
	right: "text-right",
};

const CUSTOM_TEXT_SIZE_MIN = 12;
const CUSTOM_TEXT_SIZE_MAX = 200;

export function TextBlock({ block, globalStyle }: BlockComponentProps) {
	const { text } = block.props as { text: string };
	const s = block.style;
	const isCustomFontSize = s.fontSize === "custom";
	const customFontSizePx =
		typeof s.fontSizePx === "number" && Number.isFinite(s.fontSizePx)
			? Math.min(
					CUSTOM_TEXT_SIZE_MAX,
					Math.max(CUSTOM_TEXT_SIZE_MIN, Math.round(s.fontSizePx)),
				)
			: undefined;

	const classes = [
		!isCustomFontSize ? FONT_SIZE_MAP[s.fontSize || "base"] || "text-base" : "text-base",
		TEXT_ALIGN_MAP[s.textAlign || "left"] || "text-left",
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
			{text || "Body text goes here..."}
		</p>
	);
}
