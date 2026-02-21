import type { BlockComponentProps } from "~/types/editor";
import { resolveTextColor, resolveAccentColor } from "~/lib/blockColors";

const FONT_SIZE_MAP: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const INLINE_ALIGN_MAP: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function ListBlock({ block, globalStyle }: BlockComponentProps) {
  const { items, ordered, inline } = block.props as {
    items: { text: string; url?: string }[];
    ordered?: boolean;
    inline?: boolean;
  };
  const s = block.style;

  const color = resolveTextColor(s, globalStyle);
  const accentColor = resolveAccentColor(s, globalStyle);
  const sizeClass = FONT_SIZE_MAP[s.fontSize || "base"] || "text-base";
  const inlineAlignClass = INLINE_ALIGN_MAP[s.textAlign || "left"] || "justify-start";
  const textAlignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] || "text-left";
  const listItems = items && items.length > 0
    ? items
    : [{ text: "List item 1" }, { text: "List item 2" }, { text: "List item 3" }];

  if (inline) {
    return (
      <ul
        className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${inlineAlignClass} ${sizeClass} ${textAlignClass} list-none pl-0`}
        style={{
          color,
          marginTop: s.marginTop ?? 0,
          marginBottom: s.marginBottom ?? 0,
        }}
      >
        {listItems.map((item, i) => (
          <li key={i} className="whitespace-nowrap">
            {item.url ? (
              <a
                href={item.url}
                className="font-medium transition-opacity hover:opacity-90"
                style={{ color }}
              >
                {item.text}
              </a>
            ) : (
              <span className="font-medium">{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={`space-y-2 ${sizeClass} ${textAlignClass} ${ordered ? "list-decimal" : "list-none"} pl-0`}
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
