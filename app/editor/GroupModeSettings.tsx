import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { LAYOUT_TEMPLATES } from "~/config/layoutTemplates";
import { AddBlockModal } from "./AddBlockModal";
import { SettingsCollapsibleSection } from "./SettingsCollapsibleSection";
import { ColorControl } from "~/components/controls/ColorControl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import type { ColumnStyle, Group, GroupStyle, LayoutTemplate, Section } from "~/types/editor";

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
  const updateGroupColumnStyle = useEditorStore((s) => s.updateGroupColumnStyle);
  const renameGroup = useEditorStore((s) => s.renameGroup);
  const selectBlock = useEditorStore((s) => s.selectBlock);

  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    layout: true,
    blocks: true,
    groupStyle: false,
    columnStyle: false,
  });
  const [selectedColIndex, setSelectedColIndex] = useState(0);

  const togglePanel = (key: "layout" | "blocks" | "groupStyle" | "columnStyle") => {
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

      {/* Column Styling — only available when 2 or 3 columns */}
      {colCount > 1 && (
        <SettingsCollapsibleSection
          title="Column Styling"
          isOpen={openSections.columnStyle}
          onToggle={() => togglePanel("columnStyle")}
        >
          <ColumnStylingPanel
            section={section}
            activeGroup={activeGroup}
            colCount={colCount as 2 | 3}
            selectedColIndex={selectedColIndex}
            onSelectCol={setSelectedColIndex}
            onUpdate={(style: Partial<ColumnStyle>) =>
              updateGroupColumnStyle(section.id, activeGroup.id, selectedColIndex, style)
            }
          />
        </SettingsCollapsibleSection>
      )}
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

// ─── Column presets ──────────────────────────────────────────────────────────
type ColumnPreset = NonNullable<ColumnStyle["preset"]>;

const COLUMN_PRESETS: Record<ColumnPreset, { label: string; defaults: Partial<ColumnStyle> }> = {
  none: {
    label: "None",
    defaults: {
      preset: "none",
      borderColor: undefined,
      borderWidth: 0,
      borderRadius: 0,
      shadowColor: undefined,
      shadowSize: "none",
      backgroundColor: undefined,
      paddingX: 0,
      paddingY: 0,
    },
  },
  card: {
    label: "Card",
    defaults: {
      preset: "card",
      borderColor: "#d1d5db",
      borderWidth: 1,
      borderRadius: 10,
      shadowColor: "#cecece",
      shadowSize: "sm",
      backgroundColor: undefined,
      paddingX: 20,
      paddingY: 20,
    },
  },
  outlined: {
    label: "Outlined",
    defaults: {
      preset: "outlined",
      borderColor: "#94a3b8",
      borderWidth: 1,
      borderRadius: 8,
      shadowSize: "none",
      shadowColor: undefined,
      backgroundColor: undefined,
      paddingX: 16,
      paddingY: 16,
    },
  },
  raised: {
    label: "Raised",
    defaults: {
      preset: "raised",
      borderWidth: 0,
      borderColor: undefined,
      shadowColor: "#c9c9c9",
      shadowSize: "md",
      borderRadius: 12,
      backgroundColor: undefined,
      paddingX: 20,
      paddingY: 20,
    },
  },
  frosted: {
    label: "Frosted",
    defaults: {
      preset: "frosted",
      backgroundColor: "#f8fafc",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      borderRadius: 12,
      shadowSize: "sm",
      shadowColor: "#c9c9c9",
      paddingX: 20,
      paddingY: 20,
    },
  },
};

interface ColumnStylingPanelProps {
  section: Section;
  activeGroup: Group;
  colCount: 2 | 3;
  selectedColIndex: number;
  onSelectCol: (index: number) => void;
  onUpdate: (style: Partial<ColumnStyle>) => void;
}

function ColumnStylingPanel({
  activeGroup,
  colCount,
  selectedColIndex,
  onSelectCol,
  onUpdate,
}: ColumnStylingPanelProps) {
  const colStyle: ColumnStyle = activeGroup.style?.columnStyles?.[selectedColIndex] ?? {};
  const activePreset: ColumnPreset = colStyle.preset ?? "none";

  function handlePresetChange(preset: ColumnPreset) {
    onUpdate({ ...COLUMN_PRESETS[preset].defaults });
  }

  return (
    <div className="space-y-3">
      {/* Column selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Column</label>
        <div className="flex gap-1">
          {Array.from({ length: colCount }, (_, i) => (
            <button
              key={i}
              onClick={() => onSelectCol(i)}
              className={cn(
                "flex-1 rounded-lg border py-1.5 text-[11px] font-medium transition-colors",
                selectedColIndex === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
              )}
            >
              Col {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Preset */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Preset</label>
        <Select value={activePreset} onValueChange={(v) => handlePresetChange(v as ColumnPreset)}>
          <SelectTrigger className="h-8 w-full rounded-lg border border-border/50 bg-muted/20 px-3 text-xs font-medium text-foreground shadow-none ring-0 transition-colors hover:border-border hover:bg-muted/40 focus-visible:ring-0 data-[state=open]:border-primary/50 data-[state=open]:bg-muted/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(COLUMN_PRESETS) as ColumnPreset[]).map((key) => (
              <SelectItem key={key} value={key} className="text-xs">
                {COLUMN_PRESETS[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Border */}
      <div className="space-y-1.5 rounded-xl border border-border/50 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          Border
        </p>
        <ColorControl
          label="Border Color"
          value={colStyle.borderColor ?? "#ffffff"}
          onChange={(v) => onUpdate({ borderColor: v })}
        />
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Border Width</label>
            <span className="text-[10px] text-muted-foreground">
              {colStyle.borderWidth ?? 0}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={colStyle.borderWidth ?? 0}
            onChange={(e) => onUpdate({ borderWidth: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Border Radius</label>
            <span className="text-[10px] text-muted-foreground">
              {colStyle.borderRadius ?? 0}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            step={2}
            value={colStyle.borderRadius ?? 0}
            onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      </div>

      {/* Shadow */}
      <div className="space-y-1.5 rounded-xl border border-border/50 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          Shadow
        </p>
        <div className="flex gap-1">
          {(["none", "sm", "md", "lg"] as const).map((size) => (
            <button
              key={size}
              onClick={() => onUpdate({ shadowSize: size })}
              className={cn(
                "flex-1 rounded-lg border py-1.5 text-[10px] font-medium uppercase transition-colors",
                (colStyle.shadowSize ?? "none") === size
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
              )}
            >
              {size}
            </button>
          ))}
        </div>
        {(colStyle.shadowSize ?? "none") !== "none" && (
          <ColorControl
            label="Shadow Color"
            value={colStyle.shadowColor ?? "#c9c9c9"}
            onChange={(v) => onUpdate({ shadowColor: v })}
          />
        )}
      </div>

      {/* Background */}
      <div className="space-y-1.5 rounded-xl border border-border/50 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          Background
        </p>
        <ColorControl
          label="Background Color"
          value={colStyle.backgroundColor ?? "#ffffff"}
          onChange={(v) => onUpdate({ backgroundColor: v })}
        />
      </div>

      {/* Padding */}
      <div className="space-y-1.5 rounded-xl border border-border/50 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          Padding
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Horizontal</label>
            <span className="text-[10px] text-muted-foreground">
              {colStyle.paddingX ?? 0}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={64}
            step={4}
            value={colStyle.paddingX ?? 0}
            onChange={(e) => onUpdate({ paddingX: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Vertical</label>
            <span className="text-[10px] text-muted-foreground">
              {colStyle.paddingY ?? 0}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={64}
            step={4}
            value={colStyle.paddingY ?? 0}
            onChange={(e) => onUpdate({ paddingY: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  );
}


