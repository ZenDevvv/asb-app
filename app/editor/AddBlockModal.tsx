import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { useEditorStore } from "~/stores/editorStore";
import type { BlockType, SectionType } from "~/types/editor";

interface AddBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionType: SectionType;
}

export function AddBlockModal({
  open,
  onOpenChange,
  sectionId,
  sectionType,
}: AddBlockModalProps) {
  const addBlock = useEditorStore((s) => s.addBlock);
  const registry = SECTION_REGISTRY[sectionType];
  const allowedTypes = registry?.allowedBlockTypes || [];

  const handleAdd = (type: BlockType) => {
    addBlock(sectionId, type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Block</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 pt-2">
          {allowedTypes.map((type) => {
            const entry = BLOCK_REGISTRY[type];
            if (!entry) return null;

            return (
              <button
                key={type}
                onClick={() => handleAdd(type)}
                className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: 18 }}
                  >
                    {entry.icon}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {entry.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
