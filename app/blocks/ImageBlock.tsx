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

type TextPosition =
  | "top-left" | "top-center" | "top-right"
  | "mid-left" | "mid-center" | "mid-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

const POSITION_CLASSES: Record<TextPosition, string> = {
  "top-left":      "top-0 left-0 items-start justify-start text-left",
  "top-center":    "top-0 left-0 right-0 items-start justify-center text-center",
  "top-right":     "top-0 right-0 items-start justify-end text-right",
  "mid-left":      "top-0 bottom-0 left-0 items-center justify-start text-left",
  "mid-center":    "inset-0 items-center justify-center text-center",
  "mid-right":     "top-0 bottom-0 right-0 items-center justify-end text-right",
  "bottom-left":   "bottom-0 left-0 items-end justify-start text-left",
  "bottom-center": "bottom-0 left-0 right-0 items-end justify-center text-center",
  "bottom-right":  "bottom-0 right-0 items-end justify-end text-right",
};

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

export function ImageBlock({ block, globalStyle }: BlockComponentProps) {
  const { src, alt, caption, textPosition } = block.props as {
    src: string;
    alt: string;
    caption?: string;
    textPosition?: TextPosition;
  };
  const s = block.style;

  const widthClass = WIDTH_MAP[s.width || "full"] || "w-full";
  const radius = RADIUS_MAP[globalStyle.borderRadius || "md"] || "rounded-lg";
  const isLightTheme = globalStyle.themeMode === "light";
  const heightStyle = s.height ? { height: s.height } : {};
  const overlayStyle = getOverlayStyle(s.overlayEffect, s.overlayIntensity ?? 40);
  const positionClasses = POSITION_CLASSES[(textPosition as TextPosition) || "mid-center"];

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center ${widthClass} ${radius} ${s.height ? "" : "aspect-video"}`}
        style={{
          marginTop: s.marginTop ?? 0,
          marginBottom: s.marginBottom ?? 0,
          backgroundColor: isLightTheme ? "rgba(16,26,22,0.06)" : "rgba(255,255,255,0.05)",
          ...heightStyle,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 48,
            color: isLightTheme ? "rgba(16,26,22,0.32)" : "rgba(255,255,255,0.2)",
          }}
        >
          image
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
        ...heightStyle,
      }}
    >
      <img
        src={src}
        alt={alt || ""}
        className="object-cover w-full h-full"
        style={{ opacity: (s.opacity ?? 100) / 100 }}
      />

      {overlayStyle && (
        <div className={`absolute inset-0 ${radius}`} style={overlayStyle} />
      )}

      {caption && (
        <div className={`absolute flex p-4 ${positionClasses}`}>
          <p className="text-sm font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] max-w-[80%]">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
