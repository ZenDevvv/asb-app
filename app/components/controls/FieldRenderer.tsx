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
    case "select":
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {field.label}
          </label>
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "toggle":
      return (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            {field.label}
          </label>
          <button
            onClick={() => onChange(!value)}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              value ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                value ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      );
    default:
      return null;
  }
}
