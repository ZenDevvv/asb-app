import type { BlockComponentProps } from "~/types/editor";

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

export function HeadingBlock({ block, sectionStyle }: BlockComponentProps) {
  const { text } = block.props as { text: string };
  const s = block.style;

  const classes = [
    FONT_SIZE_MAP[s.fontSize || "4xl"] || "text-4xl",
    FONT_WEIGHT_MAP[s.fontWeight || "bold"] || "font-bold",
    TEXT_ALIGN_MAP[s.textAlign || "left"] || "text-left",
    "leading-tight",
  ].join(" ");

  return (
    <h2
      className={classes}
      style={{
        color: s.textColor || sectionStyle.textColor || "#ffffff",
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
      }}
    >
      {text || "Heading text"}
    </h2>
  );
}
