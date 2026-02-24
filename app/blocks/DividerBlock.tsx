import type { BlockComponentProps } from "~/types/editor";
import { resolveTextColor } from "~/lib/blockColors";

const RELATIVE_WIDTH_MAP: Record<string, string> = {
	sm: "25%",
	md: "50%",
	lg: "75%",
	full: "100%",
};
const CUSTOM_WIDTH_MIN = 40;
const CUSTOM_WIDTH_MAX = 1600;
const CUSTOM_WIDTH_DEFAULT = 448;

function clampCustomWidth(value: number): number {
	if (!Number.isFinite(value)) {
		return CUSTOM_WIDTH_DEFAULT;
	}
	return Math.min(CUSTOM_WIDTH_MAX, Math.max(CUSTOM_WIDTH_MIN, Math.round(value)));
}

export function DividerBlock({ block, globalStyle }: BlockComponentProps) {
	const s = block.style;
	const color = resolveTextColor(s, globalStyle);
	const isCustomWidth = s.width === "custom";
	const customWidthPx = clampCustomWidth(
		typeof s.widthPx === "number" ? s.widthPx : CUSTOM_WIDTH_DEFAULT,
	);
	const relativeWidth = isCustomWidth
		? undefined
		: (RELATIVE_WIDTH_MAP[s.width || "full"] ?? "100%");

	return (
		<hr
			className="border-0"
			style={{
				height: 1,
				width: isCustomWidth ? `${customWidthPx}px` : relativeWidth,
				maxWidth: "100%",
				backgroundColor: color,
				opacity: (s.opacity ?? 20) / 100,
				marginTop: s.marginTop ?? 16,
				marginBottom: s.marginBottom ?? 16,
				marginLeft: "auto",
				marginRight: "auto",
			}}
		/>
	);
}
