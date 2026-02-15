import { Slider } from "~/components/ui/slider";

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SliderControl({
  label,
  value,
  onChange,
  min = 20,
  max = 160,
  step = 4,
}: SliderControlProps) {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Slider
        value={[value ?? 80]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Small</span>
        <span>Large</span>
      </div>
    </div>
  );
}
