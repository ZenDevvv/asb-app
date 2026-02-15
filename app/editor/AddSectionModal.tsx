import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { useEditorStore } from "~/stores/editorStore";
import type { SectionType } from "~/types/editor";

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSectionModal({ open, onOpenChange }: AddSectionModalProps) {
  const addSection = useEditorStore((s) => s.addSection);

  const sectionTypes = Object.entries(SECTION_REGISTRY) as [
    SectionType,
    (typeof SECTION_REGISTRY)[SectionType],
  ][];

  const handleAdd = (type: SectionType) => {
    addSection(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Section</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {sectionTypes.map(([type, entry]) => (
            <button
              key={type}
              onClick={() => handleAdd(type)}
              className="flex items-start gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: 20 }}
                >
                  {entry.icon}
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {entry.label}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {entry.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
