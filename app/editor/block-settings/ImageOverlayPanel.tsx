import { cn } from "~/lib/utils";
import type { BlockStyle } from "~/types/editor";
import { CollapsiblePanel } from "./CollapsiblePanel";

const OVERLAY_EFFECTS = [
	{ id: "none" as const, icon: "do_not_disturb_on", label: "None" },
	{ id: "dots" as const, icon: "scatter_plot", label: "Dots" },
	{ id: "grid" as const, icon: "grid_4x4", label: "Grid" },
	{ id: "dim" as const, icon: "brightness_low", label: "Dim" },
	{ id: "vignette" as const, icon: "vignette", label: "Vignette" },
];

interface ImageOverlayPanelProps {
	blockStyle: BlockStyle;
	onStyleChange: (style: Partial<BlockStyle>) => void;
}

export function ImageOverlayPanel({ blockStyle, onStyleChange }: ImageOverlayPanelProps) {
	const activeEffect = blockStyle.overlayEffect ?? "none";
	const intensity = blockStyle.overlayIntensity ?? 40;

	return (
		<CollapsiblePanel title="Overlay">
			<div className="space-y-3">
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground">Effect</label>
					<div className="flex gap-1.5">
						{OVERLAY_EFFECTS.map((t) => {
							const active = activeEffect === t.id;
							return (
								<button
									key={t.id}
									onClick={() => onStyleChange({ overlayEffect: t.id })}
									className={cn(
										"flex size-10 items-center justify-center rounded-xl border transition-colors",
										active
											? "border-primary bg-primary/10 text-primary"
											: "border-border bg-muted/30 text-muted-foreground hover:text-foreground",
									)}
									title={t.label}>
									<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
										{t.icon}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{activeEffect !== "none" && (
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<label className="text-xs font-medium text-muted-foreground">
								Intensity
							</label>
							<span className="text-[10px] text-muted-foreground">{intensity}%</span>
						</div>
						<input
							type="range"
							min={0}
							max={100}
							step={1}
							value={intensity}
							onChange={(e) =>
								onStyleChange({ overlayIntensity: Number(e.target.value) })
							}
							className="w-full accent-primary"
						/>
					</div>
				)}
			</div>
		</CollapsiblePanel>
	);
}
