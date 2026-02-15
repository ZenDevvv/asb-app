import type { BlockComponentProps } from "~/types/editor";

const FONT_SIZE_MAP: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function QuoteBlock({ block, sectionStyle, globalStyle }: BlockComponentProps) {
  const { text, attribution } = block.props as {
    text: string;
    attribution?: string;
  };
  const s = block.style;

  const color = s.textColor || sectionStyle.textColor || "#ffffff";
  const accentColor = sectionStyle.accentColor || globalStyle.primaryColor || "#00e5a0";
  const sizeClass = FONT_SIZE_MAP[s.fontSize || "lg"] || "text-lg";
  const alignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] || "";

  return (
    <blockquote
      className={`${alignClass}`}
      style={{
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
        paddingLeft: 16,
      }}
    >
      <p
        className={`${sizeClass} italic leading-relaxed`}
        style={{ color, opacity: 0.9 }}
      >
        "{text || "Quote text goes here..."}"
      </p>
      {attribution && (
        <cite
          className="mt-2 block text-sm not-italic"
          style={{ color, opacity: 0.6 }}
        >
          — {attribution}
        </cite>
      )}
    </blockquote>
  );
}
