import type { EditableField } from "~/types/editor";
import { ShortTextControl } from "./ShortTextControl";
import { LongTextControl } from "./LongTextControl";
import { UrlControl } from "./UrlControl";

interface RepeaterControlProps {
  label: string;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
  subFields: EditableField[];
}

export function RepeaterControl({
  label,
  value,
  onChange,
  subFields,
}: RepeaterControlProps) {
  const items = value || [];

  const updateItem = (index: number, key: string, val: unknown) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const addItem = () => {
    const newItem: Record<string, unknown> = {};
    subFields.forEach((f) => {
      newItem[f.key] = f.defaultValue ?? "";
    });
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Item {i + 1}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => moveItem(i, i - 1)}
                  disabled={i === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    arrow_upward
                  </span>
                </button>
                <button
                  onClick={() => moveItem(i, i + 1)}
                  disabled={i === items.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    arrow_downward
                  </span>
                </button>
                <button
                  onClick={() => removeItem(i)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    delete
                  </span>
                </button>
              </div>
            </div>
            {subFields.map((field) => {
              const fieldValue = item[field.key] as string;
              if (field.type === "short-text") {
                return (
                  <ShortTextControl
                    key={field.key}
                    label={field.label}
                    value={fieldValue}
                    onChange={(v) => updateItem(i, field.key, v)}
                  />
                );
              }
              if (field.type === "long-text") {
                return (
                  <LongTextControl
                    key={field.key}
                    label={field.label}
                    value={fieldValue}
                    onChange={(v) => updateItem(i, field.key, v)}
                  />
                );
              }
              if (field.type === "url") {
                return (
                  <UrlControl
                    key={field.key}
                    label={field.label}
                    value={fieldValue}
                    onChange={(v) => updateItem(i, field.key, v)}
                  />
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>
      <button
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 bg-muted/20 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          add
        </span>
        Add Item
      </button>
    </div>
  );
}
