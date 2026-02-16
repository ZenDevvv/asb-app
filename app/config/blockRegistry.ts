import type { BlockType, BlockRegistryEntry } from "~/types/editor";
import { HeadingBlock } from "~/blocks/HeadingBlock";
import { TextBlock } from "~/blocks/TextBlock";
import { ButtonBlock } from "~/blocks/ButtonBlock";
import { CardBlock } from "~/blocks/CardBlock";
import { ImageBlock } from "~/blocks/ImageBlock";
import { IconBlock } from "~/blocks/IconBlock";
import { SpacerBlock } from "~/blocks/SpacerBlock";
import { BadgeBlock } from "~/blocks/BadgeBlock";
import { DividerBlock } from "~/blocks/DividerBlock";
import { ListBlock } from "~/blocks/ListBlock";
import { QuoteBlock } from "~/blocks/QuoteBlock";

export const BLOCK_REGISTRY: Record<BlockType, BlockRegistryEntry> = {
  heading: {
    component: HeadingBlock,
    label: "Heading",
    icon: "title",
    defaultProps: { text: "Heading text" },
    defaultStyle: { fontSize: "4xl", fontWeight: "bold", textAlign: "left" },
    editableProps: [
      { key: "text", label: "Text", type: "short-text" },
    ],
    editableStyles: [
      {
        key: "fontSize",
        label: "Size",
        type: "size-picker",
        options: [
          { label: "S", value: "xl" },
          { label: "M", value: "2xl" },
          { label: "L", value: "3xl" },
          { label: "XL", value: "4xl" },
          { label: "2XL", value: "5xl" },
        ],
      },
      {
        key: "fontWeight",
        label: "Weight",
        type: "size-picker",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Medium", value: "medium" },
          { label: "Bold", value: "bold" },
        ],
      },
      {
        key: "textAlign",
        label: "Align",
        type: "align-picker",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "textColor", label: "Color", type: "color" },
    ],
    inlineEditable: true,
  },

  text: {
    component: TextBlock,
    label: "Text",
    icon: "notes",
    defaultProps: { text: "Body text goes here. Write something compelling for your visitors." },
    defaultStyle: { fontSize: "base", textAlign: "left" },
    editableProps: [
      { key: "text", label: "Text", type: "long-text" },
    ],
    editableStyles: [
      {
        key: "fontSize",
        label: "Size",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "base" },
          { label: "L", value: "lg" },
          { label: "XL", value: "xl" },
        ],
      },
      {
        key: "textAlign",
        label: "Align",
        type: "align-picker",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "textColor", label: "Color", type: "color" },
      { key: "opacity", label: "Opacity", type: "slider", min: 0, max: 100, step: 5 },
    ],
    inlineEditable: true,
  },

  button: {
    component: ButtonBlock,
    label: "Button",
    icon: "smart_button",
    defaultProps: { text: "Get Started", url: "#" },
    defaultStyle: { fontSize: "base", textAlign: "left" },
    editableProps: [
      { key: "text", label: "Button Text", type: "short-text" },
      { key: "url", label: "Button Link", type: "url" },
    ],
    editableStyles: [
      {
        key: "fontSize",
        label: "Size",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "base" },
          { label: "L", value: "lg" },
        ],
      },
      {
        key: "textAlign",
        label: "Align",
        type: "align-picker",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    inlineEditable: false,
  },

  card: {
    component: CardBlock,
    label: "Card",
    icon: "style",
    defaultProps: {
      title: "Feature spotlight",
      text: "Highlight a key feature, proof point, or value proposition in a compact card.",
      buttonText: "Learn More",
      buttonUrl: "#",
      imageSrc: "",
      imageAlt: "",
    },
    defaultStyle: { fontSize: "base", textAlign: "left", width: "full" },
    editableProps: [
      { key: "title", label: "Title", type: "short-text" },
      { key: "text", label: "Description", type: "long-text" },
      { key: "buttonText", label: "Button Text", type: "short-text" },
      { key: "buttonUrl", label: "Button Link", type: "url" },
      { key: "imageSrc", label: "Image (optional)", type: "image" },
      { key: "imageAlt", label: "Image Alt Text", type: "short-text" },
    ],
    editableStyles: [
      {
        key: "fontSize",
        label: "Size",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "base" },
          { label: "L", value: "lg" },
          { label: "XL", value: "xl" },
        ],
      },
      {
        key: "textAlign",
        label: "Align",
        type: "align-picker",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      {
        key: "width",
        label: "Width",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "md" },
          { label: "L", value: "lg" },
          { label: "Full", value: "full" },
        ],
      },
      { key: "textColor", label: "Color", type: "color" },
      { key: "opacity", label: "Opacity", type: "slider", min: 0, max: 100, step: 5 },
    ],
    inlineEditable: false,
  },

  image: {
    component: ImageBlock,
    label: "Image",
    icon: "image",
    defaultProps: { src: "", alt: "" },
    defaultStyle: { width: "full" },
    editableProps: [
      { key: "src", label: "Image", type: "image" },
      { key: "alt", label: "Alt Text", type: "short-text" },
    ],
    editableStyles: [
      {
        key: "width",
        label: "Width",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "md" },
          { label: "L", value: "lg" },
          { label: "Full", value: "full" },
        ],
      },
      { key: "opacity", label: "Opacity", type: "slider", min: 0, max: 100, step: 5 },
    ],
    inlineEditable: false,
  },

  icon: {
    component: IconBlock,
    label: "Icon",
    icon: "emoji_symbols",
    defaultProps: { icon: "star", label: "" },
    defaultStyle: { fontSize: "xl", textAlign: "left" },
    editableProps: [
      { key: "icon", label: "Icon Name", type: "short-text" },
      { key: "label", label: "Label", type: "short-text" },
    ],
    editableStyles: [
      {
        key: "fontSize",
        label: "Size",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "base" },
          { label: "L", value: "xl" },
          { label: "XL", value: "2xl" },
        ],
      },
      { key: "textColor", label: "Color", type: "color" },
      {
        key: "textAlign",
        label: "Align",
        type: "align-picker",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    inlineEditable: false,
  },

  spacer: {
    component: SpacerBlock,
    label: "Spacer",
    icon: "height",
    defaultProps: {},
    defaultStyle: { height: 32 },
    editableProps: [],
    editableStyles: [
      { key: "height", label: "Height", type: "slider", min: 8, max: 128, step: 4 },
    ],
    inlineEditable: false,
  },

  badge: {
    component: BadgeBlock,
    label: "Badge",
    icon: "label",
    defaultProps: { text: "NEW" },
    defaultStyle: { fontSize: "base", textAlign: "left" },
    editableProps: [
      { key: "text", label: "Text", type: "short-text" },
    ],
    editableStyles: [
      {
        key: "fontSize",
        label: "Size",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "base" },
          { label: "L", value: "lg" },
        ],
      },
      {
        key: "textAlign",
        label: "Align",
        type: "align-picker",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    inlineEditable: false,
  },

  divider: {
    component: DividerBlock,
    label: "Divider",
    icon: "horizontal_rule",
    defaultProps: {},
    defaultStyle: { marginTop: 16, marginBottom: 16 },
    editableProps: [],
    editableStyles: [
      { key: "marginTop", label: "Top Spacing", type: "slider", min: 0, max: 64, step: 4 },
      { key: "marginBottom", label: "Bottom Spacing", type: "slider", min: 0, max: 64, step: 4 },
    ],
    inlineEditable: false,
  },

  list: {
    component: ListBlock,
    label: "List",
    icon: "format_list_bulleted",
    defaultProps: {
      items: [
        { text: "First item" },
        { text: "Second item" },
        { text: "Third item" },
      ],
      ordered: false,
      inline: false,
    },
    defaultStyle: { fontSize: "base" },
    editableProps: [
      {
        key: "items",
        label: "Items",
        type: "repeater",
        subFields: [
          { key: "text", label: "Text", type: "short-text" },
          { key: "url", label: "Link (optional)", type: "url" },
        ],
      },
      { key: "ordered", label: "Numbered List", type: "toggle" },
      { key: "inline", label: "Inline Row", type: "toggle" },
    ],
    editableStyles: [
      {
        key: "fontSize",
        label: "Size",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "base" },
          { label: "L", value: "lg" },
        ],
      },
      {
        key: "textAlign",
        label: "Align",
        type: "align-picker",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "textColor", label: "Color", type: "color" },
    ],
    inlineEditable: false,
  },

  quote: {
    component: QuoteBlock,
    label: "Quote",
    icon: "format_quote",
    defaultProps: {
      text: "This is an inspiring quote that captures attention.",
      attribution: "Author Name",
    },
    defaultStyle: { fontSize: "lg", textAlign: "left" },
    editableProps: [
      { key: "text", label: "Quote", type: "long-text" },
      { key: "attribution", label: "Attribution", type: "short-text" },
    ],
    editableStyles: [
      {
        key: "fontSize",
        label: "Size",
        type: "size-picker",
        options: [
          { label: "S", value: "base" },
          { label: "M", value: "lg" },
          { label: "L", value: "xl" },
        ],
      },
      {
        key: "textAlign",
        label: "Align",
        type: "align-picker",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "textColor", label: "Color", type: "color" },
    ],
    inlineEditable: false,
  },
};
