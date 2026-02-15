import type { SectionComponentProps } from "~/types/editor";

interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

interface SocialLink {
  icon: string;
  url: string;
}

export function FooterSection({ section, isEditing }: SectionComponentProps) {
  const {
    logo = "Brand",
    columns = [],
    copyright = "© 2026 Brand. All rights reserved.",
    socialLinks = [],
  } = section.props as {
    logo: string;
    columns: FooterColumn[];
    copyright: string;
    socialLinks: SocialLink[];
  };

  const style = section.style;
  const variant = section.variant;
  const paddingY = style.paddingY ?? 60;

  const bgStyles: React.CSSProperties = {
    backgroundColor: style.backgroundColor || "#080c0a",
    color: style.textColor || "#ffffff",
    paddingTop: paddingY,
    paddingBottom: paddingY,
  };

  return (
    <footer style={bgStyles} className="w-full">
      <div className="mx-auto max-w-7xl px-6">
        {variant === "multi-column" && (
          <>
            <div className="mb-12 grid gap-8 md:grid-cols-4">
              <div>
                <div className="mb-4 text-xl font-bold">{logo}</div>
                <div className="flex gap-3">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={isEditing ? undefined : s.url}
                      className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                      onClick={isEditing ? (e) => e.preventDefault() : undefined}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16 }}
                      >
                        {s.icon}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              {columns.map((col, i) => (
                <div key={i}>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
                    {col.title}
                  </h4>
                  <ul className="space-y-2">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a
                          href={isEditing ? undefined : link.url}
                          className="text-sm opacity-60 transition-opacity hover:opacity-100"
                          onClick={isEditing ? (e) => e.preventDefault() : undefined}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-6 text-center text-sm opacity-40">
              {copyright}
            </div>
          </>
        )}

        {variant === "simple" && (
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-lg font-bold">{logo}</div>
            <div className="text-sm opacity-40">{copyright}</div>
            <div className="flex gap-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={isEditing ? undefined : s.url}
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                  onClick={isEditing ? (e) => e.preventDefault() : undefined}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {variant === "centered" && (
          <div className="text-center">
            <div className="mb-4 text-xl font-bold">{logo}</div>
            <div className="mb-6 flex justify-center gap-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={isEditing ? undefined : s.url}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                  onClick={isEditing ? (e) => e.preventDefault() : undefined}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
            <div className="text-sm opacity-40">{copyright}</div>
          </div>
        )}
      </div>
    </footer>
  );
}
