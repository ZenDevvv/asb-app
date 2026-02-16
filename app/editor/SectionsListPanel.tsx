import { useEditorStore } from "~/stores/editorStore";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { cn } from "~/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Group, Section } from "~/types/editor";

const SECTION_DND_PREFIX = "section:";
const GROUP_DND_PREFIX = "group:";

function toSectionDndId(sectionId: string) {
  return `${SECTION_DND_PREFIX}${sectionId}`;
}

function toGroupDndId(sectionId: string, groupId: string) {
  return `${GROUP_DND_PREFIX}${sectionId}:${groupId}`;
}

function parseSectionDndId(value: string): string | null {
  if (!value.startsWith(SECTION_DND_PREFIX)) return null;
  return value.slice(SECTION_DND_PREFIX.length);
}

function parseGroupDndId(value: string): { sectionId: string; groupId: string } | null {
  if (!value.startsWith(GROUP_DND_PREFIX)) return null;
  const payload = value.slice(GROUP_DND_PREFIX.length);
  const separatorIndex = payload.indexOf(":");
  if (separatorIndex === -1) return null;

  const sectionId = payload.slice(0, separatorIndex);
  const groupId = payload.slice(separatorIndex + 1);
  if (!sectionId || !groupId) return null;

  return { sectionId, groupId };
}

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

    const section = sections.find((entry) => entry.id === activeGroupRef.sectionId);
    if (!section) return;

    const orderedGroups = section.groups.slice().sort((a, b) => a.order - b.order);
    const fromIndex = orderedGroups.findIndex((group) => group.id === activeGroupRef.groupId);
    const toIndex = orderedGroups.findIndex((group) => group.id === overGroupRef.groupId);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderGroups(section.id, fromIndex, toIndex);
    }
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
          collisionDetection={closestCenter}
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

function SectionTreeItem({
  section,
  isSelected,
  selectedGroupId,
  onSelectSection,
  onToggleVisibility,
  onSelectGroup,
  onDuplicateGroup,
  onDeleteGroup,
  onAddGroup,
}: {
  section: Section;
  isSelected: boolean;
  selectedGroupId: string | null;
  onSelectSection: () => void;
  onToggleVisibility: () => void;
  onSelectGroup: (groupId: string) => void;
  onDuplicateGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddGroup: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: toSectionDndId(section.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const registry = SECTION_REGISTRY[section.type];
  const orderedGroups = section.groups.slice().sort((a, b) => a.order - b.order);

  return (
    <div ref={setNodeRef} style={style} className="mb-1">
      <div
        onClick={onSelectSection}
        className={cn(
          "group flex cursor-pointer items-center gap-1.5 rounded-md border px-1.5 py-1.5 transition-colors",
          isSelected
            ? "border-primary/30 bg-primary/10 shadow-[inset_0_0_0_1px_rgba(0,229,160,0.08)]"
            : "border-transparent hover:bg-sidebar-accent/50",
          !section.isVisible && "opacity-40",
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="flex shrink-0 cursor-grab touch-none items-center text-muted-foreground active:cursor-grabbing"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            drag_indicator
          </span>
        </button>

        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md",
            isSelected ? "bg-primary/20 text-primary" : "bg-sidebar-accent text-muted-foreground",
          )}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {registry?.icon || "widgets"}
          </span>
        </div>

        <div className="min-w-0 flex-1 truncate text-[11px] font-medium text-sidebar-foreground">
          {registry?.label || section.type}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
            {section.isVisible ? "visibility" : "visibility_off"}
          </span>
        </button>
      </div>

      {isSelected && (
        <div
          className="relative mt-1 space-y-1 pl-7 pr-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute bottom-0 left-2 top-0 border-l border-sidebar-border/70" />
          <SortableContext
            items={orderedGroups.map((group) => toGroupDndId(section.id, group.id))}
            strategy={verticalListSortingStrategy}
          >
            {orderedGroups.map((group) => (
              <GroupTreeItem
                key={group.id}
                sectionId={section.id}
                group={group}
                isSelected={selectedGroupId === group.id}
                onSelect={() => onSelectGroup(group.id)}
                onDuplicate={() => onDuplicateGroup(group.id)}
                onDelete={() => onDeleteGroup(group.id)}
              />
            ))}
          </SortableContext>

          <div className="relative pl-4">
            <div className="pointer-events-none absolute left-0 top-1/2 w-3 border-t border-sidebar-border/70" />
            <button
              onClick={onAddGroup}
              className="flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-primary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                add
              </span>
              Add Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupTreeItem({
  sectionId,
  group,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  sectionId: string;
  group: Group;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: toGroupDndId(sectionId, group.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="relative pl-4">
      <div className="pointer-events-none absolute left-0 top-1/2 w-3 border-t border-sidebar-border/70" />
      <div
        ref={setNodeRef}
        style={style}
        onClick={onSelect}
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 transition-colors",
          isSelected ? "bg-primary/10 text-primary" : "hover:bg-sidebar-accent/50",
        )}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="flex shrink-0 cursor-grab touch-none items-center text-muted-foreground active:cursor-grabbing"
          title="Drag to Reorder Group"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
            drag_indicator
          </span>
        </button>

        <div className="min-w-0 flex-1 truncate text-[10px] font-medium text-sidebar-foreground">
          {group.label}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          title="Duplicate Group"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>
            content_copy
          </span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          title="Delete Group"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>
            delete
          </span>
        </button>
      </div>
    </div>
  );
}
