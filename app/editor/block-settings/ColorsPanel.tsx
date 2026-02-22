import { ColorControl } from "~/components/controls/ColorControl";
import { cn } from "~/lib/utils";
import type { Block, BlockStyle, GlobalStyle } from "~/types/editor";
import { CollapsiblePanel } from "./CollapsiblePanel";

interface ColorsPanelProps {
	block: Block;
	colorOptions?: { hasText: boolean; hasAccent: boolean };
	globalStyle: GlobalStyle;
	onStyleChange: (style: Partial<BlockStyle>) => void;
}

export function ColorsPanel({ block, colorOptions, globalStyle, onStyleChange }: ColorsPanelProps) {
	if (!colorOptions || (!colorOptions.hasText && !colorOptions.hasAccent)) {
		return null;
	}

	const colorMode = block.style.colorMode ?? "global";

	return (
		<CollapsiblePanel title="Colors" defaultOpen={false}>
			<div className="space-y-3">
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground">
						Color Source
					</label>
					<div className="grid grid-cols-2 gap-1.5">
						{(
							[
								{ value: "global", label: "Global Palette" },
								{ value: "custom", label: "Custom" },
							] as const
						).map((option) => (
							<button
								key={option.value}
								onClick={() => onStyleChange({ colorMode: option.value })}
								className={cn(
									"rounded-lg border py-2 text-[11px] font-medium transition-colors",
									colorMode === option.value
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-muted-foreground hover:border-primary/30",
								)}>
								{option.label}
							</button>
						))}
					</div>
					<p className="text-[11px] text-muted-foreground">
						{colorMode === "global"
							? "Follows Global Settings primary color and theme."
							: "This block uses custom colors."}
					</p>
				</div>

				{colorMode === "custom" && (
					<>
						{colorOptions.hasText && (
							<ColorControl
								label="Text Color"
								value={
									block.style.textColor ||
									(globalStyle.themeMode === "dark" ? "#ffffff" : "#111111")
								}
								onChange={(value) =>
									onStyleChange({
										textColor: value,
										colorMode: "custom",
									})
								}
							/>
						)}
						{colorOptions.hasAccent && (
							<ColorControl
								label="Accent Color"
								value={
									block.style.accentColor || globalStyle.primaryColor || "#00e5a0"
								}
								onChange={(value) =>
									onStyleChange({
										accentColor: value,
										colorMode: "custom",
									})
								}
							/>
						)}
					</>
				)}
			</div>
		</CollapsiblePanel>
	);
}
