import type { SectionComponentProps } from "~/types/editor";
import { cn } from "~/lib/utils";

export function CTASection({ section, isEditing }: SectionComponentProps) {
  const {
    headline = "Ready to get started?",
    subheadline = "Join thousands of creators building beautiful websites.",
    buttonText = "Start Free",
    buttonUrl = "#",
  } = section.props as {
    headline: string;
    subheadline: string;
    buttonText: string;
    buttonUrl: string;
  };

  const style = section.style;
  const variant = section.variant;
  const paddingY = style.paddingY ?? 80;

  const bgStyles: React.CSSProperties = {
    backgroundColor: style.backgroundColor || "#0d1512",
    color: style.textColor || "#ffffff",
    paddingTop: paddingY,
    paddingBottom: paddingY,
  };

  if (style.backgroundType === "gradient") {
    bgStyles.background = `linear-gradient(${style.gradientDirection || "to bottom"}, ${style.gradientFrom || "#0d1512"}, ${style.gradientTo || "#1a2f2a"})`;
  }

  return (
    <section style={bgStyles} className="w-full">
      <div className="mx-auto max-w-7xl px-6">
        {variant === "banner" && (
          <div
            className="rounded-2xl px-8 py-12 text-center"
            style={{
              background: `linear-gradient(135deg, ${style.accentColor || "#00e5a0"}15, ${style.accentColor || "#00e5a0"}05)`,
              border: `1px solid ${style.accentColor || "#00e5a0"}30`,
            }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight">{headline}</h2>
            <p className="mx-auto mb-8 max-w-lg opacity-70">{subheadline}</p>
            <a
              href={isEditing ? undefined : buttonUrl}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: style.accentColor || "#00e5a0",
                color: "#0a0f0d",
              }}
              onClick={isEditing ? (e) => e.preventDefault() : undefined}
            >
              {buttonText}
            </a>
          </div>
        )}

        {variant === "split" && (
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight">{headline}</h2>
              <p className="max-w-lg opacity-70">{subheadline}</p>
            </div>
            <a
              href={isEditing ? undefined : buttonUrl}
              className="shrink-0 rounded-full px-8 py-3 font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: style.accentColor || "#00e5a0",
                color: "#0a0f0d",
              }}
              onClick={isEditing ? (e) => e.preventDefault() : undefined}
            >
              {buttonText}
            </a>
          </div>
        )}

        {variant === "minimal" && (
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">{headline}</h2>
            <a
              href={isEditing ? undefined : buttonUrl}
              className={cn(
                "text-base font-semibold underline underline-offset-4 transition-opacity hover:opacity-80",
              )}
              style={{ color: style.accentColor || "#00e5a0" }}
              onClick={isEditing ? (e) => e.preventDefault() : undefined}
            >
              {buttonText} →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
