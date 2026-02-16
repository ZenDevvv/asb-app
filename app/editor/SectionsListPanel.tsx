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
import type { Section } from "~/types/editor";

interface SectionsListPanelProps {
  onAddSection: () => void;
}

export function SectionsListPanel({ onAddSection }: SectionsListPanelProps) {
  const sections = useEditorStore((s) => s.sections);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const toggleSectionVisibility = useEditorStore((s) => s.toggleSectionVisibility);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = sections.findIndex((s) => s.id === active.id);
    const toIndex = sections.findIndex((s) => s.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderSections(fromIndex, toIndex);
    }
  };

  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Page Sections
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

      <div className="flex-1 overflow-y-auto px-2 pb-2 minimal-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                isSelected={section.id === selectedSectionId}
                onSelect={() => selectSection(section.id)}
                onToggleVisibility={() => toggleSectionVisibility(section.id)}
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

// ─── Sortable Item ────────────────────────────────────────────────────────

function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
}: {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const registry = SECTION_REGISTRY[section.type];
  const layoutLabel = section.groups?.[0]?.layout?.label || "Default";

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group mb-1 flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 transition-colors",
        isSelected
          ? "bg-primary/10 border border-primary/30"
          : "border border-transparent hover:bg-sidebar-accent/60",
        !section.isVisible && "opacity-40",
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex shrink-0 cursor-grab touch-none items-center text-muted-foreground active:cursor-grabbing"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          drag_indicator
        </span>
      </button>

      {/* Icon */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isSelected ? "bg-primary/20 text-primary" : "bg-sidebar-accent text-muted-foreground",
        )}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          {registry?.icon || "widgets"}
        </span>
      </div>

      {/* Labels */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-sidebar-foreground">
          {registry?.label || section.type}
        </div>
        <div className="truncate text-[10px] text-muted-foreground">
          {layoutLabel}
        </div>
      </div>

      {/* Visibility toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          {section.isVisible ? "visibility" : "visibility_off"}
        </span>
      </button>
    </div>
  );
}
