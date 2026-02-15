import type { SectionStyle } from "~/types/editor";
import { ColorControl } from "./ColorControl";
import { SliderControl } from "./SliderControl";
import { cn } from "~/lib/utils";

interface BackgroundControlProps {
  style: SectionStyle;
  onChange: (style: Partial<SectionStyle>) => void;
}

const BG_TYPES = [
  { id: "solid" as const, icon: "palette", label: "Solid" },
  { id: "gradient" as const, icon: "gradient", label: "Gradient" },
  { id: "image" as const, icon: "image", label: "Image" },
];

export function BackgroundControl({ style, onChange }: BackgroundControlProps) {
  const bgType = style.backgroundType || "solid";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {BG_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange({ backgroundType: t.id })}
            className={cn(
              "flex size-10 items-center justify-center rounded-xl border transition-colors",
              bgType === t.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:text-foreground",
            )}
            title={t.label}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {t.icon}
            </span>
          </button>
        ))}
      </div>

      {bgType === "solid" && (
        <ColorControl
          label="Color"
          value={style.backgroundColor || "#0a0f0d"}
          onChange={(v) => onChange({ backgroundColor: v })}
        />
      )}

      {bgType === "gradient" && (
        <div className="space-y-3">
          <ColorControl
            label="From"
            value={style.gradientFrom || "#0a0f0d"}
            onChange={(v) => onChange({ gradientFrom: v })}
          />
          <ColorControl
            label="To"
            value={style.gradientTo || "#1a2f2a"}
            onChange={(v) => onChange({ gradientTo: v })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Direction</label>
            <select
              value={style.gradientDirection || "to bottom"}
              onChange={(e) => onChange({ gradientDirection: e.target.value })}
              className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground"
            >
              <option value="to bottom">Top → Bottom</option>
              <option value="to right">Left → Right</option>
              <option value="to bottom right">Diagonal ↘</option>
              <option value="to bottom left">Diagonal ↙</option>
            </select>
          </div>
        </div>
      )}

      {bgType === "image" && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Image URL</label>
          <input
            type="text"
            placeholder="Paste image URL..."
            value={style.backgroundImage || ""}
            onChange={(e) => onChange({ backgroundImage: e.target.value })}
            className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
      )}

      <SliderControl
        label="Padding (Y-Axis)"
        value={style.paddingY ?? 80}
        onChange={(v) => onChange({ paddingY: v })}
        min={20}
        max={160}
      />
    </div>
  );
}
