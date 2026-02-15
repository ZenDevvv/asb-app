import type { LayoutTemplate } from "~/types/editor";

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // Single column
  {
    id: "1-col-center",
    label: "Centered",
    columns: 1,
    distribution: "100",
    alignment: "center",
    direction: "row",
    slots: ["main"],
  },
  {
    id: "1-col-left",
    label: "Left Aligned",
    columns: 1,
    distribution: "100",
    alignment: "top",
    direction: "row",
    slots: ["main"],
  },

  // Two columns
  {
    id: "2-col-50-50",
    label: "Split 50/50",
    columns: 2,
    distribution: "50-50",
    alignment: "center",
    direction: "row",
    slots: ["left", "right"],
  },
  {
    id: "2-col-60-40",
    label: "Content + Side",
    columns: 2,
    distribution: "60-40",
    alignment: "center",
    direction: "row",
    slots: ["left", "right"],
  },
  {
    id: "2-col-40-60",
    label: "Side + Content",
    columns: 2,
    distribution: "40-60",
    alignment: "center",
    direction: "row",
    slots: ["left", "right"],
  },
  {
    id: "2-col-50-50-reverse",
    label: "Split Reverse",
    columns: 2,
    distribution: "50-50",
    alignment: "center",
    direction: "row-reverse",
    slots: ["left", "right"],
  },

  // Three columns
  {
    id: "3-col-equal",
    label: "3 Columns",
    columns: 3,
    distribution: "33-33-33",
    alignment: "top",
    direction: "row",
    slots: ["col-1", "col-2", "col-3"],
  },
];

export function getLayoutById(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((l) => l.id === id);
}

export function getLayoutsByIds(ids: string[]): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter((l) => ids.includes(l.id));
}
