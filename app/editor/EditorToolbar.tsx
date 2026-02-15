import { useEditorStore } from "~/stores/editorStore";
import { cn } from "~/lib/utils";
import { useMemo } from "react";

export function EditorToolbar() {
  const device = useEditorStore((s) => s.device);
  const setDevice = useEditorStore((s) => s.setDevice);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const history = useEditorStore((s) => s.history);
  const future = useEditorStore((s) => s.future);
  const lastSaved = useEditorStore((s) => s.lastSaved);
  const saveToLocalStorage = useEditorStore((s) => s.saveToLocalStorage);

  const savedAgo = useMemo(() => {
    if (!lastSaved) return null;
    const diff = Date.now() - new Date(lastSaved).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    return `${mins} min${mins > 1 ? "s" : ""} ago`;
  }, [lastSaved]);

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 18 }}
          >
            dashboard
          </span>
        </div>
        <div>
          <div className="text-sm font-semibold text-sidebar-foreground">
            Landing Page V1
          </div>
          <div className="text-[10px] text-muted-foreground">
            {savedAgo ? `Last saved ${savedAgo}` : "Not saved yet"}
          </div>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center gap-2">
        {/* Device Toggle */}
        <div className="flex items-center rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-0.5">
          <button
            onClick={() => setDevice("desktop")}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors",
              device === "desktop"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              monitor
            </span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors",
              device === "mobile"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              smartphone
            </span>
          </button>
        </div>

        <div className="mx-2 h-5 w-px bg-sidebar-border" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            undo
          </span>
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            redo
          </span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            window.open("/editor/preview", "_blank");
          }}
          className="flex items-center gap-1.5 rounded-xl border border-sidebar-border px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            visibility
          </span>
          Preview
        </button>
        <button
          onClick={saveToLocalStorage}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Publish
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            rocket_launch
          </span>
        </button>
      </div>
    </div>
  );
}
