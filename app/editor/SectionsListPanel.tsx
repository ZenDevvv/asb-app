import { useEditorStore } from "~/stores/editorStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SectionTreeItem } from "./sections-list/SectionTreeItem";
import {
  isGroupDndId,
  isSectionDndId,
  parseGroupDndId,
  parseSectionDndId,
  toSectionDndId,
} from "./sections-list/sectionTreeDnd";

interface SectionsListPanelProps {
  onAddSection: () => void;
}

export function SectionsListPanel({ onAddSection }: SectionsListPanelProps) {
  const sections = useEditorStore((s) => s.sections);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const selectGroup = useEditorStore((s) => s.selectGroup);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const toggleSectionVisibility = useEditorStore((s) => s.toggleSectionVisibility);
  const reorderGroups = useEditorStore((s) => s.reorderGroups);
  const duplicateGroup = useEditorStore((s) => s.duplicateGroup);
  const removeGroup = useEditorStore((s) => s.removeGroup);
  const addGroup = useEditorStore((s) => s.addGroup);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const collisionDetection: CollisionDetection = (args) => {
    const activeId = String(args.active.id);
    const activeIsGroup = isGroupDndId(activeId);

    const filteredDroppables = args.droppableContainers.filter((container) => {
      const id = String(container.id);
      if (id === activeId) return false;
      return activeIsGroup ? isGroupDndId(id) : isSectionDndId(id);
    });

    return closestCenter({
      ...args,
      droppableContainers: filteredDroppables,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeSectionId = parseSectionDndId(activeId);
    const overSectionId = parseSectionDndId(overId);
    if (activeSectionId && overSectionId) {
      const fromIndex = sections.findIndex((section) => section.id === activeSectionId);
      const toIndex = sections.findIndex((section) => section.id === overSectionId);
      if (fromIndex !== -1 && toIndex !== -1) {
        reorderSections(fromIndex, toIndex);
      }
      return;
    }

    const activeGroupRef = parseGroupDndId(activeId);
    const overGroupRef = parseGroupDndId(overId);
    if (!activeGroupRef || !overGroupRef) return;
    if (activeGroupRef.sectionId !== overGroupRef.sectionId) return;

    reorderGroups(activeGroupRef.sectionId, activeGroupRef.groupId, overGroupRef.groupId);
  };

  return (
    <div className="flex h-full w-[240px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Page Structure
        </span>
        <button
          onClick={onAddSection}
          className="flex size-6 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            add_circle
          </span>
        </button>
      </div>

      <div className="minimal-scrollbar flex-1 overflow-y-auto px-2 pb-2">
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={sections.map((section) => toSectionDndId(section.id))}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SectionTreeItem
                key={section.id}
                section={section}
                isSelected={section.id === selectedSectionId}
                selectedGroupId={selectedGroupId}
                onSelectSection={() => selectSection(section.id)}
                onToggleVisibility={() => toggleSectionVisibility(section.id)}
                onSelectGroup={(groupId) => selectGroup(section.id, groupId)}
                onDuplicateGroup={(groupId) => duplicateGroup(section.id, groupId)}
                onDeleteGroup={(groupId) => removeGroup(section.id, groupId)}
                onAddGroup={() => addGroup(section.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onAddSection}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-sidebar-border py-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            add
          </span>
          Add Section
        </button>
      </div>
    </div>
  );
}
