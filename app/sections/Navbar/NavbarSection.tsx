import type { SectionComponentProps } from "~/types/editor";
import { cn } from "~/lib/utils";

export function NavbarSection({ section, isEditing }: SectionComponentProps) {
  const {
    logo = "Brand",
    navLinks = [],
    ctaText = "Get Started",
    ctaUrl = "#",
  } = section.props as {
    logo: string;
    navLinks: { label: string; url: string }[];
    ctaText: string;
    ctaUrl: string;
  };

  const style = section.style;
  const variant = section.variant;

  const containerStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor || "transparent",
    color: style.textColor || "#ffffff",
  };

  return (
    <nav style={containerStyle} className="w-full">
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center px-6 py-4",
          variant === "centered-logo" ? "justify-center" : "justify-between",
        )}
      >
        {variant !== "centered-logo" && (
          <div className="text-xl font-bold">{logo}</div>
        )}

        {variant === "centered-logo" && (
          <div className="flex items-center gap-8">
            <div className="hidden gap-6 md:flex">
              {navLinks.slice(0, Math.ceil(navLinks.length / 2)).map((link, i) => (
                <a
                  key={i}
                  href={isEditing ? undefined : link.url}
                  className="text-sm opacity-80 transition-opacity hover:opacity-100"
                  onClick={isEditing ? (e) => e.preventDefault() : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="text-xl font-bold">{logo}</div>
            <div className="hidden gap-6 md:flex">
              {navLinks.slice(Math.ceil(navLinks.length / 2)).map((link, i) => (
                <a
                  key={i}
                  href={isEditing ? undefined : link.url}
                  className="text-sm opacity-80 transition-opacity hover:opacity-100"
                  onClick={isEditing ? (e) => e.preventDefault() : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {variant !== "centered-logo" && (
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={isEditing ? undefined : link.url}
                className="text-sm opacity-80 transition-opacity hover:opacity-100"
                onClick={isEditing ? (e) => e.preventDefault() : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {variant === "with-cta" && (
          <a
            href={isEditing ? undefined : ctaUrl}
            className="rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: style.accentColor || "#00e5a0",
              color: "#0a0f0d",
            }}
            onClick={isEditing ? (e) => e.preventDefault() : undefined}
          >
            {ctaText}
          </a>
        )}
      </div>
    </nav>
  );
}
