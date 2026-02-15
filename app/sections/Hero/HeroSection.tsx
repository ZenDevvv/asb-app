import type { SectionComponentProps } from "~/types/editor";
import { cn } from "~/lib/utils";

export function HeroSection({ section, isEditing }: SectionComponentProps) {
  const {
    headline = "Build Faster. Design Better.",
    subheadline = "Create stunning landing pages in minutes without writing a single line of code.",
    buttonText = "Start Building Free",
    buttonUrl = "#",
    imageUrl = "",
  } = section.props as {
    headline: string;
    subheadline: string;
    buttonText: string;
    buttonUrl: string;
    imageUrl: string;
  };

  const style = section.style;
  const variant = section.variant;
  const paddingY = style.paddingY ?? 80;

  const bgStyles: React.CSSProperties = {
    backgroundColor: style.backgroundColor || "#0a0f0d",
    color: style.textColor || "#ffffff",
    paddingTop: paddingY,
    paddingBottom: paddingY,
  };

  if (style.backgroundType === "gradient") {
    bgStyles.background = `linear-gradient(${style.gradientDirection || "to bottom"}, ${style.gradientFrom || "#0a0f0d"}, ${style.gradientTo || "#1a2f2a"})`;
  }

  if (style.backgroundType === "image" && style.backgroundImage) {
    bgStyles.backgroundImage = `url(${style.backgroundImage})`;
    bgStyles.backgroundSize = "cover";
    bgStyles.backgroundPosition = "center";
  }

  const isSplit = variant === "split-left" || variant === "split-right";

  return (
    <section style={bgStyles} className="w-full">
      <div
        className={cn(
          "mx-auto max-w-7xl px-6",
          isSplit ? "flex flex-col items-center gap-12 md:flex-row" : "text-center",
          variant === "split-right" && "md:flex-row-reverse",
        )}
      >
        <div className={cn(isSplit ? "flex-1" : "mx-auto max-w-3xl")}>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {headline.split(".").map((part, i, arr) => (
              <span key={i}>
                {i === 1 && part.trim() ? (
                  <span style={{ color: style.accentColor || "#00e5a0" }}>
                    {part.trim()}.
                  </span>
                ) : (
                  <>
                    {part.trim()}
                    {i < arr.length - 1 && part.trim() ? "." : ""}
                  </>
                )}
                {i === 0 && arr.length > 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-70">{subheadline}</p>

          <a
            href={isEditing ? undefined : buttonUrl}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: style.accentColor || "#00e5a0",
              color: "#0a0f0d",
            }}
            onClick={isEditing ? (e) => e.preventDefault() : undefined}
          >
            {buttonText}
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_forward
            </span>
          </a>
        </div>

        {isSplit && (
          <div className="flex flex-1 items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Hero"
                className="max-h-[400px] w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-[300px] w-full items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-4xl opacity-30">
                  image
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
