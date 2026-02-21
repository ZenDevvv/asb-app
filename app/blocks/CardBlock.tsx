import type { BlockComponentProps } from "~/types/editor";
import { resolveTextColor, resolveAccentColor } from "~/lib/blockColors";

const WIDTH_MAP: Record<string, string> = {
  auto: "w-auto",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "w-full",
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const JUSTIFY_MAP: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

const BODY_SIZE_MAP: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
};

const TITLE_SIZE_MAP: Record<string, string> = {
  sm: "text-base",
  base: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
  "2xl": "text-3xl",
  "3xl": "text-4xl",
  "4xl": "text-5xl",
  "5xl": "text-5xl",
};

const RADIUS_MAP: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-2xl",
};

export function CardBlock({
  block,
  globalStyle,
  isEditing,
}: BlockComponentProps) {
  const {
    title,
    text,
    buttonText,
    buttonUrl,
    imageSrc,
    imageAlt,
  } = block.props as {
    title?: string;
    text?: string;
    buttonText?: string;
    buttonUrl?: string;
    imageSrc?: string;
    imageAlt?: string;
  };

  const s = block.style;
  const accentColor = resolveAccentColor(s, globalStyle);
  const contentColor = resolveTextColor(s, globalStyle);
  const widthClass = WIDTH_MAP[s.width || "full"] || "w-full";
  const textAlignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] || "text-left";
  const justifyClass = JUSTIFY_MAP[s.textAlign || "left"] || "justify-start";
  const bodySizeClass = BODY_SIZE_MAP[s.fontSize || "base"] || "text-base";
  const titleSizeClass = TITLE_SIZE_MAP[s.fontSize || "base"] || "text-lg";
  const cardRadiusClass = RADIUS_MAP[globalStyle.borderRadius || "md"] || "rounded-lg";
  const isLightTheme = globalStyle.themeMode === "light";

  return (
    <div
      className={`flex ${justifyClass}`}
      style={{
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
      }}
    >
      <article
        className={`overflow-hidden border p-5 sm:p-6 ${cardRadiusClass} ${widthClass}`}
        style={{
          color: contentColor,
          opacity: (s.opacity ?? 100) / 100,
          borderColor: `${accentColor}40`,
          backgroundColor: isLightTheme ? "rgba(255,255,255,0.76)" : "rgba(255,255,255,0.04)",
          boxShadow: isLightTheme
            ? "inset 0 1px 0 rgba(255,255,255,0.95), 0 4px 12px rgba(15,23,18,0.06)"
            : "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt || ""}
            className={`mb-4 aspect-video w-full object-cover ${cardRadiusClass}`}
          />
        ) : null}

        <div className={`space-y-3 ${textAlignClass}`}>
          <h3 className={`font-semibold leading-tight ${titleSizeClass}`}>
            {title || "Card title"}
          </h3>

          <p className={`leading-relaxed ${bodySizeClass}`}>
            {text || "Use cards to group related content and CTAs in a clean, scannable layout."}
          </p>

          {buttonText ? (
            <div className={`pt-1 flex ${justifyClass}`}>
              <a
                href={isEditing ? undefined : buttonUrl || "#"}
                onClick={(event) => {
                  if (isEditing) event.preventDefault();
                }}
                className={`inline-flex items-center font-semibold text-white transition-opacity hover:opacity-90 px-4 py-2 ${cardRadiusClass}`}
                style={{ backgroundColor: accentColor }}
              >
                {buttonText}
              </a>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
