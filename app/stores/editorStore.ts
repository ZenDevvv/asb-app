import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import type {
  Section,
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
  selectedId: null,
  globalStyle: DEFAULT_GLOBAL_STYLE,
  history: [],
  future: [],
  isDirty: false,
  device: "desktop",
  zoom: 100,
  lastSaved: null,
};

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    ...initialState,

    // ─── Section CRUD ─────────────────────────────────────────────

    addSection: (type: SectionType, variant?: string, index?: number) => {
      const registry = SECTION_REGISTRY[type];
      if (!registry) return;

      const newSection: Section = {
        id: nanoid(10),
        type,
        variant: variant || registry.variants[0]?.id || "default",
        props: { ...registry.defaultProps },
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
        state.selectedId = newSection.id;
        state.isDirty = true;
      });
    },

    removeSection: (id: string) => {
      set((state) => {
        state.history.push(JSON.parse(JSON.stringify(state.sections)));
        state.future = [];
        state.sections = state.sections.filter((s) => s.id !== id);
        if (state.selectedId === id) {
          state.selectedId = null;
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
        const clone: Section = {
          ...JSON.parse(JSON.stringify(original)),
          id: nanoid(10),
        };
        state.sections.splice(idx + 1, 0, clone);
        state.selectedId = clone.id;
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

    // ─── Selection ────────────────────────────────────────────────

    selectSection: (id: string | null) => {
      set((state) => {
        state.selectedId = id;
      });
    },

    // ─── Section Updates ──────────────────────────────────────────

    updateSectionProp: (id: string, key: string, value: unknown) => {
      set((state) => {
        const section = state.sections.find((s) => s.id === id);
        if (section) {
          section.props[key] = value;
          state.isDirty = true;
        }
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

    updateSectionVariant: (id: string, variant: string) => {
      set((state) => {
        const section = state.sections.find((s) => s.id === id);
        if (section) {
          state.history.push(JSON.parse(JSON.stringify(state.sections)));
          state.future = [];
          section.variant = variant;
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
          set((state) => {
            state.sections = data.sections || [];
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
        state.selectedId = null;
        state.isDirty = false;
      });
    },
  })),
);
