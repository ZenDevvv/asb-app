import type { BlockComponentProps } from "~/types/editor";

const WIDTH_MAP: Record<string, string> = {
  auto: "w-auto",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "w-full",
};

const RADIUS_MAP: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function ImageBlock({ block, globalStyle }: BlockComponentProps) {
  const { src, alt } = block.props as { src: string; alt: string };
  const s = block.style;

  const widthClass = WIDTH_MAP[s.width || "full"] || "w-full";
  const radius = RADIUS_MAP[globalStyle.borderRadius || "md"] || "rounded-lg";

  if (!src) {
    return (
      <div
        className={`flex aspect-video items-center justify-center bg-white/5 ${widthClass} ${radius}`}
        style={{
          marginTop: s.marginTop ?? 0,
          marginBottom: s.marginBottom ?? 0,
        }}
      >
        <span
          className="material-symbols-outlined text-white/20"
          style={{ fontSize: 48 }}
        >
          image
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      className={`object-cover ${widthClass} ${radius}`}
      style={{
        marginTop: s.marginTop ?? 0,
        marginBottom: s.marginBottom ?? 0,
        opacity: (s.opacity ?? 100) / 100,
      }}
    />
  );
}
