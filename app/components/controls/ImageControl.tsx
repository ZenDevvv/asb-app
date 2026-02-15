interface ImageControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ImageControl({ label, value, onChange }: ImageControlProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uploaded"
            className="h-24 w-full rounded-xl border border-border object-cover"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              close
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Paste image URL..."
            className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30">
            <span className="material-symbols-outlined text-muted-foreground" style={{ fontSize: 24 }}>
              add_photo_alternate
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
