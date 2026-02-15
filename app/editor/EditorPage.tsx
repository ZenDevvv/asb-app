import { useEffect, useCallback, useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { EditorToolbar } from "./EditorToolbar";
import { SectionsListPanel } from "./SectionsListPanel";
import { EditorCanvas } from "./EditorCanvas";
import { SectionSettings } from "./SectionSettings";
import { AddSectionModal } from "./AddSectionModal";
import { debounce } from "lodash";

export default function EditorPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
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
      addSection("navbar", "simple");
      addSection("hero", "centered");
      addSection("features", "cards");
      addSection("testimonials", "slider");
      addSection("footer", "simple");
    }
    // Only run once on mount
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

      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        store.redo();
      }

      // Ctrl+S / Cmd+S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        store.saveToLocalStorage();
      }

      // Delete selected section
      if (e.key === "Delete" && store.selectedId) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          store.removeSection(store.selectedId);
        }
      }

      // Escape = deselect
      if (e.key === "Escape") {
        store.selectSection(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <EditorToolbar />

      <div className="flex flex-1 overflow-hidden">
        <SectionsListPanel onAddSection={() => setAddModalOpen(true)} />
        <EditorCanvas />
        <SectionSettings />
      </div>

      <AddSectionModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}
