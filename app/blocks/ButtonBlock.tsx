import type { BlockComponentProps } from "~/types/editor";
import { resolveAccentColor } from "~/lib/blockColors";

const BUTTON_APPEARANCES = ["solid", "outline", "ghost", "link", "text"] as const;
type ButtonAppearance = (typeof BUTTON_APPEARANCES)[number];

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

const ICON_SIZE_MAP: Record<string, number> = {
  sm: 16,
  base: 18,
  lg: 20,
  xl: 22,
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

interface ButtonAppearanceConfig {
  className: string;
  style: React.CSSProperties;
}

function getAppearanceConfig(
  appearance: ButtonAppearance,
  accentColor: string,
  radius: string,
  sizeClass: string,
): ButtonAppearanceConfig {
  switch (appearance) {
    case "outline":
      return {
        className: `cursor-pointer inline-flex items-center gap-2 font-semibold transition-opacity hover:opacity-80 border-2 ${radius} ${sizeClass}`,
        style: { color: accentColor, borderColor: accentColor, backgroundColor: "transparent" },
      };
    case "ghost":
      return {
        className: `cursor-pointer inline-flex items-center gap-2 font-semibold transition-opacity hover:opacity-80 ${radius} ${sizeClass}`,
        style: { color: accentColor, backgroundColor: `${accentColor}14` },
      };
    case "link":
      return {
        className: "cursor-pointer inline-flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-70 underline underline-offset-4",
        style: { color: accentColor },
      };
    case "text":
      return {
        className: "cursor-pointer inline-flex items-center gap-1.5 transition-opacity hover:opacity-70",
        style: { color: accentColor },
      };
    case "solid":
    default:
      return {
        className: `cursor-pointer inline-flex items-center gap-2 font-semibold text-white transition-opacity hover:opacity-90 ${radius} ${sizeClass}`,
        style: { backgroundColor: accentColor },
      };
  }
}

function resolveButtonAppearance(props: Record<string, unknown>): ButtonAppearance {
  const rawAppearance = props.appearance;
  if (
    typeof rawAppearance === "string" &&
    BUTTON_APPEARANCES.includes(rawAppearance as ButtonAppearance)
  ) {
    return rawAppearance as ButtonAppearance;
  }

  // Backward compatibility: historical payloads stored style choice in `variant`.
  const rawLegacyVariant = props.variant;
  if (
    typeof rawLegacyVariant === "string" &&
    BUTTON_APPEARANCES.includes(rawLegacyVariant as ButtonAppearance)
  ) {
    return rawLegacyVariant as ButtonAppearance;
  }

  return "solid";
}

export function ButtonBlock({
  block,
  globalStyle,
  isEditing,
}: BlockComponentProps) {
  const { text, url, iconLeft, iconRight } = block.props as {
    text: string;
    url: string;
    appearance?: ButtonAppearance;
    variant?: string;
    iconLeft?: string;
    iconRight?: string;
  };
  const appearance = resolveButtonAppearance(block.props);

  const s = block.style;
  const accentColor = resolveAccentColor(s, globalStyle);
  const radiusKey = s.borderRadius || globalStyle.borderRadius || "md";
  const radius = RADIUS_MAP[radiusKey] || "rounded-lg";
  const sizeClass = FONT_SIZE_MAP[s.fontSize || "base"] || FONT_SIZE_MAP.base;
  const alignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] || "justify-start";
  const iconSize = ICON_SIZE_MAP[s.fontSize || "base"] || 18;

  const { className: appearanceClass, style: appearanceStyle } = getAppearanceConfig(
    appearance,
    accentColor,
    radius,
    sizeClass,
  );

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) e.preventDefault();
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
        className={appearanceClass}
        style={{ ...appearanceStyle, fontFamily: s.fontFamily || globalStyle.fontFamily }}
      >
        {iconLeft ? (
          <span className="material-symbols-outlined" style={{ fontSize: iconSize }}>
            {iconLeft}
          </span>
        ) : null}
        {text || "Click me"}
        {iconRight ? (
          <span className="material-symbols-outlined" style={{ fontSize: iconSize }}>
            {iconRight}
          </span>
        ) : null}
      </a>
    </div>
  );
}
