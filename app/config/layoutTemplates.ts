import type { LayoutTemplate } from "~/types/editor";

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // 1 Column
  {
    id: "1col",
    label: "Centered",
    spans: [6],
    alignment: "center",
    reversed: false,
    slots: ["main"],
  },
  {
    id: "1col-left",
    label: "Left Aligned",
    spans: [6],
    alignment: "top",
    reversed: false,
    slots: ["main"],
  },

  // 2 Columns
  {
    id: "2col-1-5",
    label: "Sidebar Left",
    spans: [1, 5],
    alignment: "center",
    reversed: false,
    slots: ["col-1", "col-2"],
  },
  {
    id: "2col-2-4",
    label: "Wide Right",
    spans: [2, 4],
    alignment: "center",
    reversed: false,
    slots: ["col-1", "col-2"],
  },
  {
    id: "2col-3-3",
    label: "Split",
    spans: [3, 3],
    alignment: "center",
    reversed: false,
    slots: ["col-1", "col-2"],
  },
  {
    id: "2col-4-2",
    label: "Wide Left",
    spans: [4, 2],
    alignment: "center",
    reversed: false,
    slots: ["col-1", "col-2"],
  },
  {
    id: "2col-5-1",
    label: "Sidebar Right",
    spans: [5, 1],
    alignment: "center",
    reversed: false,
    slots: ["col-1", "col-2"],
  },

  // 3 Columns
  {
    id: "3col-1-1-4",
    label: "Wide Right",
    spans: [1, 1, 4],
    alignment: "top",
    reversed: false,
    slots: ["col-1", "col-2", "col-3"],
  },
  {
    id: "3col-1-2-3",
    label: "Ascending",
    spans: [1, 2, 3],
    alignment: "top",
    reversed: false,
    slots: ["col-1", "col-2", "col-3"],
  },
  {
    id: "3col-1-4-1",
    label: "Feature Center",
    spans: [1, 4, 1],
    alignment: "top",
    reversed: false,
    slots: ["col-1", "col-2", "col-3"],
  },
  {
    id: "3col-2-2-2",
    label: "Equal",
    spans: [2, 2, 2],
    alignment: "top",
    reversed: false,
    slots: ["col-1", "col-2", "col-3"],
  },
  {
    id: "3col-3-2-1",
    label: "Descending",
    spans: [3, 2, 1],
    alignment: "top",
    reversed: false,
    slots: ["col-1", "col-2", "col-3"],
  },
  {
    id: "3col-4-1-1",
    label: "Wide Left",
    spans: [4, 1, 1],
    alignment: "top",
    reversed: false,
    slots: ["col-1", "col-2", "col-3"],
  },
];

export function getLayoutById(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((l) => l.id === id);
}

export function getLayoutsByIds(ids: string[]): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter((l) => ids.includes(l.id));
}

