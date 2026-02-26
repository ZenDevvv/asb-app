import type { SectionStyle, GlobalStyle } from "~/types/editor";
import { resolveSectionColorScheme } from "~/lib/colorSystem";
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
	sectionIndex?: number;
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
	{ id: "overlay" as const, icon: "format_color_fill", label: "Overlay" },
	{ id: "vignette" as const, icon: "vignette", label: "Vignette" },
];

const DEFAULT_EFFECT_INTENSITY = 40;

export function BackgroundControl({
	style,
	onChange,
	globalStyle,
	sectionIndex = 0,
}: BackgroundControlProps) {
	const bgType = style.backgroundType || "solid";
	const colorMode = style.colorMode ?? "global";
	const effectIntensity = style.backgroundEffectIntensity ?? DEFAULT_EFFECT_INTENSITY;
	const activeEffect =
		(style.backgroundEffect ?? "none") === "dim"
			? "overlay"
			: (style.backgroundEffect ?? "none");
	const overlayColor = style.backgroundEffectColor || "#000000";
	const scheme = resolveSectionColorScheme({
		primaryColor: globalStyle?.primaryColor || "#00e5a0",
		themeMode: globalStyle?.themeMode ?? "dark",
		colorScheme: globalStyle?.colorScheme ?? "monochromatic",
		sectionIndex,
	});

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

			{bgType !== "image" && (
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground">
						Color Source
					</label>
					<div className="grid grid-cols-2 gap-1.5">
						{(
							[
								{ value: "global" as const, label: "Global Palette" },
								{ value: "custom" as const, label: "Custom" },
							] as const
						).map((option) => (
							<button
								key={option.value}
								onClick={() => onChange({ colorMode: option.value })}
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
							? "Follows Global Settings color scheme."
							: "Uses your exact selected color."}
					</p>
				</div>
			)}

			{bgType === "solid" && colorMode === "custom" && (
				<ColorControl
					label="Color"
					value={style.backgroundColor || scheme.backgroundColor}
					onChange={(v) => onChange({ backgroundColor: v })}
				/>
			)}

			{bgType === "gradient" && colorMode === "custom" && (
				<div className="space-y-3">
					<ColorControl
						label="From"
						value={style.gradientFrom || scheme.gradientFrom}
						onChange={(v) => onChange({ gradientFrom: v })}
					/>
					<ColorControl
						label="To"
						value={style.gradientTo || scheme.gradientTo}
						onChange={(v) => onChange({ gradientTo: v })}
					/>
				</div>
			)}

			{bgType === "gradient" && (
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground">Direction</label>
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
						const active = activeEffect === t.id;
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

			{activeEffect === "overlay" && (
				<ColorControl
					label="Overlay Color"
					value={overlayColor}
					onChange={(v) => onChange({ backgroundEffectColor: v })}
				/>
			)}

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
