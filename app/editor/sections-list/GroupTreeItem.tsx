import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "~/lib/utils";
import type { Group } from "~/types/editor";
import { toGroupDndId } from "./sectionTreeDnd";

interface GroupTreeItemProps {
  sectionId: string;
  group: Group;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function GroupTreeItem({
  sectionId,
  group,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: GroupTreeItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: toGroupDndId(sectionId, group.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="relative pl-4">
      <div className="pointer-events-none absolute left-0 top-1/2 h-3 w-3 -translate-y-full rounded-bl-md border-b border-l border-sidebar-border" />
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
