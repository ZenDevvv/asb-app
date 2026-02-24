import type { BlockComponentProps } from "~/types/editor";
import { resolveAccentColor } from "~/lib/blockColors";

const SIZE_MAP: Record<string, number> = {
  sm: 24,
  base: 32,
  lg: 40,
  xl: 48,
  "2xl": 56,
  "3xl": 64,
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const OPACITY_MAP: Record<string, number> = {
  subtle: 0.1,
  medium: 0.18,
  strong: 0.28,
};

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const match = h.match(/.{2}/g);
  if (!match || match.length < 3) return `rgba(99, 102, 241, ${alpha})`;
  const [r, g, b] = match.map((x) => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function IconBlock({ block, globalStyle }: BlockComponentProps) {
  const { icon, displayStyle = "plain", bgOpacity = "medium" } = block.props as {
    icon: string;
    displayStyle?: string;
    bgOpacity?: string;
  };
  const s = block.style;

  const iconSize = SIZE_MAP[s.fontSize || "xl"] || 48;
  const accentColor = resolveAccentColor(s, globalStyle);
  const color = accentColor;
  const alignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] || "";
  const isPlain = displayStyle === "plain";

  const alpha = OPACITY_MAP[bgOpacity] ?? 0.18;
  const padding = Math.round(iconSize * 0.4);

  const borderRadiusMap: Record<string, string | number> = {
    circle: "50%",
    square: 6,
    "rounded-square": Math.round(iconSize * 0.22),
  };

  const iconEl = (
    <span className="material-symbols-outlined" style={{ fontSize: iconSize, color }}>
      {icon || "star"}
    </span>
  );

  return (
    <div
      className={alignClass}
      style={{
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
      }}
    >
      {isPlain ? (
        iconEl
      ) : (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding,
            backgroundColor: hexToRgba(accentColor, alpha),
            borderRadius: borderRadiusMap[displayStyle] ?? 6,
          }}
        >
          {iconEl}
        </div>
      )}
    </div>
  );
}
