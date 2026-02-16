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
  GlobalStyle,
  DeviceMode,
  EditorState,
  EditorActions,
} from "~/types/editor";

const STORAGE_KEY = "asb-editor-state";
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

const DEFAULT_GLOBAL_STYLE: GlobalStyle = {
  fontFamily: "Inter",
  primaryColor: "#00e5a0",
  borderRadius: "md",
};

const initialState: EditorState = {
  sections: [],
  selectedSectionId: null,
  selectedGroupId: null,
  selectedBlockId: null,
  globalStyle: DEFAULT_GLOBAL_STYLE,
  history: [],
  future: [],
  isDirty: false,
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

  const fallback = getLayoutById("1-col-center") || getLayoutById("1-col-left");
  if (fallback) return { ...fallback };

  return {
    id: "fallback-1-col",
    label: "Main",
    columns: 1,
    distribution: "100",
    alignment: "top",
    direction: "row",
    slots: ["main"],
  };
}

function resolveLayout(layoutLike: unknown, fallbackLayoutId?: string): LayoutTemplate {
  if (layoutLike && typeof layoutLike === "object") {
    const candidate = layoutLike as Partial<LayoutTemplate>;

    if (typeof candidate.id === "string") {
      const known = getLayoutById(candidate.id);
      if (known) return { ...known };
    }

    const hasValidColumns = candidate.columns === 1 || candidate.columns === 2 || candidate.columns === 3;
    const hasValidAlignment =
      candidate.alignment === "top" ||
      candidate.alignment === "center" ||
      candidate.alignment === "bottom";
    const hasValidDirection = candidate.direction === "row" || candidate.direction === "row-reverse";

    if (
      typeof candidate.id === "string" &&
      typeof candidate.label === "string" &&
      hasValidColumns &&
      typeof candidate.distribution === "string" &&
      hasValidAlignment &&
      hasValidDirection &&
      Array.isArray(candidate.slots)
    ) {
      const columns = candidate.columns as 1 | 2 | 3;
      const alignment = candidate.alignment as "top" | "center" | "bottom";
      const direction = candidate.direction as "row" | "row-reverse";
      return {
        id: candidate.id,
        label: candidate.label,
        columns,
        distribution: candidate.distribution,
        alignment,
        direction,
        slots: [...candidate.slots],
      };
    }
  }

  return getSafeLayout(fallbackLayoutId);
}

function isSectionType(value: unknown): value is SectionType {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SECTION_REGISTRY, value);
}

function mapSlotByIndex(sourceSlot: string, sourceSlots: string[], targetSlots: string[]): string {
  if (targetSlots.length === 0) return sourceSlot;
  const sourceIndex = sourceSlots.indexOf(sourceSlot);
  if (sourceIndex === -1) return targetSlots[0];
  return targetSlots[Math.min(sourceIndex, targetSlots.length - 1)];
}

function normalizeBlocksBySlotOrder(
  blocks: Block[],
  slots: string[],
  options?: { keepUnknownSlots?: boolean },
) {
  if (slots.length === 0) return;
  const flowBlocks = getFlowBlocks(blocks);
  if (flowBlocks.length === 0) return;

  const validSlots = new Set(slots);
  const fallbackSlot = slots[0];
  const keepUnknownSlots = options?.keepUnknownSlots ?? false;

  if (!keepUnknownSlots) {
    flowBlocks.forEach((block) => {
      if (!validSlots.has(block.slot)) {
        block.slot = fallbackSlot;
      }
    });
  }

  const slotsToNormalize = keepUnknownSlots
    ? [...new Set([...slots, ...flowBlocks.map((block) => block.slot)])]
    : slots;

  slotsToNormalize.forEach((slot) => {
    const blocksInSlot = flowBlocks
      .filter((block) => block.slot === slot)
      .sort((a, b) => a.order - b.order);

    blocksInSlot.forEach((block, index) => {
      block.order = index;
    });
  });
}

function getNavbarSemanticSlot(block: Block, fallbackSlot: string): string {
  if (fallbackSlot === "brand" || fallbackSlot === "links" || fallbackSlot === "actions") {
    return fallbackSlot;
  }

  if (block.type === "button") return "actions";
  if (block.type === "list" || block.type === "text") return "links";
  return "brand";
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
  groups
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((group, index) => {
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
    normalizeBlocksBySlotOrder(group.blocks, group.layout.slots, {
      keepUnknownSlots: sectionType === "navbar",
    });
  });

  return groups;
}

function normalizeIncomingBlocks(blocksLike: unknown, fallbackSlot: string): Block[] {
  if (!Array.isArray(blocksLike)) return [];

  const blocks: Block[] = [];

  blocksLike.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const raw = item as Partial<Block>;
    if (typeof raw.type !== "string") return;
    if (!Object.prototype.hasOwnProperty.call(BLOCK_REGISTRY, raw.type)) return;

    blocks.push({
      id: typeof raw.id === "string" ? raw.id : nanoid(10),
      type: raw.type as BlockType,
      slot: typeof raw.slot === "string" ? raw.slot : fallbackSlot,
      order: typeof raw.order === "number" && Number.isFinite(raw.order) ? raw.order : index,
      props: raw.props && typeof raw.props === "object" ? { ...raw.props } : {},
      style: raw.style && typeof raw.style === "object" ? { ...raw.style } : {},
    });
  });

  return blocks;
}

function normalizeIncomingGroups(sectionType: SectionType, sectionLike: unknown): Group[] {
  const registry = SECTION_REGISTRY[sectionType];
  if (!sectionLike || typeof sectionLike !== "object") {
    return buildDefaultGroups(sectionType);
  }

  const rawSection = sectionLike as {
    groups?: unknown;
    layout?: unknown;
    blocks?: unknown;
  };

  if (Array.isArray(rawSection.groups) && rawSection.groups.length > 0) {
    const groups: Group[] = [];

    rawSection.groups.forEach((groupLike, index) => {
      if (!groupLike || typeof groupLike !== "object") return;
      const rawGroup = groupLike as Partial<Group>;
      const layout = resolveLayout(rawGroup.layout, registry.defaultLayoutId);
      const blocks = normalizeIncomingBlocks(rawGroup.blocks, layout.slots[0] || "main");

      const group: Group = {
        id: typeof rawGroup.id === "string" ? rawGroup.id : nanoid(10),
        label: typeof rawGroup.label === "string" ? rawGroup.label : `Group ${index + 1}`,
        order: typeof rawGroup.order === "number" && Number.isFinite(rawGroup.order)
          ? rawGroup.order
          : index,
        layout,
        blocks,
        style: rawGroup.style && typeof rawGroup.style === "object"
          ? { ...rawGroup.style }
          : {},
        layoutSlotMemory: rawGroup.layoutSlotMemory,
        layoutSlotMemories: rawGroup.layoutSlotMemories,
      };

      normalizeBlocksBySlotOrder(group.blocks, group.layout.slots, {
        keepUnknownSlots: sectionType === "navbar",
      });
      groups.push(group);
    });

    if (groups.length > 0) {
      groups.sort((a, b) => a.order - b.order);
      groups.forEach((group, index) => {
        group.order = index;
      });
      return groups;
    }
  }

  const legacyLayout = resolveLayout(rawSection.layout, registry.defaultLayoutId);
  const legacyBlocks = normalizeIncomingBlocks(rawSection.blocks, legacyLayout.slots[0] || "main");

  if (legacyBlocks.length > 0 || rawSection.layout) {
    const group: Group = {
      id: nanoid(10),
      label: "Main Group",
      order: 0,
      layout: legacyLayout,
      blocks: legacyBlocks,
      style: {},
      layoutSlotMemory: (rawSection as { layoutSlotMemory?: LayoutSlotMemory }).layoutSlotMemory,
      layoutSlotMemories: (rawSection as { layoutSlotMemories?: Record<string, LayoutSlotMemory> }).layoutSlotMemories,
    };

    normalizeBlocksBySlotOrder(group.blocks, group.layout.slots, {
      keepUnknownSlots: sectionType === "navbar",
    });

    return [group];
  }

  return buildDefaultGroups(sectionType);
}

function normalizeIncomingSections(sectionsLike: unknown): Section[] {
  if (!Array.isArray(sectionsLike)) return [];

  const sections: Section[] = [];

  sectionsLike.forEach((sectionLike) => {
    if (!sectionLike || typeof sectionLike !== "object") return;
    const rawSection = sectionLike as Partial<Section>;
    if (!isSectionType(rawSection.type)) return;

    const groups = normalizeIncomingGroups(rawSection.type, rawSection);
    if (groups.length === 0) return;

    sections.push({
      id: typeof rawSection.id === "string" ? rawSection.id : nanoid(10),
      type: rawSection.type,
      groups,
      style: rawSection.style && typeof rawSection.style === "object"
        ? { ...rawSection.style }
        : { ...SECTION_REGISTRY[rawSection.type].defaultStyle },
      isVisible: rawSection.isVisible !== false,
    });
  });

  return sections;
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
        groups: buildDefaultGroups(type),
        style: { ...SECTION_REGISTRY[type].defaultStyle },
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

    reorderGroups: (sectionId: string, fromIndex: number, toIndex: number) => {
      set((state) => {
        const section = findSection(state, sectionId);
        if (!section) return;
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || toIndex < 0) return;
        if (fromIndex >= section.groups.length || toIndex >= section.groups.length) return;

        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];

        const [moved] = section.groups.splice(fromIndex, 1);
        section.groups.splice(toIndex, 0, moved);
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
        const oldSlots = group.layout.slots;
        const newSlots = layout.slots;
        const isNavbarSemanticSwitch =
          section.type === "navbar" &&
          (oldLayoutId.startsWith("nav-") || layout.id.startsWith("nav-"));

        if (oldSlots.length !== newSlots.length || oldSlots.some((s, i) => s !== newSlots[i])) {
          normalizeBlocksBySlotOrder(group.blocks, oldSlots, {
            keepUnknownSlots: isNavbarSemanticSwitch,
          });

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

          const applyFromMemory = (
            memory: LayoutSlotMemory,
            options?: {
              preserveUnavailableSlots?: boolean;
              useNavbarSemanticFallback?: boolean;
            },
          ) => {
            flowBlocks.forEach((block) => {
              const targetMemory = memory.byBlockId[block.id];
              if (targetMemory) {
                block.slot = newSlots.includes(targetMemory.slot)
                  ? targetMemory.slot
                  : options?.preserveUnavailableSlots
                    ? targetMemory.slot
                    : mapSlotByIndex(targetMemory.slot, memory.sourceSlots, newSlots);
                block.order = targetMemory.order;
                return;
              }

              const currentMemory = currentLayoutMemory.byBlockId[block.id];
              const sourceSlot = currentMemory?.slot || oldSlots[0];

              if (options?.useNavbarSemanticFallback) {
                block.slot = getNavbarSemanticSlot(block, sourceSlot);
                block.order = currentMemory?.order ?? block.order;
                return;
              }

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
            applyFromMemory(targetLayoutMemory, {
              preserveUnavailableSlots: isNavbarSemanticSwitch,
              useNavbarSemanticFallback: isNavbarSemanticSwitch,
            });
          } else if (fallbackFromSingle) {
            applyFromMemory(fallbackFromSingle, {
              preserveUnavailableSlots: isNavbarSemanticSwitch,
              useNavbarSemanticFallback: isNavbarSemanticSwitch,
            });
          } else if (newSlots.length === 1) {
            const orderedBlocks = getBlocksForSingleColumnView(flowBlocks, oldSlots);
            orderedBlocks.forEach((block, index) => {
              block.slot = newSlots[0];
              block.order = index;
            });
          } else {
            if (isNavbarSemanticSwitch) {
              flowBlocks.forEach((block) => {
                const currentMemory = currentLayoutMemory.byBlockId[block.id];
                const sourceSlot = currentMemory?.slot ?? block.slot;
                const semanticSlot = getNavbarSemanticSlot(block, sourceSlot);
                block.slot = semanticSlot;
                block.order = currentMemory?.order ?? block.order;

                if (block.type === "list" && semanticSlot === "links") {
                  block.props.inline = true;
                }
              });
            } else {
              flowBlocks.forEach((block) => {
                const currentMemory = currentLayoutMemory.byBlockId[block.id];
                const sourceSlot = currentMemory?.slot ?? block.slot;
                block.slot = mapSlotByIndex(sourceSlot, oldSlots, newSlots);
                block.order = currentMemory?.order ?? block.order;
              });
            }
          }

          normalizeBlocksBySlotOrder(group.blocks, newSlots, {
            keepUnknownSlots: isNavbarSemanticSwitch,
          });
          group.layoutSlotMemories[layout.id] = createLayoutSlotMemory(group.blocks, newSlots);
        }

        group.layout = { ...layout };
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
      clearBlockStyleHistoryWindows();
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

          const normalizedSections = normalizeIncomingSections(sections);

          set((state) => {
            state.sections = normalizedSections;
            state.globalStyle = data.globalStyle || DEFAULT_GLOBAL_STYLE;
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

    // ─── Reset ────────────────────────────────────────────────────

    loadSections: (sections: Section[], globalStyle?: GlobalStyle) => {
      clearBlockStyleHistoryWindows();
      set((state) => {
        state.sections = normalizeIncomingSections(sections);
        if (globalStyle) state.globalStyle = globalStyle;
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
