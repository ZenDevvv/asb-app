import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { getLayoutById } from "~/config/layoutTemplates";
import type {
  Section,
  Block,
  LayoutSlotMemory,
  BlockType,
  BlockStyle,
  SectionType,
  SectionStyle,
  GlobalStyle,
  DeviceMode,
  EditorState,
  EditorActions,
} from "~/types/editor";

const STORAGE_KEY = "asb-editor-state";

const DEFAULT_GLOBAL_STYLE: GlobalStyle = {
  fontFamily: "Inter",
  primaryColor: "#00e5a0",
  borderRadius: "md",
};

const initialState: EditorState = {
  sections: [],
  selectedSectionId: null,
  selectedBlockId: null,
  globalStyle: DEFAULT_GLOBAL_STYLE,
  history: [],
  future: [],
  isDirty: false,
  device: "desktop",
  zoom: 100,
  lastSaved: null,
};

function mapSlotByIndex(
  sourceSlot: string,
  sourceSlots: string[],
  targetSlots: string[],
): string {
  if (targetSlots.length === 0) return sourceSlot;
  const sourceIndex = sourceSlots.indexOf(sourceSlot);
  if (sourceIndex === -1) return targetSlots[0];
  return targetSlots[Math.min(sourceIndex, targetSlots.length - 1)];
}

function normalizeBlocksBySlotOrder(blocks: Block[], slots: string[]) {
  if (slots.length === 0) return;

  const validSlots = new Set(slots);
  const fallbackSlot = slots[0];

  blocks.forEach((block) => {
    if (!validSlots.has(block.slot)) {
      block.slot = fallbackSlot;
    }
  });

  slots.forEach((slot) => {
    const blocksInSlot = blocks
      .filter((block) => block.slot === slot)
      .sort((a, b) => a.order - b.order);

    blocksInSlot.forEach((block, index) => {
      block.order = index;
    });
  });
}

function getBlocksForSingleColumnView(blocks: Block[], slots: string[]) {
  const slotPriority = new Map(slots.map((slot, index) => [slot, index]));

  return [...blocks].sort((a, b) => {
    const slotA = slotPriority.get(a.slot) ?? slots.length;
    const slotB = slotPriority.get(b.slot) ?? slots.length;
    if (slotA !== slotB) return slotA - slotB;
    return a.order - b.order;
  });
}

function createLayoutSlotMemory(
  blocks: Block[],
  slots: string[],
): LayoutSlotMemory {
  return {
    sourceSlots: [...slots],
    byBlockId: Object.fromEntries(
      blocks.map((block) => [block.id, { slot: block.slot, order: block.order }]),
    ),
  };
}

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    ...initialState,

    // ─── Section CRUD ─────────────────────────────────────────────

    addSection: (type: SectionType, index?: number) => {
      const registry = SECTION_REGISTRY[type];
      if (!registry) return;

      const layout = getLayoutById(registry.defaultLayoutId);
      if (!layout) return;

      const blocks: Block[] = registry.defaultBlocks.map((def) => ({
        ...def,
        id: nanoid(10),
        props: { ...def.props },
        style: { ...def.style },
      }));

      const newSection: Section = {
        id: nanoid(10),
        type,
        layout: { ...layout },
        blocks,
        style: { ...registry.defaultStyle },
        isVisible: true,
      };

      set((state) => {
        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        if (index !== undefined) {
          state.sections.splice(index, 0, newSection);
        } else {
          state.sections.push(newSection);
        }
        state.selectedSectionId = newSection.id;
        state.selectedBlockId = null;
        state.isDirty = true;
      });
    },

    removeSection: (id: string) => {
      set((state) => {
        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        state.sections = state.sections.filter((s) => s.id !== id);
        if (state.selectedSectionId === id) {
          state.selectedSectionId = null;
          state.selectedBlockId = null;
        }
        state.isDirty = true;
      });
    },

    duplicateSection: (id: string) => {
      set((state) => {
        const idx = state.sections.findIndex((s) => s.id === id);
        if (idx === -1) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const original = state.sections[idx];
        const clone: Section = JSON.parse(JSON.stringify(original));
        clone.id = nanoid(10);
        clone.blocks = clone.blocks.map((b: Block) => ({
          ...b,
          id: nanoid(10),
        }));
        clone.layoutSlotMemory = undefined;
        clone.layoutSlotMemories = undefined;

        state.sections.splice(idx + 1, 0, clone);
        state.selectedSectionId = clone.id;
        state.selectedBlockId = null;
        state.isDirty = true;
      });
    },

    reorderSections: (fromIndex: number, toIndex: number) => {
      set((state) => {
        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        const [moved] = state.sections.splice(fromIndex, 1);
        state.sections.splice(toIndex, 0, moved);
        state.isDirty = true;
      });
    },

    toggleSectionVisibility: (id: string) => {
      set((state) => {
        const section = state.sections.find((s) => s.id === id);
        if (section) {
          state.history.push(JSON.parse(JSON.stringify(state.sections)));
          state.future = [];
          section.isVisible = !section.isVisible;
          state.isDirty = true;
        }
      });
    },

    // ─── Selection (two levels) ───────────────────────────────────

    selectSection: (id: string | null) => {
      set((state) => {
        state.selectedSectionId = id;
        state.selectedBlockId = null;
      });
    },

    selectBlock: (sectionId: string | null, blockId: string | null) => {
      set((state) => {
        state.selectedSectionId = sectionId;
        state.selectedBlockId = blockId;
      });
    },

    // ─── Section Updates ──────────────────────────────────────────

    updateSectionLayout: (sectionId: string, layoutId: string) => {
      const layout = getLayoutById(layoutId);
      if (!layout) return;

      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId);
        if (!section) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const oldLayoutId = section.layout.id;
        const oldSlots = section.layout.slots;
        const newSlots = layout.slots;

        if (oldSlots.length !== newSlots.length || oldSlots.some((s, i) => s !== newSlots[i])) {
          normalizeBlocksBySlotOrder(section.blocks, oldSlots);

          if (!section.layoutSlotMemories) {
            section.layoutSlotMemories = {};
          }

          section.layoutSlotMemories[oldLayoutId] = createLayoutSlotMemory(
            section.blocks,
            oldSlots,
          );
          const currentLayoutMemory = section.layoutSlotMemories[oldLayoutId];

          if (oldSlots.length > 1 && newSlots.length === 1) {
            // Keep latest multi-column snapshot for restoring from single-column
            // to other layouts that don't have their own memory yet.
            section.layoutSlotMemory = currentLayoutMemory;
          }

          const applyFromMemory = (memory: LayoutSlotMemory) => {
            section.blocks.forEach((block) => {
              const targetMemory = memory.byBlockId[block.id];
              if (targetMemory) {
                block.slot = newSlots.includes(targetMemory.slot)
                  ? targetMemory.slot
                  : mapSlotByIndex(
                    targetMemory.slot,
                    memory.sourceSlots,
                    newSlots,
                  );
                block.order = targetMemory.order;
                return;
              }

              const currentMemory = currentLayoutMemory.byBlockId[block.id];
              const sourceSlot = currentMemory?.slot || oldSlots[0];
              block.slot = mapSlotByIndex(sourceSlot, oldSlots, newSlots);
              block.order = currentMemory?.order ?? block.order;
            });
          };

          const targetLayoutMemory = section.layoutSlotMemories[layout.id];
          const fallbackFromSingle =
            oldSlots.length === 1 && newSlots.length > 1
              ? section.layoutSlotMemory
              : undefined;

          if (targetLayoutMemory) {
            applyFromMemory(targetLayoutMemory);
          } else if (fallbackFromSingle) {
            applyFromMemory(fallbackFromSingle);
          } else if (newSlots.length === 1) {
            const orderedBlocks = getBlocksForSingleColumnView(
              section.blocks,
              oldSlots,
            );
            orderedBlocks.forEach((block, index) => {
              block.slot = newSlots[0];
              block.order = index;
            });
          } else {
            const isNavbarSmartMap =
              section.type === "navbar" &&
              oldSlots.length === 1 &&
              newSlots.includes("brand");

            if (isNavbarSmartMap) {
              section.blocks.forEach((block) => {
                if (
                  (block.type === "heading" ||
                    block.type === "icon" ||
                    block.type === "image" ||
                    block.type === "badge") &&
                  newSlots.includes("brand")
                ) {
                  block.slot = "brand";
                } else if (
                  (block.type === "list" || block.type === "text") &&
                  newSlots.includes("links")
                ) {
                  block.slot = "links";
                  if (block.type === "list") {
                    block.props.inline = true;
                  }
                } else if (block.type === "button" && newSlots.includes("actions")) {
                  block.slot = "actions";
                } else {
                  const currentMemory = currentLayoutMemory.byBlockId[block.id];
                  const sourceSlot = currentMemory?.slot ?? block.slot;
                  block.slot = mapSlotByIndex(sourceSlot, oldSlots, newSlots);
                  block.order = currentMemory?.order ?? block.order;
                }
              });
            } else {
              section.blocks.forEach((block) => {
                const currentMemory = currentLayoutMemory.byBlockId[block.id];
                const sourceSlot = currentMemory?.slot ?? block.slot;
                block.slot = mapSlotByIndex(sourceSlot, oldSlots, newSlots);
                block.order = currentMemory?.order ?? block.order;
              });
            }
          }

          normalizeBlocksBySlotOrder(section.blocks, newSlots);
          section.layoutSlotMemories[layout.id] = createLayoutSlotMemory(
            section.blocks,
            newSlots,
          );
        }

        section.layout = { ...layout };
        state.isDirty = true;
      });
    },

    updateSectionStyle: (id: string, style: Partial<SectionStyle>) => {
      set((state) => {
        const section = state.sections.find((s) => s.id === id);
        if (section) {
          Object.assign(section.style, style);
          state.isDirty = true;
        }
      });
    },

    // ─── Block CRUD ───────────────────────────────────────────────

    addBlock: (sectionId: string, blockType: BlockType, slot?: string) => {
      const blockEntry = BLOCK_REGISTRY[blockType];
      if (!blockEntry) return;

      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId);
        if (!section) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const targetSlot = slot || section.layout.slots[0];
        const slotsBlocks = section.blocks.filter((b) => b.slot === targetSlot);
        const maxOrder = slotsBlocks.length > 0
          ? Math.max(...slotsBlocks.map((b) => b.order))
          : -1;

        const newBlock: Block = {
          id: nanoid(10),
          type: blockType,
          slot: targetSlot,
          order: maxOrder + 1,
          props: { ...blockEntry.defaultProps },
          style: { ...blockEntry.defaultStyle },
        };

        section.blocks.push(newBlock);
        state.selectedBlockId = newBlock.id;
        state.selectedSectionId = sectionId;
        state.isDirty = true;
      });
    },

    removeBlock: (sectionId: string, blockId: string) => {
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId);
        if (!section) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        section.blocks = section.blocks.filter((b) => b.id !== blockId);
        if (state.selectedBlockId === blockId) {
          state.selectedBlockId = null;
        }
        state.isDirty = true;
      });
    },

    reorderBlocks: (sectionId: string, fromIndex: number, toIndex: number) => {
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId);
        if (!section) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        const [moved] = section.blocks.splice(fromIndex, 1);
        section.blocks.splice(toIndex, 0, moved);
        section.blocks.forEach((b, i) => {
          b.order = i;
        });
        state.isDirty = true;
      });
    },

    updateBlockProp: (sectionId: string, blockId: string, key: string, value: unknown) => {
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId);
        if (!section) return;
        const block = section.blocks.find((b) => b.id === blockId);
        if (block) {
          block.props[key] = value;
          state.isDirty = true;
        }
      });
    },

    updateBlockStyle: (sectionId: string, blockId: string, style: Partial<BlockStyle>) => {
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId);
        if (!section) return;
        const block = section.blocks.find((b) => b.id === blockId);
        if (block) {
          Object.assign(block.style, style);
          state.isDirty = true;
        }
      });
    },

    // ─── Global Style ─────────────────────────────────────────────

    updateGlobalStyle: (style: Partial<GlobalStyle>) => {
      set((state) => {
        Object.assign(state.globalStyle, style);
        state.isDirty = true;
      });
    },

    // ─── History ──────────────────────────────────────────────────

    undo: () => {
      set((state) => {
        if (state.history.length === 0) return;
        const previous = state.history.pop()!;
        state.future.push(JSON.parse(JSON.stringify(state.sections)));
        state.sections = previous;
        state.isDirty = true;
      });
    },

    redo: () => {
      set((state) => {
        if (state.future.length === 0) return;
        const next = state.future.pop()!;
        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.sections = next;
        state.isDirty = true;
      });
    },

    pushHistory: () => {
      set((state) => {
        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        if (state.history.length > 50) {
          state.history.shift();
        }
      });
    },

    // ─── Viewport ─────────────────────────────────────────────────

    setDevice: (device: DeviceMode) => {
      set((state) => {
        state.device = device;
      });
    },

    setZoom: (zoom: number) => {
      set((state) => {
        state.zoom = Math.max(50, Math.min(150, zoom));
      });
    },

    // ─── Persistence ──────────────────────────────────────────────

    saveToLocalStorage: () => {
      const state = get();
      const data = {
        sections: state.sections,
        globalStyle: state.globalStyle,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        set((s) => {
          s.isDirty = false;
          s.lastSaved = new Date().toISOString();
        });
      } catch {
        // localStorage may be full or unavailable
      }
    },

    loadFromLocalStorage: () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          const sections = data.sections || [];

          // Detect old variant-based format and discard it
          const isOldFormat = sections.length > 0 && sections[0].variant !== undefined && !sections[0].blocks;
          if (isOldFormat) {
            localStorage.removeItem(STORAGE_KEY);
            return;
          }

          set((state) => {
            state.sections = sections;
            state.globalStyle = data.globalStyle || DEFAULT_GLOBAL_STYLE;
            state.isDirty = false;
          });
        }
      } catch {
        // ignore parse errors
      }
    },

    setLastSaved: (timestamp: string) => {
      set((state) => {
        state.lastSaved = timestamp;
      });
    },

    // ─── Reset ────────────────────────────────────────────────────

    loadSections: (sections: Section[], globalStyle?: GlobalStyle) => {
      set((state) => {
        state.sections = sections;
        if (globalStyle) state.globalStyle = globalStyle;
        state.history = [];
        state.future = [];
        state.selectedSectionId = null;
        state.selectedBlockId = null;
        state.isDirty = false;
      });
    },
  })),
);
