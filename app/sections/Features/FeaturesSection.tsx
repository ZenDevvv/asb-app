import type { SectionComponentProps } from "~/types/editor";
import { cn } from "~/lib/utils";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

export function FeaturesSection({ section }: SectionComponentProps) {
  const {
    headline = "Everything you need",
    features = [],
  } = section.props as {
    headline: string;
    features: Feature[];
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
        {headline && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {headline}
          </h2>
        )}

        {variant === "cards" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/[0.07]"
              >
                <div
                  className="mb-4 inline-flex size-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: (style.accentColor || "#00e5a0") + "20" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 24, color: style.accentColor || "#00e5a0" }}
                  >
                    {f.icon || "star"}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm opacity-60">{f.description}</p>
              </div>
            ))}
          </div>
        )}

        {variant === "icons-row" && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className="text-center">
                <div
                  className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: (style.accentColor || "#00e5a0") + "20" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 28, color: style.accentColor || "#00e5a0" }}
                  >
                    {f.icon || "star"}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm opacity-60">{f.description}</p>
              </div>
            ))}
          </div>
        )}

        {variant === "alternating" && (
          <div className="space-y-16">
            {features.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center gap-8 md:flex-row",
                  i % 2 !== 0 && "md:flex-row-reverse",
                )}
              >
                <div
                  className="flex size-20 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: (style.accentColor || "#00e5a0") + "20" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 36, color: style.accentColor || "#00e5a0" }}
                  >
                    {f.icon || "star"}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                  <p className="opacity-60">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
