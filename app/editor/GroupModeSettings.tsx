import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { LAYOUT_TEMPLATES } from "~/config/layoutTemplates";
import { AddBlockModal } from "./AddBlockModal";
import { SettingsCollapsibleSection } from "./SettingsCollapsibleSection";
import { cn } from "~/lib/utils";
import type { Group, GroupStyle, LayoutTemplate, Section } from "~/types/editor";

interface GroupModeSettingsProps {
  section: Section;
  activeGroup: Group;
  selectedBlockId: string | null;
}

// Layouts by column count, deduplicated by spans signature.
const DISTRIBUTION_LAYOUTS = LAYOUT_TEMPLATES;

function getDistributions(colCount: 1 | 2 | 3): LayoutTemplate[] {
  const seen = new Set<string>();
  return DISTRIBUTION_LAYOUTS.filter((l) => {
    if (l.spans.length !== colCount) return false;
    const key = l.spans.join("-");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const DEFAULT_COL_LAYOUT_IDS: Record<1 | 2 | 3, string> = {
  1: "1col",
  2: "2col-3-3",
  3: "3col-2-2-2",
};

export function GroupModeSettings({
  section,
  activeGroup,
  selectedBlockId,
}: GroupModeSettingsProps) {
  const updateGroupLayout = useEditorStore((s) => s.updateGroupLayout);
  const updateGroupLayoutOptions = useEditorStore((s) => s.updateGroupLayoutOptions);
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

  const currentSpansLen = activeGroup.layout.spans.length;
  const colCount: 1 | 2 | 3 =
    currentSpansLen === 1 ? 1 : currentSpansLen === 2 ? 2 : 3;

  const distributions = getDistributions(colCount);

  // Find the active distribution: match by spans signature (ignoring reversed)
  const activeSpansKey = activeGroup.layout.spans.join("-");

  function handleColCountSwitch(count: 1 | 2 | 3) {
    if (count === colCount) return;
    updateGroupLayout(section.id, activeGroup.id, DEFAULT_COL_LAYOUT_IDS[count]);
  }

  function handleDistributionClick(layout: LayoutTemplate) {
    updateGroupLayout(section.id, activeGroup.id, layout.id);
  }

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
        <div className="space-y-3">
          {/* Column count tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Columns</label>
            <div className="flex gap-1">
              {([1, 2, 3] as const).map((count) => (
                <button
                  key={count}
                  onClick={() => handleColCountSwitch(count)}
                  className={cn(
                    "flex-1 rounded-lg border py-1.5 text-[11px] font-medium transition-colors",
                    colCount === count
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Distribution thumbnails */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Distribution</label>
            <div className="grid grid-cols-3 gap-2">
              {distributions.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleDistributionClick(layout)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border p-2.5 transition-colors",
                    layout.spans.join("-") === activeSpansKey
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <ColumnDistributionThumbnail spans={layout.spans} />
                  <span className="mt-1.5 text-center text-[9px] font-medium leading-tight">
                    {layout.spans.join(" x ")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Alignment</label>
            <div className="flex gap-1">
              {(["top", "center", "bottom"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() =>
                    updateGroupLayoutOptions(section.id, activeGroup.id, { alignment: align })
                  }
                  title={align.charAt(0).toUpperCase() + align.slice(1)}
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-lg border py-1.5 transition-colors",
                    activeGroup.layout.alignment === align
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {align === "top"
                      ? "vertical_align_top"
                      : align === "center"
                        ? "vertical_align_center"
                        : "vertical_align_bottom"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reversed toggle (multi-col only) */}
          {colCount > 1 && (
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Reversed</label>
              <button
                onClick={() =>
                  updateGroupLayoutOptions(section.id, activeGroup.id, {
                    reversed: !activeGroup.layout.reversed,
                  })
                }
                className={cn(
                  "rounded-lg border px-3 py-1 text-[10px] font-medium transition-colors",
                  activeGroup.layout.reversed
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
                )}
              >
                {activeGroup.layout.reversed ? "On" : "Off"}
              </button>
            </div>
          )}
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

          {/* Corners - only when surface is active */}
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

function ColumnDistributionThumbnail({ spans }: { spans: number[] }) {
  const total = spans.reduce((sum, s) => sum + s, 0);
  return (
    <div className="flex h-8 w-full gap-0.5">
      {spans.map((span, i) => (
        <div
          key={i}
          className="h-full rounded bg-current opacity-20"
          style={{ width: `${(span / total) * 100}%` }}
        />
      ))}
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


