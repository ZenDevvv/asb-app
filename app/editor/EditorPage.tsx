import { useEffect, useCallback, useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { EditorToolbar } from "./EditorToolbar";
import { SectionsListPanel } from "./SectionsListPanel";
import { EditorCanvas } from "./EditorCanvas";
import { SectionSettings } from "./SectionSettings";
import { AddSectionModal } from "./AddSectionModal";
import { debounce } from "lodash";

export default function EditorPage() {
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const loadFromLocalStorage = useEditorStore((s) => s.loadFromLocalStorage);
  const isDirty = useEditorStore((s) => s.isDirty);
  const saveToLocalStorage = useEditorStore((s) => s.saveToLocalStorage);
  const sections = useEditorStore((s) => s.sections);
  const addSection = useEditorStore((s) => s.addSection);

  // Load saved state on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Seed default sections if empty after load
  useEffect(() => {
    if (sections.length === 0) {
      addSection("navbar");
      addSection("hero");
      addSection("features");
      addSection("testimonials");
      addSection("footer");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save debounced
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
