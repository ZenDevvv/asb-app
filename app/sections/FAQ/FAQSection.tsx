import { useState } from "react";
import type { SectionComponentProps } from "~/types/editor";
import { cn } from "~/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection({ section }: SectionComponentProps) {
  const {
    headline = "Frequently asked questions",
    faqs = [],
  } = section.props as {
    headline: string;
    faqs: FAQItem[];
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

        {variant === "accordion" && (
          <div className="mx-auto max-w-3xl">
            <AccordionList faqs={faqs} accentColor={style.accentColor} />
          </div>
        )}

        {variant === "two-column" && (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-2 font-semibold">{faq.question}</h3>
                <p className="text-sm opacity-60">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        {variant === "simple" && (
          <div className="mx-auto max-w-3xl space-y-8">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="mb-2 font-semibold">{faq.question}</h3>
                <p className="text-sm opacity-60">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AccordionList({
  faqs,
  accentColor,
}: {
  faqs: FAQItem[];
  accentColor?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
        >
          <button
            className="flex w-full items-center justify-between p-5 text-left font-medium"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {faq.question}
            <span
              className={cn(
                "material-symbols-outlined shrink-0 transition-transform",
                openIndex === i && "rotate-180",
              )}
              style={{ fontSize: 20, color: accentColor || "#00e5a0" }}
            >
              expand_more
            </span>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-5 text-sm opacity-60">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
