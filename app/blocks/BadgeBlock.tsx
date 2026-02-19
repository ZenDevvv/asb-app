import type { BlockComponentProps } from "~/types/editor";

const FONT_SIZE_MAP: Record<string, string> = {
  sm: "text-[10px] px-2 py-0.5",
  base: "text-xs px-2.5 py-0.5",
  lg: "text-sm px-3 py-1",
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

const RADIUS_MAP: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function BadgeBlock({ block, sectionStyle, globalStyle }: BlockComponentProps) {
  const { text, variant = "subtle" } = block.props as {
    text: string;
    variant?: "subtle" | "filled" | "outline" | "pill-dot";
  };
  const s = block.style;

  const accentColor = sectionStyle.accentColor || globalStyle.primaryColor || "#00e5a0";
  const sizeClass = FONT_SIZE_MAP[s.fontSize || "base"] ?? FONT_SIZE_MAP.base;
  const alignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] ?? "";

  const globalRadius = RADIUS_MAP[globalStyle.borderRadius || "md"] ?? "rounded-full";
  // pill-dot is always fully rounded; subtle/filled/outline respect global radius but never go none
  const radius =
    variant === "pill-dot"
      ? "rounded-full"
      : globalRadius === "rounded-none"
        ? "rounded-md"
        : globalRadius;

  let badgeStyle: React.CSSProperties;
  if (variant === "filled") {
    badgeStyle = { backgroundColor: accentColor, color: "#ffffff" };
  } else if (variant === "outline") {
    badgeStyle = { border: `1px solid ${accentColor}`, color: accentColor };
  } else {
    // "subtle" and "pill-dot" share the same tinted background treatment
    badgeStyle = { backgroundColor: `${accentColor}18`, color: accentColor };
  }

  return (
    <div
      className={`flex ${alignClass}`}
      style={{ marginTop: s.marginTop ?? 0, marginBottom: s.marginBottom ?? 0 }}
    >
      <span
        className={`inline-flex items-center font-semibold uppercase tracking-wider ${sizeClass} ${radius}`}
        style={badgeStyle}
      >
        {variant === "pill-dot" && (
          <span
            className="mr-1.5 inline-block size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        )}
        {text || "Badge"}
      </span>
    </div>
  );
}
