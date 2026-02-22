import type { BlockStyle } from "~/types/editor";
import { CollapsiblePanel } from "./CollapsiblePanel";

interface SpacingPanelProps {
	blockStyle: BlockStyle;
	onStyleChange: (style: Partial<BlockStyle>) => void;
}

interface MarginSliderProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
}

function MarginSlider({ label, value, onChange }: MarginSliderProps) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<label className="text-xs font-medium text-muted-foreground">{label}</label>
				<span className="text-[10px] text-muted-foreground">{value}</span>
			</div>
			<input
				type="range"
				min={0}
				max={64}
				step={4}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="w-full accent-primary"
			/>
		</div>
	);
}

export function SpacingPanel({ blockStyle, onStyleChange }: SpacingPanelProps) {
	return (
		<CollapsiblePanel title="Spacing" defaultOpen={false}>
			<div className="space-y-3">
				<MarginSlider
					label="Top Margin"
					value={blockStyle.marginTop ?? 0}
					onChange={(marginTop) => onStyleChange({ marginTop })}
				/>
				<MarginSlider
					label="Bottom Margin"
					value={blockStyle.marginBottom ?? 0}
					onChange={(marginBottom) => onStyleChange({ marginBottom })}
				/>
			</div>
		</CollapsiblePanel>
	);
}
