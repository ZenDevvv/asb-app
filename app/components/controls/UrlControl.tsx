import { Input } from "~/components/ui/input";

interface UrlControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function UrlControl({ label, value, onChange }: UrlControlProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <span
          className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          style={{ fontSize: 16 }}
        >
          link
        </span>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://"
          className="h-9 rounded-xl bg-input/50 pl-8 text-sm border-border"
        />
      </div>
    </div>
  );
}
