import { useEditorStore } from "~/stores/editorStore";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { getLayoutsByIds } from "~/config/layoutTemplates";
import { BlockSettings } from "./BlockSettings";
import { SectionModeSettings } from "./SectionModeSettings";
import { GroupModeSettings } from "./GroupModeSettings";
import { GlobalSettingsPanel } from "./GlobalSettingsPanel";

export function SettingsPanel() {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const sections = useEditorStore((s) => s.sections);
  const removeSection = useEditorStore((s) => s.removeSection);
  const duplicateSection = useEditorStore((s) => s.duplicateSection);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const selectSection = useEditorStore((s) => s.selectSection);
  const selectGroup = useEditorStore((s) => s.selectGroup);

  const section = sections.find((entry) => entry.id === selectedSectionId);
  const registry = section ? SECTION_REGISTRY[section.type] : null;
  const orderedGroups = section
    ? section.groups.slice().sort((a, b) => a.order - b.order)
    : [];
  const selectedGroup = orderedGroups.find((group) => group.id === selectedGroupId) || null;
  const activeGroup = selectedGroup || orderedGroups[0] || null;

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

  const isGroupMode = Boolean(selectedGroupId && activeGroup);
  const allowedLayouts = getLayoutsByIds(registry.allowedLayouts);

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
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

      <div className="minimal-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-3">
        {isGroupMode && activeGroup ? (
          <GroupModeSettings
            section={section}
            activeGroup={activeGroup}
            selectedBlockId={selectedBlockId}
            allowedLayouts={allowedLayouts}
          />
        ) : (
          <SectionModeSettings section={section} />
        )}
      </div>
    </div>
  );
}
