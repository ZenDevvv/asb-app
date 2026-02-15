import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorControl({ label, value, onChange }: ColorControlProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex h-9 w-full items-center gap-2 rounded-xl border border-border bg-input/50 px-3 text-sm">
            <div
              className="size-5 shrink-0 rounded-md border border-white/20"
              style={{ backgroundColor: value || "#000000" }}
            />
            <span className="text-muted-foreground">{value || "#000000"}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" side="left" align="start">
          <HexColorPicker color={value || "#000000"} onChange={onChange} />
          <input
            className="mt-2 w-full rounded-lg border border-border bg-input/50 px-2 py-1 text-center text-xs"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
