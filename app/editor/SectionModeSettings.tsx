import { useState } from "react";
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
import { useEditorStore } from "~/stores/editorStore";
import { BackgroundControl } from "~/components/controls/BackgroundControl";
import { ColorControl } from "~/components/controls/ColorControl";
import { cn } from "~/lib/utils";
import { SettingsCollapsibleSection } from "./SettingsCollapsibleSection";
import type { Group, Section, SectionStyle } from "~/types/editor";

interface SectionModeSettingsProps {
  section: Section;
  orderedGroups: Group[];
}

export function SectionModeSettings({ section, orderedGroups }: SectionModeSettingsProps) {
  const updateSectionStyle = useEditorStore((s) => s.updateSectionStyle);
  const addGroup = useEditorStore((s) => s.addGroup);
  const removeGroup = useEditorStore((s) => s.removeGroup);
  const duplicateGroup = useEditorStore((s) => s.duplicateGroup);
  const reorderGroups = useEditorStore((s) => s.reorderGroups);
  const selectGroup = useEditorStore((s) => s.selectGroup);

  const [openSections, setOpenSections] = useState({
    groups: true,
    background: true,
  });

  const togglePanel = (key: "groups" | "background") => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groupListSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = orderedGroups.findIndex((group) => group.id === active.id);
    const toIndex = orderedGroups.findIndex((group) => group.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderGroups(section.id, fromIndex, toIndex);
    }
  };

  return (
    <>
      <SettingsCollapsibleSection
        title="Groups"
        isOpen={openSections.groups}
        onToggle={() => togglePanel("groups")}
      >
        <div className="space-y-1">
          <DndContext
            sensors={groupListSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleGroupDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={orderedGroups.map((group) => group.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedGroups.map((group) => (
                <SortableGroupItem
                  key={group.id}
                  group={group}
                  onSelect={() => selectGroup(section.id, group.id)}
                  onDuplicate={() => duplicateGroup(section.id, group.id)}
                  onDelete={() => removeGroup(section.id, group.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
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
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection
        title="Background"
        isOpen={openSections.background}
        onToggle={() => togglePanel("background")}
      >
        <BackgroundControl
          style={section.style}
          onChange={(style: Partial<SectionStyle>) => updateSectionStyle(section.id, style)}
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
      </SettingsCollapsibleSection>
    </>
  );
}

function SortableGroupItem({
  group,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  group: Group;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group mb-1 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-primary/30 hover:bg-sidebar-accent/60",
        isDragging && "ring-1 ring-primary/50",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="flex shrink-0 cursor-grab touch-none items-center text-muted-foreground active:cursor-grabbing"
        title="Drag to Reorder"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          drag_indicator
        </span>
      </button>

      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-muted-foreground">
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          view_stream
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-medium text-sidebar-foreground">
          {group.label}
        </div>
        <div className="truncate text-[9px] text-muted-foreground">{group.layout.label}</div>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
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
            onDelete();
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
  );
}
