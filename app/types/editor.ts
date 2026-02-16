import type { ComponentType } from "react";

// ─── Block Types ─────────────────────────────────────────────────────────────

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

// ─── Block Style ─────────────────────────────────────────────────────────────

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
}

// ─── Block ───────────────────────────────────────────────────────────────────

export interface Block {
  id: string;
  type: BlockType;
  slot: string;
  order: number;
  props: Record<string, unknown>;
  style: BlockStyle;
}

// ─── Layout Template ─────────────────────────────────────────────────────────

export interface LayoutTemplate {
  id: string;
  label: string;
  columns: 1 | 2 | 3;
  distribution: string;
  alignment: "top" | "center" | "bottom";
  direction: "row" | "row-reverse";
  slots: string[];
}

// ─── Section Types ───────────────────────────────────────────────────────────

export type SectionType =
  | "navbar"
  | "hero"
  | "features"
  | "cta"
  | "testimonials"
  | "faq"
  | "footer";

// ─── Section Style ───────────────────────────────────────────────────────────

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

export interface LayoutSlotMemoryEntry {
  slot: string;
  order: number;
}

export interface LayoutSlotMemory {
  sourceSlots: string[];
  byBlockId: Record<string, LayoutSlotMemoryEntry>;
}

// ─── Section Data ────────────────────────────────────────────────────────────

export interface Section {
  id: string;
  type: SectionType;
  layout: LayoutTemplate;
  blocks: Block[];
  style: SectionStyle;
  isVisible: boolean;
  // Legacy single-memory field kept for backwards compatibility with
  // previously persisted editor state.
  layoutSlotMemory?: LayoutSlotMemory;
  // Per-layout slot memory used to keep block placement stable when
  // switching across different layout combinations.
  layoutSlotMemories?: Record<string, LayoutSlotMemory>;
}

// ─── Global Style ────────────────────────────────────────────────────────────

export interface GlobalStyle {
  fontFamily: string;
  primaryColor: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
}

// ─── Block Component Props ───────────────────────────────────────────────────

export interface BlockComponentProps {
  block: Block;
  sectionStyle: SectionStyle;
  globalStyle: GlobalStyle;
  isEditing: boolean;
  isSelected: boolean;
  onUpdateProp: (key: string, value: unknown) => void;
}

// ─── Control Types ───────────────────────────────────────────────────────────

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

// ─── Editable Field ──────────────────────────────────────────────────────────

export interface EditableField {
  key: string;
  label: string;
  type: ControlType;
  options?: { label: string; value: string }[];
  subFields?: EditableField[];
  defaultValue?: unknown;
}

// ─── Editable Style Field ────────────────────────────────────────────────────

export interface EditableStyleField {
  key: keyof BlockStyle;
  label: string;
  type: ControlType;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}

// ─── Block Registry Entry ────────────────────────────────────────────────────

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

// ─── Section Registry Entry ──────────────────────────────────────────────────

export interface SectionRegistryEntry {
  label: string;
  icon: string;
  description: string;
  allowedLayouts: string[];
  defaultLayoutId: string;
  defaultBlocks: Omit<Block, "id">[];
  defaultStyle: SectionStyle;
  allowedBlockTypes: BlockType[];
  maxBlocksPerSlot?: number;
}

// ─── Editor Store ────────────────────────────────────────────────────────────

export type DeviceMode = "desktop" | "mobile";

export interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
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

  // Selection (two levels)
  selectSection: (id: string | null) => void;
  selectBlock: (sectionId: string | null, blockId: string | null) => void;

  // Section updates
  updateSectionLayout: (sectionId: string, layoutId: string) => void;
  updateSectionStyle: (id: string, style: Partial<SectionStyle>) => void;

  // Block CRUD
  addBlock: (sectionId: string, blockType: BlockType, slot?: string) => void;
  removeBlock: (sectionId: string, blockId: string) => void;
  reorderBlocks: (sectionId: string, fromIndex: number, toIndex: number) => void;
  updateBlockProp: (sectionId: string, blockId: string, key: string, value: unknown) => void;
  updateBlockStyle: (sectionId: string, blockId: string, style: Partial<BlockStyle>) => void;

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
