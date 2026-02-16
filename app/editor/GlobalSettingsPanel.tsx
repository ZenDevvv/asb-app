import { useEditorStore } from "~/stores/editorStore";
import { ColorControl } from "~/components/controls/ColorControl";
import { cn } from "~/lib/utils";

export function GlobalSettingsPanel() {
  const globalStyle = useEditorStore((s) => s.globalStyle);
  const updateGlobalStyle = useEditorStore((s) => s.updateGlobalStyle);

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-4 py-3">
        <div className="text-sm font-semibold text-sidebar-foreground">
          Page Settings
        </div>
        <div className="text-[10px] uppercase tracking-widest text-primary">
          Global
        </div>
      </div>

      <div className="minimal-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Font Family</label>
          <select
            value={globalStyle.fontFamily}
            onChange={(e) => updateGlobalStyle({ fontFamily: e.target.value })}
            className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground"
          >
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        <ColorControl
          label="Primary Color"
          value={globalStyle.primaryColor}
          onChange={(v) => updateGlobalStyle({ primaryColor: v })}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Corner Style
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(["none", "sm", "md", "lg", "full"] as const).map((r) => (
              <button
                key={r}
                onClick={() => updateGlobalStyle({ borderRadius: r })}
                className={cn(
                  "rounded-lg border py-1.5 text-[10px] font-medium transition-colors",
                  globalStyle.borderRadius === r
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                {r === "none" ? "Sharp" : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
