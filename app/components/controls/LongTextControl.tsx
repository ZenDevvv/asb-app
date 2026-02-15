interface LongTextControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function LongTextControl({ label, value, onChange }: LongTextControlProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
