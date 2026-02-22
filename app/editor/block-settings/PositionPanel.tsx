import { cn } from "~/lib/utils";
import type { Block, BlockStyle } from "~/types/editor";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { formatSlotLabel } from "./utils";

interface PositionPanelProps {
	block: Block;
	groupSlots: string[];
	onStyleChange: (style: Partial<BlockStyle>) => void;
	onMoveToSlot: (slot: string) => void;
}

interface PositionSliderProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	unit?: string;
	onChange: (value: number) => void;
}

function PositionSlider({
	label,
	value,
	min,
	max,
	step,
	unit = "",
	onChange,
}: PositionSliderProps) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<label className="text-xs font-medium text-muted-foreground">{label}</label>
				<span className="text-[10px] text-muted-foreground">
					{value}
					{unit}
				</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="w-full accent-primary"
			/>
		</div>
	);
}

export function PositionPanel({
	block,
	groupSlots,
	onStyleChange,
	onMoveToSlot,
}: PositionPanelProps) {
	const isAbsolute = block.style.positionMode === "absolute";
	const positionX = block.style.positionX ?? 0;
	const positionY = block.style.positionY ?? 0;
	const zIndex = block.style.zIndex ?? 20;
	const absoluteScale = block.style.scale ?? 100;

	return (
		<CollapsiblePanel title="Position" defaultOpen={false}>
			<div className="space-y-3">
				{!isAbsolute && groupSlots.length > 1 && (
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">Column</label>
						<div
							className={cn(
								"grid gap-1",
								groupSlots.length === 2 ? "grid-cols-2" : "grid-cols-3",
							)}>
							{groupSlots.map((slot) => (
								<button
									key={slot}
									onClick={() => onMoveToSlot(slot)}
									className={cn(
										"rounded-lg border py-1.5 text-[10px] font-medium transition-colors",
										block.slot === slot
											? "border-primary bg-primary/10 text-primary"
											: "border-border text-muted-foreground hover:border-primary/30",
									)}>
									{formatSlotLabel(slot)}
								</button>
							))}
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-1">
					<button
						onClick={() => onStyleChange({ positionMode: "flow" })}
						className={cn(
							"rounded-lg border py-1.5 text-[10px] font-medium transition-colors",
							!isAbsolute
								? "border-primary bg-primary/10 text-primary"
								: "border-border text-muted-foreground hover:border-primary/30",
						)}>
						Flow
					</button>
					<button
						onClick={() =>
							onStyleChange({
								positionMode: "absolute",
								positionX,
								positionY,
								zIndex,
								scale: absoluteScale,
							})
						}
						className={cn(
							"rounded-lg border py-1.5 text-[10px] font-medium transition-colors",
							isAbsolute
								? "border-primary bg-primary/10 text-primary"
								: "border-border text-muted-foreground hover:border-primary/30",
						)}>
						Absolute
					</button>
				</div>

				{isAbsolute && (
					<>
						<PositionSlider
							label="X Position"
							value={positionX}
							min={-300}
							max={1600}
							step={1}
							unit="px"
							onChange={(nextValue) => onStyleChange({ positionX: nextValue })}
						/>

						<PositionSlider
							label="Y Position"
							value={positionY}
							min={-300}
							max={1600}
							step={1}
							unit="px"
							onChange={(nextValue) => onStyleChange({ positionY: nextValue })}
						/>

						<PositionSlider
							label="Layer"
							value={zIndex}
							min={1}
							max={100}
							step={1}
							onChange={(nextValue) => onStyleChange({ zIndex: nextValue })}
						/>

						<PositionSlider
							label="Scale"
							value={absoluteScale}
							min={25}
							max={300}
							step={5}
							unit="%"
							onChange={(nextValue) => onStyleChange({ scale: nextValue })}
						/>

						<p className="text-[10px] text-muted-foreground">
							Absolute positioning is relative to the selected group.
						</p>
					</>
				)}
			</div>
		</CollapsiblePanel>
	);
}
