import { Input } from "~/components/ui/input";

interface TimeControlProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

export function TimeControl({ label, value, onChange }: TimeControlProps) {
	return (
		<div className="space-y-1.5">
			<label className="text-xs font-medium text-muted-foreground">{label}</label>
			<Input
				type="time"
				step={60}
				value={value || ""}
				onChange={(event) => onChange(event.target.value)}
				className="h-9 rounded-xl border-border bg-input/50 text-sm"
			/>
		</div>
	);
}
