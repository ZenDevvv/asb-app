import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { cn } from "~/lib/utils";
import type { Section } from "~/types/editor";
import { GroupTreeItem } from "./GroupTreeItem";
import { toGroupDndId, toSectionDndId } from "./sectionTreeDnd";

interface SectionTreeItemProps {
  section: Section;
  isSelected: boolean;
  selectedGroupId: string | null;
  onSelectSection: () => void;
  onToggleVisibility: () => void;
  onSelectGroup: (groupId: string) => void;
  onDuplicateGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddGroup: () => void;
}

export function SectionTreeItem({
  section,
  isSelected,
  selectedGroupId,
  onSelectSection,
  onToggleVisibility,
  onSelectGroup,
  onDuplicateGroup,
  onDeleteGroup,
  onAddGroup,
}: SectionTreeItemProps) {
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
          className="relative mt-1 space-y-1 pl-8 pr-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute bottom-0 left-8 top-0 border-l border-sidebar-border" />
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
            <div className="pointer-events-none absolute left-0 top-1/2 h-3 w-3 -translate-y-full rounded-bl-md border-b border-l border-sidebar-border/70" />
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
