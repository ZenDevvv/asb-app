import type { BlockComponentProps } from "~/types/editor";

export function DividerBlock({ block, sectionStyle }: BlockComponentProps) {
  const s = block.style;
  const color = s.textColor || sectionStyle.textColor || "#ffffff";

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
