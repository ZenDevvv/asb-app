import type { ComponentType } from "react";

// ─── Section Types ──────────────────────────────────────────────────────────

export type SectionType =
  | "navbar"
  | "hero"
  | "features"
  | "cta"
  | "testimonials"
  | "faq"
  | "footer";

// ─── Section Style ──────────────────────────────────────────────────────────

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

// ─── Section Data ───────────────────────────────────────────────────────────

export interface Section {
  id: string;
  type: SectionType;
  variant: string;
  props: Record<string, unknown>;
  style: SectionStyle;
  isVisible: boolean;
}

// ─── Global Style ───────────────────────────────────────────────────────────

export interface GlobalStyle {
  fontFamily: string;
  primaryColor: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
}

// ─── Section Component Props ────────────────────────────────────────────────

export interface SectionComponentProps {
  section: Section;
  isEditing: boolean;
  onUpdateProp: (key: string, value: unknown) => void;
}

// ─── Editable Field ─────────────────────────────────────────────────────────

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
  | "select";

export interface EditableField {
  key: string;
  label: string;
  type: ControlType;
  options?: { label: string; value: string }[];
  subFields?: EditableField[];
  defaultValue?: unknown;
}

// ─── Variant Definition ─────────────────────────────────────────────────────

export interface VariantDef {
  id: string;
  label: string;
  thumbnail?: string;
}

// ─── Section Registry Entry ─────────────────────────────────────────────────

export interface SectionRegistryEntry {
  component: ComponentType<SectionComponentProps>;
  label: string;
  icon: string;
  description: string;
  variants: VariantDef[];
  defaultProps: Record<string, unknown>;
  defaultStyle: SectionStyle;
  editableProps: EditableField[];
  editableStyles: EditableField[];
}

// ─── Editor Store ───────────────────────────────────────────────────────────

export type DeviceMode = "desktop" | "mobile";

export interface EditorState {
  sections: Section[];
  selectedId: string | null;
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
  addSection: (type: SectionType, variant?: string, index?: number) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionVisibility: (id: string) => void;

  // Selection
  selectSection: (id: string | null) => void;

  // Section updates
  updateSectionProp: (id: string, key: string, value: unknown) => void;
  updateSectionStyle: (id: string, style: Partial<SectionStyle>) => void;
  updateSectionVariant: (id: string, variant: string) => void;

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
