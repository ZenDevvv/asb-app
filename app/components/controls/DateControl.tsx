import { Input } from "~/components/ui/input";

interface DateControlProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

export function DateControl({ label, value, onChange }: DateControlProps) {
	return (
		<div className="space-y-1.5">
			<label className="text-xs font-medium text-muted-foreground">{label}</label>
			<Input
				type="date"
				value={value || ""}
				onChange={(event) => onChange(event.target.value)}
				className="h-9 rounded-xl border-border bg-input/50 text-sm"
			/>
		</div>
	);
}
