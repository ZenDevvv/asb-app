import type { BlockComponentProps, BlockStyle } from "~/types/editor";

const WIDTH_MAP: Record<string, string> = {
	auto: "w-auto",
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	full: "w-full",
};

const RADIUS_MAP: Record<string, string> = {
	none: "rounded-none",
	sm: "rounded-md",
	md: "rounded-lg",
	lg: "rounded-xl",
	full: "rounded-full",
};

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

const SHADOW_MAP: Record<string, string> = {
	none: "none",
	sm: "0 2px 8px",
	md: "0 4px 16px",
	lg: "0 8px 32px",
};

const CUSTOM_CAPTION_SIZE_MIN = 12;
const CUSTOM_CAPTION_SIZE_MAX = 200;

function toAlpha(value: number): string {
	return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function getOverlayStyle(
	effect: BlockStyle["overlayEffect"],
	intensity: number,
): React.CSSProperties | null {
	if (!effect || effect === "none") return null;

	const t = intensity / 100;

	if (effect === "dots") {
		const alpha = toAlpha(0.6 * t);
		return {
			backgroundImage: `radial-gradient(circle, rgba(0,0,0,${alpha}) 1px, transparent 1px)`,
			backgroundSize: "24px 24px",
		};
	}

	if (effect === "grid") {
		const alpha = toAlpha(0.5 * t);
		const color = `rgba(0,0,0,${alpha})`;
		return {
			backgroundImage: [
				`linear-gradient(${color} 1px, transparent 1px)`,
				`linear-gradient(90deg, ${color} 1px, transparent 1px)`,
			].join(", "),
			backgroundSize: "40px 40px, 40px 40px",
		};
	}

	if (effect === "dim") {
		const alpha = toAlpha(0.85 * t);
		return {
			backgroundImage: `linear-gradient(rgba(0,0,0,${alpha}), rgba(0,0,0,${alpha}))`,
			backgroundSize: "auto",
		};
	}

	if (effect === "vignette") {
		const edgeAlpha = toAlpha(0.85 * t);
		const midAlpha = toAlpha(0.3 * t);
		return {
			backgroundImage: `radial-gradient(ellipse at center, rgba(0,0,0,0) 36%, rgba(0,0,0,${midAlpha}) 72%, rgba(0,0,0,${edgeAlpha}) 100%)`,
			backgroundSize: "cover",
			backgroundPosition: "center",
		};
	}

	return null;
}

const VERTICAL_ALIGN_CLASSES: Record<string, string> = {
	top: "top-0",
	center: "top-1/2 -translate-y-1/2",
	bottom: "bottom-0",
};

export function VideoBlock({ block, globalStyle }: BlockComponentProps) {
	const { src, alt, caption } = block.props as {
		src: string;
		alt: string;
		caption?: string;
	};
	const s = block.style;

	const widthClass = WIDTH_MAP[s.width || "full"] || "w-full";
	const radiusKey = s.borderRadius || globalStyle.borderRadius || "md";
	const radius = RADIUS_MAP[radiusKey] || "rounded-lg";
	const isLightTheme = globalStyle.themeMode === "light";
	const heightStyle = s.height ? { height: s.height } : {};
	const tilt =
		typeof s.tilt === "number" && Number.isFinite(s.tilt)
			? Math.max(-180, Math.min(180, s.tilt))
			: 0;
	const tiltStyle: React.CSSProperties =
		tilt === 0 ? {} : { transform: `rotate(${tilt}deg)`, transformOrigin: "center" };
	const baseBorderWidth =
		typeof s.borderWidth === "number" && Number.isFinite(s.borderWidth)
			? Math.max(0, s.borderWidth)
			: 0;
	const borderWidth = baseBorderWidth;
	const borderColor = s.borderColor || (isLightTheme ? "#334155" : "#ffffff");
	const shadowSize = s.shadowSize || "none";
	const shadowColor = s.shadowColor || "rgba(0,0,0,0.35)";
	const shadowBase = SHADOW_MAP[shadowSize] ?? "none";
	const mediaSurfaceStyle: React.CSSProperties = {
		...heightStyle,
		...tiltStyle,
		...(borderWidth > 0 ? { border: `${borderWidth}px solid ${borderColor}` } : {}),
		...(shadowBase !== "none" ? { boxShadow: `${shadowBase} ${shadowColor}` } : {}),
	};
	const overlayStyle = getOverlayStyle(s.overlayEffect, s.overlayIntensity ?? 40);

	const isCustomFontSize = s.fontSize === "custom";
	const customFontSizePx =
		typeof s.fontSizePx === "number" && Number.isFinite(s.fontSizePx)
			? Math.min(
					CUSTOM_CAPTION_SIZE_MAX,
					Math.max(CUSTOM_CAPTION_SIZE_MIN, Math.round(s.fontSizePx)),
				)
			: undefined;

	const captionClasses = [
		isCustomFontSize ? "" : (FONT_SIZE_MAP[s.fontSize || "xl"] ?? "text-xl"),
		FONT_WEIGHT_MAP[s.fontWeight || "bold"] ?? "font-bold",
		TEXT_ALIGN_MAP[s.textAlign || "center"] ?? "text-center",
	].join(" ");

	const captionStyle: React.CSSProperties = {
		fontFamily: s.fontFamily || globalStyle.fontFamily,
		fontStyle: s.fontStyle || "normal",
		letterSpacing: typeof s.letterSpacing === "number" ? `${s.letterSpacing}px` : undefined,
		fontSize: isCustomFontSize && customFontSizePx ? `${customFontSizePx}px` : undefined,
	};

	const verticalClass = VERTICAL_ALIGN_CLASSES[s.captionVerticalAlign || "center"];

	if (!src) {
		return (
			<div
				className={`flex items-center justify-center ${widthClass} ${radius} ${s.height ? "" : "aspect-video"}`}
				style={{
					marginTop: s.marginTop ?? 0,
					marginBottom: s.marginBottom ?? 0,
					backgroundColor: isLightTheme
						? "rgba(16,26,22,0.06)"
						: "rgba(255,255,255,0.05)",
					...mediaSurfaceStyle,
				}}>
				<span
					className="material-symbols-outlined"
					style={{
						fontSize: 48,
						color: isLightTheme ? "rgba(16,26,22,0.32)" : "rgba(255,255,255,0.2)",
					}}>
					video_library
				</span>
			</div>
		);
	}

	return (
		<div
			className={`relative ${widthClass} overflow-hidden ${radius} ${s.height ? "" : "aspect-video"}`}
			style={{
				marginTop: s.marginTop ?? 0,
				marginBottom: s.marginBottom ?? 0,
				...mediaSurfaceStyle,
			}}>
			<video
				src={src}
				aria-label={alt || undefined}
				controls
				playsInline
				preload="metadata"
				className="h-full w-full object-cover"
				style={{ opacity: (s.opacity ?? 100) / 100 }}
			/>

			{overlayStyle && (
				<div
					className={`pointer-events-none absolute inset-0 ${radius}`}
					style={overlayStyle}
				/>
			)}

			{caption && (
				<div
					className={`pointer-events-none absolute inset-x-0 ${verticalClass}`}
					style={{ padding: s.captionPadding ?? 16 }}>
					<p
						className={`w-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-white ${captionClasses}`}
						style={captionStyle}>
						{caption}
					</p>
				</div>
			)}
		</div>
	);
}
