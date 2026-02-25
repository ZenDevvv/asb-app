import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { getLayoutById } from "~/config/layoutTemplates";
import type {
  Section,
  Group,
  Block,
  LayoutTemplate,
  LayoutSlotMemory,
  BlockType,
  BlockStyle,
  SectionType,
  SectionStyle,
  GroupStyle,
  ColumnStyle,
  GlobalStyle,
  DeviceMode,
  EditorState,
  EditorActions,
} from "~/types/editor";

export const EDITOR_STORAGE_KEY = "asb-editor-state";
const BLOCK_STYLE_HISTORY_DEBOUNCE_MS = 400;
const blockStyleHistoryWindows = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleBlockStyleHistoryWindow(windowKey: string) {
  const existingTimer = blockStyleHistoryWindows.get(windowKey);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    blockStyleHistoryWindows.delete(windowKey);
  }, BLOCK_STYLE_HISTORY_DEBOUNCE_MS);

  blockStyleHistoryWindows.set(windowKey, timer);
}

function clearBlockStyleHistoryWindows() {
  blockStyleHistoryWindows.forEach((timer) => clearTimeout(timer));
  blockStyleHistoryWindows.clear();
}

export const DEFAULT_GLOBAL_STYLE: GlobalStyle = {
  fontFamily: "Inter",
  primaryColor: "#00e5a0",
  colorScheme: "monochromatic",
  borderRadius: "md",
  themeMode: "dark",
};

const initialState: EditorState = {
  sections: [],
  selectedSectionId: null,
  selectedGroupId: null,
  selectedBlockId: null,
  clipboard: null,
  globalStyle: { ...DEFAULT_GLOBAL_STYLE },
  history: [],
  future: [],
  isDirty: false,
  isSaving: false,
  device: "desktop",
  zoom: 100,
  lastSaved: null,
};

function isAbsoluteBlock(block: Block): boolean {
  return block.style.positionMode === "absolute";
}

function getFlowBlocks(blocks: Block[]): Block[] {
  return blocks.filter((block) => !isAbsoluteBlock(block));
}

function getSafeLayout(layoutId?: string): LayoutTemplate {
  if (layoutId) {
    const byId = getLayoutById(layoutId);
    if (byId) return { ...byId };
  }

  const fallback = getLayoutById("1col") || getLayoutById("1col-left");
  if (fallback) return { ...fallback };

  return {
    id: "1col",
    label: "Centered",
    spans: [6],
    alignment: "center",
    reversed: false,
    slots: ["main"],
  };
}

function mapSlotByIndex(sourceSlot: string, sourceSlots: string[], targetSlots: string[]): string {
  if (targetSlots.length === 0) return sourceSlot;
  const sourceIndex = sourceSlots.indexOf(sourceSlot);
  if (sourceIndex === -1) return targetSlots[0];
  return targetSlots[Math.min(sourceIndex, targetSlots.length - 1)];
}

function normalizeBlocksBySlotOrder(blocks: Block[], slots: string[]) {
  if (slots.length === 0) return;
  const flowBlocks = getFlowBlocks(blocks);
  if (flowBlocks.length === 0) return;

  const validSlots = new Set(slots);
  const fallbackSlot = slots[0];
  flowBlocks.forEach((block) => {
    if (!validSlots.has(block.slot)) {
      block.slot = fallbackSlot;
    }
  });

  slots.forEach((slot) => {
    const blocksInSlot = flowBlocks
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
  const flowBlocks = getFlowBlocks(blocks);

  return {
    sourceSlots: [...slots],
    byBlockId: Object.fromEntries(
      flowBlocks.map((block) => [block.id, { slot: block.slot, order: block.order }]),
    ),
  };
}

function normalizeGroupOrders(groups: Group[]) {
  groups.forEach((group, index) => {
    group.order = index;
  });
}

function cloneBlockSeed(block: Omit<Block, "id">): Block {
  return {
    ...block,
    id: nanoid(10),
    props: { ...block.props },
    style: { ...block.style },
  };
}

function buildDefaultGroups(sectionType: SectionType): Group[] {
  const registry = SECTION_REGISTRY[sectionType];
  const fallbackLayout = getSafeLayout(registry.defaultLayoutId);

  const groupsFromRegistry = registry.defaultGroups?.length
    ? registry.defaultGroups.map((seed, index) => {
      const layout = getSafeLayout(seed.layoutId);
      return {
        id: nanoid(10),
        label: seed.label || `Group ${index + 1}`,
        order: index,
        layout,
        blocks: seed.blocks.map((block) => cloneBlockSeed(block)),
        style: seed.style ? { ...seed.style } : {},
      } satisfies Group;
    })
    : null;

  const groups = groupsFromRegistry ?? [
    {
      id: nanoid(10),
      label: "Main Group",
      order: 0,
      layout: fallbackLayout,
      blocks: registry.defaultBlocks.map((block) => cloneBlockSeed(block)),
      style: {},
    } satisfies Group,
  ];

  groups.forEach((group) => {
    normalizeBlocksBySlotOrder(group.blocks, group.layout.slots);
  });

  return groups;
}

function findSection(state: EditorState, sectionId: string): Section | undefined {
  return state.sections.find((section) => section.id === sectionId);
}

function findGroup(section: Section, groupId: string): Group | undefined {
  return section.groups.find((group) => group.id === groupId);
}

function findBlock(group: Group, blockId: string): Block | undefined {
  return group.blocks.find((block) => block.id === blockId);
}

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    ...initialState,

    // ─── Section CRUD ─────────────────────────────────────────────

    addSection: (type: SectionType, index?: number) => {
      if (!SECTION_REGISTRY[type]) return;

      const newSection: Section = {
        id: nanoid(10),
        type,
        label: SECTION_REGISTRY[type].label,
        groups: buildDefaultGroups(type),
        style: {
          ...SECTION_REGISTRY[type].defaultStyle,
          colorMode: "global",
        },
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
        state.selectedGroupId = null;
        state.selectedBlockId = null;
        state.isDirty = true;
      });
    },

    renameSection: (id: string, label: string) => {
      set((state) => {
        const section = findSection(state, id);
        if (!section) return;

        section.label = label;
        state.isDirty = true;
      });
    },

    removeSection: (id: string) => {
      set((state) => {
        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        state.sections = state.sections.filter((section) => section.id !== id);
        if (state.selectedSectionId === id) {
          state.selectedSectionId = null;
          state.selectedGroupId = null;
          state.selectedBlockId = null;
        }
        state.isDirty = true;
      });
    },

    duplicateSection: (id: string) => {
      set((state) => {
        const idx = state.sections.findIndex((section) => section.id === id);
        if (idx === -1) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const clone: Section = JSON.parse(JSON.stringify(state.sections[idx]));
        clone.id = nanoid(10);
        clone.groups = clone.groups.map((group: Group, groupIndex: number) => ({
          ...group,
          id: nanoid(10),
          order: groupIndex,
          blocks: group.blocks.map((block: Block) => ({
            ...block,
            id: nanoid(10),
            props: { ...block.props },
            style: { ...block.style },
          })),
          layoutSlotMemory: undefined,
          layoutSlotMemories: undefined,
        }));

        state.sections.splice(idx + 1, 0, clone);
        state.selectedSectionId = clone.id;
        state.selectedGroupId = null;
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
        const section = state.sections.find((item) => item.id === id);
        if (!section) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        section.isVisible = !section.isVisible;
        state.isDirty = true;
      });
    },

    // Group CRUD
    addGroup: (sectionId: string, layoutId?: string, index?: number) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;

        const registry = SECTION_REGISTRY[section.type];
        const layout = getSafeLayout(layoutId || registry.defaultLayoutId);
        const insertIndex = index === undefined
          ? section.groups.length
          : Math.max(0, Math.min(index, section.groups.length));

        const newGroup: Group = {
          id: nanoid(10),
          label: `Group ${section.groups.length + 1}`,
          order: insertIndex,
          layout,
          blocks: [],
          style: {},
        };

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        section.groups.splice(insertIndex, 0, newGroup);
        normalizeGroupOrders(section.groups);

        state.selectedSectionId = sectionId;
        state.selectedGroupId = newGroup.id;
        state.selectedBlockId = null;
        state.isDirty = true;
      });
    },

    removeGroup: (sectionId: string, groupId: string) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section || section.groups.length <= 1) return;

        const removedIndex = section.groups.findIndex((group) => group.id === groupId);
        if (removedIndex === -1) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        section.groups.splice(removedIndex, 1);
        normalizeGroupOrders(section.groups);

        if (state.selectedGroupId === groupId) {
          const fallbackGroup = section.groups[Math.max(0, removedIndex - 1)] || section.groups[0];
          state.selectedGroupId = fallbackGroup?.id || null;
          state.selectedBlockId = null;
        }

        state.isDirty = true;
      });
    },

    duplicateGroup: (sectionId: string, groupId: string) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;

        const sourceIndex = section.groups.findIndex((group) => group.id === groupId);
        if (sourceIndex === -1) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const original = section.groups[sourceIndex];
        const clone: Group = {
          ...JSON.parse(JSON.stringify(original)),
          id: nanoid(10),
          label: `${original.label} Copy`,
          blocks: original.blocks.map((block) => ({
            ...JSON.parse(JSON.stringify(block)),
            id: nanoid(10),
          })),
          layoutSlotMemory: undefined,
          layoutSlotMemories: undefined,
        };

        section.groups.splice(sourceIndex + 1, 0, clone);
        normalizeGroupOrders(section.groups);

        state.selectedSectionId = sectionId;
        state.selectedGroupId = clone.id;
        state.selectedBlockId = null;
        state.isDirty = true;
      });
    },

    reorderGroups: (sectionId: string, activeGroupId: string, overGroupId: string) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        if (activeGroupId === overGroupId) return;

        const orderedGroups = section.groups.slice().sort((a, b) => a.order - b.order);
        const fromIndex = orderedGroups.findIndex((group) => group.id === activeGroupId);
        const toIndex = orderedGroups.findIndex((group) => group.id === overGroupId);

        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || toIndex < 0) return;
        if (fromIndex >= orderedGroups.length || toIndex >= orderedGroups.length) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const [moved] = orderedGroups.splice(fromIndex, 1);
        if (!moved) return;
        orderedGroups.splice(toIndex, 0, moved);
        section.groups = orderedGroups;
        normalizeGroupOrders(section.groups);
        state.isDirty = true;
      });
    },

    renameGroup: (sectionId: string, groupId: string, label: string) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;

        const group = findGroup(section, groupId);
        if (!group) return;

        group.label = label;
        state.isDirty = true;
      });
    },

    // ─── Selection (two levels) ───────────────────────────────────

    selectSection: (id: string | null) => {
      set((state) => {
        state.selectedSectionId = id;
        state.selectedGroupId = null;
        state.selectedBlockId = null;
      });
    },

    selectGroup: (sectionId: string | null, groupId: string | null) => {
      set((state) => {
        state.selectedSectionId = sectionId;
        state.selectedGroupId = groupId;
        state.selectedBlockId = null;
      });
    },

    selectBlock: (sectionId: string | null, groupId: string | null, blockId: string | null) => {
      set((state) => {
        state.selectedSectionId = sectionId;
        state.selectedGroupId = groupId;
        state.selectedBlockId = blockId;
      });
    },

    // ─── Section Updates ──────────────────────────────────────────

    updateGroupLayout: (sectionId: string, groupId: string, layoutId: string) => {
      const layout = getLayoutById(layoutId);
      if (!layout) return;

      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const oldLayoutId = group.layout.id;
        const oldAlignment = group.layout.alignment;
        const oldReversed = group.layout.reversed;
        const oldSlots = group.layout.slots;
        const newSlots = layout.slots;

        if (oldSlots.length !== newSlots.length || oldSlots.some((s, i) => s !== newSlots[i])) {
          normalizeBlocksBySlotOrder(group.blocks, oldSlots);

          if (!group.layoutSlotMemories) {
            group.layoutSlotMemories = {};
          }

          group.layoutSlotMemories[oldLayoutId] = createLayoutSlotMemory(
            group.blocks,
            oldSlots,
          );
          const currentLayoutMemory = group.layoutSlotMemories[oldLayoutId];

          if (oldSlots.length > 1 && newSlots.length === 1) {
            group.layoutSlotMemory = currentLayoutMemory;
          }

          const flowBlocks = getFlowBlocks(group.blocks);

          const applyFromMemory = (memory: LayoutSlotMemory) => {
            flowBlocks.forEach((block) => {
              const targetMemory = memory.byBlockId[block.id];
              if (targetMemory) {
                block.slot = newSlots.includes(targetMemory.slot)
                  ? targetMemory.slot
                  : mapSlotByIndex(targetMemory.slot, memory.sourceSlots, newSlots);
                block.order = targetMemory.order;
                return;
              }

              const currentMemory = currentLayoutMemory.byBlockId[block.id];
              const sourceSlot = currentMemory?.slot || oldSlots[0];
              block.slot = mapSlotByIndex(sourceSlot, oldSlots, newSlots);
              block.order = currentMemory?.order ?? block.order;
            });
          };

          const targetLayoutMemory = group.layoutSlotMemories[layout.id];
          const fallbackFromSingle =
            oldSlots.length === 1 && newSlots.length > 1
              ? group.layoutSlotMemory
              : undefined;

          if (targetLayoutMemory) {
            applyFromMemory(targetLayoutMemory);
          } else if (fallbackFromSingle) {
            applyFromMemory(fallbackFromSingle);
          } else if (newSlots.length === 1) {
            const orderedBlocks = getBlocksForSingleColumnView(flowBlocks, oldSlots);
            orderedBlocks.forEach((block, index) => {
              block.slot = newSlots[0];
              block.order = index;
            });
          } else {
            flowBlocks.forEach((block) => {
              const currentMemory = currentLayoutMemory.byBlockId[block.id];
              const sourceSlot = currentMemory?.slot ?? block.slot;
              block.slot = mapSlotByIndex(sourceSlot, oldSlots, newSlots);
              block.order = currentMemory?.order ?? block.order;
            });
          }

          normalizeBlocksBySlotOrder(group.blocks, newSlots);
          group.layoutSlotMemories[layout.id] = createLayoutSlotMemory(group.blocks, newSlots);
        }

        group.layout = {
          ...layout,
          // Preserve user's alignment and reversed preferences across layout switches.
          // Reversed is only preserved when the slot count stays the same.
          alignment: oldAlignment,
          reversed: newSlots.length === oldSlots.length ? oldReversed : false,
        };
        state.isDirty = true;
      });
    },

    updateGroupLayoutOptions: (sectionId, groupId, options) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        if (options.alignment !== undefined) group.layout.alignment = options.alignment;
        if (options.reversed !== undefined) group.layout.reversed = options.reversed;
        state.isDirty = true;
      });
    },

    updateSectionStyle: (id: string, style: Partial<SectionStyle>) => {
      set((state) => {
        const section = findSection(state, id);
        if (!section) return;

        Object.assign(section.style, style);
        state.isDirty = true;
      });
    },

    updateGroupStyle: (sectionId: string, groupId: string, style: Partial<GroupStyle>) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;

        const group = findGroup(section, groupId);
        if (!group) return;

        group.style = { ...(group.style || {}), ...style };
        state.isDirty = true;
      });
    },

    updateGroupColumnStyle: (sectionId: string, groupId: string, colIndex: number, style: Partial<ColumnStyle>) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;

        const group = findGroup(section, groupId);
        if (!group) return;

        if (!group.style) group.style = {};
        if (!group.style.columnStyles) group.style.columnStyles = {};
        group.style.columnStyles[colIndex] = {
          ...(group.style.columnStyles[colIndex] || {}),
          ...style,
        };
        state.isDirty = true;
      });
    },

    // ─── Block CRUD ───────────────────────────────────────────────

    addBlock: (
      sectionId: string,
      groupId: string,
      blockType: BlockType,
      slot?: string,
      options?: { addAsAbsolute?: boolean },
    ) => {
      const blockEntry = BLOCK_REGISTRY[blockType];
      if (!blockEntry) return;

      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const targetSlot = slot || group.layout.slots[0] || "main";
        const isAbsolute = options?.addAsAbsolute === true;
        const candidateBlocks = isAbsolute
          ? group.blocks.filter((block) => isAbsoluteBlock(block))
          : group.blocks.filter((block) => !isAbsoluteBlock(block) && block.slot === targetSlot);
        const maxOrder = candidateBlocks.length > 0
          ? Math.max(...candidateBlocks.map((block) => block.order))
          : -1;

        const newBlock: Block = {
          id: nanoid(10),
          type: blockType,
          slot: targetSlot,
          order: maxOrder + 1,
          props: { ...blockEntry.defaultProps },
          style: {
            ...blockEntry.defaultStyle,
            ...(isAbsolute
              ? {
                positionMode: "absolute",
                positionX: 24,
                positionY: 24,
                zIndex: 20,
                scale: 100,
              }
              : {}),
          },
        };

        group.blocks.push(newBlock);
        state.selectedSectionId = sectionId;
        state.selectedGroupId = groupId;
        state.selectedBlockId = newBlock.id;
        state.isDirty = true;
      });
    },

    duplicateBlock: (sectionId: string, groupId: string, blockId: string) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        const sourceBlock = findBlock(group, blockId);
        if (!sourceBlock) return;

        const sourceIsAbsolute = isAbsoluteBlock(sourceBlock);
        const peerBlocks = group.blocks
          .filter((entry) =>
            sourceIsAbsolute
              ? isAbsoluteBlock(entry)
              : !isAbsoluteBlock(entry) && entry.slot === sourceBlock.slot
          )
          .sort((a, b) => a.order - b.order);
        const sourceIndex = peerBlocks.findIndex((entry) => entry.id === blockId);
        if (sourceIndex === -1) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const clone: Block = {
          ...JSON.parse(JSON.stringify(sourceBlock)),
          id: nanoid(10),
        };

        if (sourceIsAbsolute) {
          clone.style.positionY = (sourceBlock.style.positionY ?? 0) + 24;
        }

        const reorderedPeers = peerBlocks.slice();
        reorderedPeers.splice(sourceIndex + 1, 0, clone);
        reorderedPeers.forEach((entry, index) => {
          entry.order = index;
        });

        group.blocks.push(clone);
        normalizeBlocksBySlotOrder(group.blocks, group.layout.slots);

        state.selectedSectionId = sectionId;
        state.selectedGroupId = groupId;
        state.selectedBlockId = clone.id;
        state.isDirty = true;
      });
    },

    copyBlock: (sectionId: string, groupId: string, blockId: string) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;
        const block = findBlock(group, blockId);
        if (!block) return;
        state.clipboard = JSON.parse(JSON.stringify(block));
      });
    },

    pasteBlock: (targetSectionId: string, targetGroupId: string, targetBlockId?: string | null) => {
      set((state) => {
        if (!state.clipboard) return;

        const section = findSection(state, targetSectionId);
        if (!section) return;
        const group = findGroup(section, targetGroupId);
        if (!group) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const clone: Block = {
          ...JSON.parse(JSON.stringify(state.clipboard)),
          id: nanoid(10),
        };

        if (targetBlockId) {
          // Paste after the focused block in the same slot
          const sourceBlock = findBlock(group, targetBlockId);
          if (sourceBlock) {
            clone.slot = sourceBlock.slot;
            const sourceIsAbsolute = isAbsoluteBlock(sourceBlock);
            if (sourceIsAbsolute) {
              clone.style.positionMode = "absolute";
              clone.style.positionY = (sourceBlock.style.positionY ?? 0) + 24;
            } else {
              clone.style.positionMode = "flow";
              const peerBlocks = group.blocks
                .filter((b) => !isAbsoluteBlock(b) && b.slot === sourceBlock.slot)
                .sort((a, b) => a.order - b.order);
              const sourceIndex = peerBlocks.findIndex((b) => b.id === targetBlockId);
              clone.order = sourceIndex + 1;
              // Shift later blocks down
              peerBlocks.forEach((b) => {
                if (b.order >= clone.order) b.order += 1;
              });
            }
          }
        } else {
          // Paste at end of first slot in group
          const targetSlot = group.layout.slots[0] ?? "main";
          clone.slot = targetSlot;
          const slotBlocks = group.blocks.filter(
            (b) => !isAbsoluteBlock(b) && b.slot === targetSlot,
          );
          clone.order = slotBlocks.length;
          clone.style.positionMode = "flow";
        }

        group.blocks.push(clone);
        normalizeBlocksBySlotOrder(group.blocks, group.layout.slots);

        state.selectedSectionId = targetSectionId;
        state.selectedGroupId = targetGroupId;
        state.selectedBlockId = clone.id;
        state.isDirty = true;
      });
    },

    removeBlock: (sectionId: string, groupId: string, blockId: string) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        group.blocks = group.blocks.filter((block) => block.id !== blockId);
        if (state.selectedBlockId === blockId) {
          state.selectedBlockId = null;
        }
        state.isDirty = true;
      });
    },

    reorderBlocks: (sectionId: string, groupId: string, fromIndex: number, toIndex: number) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        const orderedBlocks = group.blocks.slice().sort((a, b) => a.order - b.order);
        if (fromIndex < 0 || toIndex < 0) return;
        if (fromIndex >= orderedBlocks.length || toIndex >= orderedBlocks.length) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const [moved] = orderedBlocks.splice(fromIndex, 1);
        orderedBlocks.splice(toIndex, 0, moved);

        const orderById = new Map<string, number>();
        orderedBlocks.forEach((block, index) => {
          orderById.set(block.id, index);
        });

        group.blocks.forEach((block) => {
          const nextOrder = orderById.get(block.id);
          if (nextOrder !== undefined) {
            block.order = nextOrder;
          }
        });

        state.isDirty = true;
      });
    },

    moveBlockToSlot: (sectionId: string, groupId: string, blockId: string, slot: string) => {
      get().moveBlockToSlotAtIndex(sectionId, groupId, blockId, slot, Number.MAX_SAFE_INTEGER);
    },

    moveBlockToSlotAtIndex: (
      sectionId: string,
      groupId: string,
      blockId: string,
      slot: string,
      targetIndex: number,
    ) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        const groupSlots = group.layout.slots;
        if (groupSlots.length === 0) return;
        const targetSlot = groupSlots.includes(slot) ? slot : groupSlots[0];

        const block = findBlock(group, blockId);
        if (!block) return;
        if (isAbsoluteBlock(block)) return;

        const sourceSlot = block.slot;
        const sourceSlotBlocks = group.blocks
          .filter((entry) => !isAbsoluteBlock(entry) && entry.slot === sourceSlot)
          .sort((a, b) => a.order - b.order);
        const sourceIndex = sourceSlotBlocks.findIndex((entry) => entry.id === blockId);
        if (sourceIndex === -1) return;

        const targetSlotBlocks = group.blocks
          .filter(
            (entry) => !isAbsoluteBlock(entry) && entry.slot === targetSlot && entry.id !== blockId,
          )
          .sort((a, b) => a.order - b.order);
        const clampedTargetIndex = Math.max(
          0,
          Math.min(Math.round(targetIndex), targetSlotBlocks.length),
        );

        if (sourceSlot === targetSlot && clampedTargetIndex === sourceIndex) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const reorderedTargetSlot = targetSlotBlocks.slice();
        reorderedTargetSlot.splice(clampedTargetIndex, 0, block);
        reorderedTargetSlot.forEach((entry, index) => {
          entry.slot = targetSlot;
          entry.order = index;
        });

        if (sourceSlot !== targetSlot) {
          const reorderedSourceSlot = sourceSlotBlocks.filter((entry) => entry.id !== blockId);
          reorderedSourceSlot.forEach((entry, index) => {
            entry.order = index;
          });
        }

        normalizeBlocksBySlotOrder(group.blocks, group.layout.slots);

        state.isDirty = true;
      });
    },

    updateBlockProp: (
      sectionId: string,
      groupId: string,
      blockId: string,
      key: string,
      value: unknown,
    ) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        const block = findBlock(group, blockId);
        if (!block) return;

        block.props[key] = value;
        state.isDirty = true;
      });
    },

    updateBlockStyle: (
      sectionId: string,
      groupId: string,
      blockId: string,
      style: Partial<BlockStyle>,
    ) => {
      const historyWindowKey = `${sectionId}:${groupId}:${blockId}`;
      const shouldPushHistory = !blockStyleHistoryWindows.has(historyWindowKey);
      let didUpdate = false;

      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        const group = findGroup(section, groupId);
        if (!group) return;

        const block = findBlock(group, blockId);
        if (!block) return;

        if (shouldPushHistory) {
          state.history.push(JSON.parse(JSON.stringify(state.sections)));
          state.future = [];
        }
        Object.assign(block.style, style);
        state.isDirty = true;
        didUpdate = true;
      });

      if (didUpdate) {
        scheduleBlockStyleHistoryWindow(historyWindowKey);
      }
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
      clearBlockStyleHistoryWindows();
      set((state) => {
        if (state.history.length === 0) return;
        const previous = state.history.pop()!;
        state.future.push(JSON.parse(JSON.stringify(state.sections)));
        state.sections = previous;
        state.selectedGroupId = null;
        state.selectedBlockId = null;
        state.isDirty = true;
      });
    },

    redo: () => {
      clearBlockStyleHistoryWindows();
      set((state) => {
        if (state.future.length === 0) return;
        const next = state.future.pop()!;
        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.sections = next;
        state.selectedGroupId = null;
        state.selectedBlockId = null;
        state.isDirty = true;
      });
    },

    pushHistory: () => {
      clearBlockStyleHistoryWindows();
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
        localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(data));
        set((s) => {
          s.isDirty = false;
          s.lastSaved = new Date().toISOString();
        });
      } catch {
        // localStorage may be full or unavailable
      }
    },

    loadFromLocalStorage: () => {
      clearBlockStyleHistoryWindows();
      try {
        const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw) as {
            sections?: unknown;
            globalStyle?: unknown;
          };

          if (!Array.isArray(data.sections) || !data.globalStyle || typeof data.globalStyle !== "object") {
            return;
          }

          set((state) => {
            state.sections = data.sections as Section[];
            state.globalStyle = data.globalStyle as GlobalStyle;
            state.history = [];
            state.future = [];
            state.selectedSectionId = null;
            state.selectedGroupId = null;
            state.selectedBlockId = null;
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

    setIsSaving: (value: boolean) => {
      set((state) => {
        state.isSaving = value;
      });
    },

    // ─── Reset ────────────────────────────────────────────────────

    loadSections: (sections: Section[], globalStyle: GlobalStyle) => {
      clearBlockStyleHistoryWindows();
      set((state) => {
        state.sections = sections;
        state.globalStyle = globalStyle;
        state.history = [];
        state.future = [];
        state.selectedSectionId = null;
        state.selectedGroupId = null;
        state.selectedBlockId = null;
        state.isDirty = false;
      });
    },
  })),
);
