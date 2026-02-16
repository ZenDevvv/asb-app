import { useEffect, useCallback, useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { EditorToolbar } from "./EditorToolbar";
import { SectionsListPanel } from "./SectionsListPanel";
import { EditorCanvas } from "./EditorCanvas";
import { SectionSettings } from "./SectionSettings";
import { AddSectionModal } from "./AddSectionModal";
import { debounce } from "lodash";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import type { SectionType } from "~/types/editor";

export default function EditorPage() {
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const isDirty = useEditorStore((s) => s.isDirty);
  const saveToLocalStorage = useEditorStore((s) => s.saveToLocalStorage);

  // Initialize editor state once: load from storage, then seed defaults only if still empty.
  useEffect(() => {
    const store = useEditorStore.getState();
    store.loadFromLocalStorage();

    if (store.sections.length === 0) {
      const defaultSections = Object.keys(SECTION_REGISTRY) as SectionType[];
      defaultSections.forEach((type) => {
        store.addSection(type);
      });
    }
  }, []);

  // Auto-save debounced
  const debouncedSave = useCallback(
    debounce(() => {
      saveToLocalStorage();
    }, 3000),
    [saveToLocalStorage],
  );

  useEffect(() => {
    if (isDirty) {
      debouncedSave();
    }
    return () => debouncedSave.cancel();
  }, [isDirty, debouncedSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useEditorStore.getState();

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        store.redo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        store.saveToLocalStorage();
      }

      if (e.key === "Delete" && store.selectedSectionId) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }

        e.preventDefault();

        if (store.selectedBlockId && store.selectedGroupId) {
          store.removeBlock(store.selectedSectionId, store.selectedGroupId, store.selectedBlockId);
          return;
        }

        if (store.selectedGroupId) {
          store.removeGroup(store.selectedSectionId, store.selectedGroupId);
          return;
        }

        store.removeSection(store.selectedSectionId);
      }

      if (e.key === "Escape") {
        if (store.selectedBlockId && store.selectedSectionId && store.selectedGroupId) {
          store.selectBlock(store.selectedSectionId, store.selectedGroupId, null);
        } else if (store.selectedSectionId && store.selectedGroupId) {
          store.selectSection(store.selectedSectionId);
        } else {
          store.selectSection(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <EditorToolbar />

      <div className="flex flex-1 overflow-hidden">
        <SectionsListPanel onAddSection={() => setAddSectionModalOpen(true)} />
        <EditorCanvas />
        <SectionSettings />
      </div>

      <AddSectionModal
        open={addSectionModalOpen}
        onOpenChange={setAddSectionModalOpen}
      />
    </div>
  );
}
