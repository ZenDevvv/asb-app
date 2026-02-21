import type { SectionStyle, GlobalStyle } from "~/types/editor";
import { ColorControl } from "./ColorControl";
import { SliderControl } from "./SliderControl";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

interface BackgroundControlProps {
	style: SectionStyle;
	onChange: (style: Partial<SectionStyle>) => void;
	globalStyle?: GlobalStyle;
}

const BG_TYPES = [
	{ id: "solid" as const, icon: "palette", label: "Solid" },
	{ id: "gradient" as const, icon: "gradient", label: "Gradient" },
	{ id: "image" as const, icon: "image", label: "Image" },
];

const EFFECT_TYPES = [
	{ id: "none" as const, icon: "do_not_disturb_on", label: "None" },
	{ id: "dots" as const, icon: "scatter_plot", label: "Dots" },
	{ id: "grid" as const, icon: "grid_4x4", label: "Grid" },
	{ id: "dim" as const, icon: "brightness_low", label: "Dim" },
	{ id: "vignette" as const, icon: "vignette", label: "Vignette" },
];

const DEFAULT_EFFECT_INTENSITY = 40;

export function BackgroundControl({ style, onChange, globalStyle }: BackgroundControlProps) {
	const bgType = style.backgroundType || "solid";
	const effectIntensity = style.backgroundEffectIntensity ?? DEFAULT_EFFECT_INTENSITY;
	const primaryColor = globalStyle?.primaryColor || "#00e5a0";
	const darkBg = globalStyle?.themeMode === "light" ? "#f5f5f5" : "#0a0f0d";

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				{BG_TYPES.map((t) => (
					<button
						key={t.id}
						onClick={() => onChange({ backgroundType: t.id })}
						className={cn(
							"flex size-10 items-center justify-center rounded-xl border transition-colors",
							bgType === t.id
								? "border-primary bg-primary/10 text-primary"
								: "border-border bg-muted/30 text-muted-foreground hover:text-foreground",
						)}
						title={t.label}>
						<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
							{t.icon}
						</span>
					</button>
				))}
			</div>

			{bgType === "solid" && (
				<ColorControl
					label="Color"
					value={style.backgroundColor || darkBg}
					onChange={(v) => onChange({ backgroundColor: v })}
				/>
			)}

			{bgType === "gradient" && (
				<div className="space-y-3">
					<ColorControl
						label="From"
						value={style.gradientFrom || primaryColor}
						onChange={(v) => onChange({ gradientFrom: v })}
					/>
					<ColorControl
						label="To"
						value={style.gradientTo || darkBg}
						onChange={(v) => onChange({ gradientTo: v })}
					/>
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							Direction
						</label>
						<Select
							value={style.gradientDirection || "to bottom"}
							onValueChange={(value) => onChange({ gradientDirection: value })}>
							<SelectTrigger className="w-full rounded-xl border-border bg-input/50 text-sm text-foreground">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="to bottom">Top → Bottom</SelectItem>
								<SelectItem value="to right">Left → Right</SelectItem>
								<SelectItem value="to bottom right">Diagonal ↘</SelectItem>
								<SelectItem value="to bottom left">Diagonal ↙</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			{bgType === "image" && (
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground">Image URL</label>
					<input
						type="text"
						placeholder="Paste image URL..."
						value={style.backgroundImage || ""}
						onChange={(e) => onChange({ backgroundImage: e.target.value })}
						className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
					/>
				</div>
			)}

			<div className="space-y-1.5">
				<label className="text-xs font-medium text-muted-foreground">Overlay Effect</label>
				<div className="flex gap-1.5">
					{EFFECT_TYPES.map((t) => {
						const active = (style.backgroundEffect ?? "none") === t.id;
						return (
							<button
								key={t.id}
								onClick={() => onChange({ backgroundEffect: t.id })}
								className={cn(
									"flex size-10 items-center justify-center rounded-xl border transition-colors",
									active
										? "border-primary bg-primary/10 text-primary"
										: "border-border bg-muted/30 text-muted-foreground hover:text-foreground",
								)}
								title={t.label}>
								<span
									className="material-symbols-outlined"
									style={{ fontSize: 18 }}>
									{t.icon}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<SliderControl
				label="Effect Intensity"
				value={effectIntensity}
				onChange={(v) => onChange({ backgroundEffectIntensity: v })}
				min={0}
				max={100}
				step={1}
			/>

			<SliderControl
				label="Padding (Y-Axis)"
				value={style.paddingY ?? 80}
				onChange={(v) => onChange({ paddingY: v })}
				min={20}
				max={160}
			/>
		</div>
	);
}
