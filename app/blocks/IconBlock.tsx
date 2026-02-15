import type { BlockComponentProps } from "~/types/editor";

const SIZE_MAP: Record<string, number> = {
  sm: 24,
  base: 32,
  lg: 40,
  xl: 48,
  "2xl": 56,
  "3xl": 64,
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function IconBlock({ block, sectionStyle, globalStyle }: BlockComponentProps) {
  const { icon, label } = block.props as { icon: string; label?: string };
  const s = block.style;

  const iconSize = SIZE_MAP[s.fontSize || "xl"] || 48;
  const color = s.textColor || sectionStyle.accentColor || globalStyle.primaryColor || "#00e5a0";
  const alignClass = TEXT_ALIGN_MAP[s.textAlign || "left"] || "";

  return (
    <div
      className={alignClass}
      style={{
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: iconSize, color }}
      >
        {icon || "star"}
      </span>
      {label && (
        <p
          className="mt-1 text-sm"
          style={{ color: sectionStyle.textColor || "#ffffff" }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
