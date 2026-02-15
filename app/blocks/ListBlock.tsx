import type { BlockComponentProps } from "~/types/editor";

const FONT_SIZE_MAP: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export function ListBlock({ block, sectionStyle, globalStyle }: BlockComponentProps) {
  const { items, ordered } = block.props as {
    items: { text: string; url?: string }[];
    ordered?: boolean;
  };
  const s = block.style;

  const color = s.textColor || sectionStyle.textColor || "#ffffff";
  const accentColor = sectionStyle.accentColor || globalStyle.primaryColor || "#00e5a0";
  const sizeClass = FONT_SIZE_MAP[s.fontSize || "base"] || "text-base";
  const listItems = items && items.length > 0
    ? items
    : [{ text: "List item 1" }, { text: "List item 2" }, { text: "List item 3" }];

  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={`space-y-2 ${sizeClass} ${ordered ? "list-decimal" : "list-none"} pl-0`}
      style={{
        color,
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
      }}
    >
      {listItems.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          {!ordered && (
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
          {item.url ? (
            <a
              href={item.url}
              className="transition-opacity hover:opacity-80"
              style={{ color }}
            >
              {item.text}
            </a>
          ) : (
            <span>{item.text}</span>
          )}
        </li>
      ))}
    </Tag>
  );
}
