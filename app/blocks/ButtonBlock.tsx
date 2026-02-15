import type { BlockComponentProps } from "~/types/editor";

const RADIUS_MAP: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

const FONT_SIZE_MAP: Record<string, string> = {
  sm: "text-sm px-4 py-2",
  base: "text-base px-6 py-2.5",
  lg: "text-lg px-8 py-3",
  xl: "text-xl px-10 py-3.5",
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function ButtonBlock({
  block,
  sectionStyle,
  globalStyle,
  isEditing,
}: BlockComponentProps) {
  const { text, url } = block.props as { text: string; url: string };
  const s = block.style;

  const accentColor = sectionStyle.accentColor || globalStyle.primaryColor || "#00e5a0";
  const radius = RADIUS_MAP[globalStyle.borderRadius || "md"] || "rounded-lg";
  const sizeClass = FONT_SIZE_MAP[s.fontSize || "base"] || FONT_SIZE_MAP.base;
  const alignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] || "";

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`flex ${alignClass}`}
      style={{
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
      }}
    >
      <a
        href={isEditing ? undefined : url || "#"}
        onClick={handleClick}
        className={`inline-flex items-center font-semibold text-white transition-opacity hover:opacity-90 ${radius} ${sizeClass}`}
        style={{ backgroundColor: accentColor }}
      >
        {text || "Click me"}
      </a>
    </div>
  );
}
