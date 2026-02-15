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
  const { text } = block.props as { text: string };
  const s = block.style;

  const accentColor = sectionStyle.accentColor || globalStyle.primaryColor || "#00e5a0";
  const sizeClass = FONT_SIZE_MAP[s.fontSize || "base"] || FONT_SIZE_MAP.base;
  const alignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] || "";
  const radius = RADIUS_MAP[globalStyle.borderRadius || "md"] === "rounded-none"
    ? "rounded-md"
    : RADIUS_MAP[globalStyle.borderRadius || "md"] || "rounded-full";

  return (
    <div
      className={`flex ${alignClass}`}
      style={{
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
      }}
    >
      <span
        className={`inline-flex items-center font-semibold uppercase tracking-wider ${sizeClass} ${radius}`}
        style={{
          backgroundColor: `${accentColor}15`,
          color: accentColor,
        }}
      >
        {text || "Badge"}
      </span>
    </div>
  );
}
