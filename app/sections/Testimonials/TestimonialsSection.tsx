import type { SectionComponentProps } from "~/types/editor";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export function TestimonialsSection({ section }: SectionComponentProps) {
  const {
    headline = "What our customers say",
    testimonials = [],
  } = section.props as {
    headline: string;
    testimonials: Testimonial[];
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

  return (
    <section style={bgStyles} className="w-full">
      <div className="mx-auto max-w-7xl px-6">
        {headline && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {headline}
          </h2>
        )}

        {variant === "grid" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <p className="mb-4 text-sm italic opacity-80">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                    {t.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs opacity-50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {variant === "single" && testimonials.length > 0 && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-6 text-xl italic opacity-80">
              &ldquo;{testimonials[0].quote}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold">
                {testimonials[0].name?.charAt(0) || "?"}
              </div>
              <div className="text-left">
                <p className="font-semibold">{testimonials[0].name}</p>
                <p className="text-sm opacity-50">{testimonials[0].role}</p>
              </div>
            </div>
          </div>
        )}

        {variant === "slider" && (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="min-w-[300px] shrink-0 rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <p className="mb-4 text-sm italic opacity-80">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                    {t.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs opacity-50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
