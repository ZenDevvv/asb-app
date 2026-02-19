import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { AddBlockModal } from "./AddBlockModal";
import { SettingsCollapsibleSection } from "./SettingsCollapsibleSection";
import { cn } from "~/lib/utils";
import type { Group, GroupStyle, LayoutTemplate, Section } from "~/types/editor";

interface GroupModeSettingsProps {
  section: Section;
  activeGroup: Group;
  selectedBlockId: string | null;
  allowedLayouts: LayoutTemplate[];
}

export function GroupModeSettings({
  section,
  activeGroup,
  selectedBlockId,
  allowedLayouts,
}: GroupModeSettingsProps) {
  const updateGroupLayout = useEditorStore((s) => s.updateGroupLayout);
  const updateGroupStyle = useEditorStore((s) => s.updateGroupStyle);
  const renameGroup = useEditorStore((s) => s.renameGroup);
  const selectBlock = useEditorStore((s) => s.selectBlock);

  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    layout: true,
    blocks: true,
    groupStyle: false,
  });

  const togglePanel = (key: "layout" | "blocks" | "groupStyle") => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="space-y-1.5 pb-2">
        <label className="text-xs font-medium text-muted-foreground">Group Name</label>
        <input
          value={activeGroup.label}
          onChange={(e) => renameGroup(section.id, activeGroup.id, e.target.value)}
          className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground"
          placeholder="Group name"
        />
      </div>

      <SettingsCollapsibleSection
        title="Layout"
        isOpen={openSections.layout}
        onToggle={() => togglePanel("layout")}
      >
        <div className="grid grid-cols-3 gap-2">
          {allowedLayouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => updateGroupLayout(section.id, activeGroup.id, layout.id)}
              className={cn(
                "flex flex-col items-center rounded-xl border p-2.5 transition-colors",
                activeGroup.layout.id === layout.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
              )}
            >
              <LayoutThumbnail layout={layout} />
              <span className="mt-1.5 text-center text-[9px] font-medium leading-tight">
                {layout.label}
              </span>
            </button>
          ))}
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection
        title="Blocks"
        isOpen={openSections.blocks}
        onToggle={() => togglePanel("blocks")}
      >
        <div className="space-y-1">
          {activeGroup.blocks
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((block) => {
              const blockEntry = BLOCK_REGISTRY[block.type];
              if (!blockEntry) return null;

              const isBlockSelected = block.id === selectedBlockId;
              const previewText = getBlockPreviewText(block.props);
              const isAbsolute = block.style.positionMode === "absolute";

              return (
                <button
                  key={block.id}
                  onClick={() => selectBlock(section.id, activeGroup.id, block.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                    isBlockSelected
                      ? "border border-primary/30 bg-primary/10"
                      : "border border-transparent hover:bg-sidebar-accent/60",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md",
                      isBlockSelected
                        ? "bg-primary/20 text-primary"
                        : "bg-sidebar-accent text-muted-foreground",
                    )}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      {blockEntry.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-sidebar-foreground">
                      {blockEntry.label}
                    </div>
                    {previewText && (
                      <div className="truncate text-[9px] text-muted-foreground">
                        {previewText}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-[8px] uppercase text-muted-foreground/70">
                    {isAbsolute ? "abs" : block.slot}
                  </span>
                </button>
              );
            })}
          <button
            onClick={() => setAddBlockOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-sidebar-border py-2 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              add
            </span>
            Add Block
          </button>
        </div>

        <AddBlockModal
          open={addBlockOpen}
          onOpenChange={setAddBlockOpen}
          sectionId={section.id}
          sectionType={section.type}
          groupId={activeGroup.id}
          groupSlots={activeGroup.layout.slots}
        />
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection
        title="Group Style"
        isOpen={openSections.groupStyle}
        onToggle={() => togglePanel("groupStyle")}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Top Padding</label>
              <span className="text-[10px] text-muted-foreground">
                {activeGroup.style?.paddingTop ?? 0}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={160}
              step={4}
              value={activeGroup.style?.paddingTop ?? 0}
              onChange={(e) =>
                updateGroupStyle(section.id, activeGroup.id, {
                  paddingTop: Number(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Bottom Padding
              </label>
              <span className="text-[10px] text-muted-foreground">
                {activeGroup.style?.paddingBottom ?? 0}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={160}
              step={4}
              value={activeGroup.style?.paddingBottom ?? 0}
              onChange={(e) =>
                updateGroupStyle(section.id, activeGroup.id, {
                  paddingBottom: Number(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
          </div>

          {/* Surface */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Surface</label>
            <div className="grid grid-cols-4 gap-1">
              {(["none", "card", "glass", "bordered"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => updateGroupStyle(section.id, activeGroup.id, { surface: val })}
                  className={cn(
                    "rounded-lg border px-1.5 py-1.5 text-[10px] font-medium capitalize transition-colors",
                    (activeGroup.style?.surface ?? "none") === val
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  {val === "none" ? "None" : val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Corners — only when surface is active */}
          {activeGroup.style?.surface && activeGroup.style.surface !== "none" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Corners</label>
              <div className="grid grid-cols-4 gap-1">
                {(["none", "sm", "md", "lg"] as NonNullable<GroupStyle["borderRadius"]>[]).map(
                  (val) => (
                    <button
                      key={val}
                      onClick={() =>
                        updateGroupStyle(section.id, activeGroup.id, { borderRadius: val })
                      }
                      className={cn(
                        "rounded-lg border px-1.5 py-1.5 text-[10px] font-medium uppercase transition-colors",
                        (activeGroup.style?.borderRadius ?? "md") === val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
                      )}
                    >
                      {val}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Block Gap */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Block Gap</label>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { label: "None", value: undefined },
                  { label: "S", value: "sm" },
                  { label: "M", value: "md" },
                  { label: "L", value: "lg" },
                ] as { label: string; value: GroupStyle["gap"] | undefined }[]
              ).map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => updateGroupStyle(section.id, activeGroup.id, { gap: value })}
                  className={cn(
                    "rounded-lg border px-1.5 py-1.5 text-[10px] font-medium transition-colors",
                    (activeGroup.style?.gap ?? undefined) === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsCollapsibleSection>
    </>
  );
}

function LayoutThumbnail({
  layout,
}: {
  layout: { id: string; columns: number; distribution: string; slots: string[] };
}) {
  const isNavLayout =
    layout.id.startsWith("nav-") ||
    layout.slots.some((slot) => slot === "brand" || slot === "links" || slot === "actions");

  if (isNavLayout) {
    return <NavbarLayoutThumbnail layout={layout} />;
  }

  if (layout.columns === 1) {
    return (
      <div className="flex h-8 w-full items-center justify-center">
        <div className="h-full w-full rounded bg-current opacity-20" />
      </div>
    );
  }

  if (layout.columns === 2) {
    const [left, right] = layout.distribution.split("-").map(Number);
    const total = left + right;
    return (
      <div className="flex h-8 w-full gap-0.5">
        <div
          className="h-full rounded bg-current opacity-20"
          style={{ width: `${(left / total) * 100}%` }}
        />
        <div
          className="h-full rounded bg-current opacity-20"
          style={{ width: `${(right / total) * 100}%` }}
        />
      </div>
    );
  }

  const parts = layout.distribution.split("-").map(Number);
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n) && n > 0)) {
    const total = parts.reduce((sum, n) => sum + n, 0);
    return (
      <div className="flex h-8 w-full gap-0.5">
        {parts.map((part, i) => (
          <div
            key={i}
            className="h-full rounded bg-current opacity-20"
            style={{ width: `${(part / total) * 100}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-8 w-full gap-0.5">
      <div className="h-full flex-1 rounded bg-current opacity-20" />
      <div className="h-full flex-1 rounded bg-current opacity-20" />
      <div className="h-full flex-1 rounded bg-current opacity-20" />
    </div>
  );
}

function NavbarLayoutThumbnail({
  layout,
}: {
  layout: { columns: number; distribution: string; slots: string[] };
}) {
  const parts = layout.distribution
    .split("-")
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const total = parts.length > 0 ? parts.reduce((sum, n) => sum + n, 0) : 100;

  return (
    <div className="flex h-8 w-full items-center gap-0.5 rounded-md border border-current/25 bg-current/10 p-1">
      {layout.slots.map((slot, i) => {
        const part = parts[i] ?? 100 / Math.max(1, layout.slots.length);
        return (
          <div
            key={slot}
            className="flex h-full min-w-0 items-center justify-center rounded-sm bg-current/15 px-1"
            style={{ width: `${(part / total) * 100}%` }}
          >
            {slot === "brand" && (
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-sm bg-current opacity-85" />
                <div className="h-1.5 w-5 rounded bg-current opacity-75" />
              </div>
            )}
            {slot === "links" && (
              <div className="flex items-center gap-0.5">
                <div className="h-1 w-2 rounded bg-current opacity-70" />
                <div className="h-1 w-2 rounded bg-current opacity-70" />
                <div className="h-1 w-2 rounded bg-current opacity-70" />
                <div className="h-1 w-2 rounded bg-current opacity-70" />
              </div>
            )}
            {slot === "actions" && (
              <div className="h-3 w-7 rounded-full border border-current/45 bg-current/35" />
            )}
            {slot !== "brand" && slot !== "links" && slot !== "actions" && (
              <div className="h-1.5 w-5 rounded bg-current opacity-60" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getBlockPreviewText(props: Record<string, unknown>): string {
  if (typeof props.text === "string") return props.text.slice(0, 40);
  if (typeof props.icon === "string") return props.icon;
  if (typeof props.src === "string" && props.src) return "Image";
  if (Array.isArray(props.items)) return `${props.items.length} items`;
  return "";
}
