import type { BlockComponentProps } from "~/types/editor";
import { resolveTextColor, resolveAccentColor } from "~/lib/blockColors";

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

const FONT_WEIGHT_MAP: Record<string, string> = {
	normal: "font-normal",
	medium: "font-medium",
	semibold: "font-semibold",
	bold: "font-bold",
};

const TEXT_ALIGN_MAP: Record<string, string> = {
	left: "text-left",
	center: "text-center",
	right: "text-right",
};

export function HeadingBlock({ block, globalStyle }: BlockComponentProps) {
	const { text, textStyle = "default" } = block.props as { text: string; textStyle?: string };
	const s = block.style;

	const isGradient = textStyle === "gradient";

	const accentColor = resolveAccentColor(s, globalStyle);
	const gradientTo = globalStyle.themeMode === "dark" ? "#ffffff" : "#111111";

	const classes = [
		FONT_SIZE_MAP[s.fontSize || "4xl"] || "text-4xl",
		FONT_WEIGHT_MAP[s.fontWeight || "bold"] || "font-bold",
		TEXT_ALIGN_MAP[s.textAlign || "left"] || "text-left",
		"leading-tight",
		"text-balance",
	].join(" ");

	const inlineStyle: React.CSSProperties = {
		fontFamily: s.fontFamily || globalStyle.fontFamily,
		fontStyle: s.fontStyle || "normal",
		letterSpacing: typeof s.letterSpacing === "number" ? `${s.letterSpacing}px` : undefined,
		...(isGradient
			? {
					background: `linear-gradient(135deg, ${accentColor}, ${gradientTo})`,
					WebkitBackgroundClip: "text",
					backgroundClip: "text",
					color: "transparent",
				}
			: {
					color: resolveTextColor(s, globalStyle),
				}),
		marginTop: s.marginTop ?? 0,
		marginBottom: s.marginBottom ?? 0,
	};

	return (
		<h2 className={classes} style={inlineStyle}>
			{text || "Heading text"}
		</h2>
	);
}
