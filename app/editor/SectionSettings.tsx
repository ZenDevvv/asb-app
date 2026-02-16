import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { getLayoutsByIds } from "~/config/layoutTemplates";
import { BackgroundControl } from "~/components/controls/BackgroundControl";
import { ColorControl } from "~/components/controls/ColorControl";
import { BlockSettings } from "./BlockSettings";
import { AddBlockModal } from "./AddBlockModal";
import { cn } from "~/lib/utils";
import type { SectionStyle } from "~/types/editor";

export function SectionSettings() {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const sections = useEditorStore((s) => s.sections);
  const updateSectionStyle = useEditorStore((s) => s.updateSectionStyle);
  const updateGroupLayout = useEditorStore((s) => s.updateGroupLayout);
  const updateGroupStyle = useEditorStore((s) => s.updateGroupStyle);
  const addGroup = useEditorStore((s) => s.addGroup);
  const removeGroup = useEditorStore((s) => s.removeGroup);
  const duplicateGroup = useEditorStore((s) => s.duplicateGroup);
  const reorderGroups = useEditorStore((s) => s.reorderGroups);
  const renameGroup = useEditorStore((s) => s.renameGroup);
  const removeSection = useEditorStore((s) => s.removeSection);
  const duplicateSection = useEditorStore((s) => s.duplicateSection);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const selectSection = useEditorStore((s) => s.selectSection);
  const selectGroup = useEditorStore((s) => s.selectGroup);
  const selectBlock = useEditorStore((s) => s.selectBlock);

  const section = sections.find((s) => s.id === selectedSectionId);
  const registry = section ? SECTION_REGISTRY[section.type] : null;
  const orderedGroups = section
    ? section.groups.slice().sort((a, b) => a.order - b.order)
    : [];
  const selectedGroup = orderedGroups.find((group) => group.id === selectedGroupId) || null;
  const activeGroup = selectedGroup || orderedGroups[0] || null;

  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    groups: true,
    layout: true,
    blocks: true,
    groupStyle: false,
    background: true,
  });

  const togglePanel = (key: "groups" | "layout" | "blocks" | "groupStyle" | "background") => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // If a block is selected, show BlockSettings
  if (selectedBlockId && section) {
    const owningGroup = section.groups.find((group) =>
      group.blocks.some((block) => block.id === selectedBlockId),
    );
    const block = owningGroup?.blocks.find((entry) => entry.id === selectedBlockId);
    if (block && owningGroup) {
      return (
        <BlockSettings
          sectionId={section.id}
          groupId={owningGroup.id}
          block={block}
          onBack={() => selectGroup(section.id, owningGroup.id)}
          onDelete={() => {
            removeBlock(section.id, owningGroup.id, block.id);
          }}
        />
      );
    }
  }

  if (!section || !registry) {
    return <GlobalSettingsPanel />;
  }

  const allowedLayouts = getLayoutsByIds(registry.allowedLayouts);
  const isGroupMode = Boolean(selectedGroupId && activeGroup);

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-sidebar-foreground">
            {registry.label}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-primary">
            {isGroupMode && activeGroup ? `Group: ${activeGroup.label}` : "Section Settings"}
          </div>
        </div>
        <div className="flex gap-1">
          {isGroupMode && activeGroup && (
            <button
              onClick={() => selectSection(section.id)}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              title="Back to Section"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                arrow_back
              </span>
            </button>
          )}
          <button
            onClick={() => duplicateSection(section.id)}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            title="Duplicate"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              content_copy
            </span>
          </button>
          <button
            onClick={() => removeSection(section.id)}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            title="Delete"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              delete
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 minimal-scrollbar space-y-1">
        {!isGroupMode && (
          <>
            <CollapsibleSection
              title="Groups"
              isOpen={openSections.groups}
              onToggle={() => togglePanel("groups")}
            >
              <div className="space-y-1">
                {orderedGroups.map((group, index) => (
                  <div
                    key={group.id}
                    onClick={() => selectGroup(section.id, group.id)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-primary/30 hover:bg-sidebar-accent/60"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-muted-foreground">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        view_stream
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-medium text-sidebar-foreground">
                        {group.label}
                      </div>
                      <div className="truncate text-[9px] text-muted-foreground">
                        {group.layout.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (index > 0) reorderGroups(section.id, index, index - 1);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent"
                        title="Move Up"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                          keyboard_arrow_up
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (index < orderedGroups.length - 1) reorderGroups(section.id, index, index + 1);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent"
                        title="Move Down"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                          keyboard_arrow_down
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateGroup(section.id, group.id);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent"
                        title="Duplicate Group"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                          content_copy
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGroup(section.id, group.id);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                        title="Delete Group"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addGroup(section.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-sidebar-border py-2 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    add
                  </span>
                  Add Group
                </button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Background"
              isOpen={openSections.background}
              onToggle={() => togglePanel("background")}
            >
              <BackgroundControl
                style={section.style}
                onChange={(style: Partial<SectionStyle>) =>
                  updateSectionStyle(section.id, style)
                }
              />
              <div className="mt-3">
                <ColorControl
                  label="Text Color"
                  value={section.style.textColor || "#ffffff"}
                  onChange={(v) => updateSectionStyle(section.id, { textColor: v })}
                />
              </div>
              <div className="mt-3">
                <ColorControl
                  label="Accent Color"
                  value={section.style.accentColor || "#00e5a0"}
                  onChange={(v) => updateSectionStyle(section.id, { accentColor: v })}
                />
              </div>
            </CollapsibleSection>
          </>
        )}

        {isGroupMode && activeGroup && (
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

            <CollapsibleSection
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
                    <span className="mt-1.5 text-[9px] font-medium leading-tight text-center">
                      {layout.label}
                    </span>
                  </button>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
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
                            ? "bg-primary/10 border border-primary/30"
                            : "border border-transparent hover:bg-sidebar-accent/60",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-md",
                            isBlockSelected ? "bg-primary/20 text-primary" : "bg-sidebar-accent text-muted-foreground",
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
                        <span className="shrink-0 text-[8px] text-muted-foreground/70 uppercase">
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
            </CollapsibleSection>

            <CollapsibleSection
              title="Group Style"
              isOpen={openSections.groupStyle}
              onToggle={() => togglePanel("groupStyle")}
            >
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Top Padding</label>
                    <span className="text-[10px] text-muted-foreground">{activeGroup.style?.paddingTop ?? 0}px</span>
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
                    <label className="text-xs font-medium text-muted-foreground">Bottom Padding</label>
                    <span className="text-[10px] text-muted-foreground">{activeGroup.style?.paddingBottom ?? 0}px</span>
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
              </div>
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Layout Thumbnail ────────────────────────────────────────────────────

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

// ─── Block Preview Text ──────────────────────────────────────────────────

function getBlockPreviewText(props: Record<string, unknown>): string {
  if (typeof props.text === "string") return props.text.slice(0, 40);
  if (typeof props.icon === "string") return props.icon;
  if (typeof props.src === "string" && props.src) return "Image";
  if (Array.isArray(props.items)) return `${props.items.length} items`;
  return "";
}

// ─── Collapsible Section ─────────────────────────────────────────────────

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-sidebar-border pb-3 mb-3 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        <span
          className={cn(
            "material-symbols-outlined text-muted-foreground transition-transform",
            !isOpen && "-rotate-90",
          )}
          style={{ fontSize: 16 }}
        >
          expand_more
        </span>
      </button>
      {isOpen && <div className="pt-1">{children}</div>}
    </div>
  );
}

// ─── Global Settings (when no section selected) ──────────────────────────

function GlobalSettingsPanel() {
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 minimal-scrollbar">
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
