import type { BlockComponentProps } from "~/types/editor";
import { resolveTextColor } from "~/lib/blockColors";

export function DividerBlock({ block, globalStyle }: BlockComponentProps) {
  const s = block.style;
  const color = resolveTextColor(s, globalStyle);

  return (
    <hr
      className="border-0"
      style={{
        height: 1,
        backgroundColor: `${color}20`,
        marginTop: s.marginTop ?? 16,
        marginBottom: s.marginBottom ?? 16,
      }}
    />
  );
}
