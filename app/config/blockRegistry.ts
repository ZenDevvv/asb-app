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
import { DateBlock } from "~/blocks/DateBlock";
import { RsvpBlock } from "~/blocks/RsvpBlock";

export const BLOCK_REGISTRY: Record<BlockType, BlockRegistryEntry> = {
  heading: {
    component: HeadingBlock,
    label: "Heading",
    icon: "title",
    category: "basic",
    defaultProps: { text: "Heading text", textStyle: "default" },
    defaultStyle: {
      fontSize: "4xl",
      fontWeight: "bold",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "left",
    },
    editableProps: [
      { key: "text", label: "Text", type: "short-text" },
      {
        key: "textStyle",
        label: "Style",
        type: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Gradient", value: "gradient" },
        ],
      },
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
          { label: "Custom", value: "custom" },
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
        key: "fontStyle",
        label: "Style",
        type: "size-picker",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Italic", value: "italic" },
        ],
      },
      {
        key: "letterSpacing",
        label: "Letter Spacing",
        type: "slider",
        min: 0,
        max: 12,
        step: 0.5,
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
    inlineEditable: true,
    colorOptions: { hasText: true, hasAccent: true },
  },

  text: {
    component: TextBlock,
    label: "Text",
    icon: "notes",
    category: "basic",
    defaultProps: { text: "Body text goes here. Write something compelling for your visitors." },
    defaultStyle: { fontSize: "base", fontWeight: "normal", fontStyle: "normal", letterSpacing: 0, textAlign: "left" },
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
          { label: "Custom", value: "custom" },
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
        key: "fontStyle",
        label: "Style",
        type: "size-picker",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Italic", value: "italic" },
        ],
      },
      {
        key: "letterSpacing",
        label: "Letter Spacing",
        type: "slider",
        min: 0,
        max: 12,
        step: 0.5,
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
      { key: "opacity", label: "Opacity", type: "slider", min: 0, max: 100, step: 5 },
    ],
    inlineEditable: true,
    colorOptions: { hasText: true, hasAccent: false },
  },

  button: {
    component: ButtonBlock,
    label: "Button",
    icon: "smart_button",
    category: "basic",
    defaultProps: {
      text: "Get Started",
      url: "#",
      variant: "solid",
      iconLeft: "",
      iconRight: "",
    },
    defaultStyle: { fontSize: "base", textAlign: "left" },
    editableProps: [
      { key: "text", label: "Button Text", type: "short-text" },
      { key: "url", label: "Button Link", type: "url" },
      {
        key: "variant",
        label: "Style",
        type: "select",
        options: [
          { label: "Solid", value: "solid" },
          { label: "Outline", value: "outline" },
          { label: "Ghost", value: "ghost" },
          { label: "Link", value: "link" },
          { label: "Text", value: "text" },
        ],
      },
      { key: "iconLeft", label: "Left Icon", type: "icon-picker" },
      { key: "iconRight", label: "Right Icon", type: "icon-picker" },
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
    colorOptions: { hasText: false, hasAccent: true },
  },

  card: {
    component: CardBlock,
    label: "Card",
    icon: "style",
    category: "content",
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
      { key: "opacity", label: "Opacity", type: "slider", min: 0, max: 100, step: 5 },
    ],
    inlineEditable: false,
    colorOptions: { hasText: true, hasAccent: true },
  },

  image: {
    component: ImageBlock,
    label: "Image",
    icon: "image",
    category: "media",
    defaultProps: { src: "", alt: "", caption: "" },
    defaultStyle: {
      width: "full",
      fontSize: "xl",
      fontWeight: "bold",
      fontStyle: "normal",
      letterSpacing: 0,
      textAlign: "center",
      captionVerticalAlign: "center",
    },
    editableProps: [
      { key: "src", label: "Image", type: "image" },
      { key: "alt", label: "Alt Text", type: "short-text" },
      { key: "caption", label: "Caption Text", type: "short-text" },
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
      { key: "height", label: "Height", type: "slider", min: 0, max: 800, step: 8 },
      {
        key: "fontSize",
        label: "Text Size",
        type: "size-picker",
        options: [
          { label: "S", value: "sm" },
          { label: "M", value: "base" },
          { label: "L", value: "lg" },
          { label: "XL", value: "xl" },
          { label: "2XL", value: "2xl" },
          { label: "Custom", value: "custom" },
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
        key: "fontStyle",
        label: "Style",
        type: "size-picker",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Italic", value: "italic" },
        ],
      },
      { key: "letterSpacing", label: "Letter Spacing", type: "slider", min: 0, max: 12, step: 0.5 },
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
        key: "captionVerticalAlign",
        label: "Vertical",
        type: "size-picker",
        options: [
          { label: "Top", value: "top" },
          { label: "Mid", value: "center" },
          { label: "Bot", value: "bottom" },
        ],
      },
      { key: "captionPadding", label: "Text Padding", type: "slider", min: 0, max: 64, step: 4 },
    ],
    inlineEditable: false,
    colorOptions: { hasText: false, hasAccent: false },
  },

  icon: {
    component: IconBlock,
    label: "Icon",
    icon: "emoji_symbols",
    category: "media",
    defaultProps: { icon: "star", displayStyle: "plain", bgOpacity: "medium" },
    defaultStyle: { fontSize: "xl", textAlign: "left" },
    editableProps: [
      { key: "icon", label: "Icon", type: "icon-picker" },
      {
        key: "displayStyle",
        label: "Display",
        type: "select",
        options: [
          { label: "Plain", value: "plain" },
          { label: "Circle", value: "circle" },
          { label: "Square", value: "square" },
          { label: "Rounded", value: "rounded-square" },
        ],
      },
      {
        key: "bgOpacity",
        label: "Intensity",
        type: "select",
        options: [
          { label: "Subtle", value: "subtle" },
          { label: "Medium", value: "medium" },
          { label: "Strong", value: "strong" },
        ],
      },
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
    colorOptions: { hasText: false, hasAccent: true },
  },

  spacer: {
    component: SpacerBlock,
    label: "Spacer",
    icon: "height",
    category: "layout",
    defaultProps: {},
    defaultStyle: { height: 32 },
    editableProps: [],
    editableStyles: [
      { key: "height", label: "Height", type: "slider", min: 8, max: 128, step: 4 },
    ],
    inlineEditable: false,
    colorOptions: { hasText: false, hasAccent: false },
  },

  badge: {
    component: BadgeBlock,
    label: "Badge",
    icon: "label",
    category: "basic",
    defaultProps: { text: "NEW", variant: "subtle" },
    defaultStyle: { fontSize: "base", textAlign: "left" },
    editableProps: [
      { key: "text", label: "Text", type: "short-text" },
      {
        key: "variant",
        label: "Style",
        type: "select",
        options: [
          { label: "Subtle", value: "subtle" },
          { label: "Filled", value: "filled" },
          { label: "Outline", value: "outline" },
          { label: "Pill Dot", value: "pill-dot" },
        ],
      },
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
    colorOptions: { hasText: false, hasAccent: true },
  },

  divider: {
    component: DividerBlock,
    label: "Divider",
    icon: "horizontal_rule",
    category: "layout",
    defaultProps: {},
    defaultStyle: { width: "full", opacity: 20, marginTop: 16, marginBottom: 16 },
    editableProps: [],
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
          { label: "Custom", value: "custom" },
        ],
      },
      { key: "opacity", label: "Opacity", type: "slider", min: 0, max: 100, step: 5 },
      { key: "marginTop", label: "Top Spacing", type: "slider", min: 0, max: 64, step: 4 },
      { key: "marginBottom", label: "Bottom Spacing", type: "slider", min: 0, max: 64, step: 4 },
    ],
    inlineEditable: false,
    colorOptions: { hasText: true, hasAccent: false },
  },

  list: {
    component: ListBlock,
    label: "List",
    icon: "format_list_bulleted",
    category: "basic",
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
    ],
    inlineEditable: false,
    colorOptions: { hasText: true, hasAccent: true },
  },

  quote: {
    component: QuoteBlock,
    label: "Quote",
    icon: "format_quote",
    category: "content",
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
    ],
    inlineEditable: false,
    colorOptions: { hasText: true, hasAccent: true },
  },

  date: {
    component: DateBlock,
    label: "Date",
    icon: "calendar_month",
    category: "content",
    defaultProps: {
      eventDate: "2024-08-08",
      eventTime: "15:00",
    },
    defaultStyle: {
      widthPx: 920,
      dateSectionGap: 24,
      scale: 100,
    },
    editableProps: [
      { key: "eventDate", label: "Date", type: "date" },
      { key: "eventTime", label: "Time", type: "time" },
    ],
    editableStyles: [
      { key: "widthPx", label: "Width", type: "slider", min: 320, max: 1600, step: 10 },
      { key: "dateSectionGap", label: "Section Spacing", type: "slider", min: 0, max: 160, step: 2 },
      { key: "scale", label: "Scale", type: "slider", min: 25, max: 300, step: 5 },
    ],
    inlineEditable: false,
    colorOptions: { hasText: true, hasAccent: false },
  },

  rsvp: {
    component: RsvpBlock,
    label: "RSVP Form",
    icon: "event_available",
    category: "content",
    defaultProps: {
      nameLabel: "Full Name",
      namePlaceholder: "Guest Name",
      emailLabel: "Email Address",
      emailPlaceholder: "email@example.com",
      attendanceLabel: "Will You Be Attending?",
      acceptText: "Joyfully Accept",
      declineText: "Regretfully Decline",
      guestsLabel: "Number of Guests",
      maxGuests: "10",
      submitText: "Confirm Attendance",
      submitUrl: "#",
      bgColor: "",
      fgColor: "",
    },
    defaultStyle: {},
    editableProps: [
      { key: "nameLabel", label: "Full Name Label", type: "short-text" },
      { key: "namePlaceholder", label: "Name Placeholder", type: "short-text" },
      { key: "emailLabel", label: "Email Label", type: "short-text" },
      { key: "emailPlaceholder", label: "Email Placeholder", type: "short-text" },
      { key: "attendanceLabel", label: "Attendance Label", type: "short-text" },
      { key: "acceptText", label: "Accept Button", type: "short-text" },
      { key: "declineText", label: "Decline Button", type: "short-text" },
      { key: "guestsLabel", label: "Guests Label", type: "short-text" },
      {
        key: "maxGuests",
        label: "Max Guests",
        type: "select",
        options: [
          { label: "5", value: "5" },
          { label: "10", value: "10" },
          { label: "15", value: "15" },
          { label: "20", value: "20" },
        ],
      },
      { key: "submitText", label: "Submit Button Text", type: "short-text" },
      { key: "submitUrl", label: "Submit URL", type: "url" },
      // Two color settings — all other colors are derived from these
      { key: "bgColor", label: "Background Color", type: "color" },
      { key: "fgColor", label: "Text Color", type: "color" },
    ],
    editableStyles: [
      { key: "marginTop", label: "Top Spacing", type: "slider", min: 0, max: 64, step: 4 },
      { key: "marginBottom", label: "Bottom Spacing", type: "slider", min: 0, max: 64, step: 4 },
    ],
    inlineEditable: false,
    colorOptions: { hasText: false, hasAccent: false },
  },
};
