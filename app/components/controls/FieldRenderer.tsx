import type { EditableField } from "~/types/editor";
import { ShortTextControl } from "./ShortTextControl";
import { LongTextControl } from "./LongTextControl";
import { UrlControl } from "./UrlControl";
import { ColorControl } from "./ColorControl";
import { ImageControl } from "./ImageControl";
import { RepeaterControl } from "./RepeaterControl";

interface FieldRendererProps {
  field: EditableField;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  switch (field.type) {
    case "short-text":
      return (
        <ShortTextControl
          label={field.label}
          value={value as string}
          onChange={onChange}
        />
      );
    case "long-text":
      return (
        <LongTextControl
          label={field.label}
          value={value as string}
          onChange={onChange}
        />
      );
    case "url":
      return (
        <UrlControl
          label={field.label}
          value={value as string}
          onChange={onChange}
        />
      );
    case "color":
      return (
        <ColorControl
          label={field.label}
          value={value as string}
          onChange={onChange}
        />
      );
    case "image":
      return (
        <ImageControl
          label={field.label}
          value={value as string}
          onChange={onChange}
        />
      );
    case "repeater":
      return (
        <RepeaterControl
          label={field.label}
          value={value as Record<string, unknown>[]}
          onChange={onChange as (value: Record<string, unknown>[]) => void}
          subFields={field.subFields || []}
        />
      );
    default:
      return null;
  }
}
