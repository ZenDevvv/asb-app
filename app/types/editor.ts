import type { ComponentType } from "react";

export type BlockType =
  | "heading"
  | "text"
  | "button"
  | "card"
  | "image"
  | "icon"
  | "spacer"
  | "badge"
  | "divider"
  | "list"
  | "quote";

export interface BlockStyle {
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  marginTop?: number;
  marginBottom?: number;
  width?: "auto" | "sm" | "md" | "lg" | "full";
  height?: number;
  opacity?: number;
  positionMode?: "flow" | "absolute";
  positionX?: number;
  positionY?: number;
  zIndex?: number;
  scale?: number;
}

export interface Block {
  id: string;
  type: BlockType;
  slot: string;
  order: number;
  props: Record<string, unknown>;
  style: BlockStyle;
}

export interface LayoutTemplate {
  id: string;
  label: string;
  columns: 1 | 2 | 3;
  distribution: string;
  alignment: "top" | "center" | "bottom";
  direction: "row" | "row-reverse";
  slots: string[];
}

export type SectionType =
  | "navbar"
  | "hero"
  | "features"
  | "cta"
  | "testimonials"
  | "faq"
  | "footer";

export interface SectionStyle {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  backgroundImage?: string;
  backgroundType?: "solid" | "gradient" | "image";
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  paddingY?: number;
}

export interface GroupStyle {
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: "content" | "wide" | "full";
  verticalAlign?: "top" | "center" | "bottom";
}

export interface LayoutSlotMemoryEntry {
  slot: string;
  order: number;
}

export interface LayoutSlotMemory {
  sourceSlots: string[];
  byBlockId: Record<string, LayoutSlotMemoryEntry>;
}

export interface Group {
  id: string;
  label: string;
  order: number;
  layout: LayoutTemplate;
  blocks: Block[];
  style?: GroupStyle;
  layoutSlotMemory?: LayoutSlotMemory;
  layoutSlotMemories?: Record<string, LayoutSlotMemory>;
}

export interface Section {
  id: string;
  type: SectionType;
  groups: Group[];
  style: SectionStyle;
  isVisible: boolean;
  // Legacy fields for one-way migration from old editor data.
  layout?: LayoutTemplate;
  blocks?: Block[];
  layoutSlotMemory?: LayoutSlotMemory;
  layoutSlotMemories?: Record<string, LayoutSlotMemory>;
}

export interface GlobalStyle {
  fontFamily: string;
  primaryColor: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  themeMode: "dark" | "light";
}

export interface BlockComponentProps {
  block: Block;
  sectionStyle: SectionStyle;
  globalStyle: GlobalStyle;
  isEditing: boolean;
  isSelected: boolean;
  onUpdateProp: (key: string, value: unknown) => void;
}

export type ControlType =
  | "short-text"
  | "long-text"
  | "url"
  | "image"
  | "color"
  | "slider"
  | "background"
  | "repeater"
  | "icon-picker"
  | "toggle"
  | "select"
  | "size-picker"
  | "align-picker";

export interface EditableField {
  key: string;
  label: string;
  type: ControlType;
  options?: { label: string; value: string }[];
  subFields?: EditableField[];
  defaultValue?: unknown;
}

export interface EditableStyleField {
  key: keyof BlockStyle;
  label: string;
  type: ControlType;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface BlockRegistryEntry {
  component: ComponentType<BlockComponentProps>;
  label: string;
  icon: string;
  defaultProps: Record<string, unknown>;
  defaultStyle: BlockStyle;
  editableProps: EditableField[];
  editableStyles: EditableStyleField[];
  inlineEditable: boolean;
}

export interface SectionGroupSeed {
  label: string;
  layoutId: string;
  blocks: Omit<Block, "id">[];
  style?: GroupStyle;
}

export interface SectionRegistryEntry {
  label: string;
  icon: string;
  description: string;
  allowedLayouts: string[];
  defaultLayoutId: string;
  defaultBlocks: Omit<Block, "id">[];
  defaultGroups?: SectionGroupSeed[];
  defaultStyle: SectionStyle;
  allowedBlockTypes: BlockType[];
  maxBlocksPerSlot?: number;
}

export type DeviceMode = "desktop" | "mobile";

export interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  selectedGroupId: string | null;
  selectedBlockId: string | null;
  globalStyle: GlobalStyle;
  history: Section[][];
  future: Section[][];
  isDirty: boolean;
  device: DeviceMode;
  zoom: number;
  lastSaved: string | null;
}

export interface EditorActions {
  // Section CRUD
  addSection: (type: SectionType, index?: number) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionVisibility: (id: string) => void;

  // Group CRUD
  addGroup: (sectionId: string, layoutId?: string, index?: number) => void;
  removeGroup: (sectionId: string, groupId: string) => void;
  duplicateGroup: (sectionId: string, groupId: string) => void;
  reorderGroups: (sectionId: string, activeGroupId: string, overGroupId: string) => void;
  renameGroup: (sectionId: string, groupId: string, label: string) => void;

  // Selection
  selectSection: (id: string | null) => void;
  selectGroup: (sectionId: string | null, groupId: string | null) => void;
  selectBlock: (
    sectionId: string | null,
    groupId: string | null,
    blockId: string | null,
  ) => void;

  // Section/Group updates
  updateGroupLayout: (sectionId: string, groupId: string, layoutId: string) => void;
  updateSectionStyle: (id: string, style: Partial<SectionStyle>) => void;
  updateGroupStyle: (sectionId: string, groupId: string, style: Partial<GroupStyle>) => void;

  // Block CRUD
  addBlock: (
    sectionId: string,
    groupId: string,
    blockType: BlockType,
    slot?: string,
    options?: { addAsAbsolute?: boolean },
  ) => void;
  removeBlock: (sectionId: string, groupId: string, blockId: string) => void;
  reorderBlocks: (sectionId: string, groupId: string, fromIndex: number, toIndex: number) => void;
  updateBlockProp: (
    sectionId: string,
    groupId: string,
    blockId: string,
    key: string,
    value: unknown,
  ) => void;
  updateBlockStyle: (
    sectionId: string,
    groupId: string,
    blockId: string,
    style: Partial<BlockStyle>,
  ) => void;

  // Global style
  updateGlobalStyle: (style: Partial<GlobalStyle>) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Viewport
  setDevice: (device: DeviceMode) => void;
  setZoom: (zoom: number) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  setLastSaved: (timestamp: string) => void;

  // Reset
  loadSections: (sections: Section[], globalStyle?: GlobalStyle) => void;
}
