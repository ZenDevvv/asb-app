import { Input } from "~/components/ui/input";

interface ShortTextControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ShortTextControl({ label, value, onChange }: ShortTextControlProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-xl bg-input/50 text-sm border-border"
      />
    </div>
  );
}
