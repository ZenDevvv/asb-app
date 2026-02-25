import { FieldRenderer } from "~/components/controls/FieldRenderer";
import { resolveFontOption } from "~/editor/fontFamilyOptions";
import { cn } from "~/lib/utils";
import type { Block, BlockStyle, EditableStyleField } from "~/types/editor";
import {
	CUSTOM_DIVIDER_WIDTH_MAX,
	CUSTOM_DIVIDER_WIDTH_MIN,
	CUSTOM_TEXT_SIZE_MAX,
	CUSTOM_TEXT_SIZE_MIN,
} from "./constants";
import { CollapsiblePanel } from "./CollapsiblePanel";
import {
	clampCustomDividerWidth,
	clampCustomTextSize,
	getCustomDividerWidthValue,
	getCustomTextSizeValue,
} from "./utils";

interface StylePanelProps {
	block: Block;
	editableStyles: EditableStyleField[];
	defaultStyle: BlockStyle;
	globalFontFamily: string;
	onStyleChange: (style: Partial<BlockStyle>) => void;
	onOpenFontModal: () => void;
}

interface CustomValueControlProps {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (value: number) => void;
}

function CustomValueControl({ label, value, min, max, onChange }: CustomValueControlProps) {
	return (
		<div className="space-y-2 rounded-lg border border-border bg-input/40 p-2">
			<div className="flex items-center justify-between">
				<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
					{label}
				</span>
				<span className="text-[10px] text-muted-foreground">{value}px</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={1}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="w-full accent-primary"
			/>
			<div className="flex items-center gap-2">
				<input
					type="number"
					min={min}
					max={max}
					step={1}
					value={value}
					onChange={(event) => {
						const nextValue = Number(event.target.value);
						if (!Number.isFinite(nextValue)) return;
						onChange(nextValue);
					}}
					className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
				/>
				<span className="text-[10px] font-medium text-muted-foreground">px</span>
			</div>
		</div>
	);
}

export function StylePanel({
	block,
	editableStyles,
	defaultStyle,
	globalFontFamily,
	onStyleChange,
	onOpenFontModal,
}: StylePanelProps) {
	if (editableStyles.length === 0) {
		return null;
	}

	const supportsFontOverride =
		block.type === "heading" ||
		block.type === "text" ||
		block.type === "button" ||
		block.type === "image" ||
		block.type === "date";
	const effectiveFontValue = block.style.fontFamily || globalFontFamily;
	const selectedFont = resolveFontOption(effectiveFontValue);
	const hasBlockFontOverride =
		typeof block.style.fontFamily === "string" &&
		block.style.fontFamily.trim().length > 0 &&
		block.style.fontFamily !== globalFontFamily;
	const supportsCustomTextSize = block.type === "heading" || block.type === "text" || block.type === "image";
	const supportsCustomDividerWidth = block.type === "divider";
	const customTextSizeValue = getCustomTextSizeValue(block);
	const customDividerWidthValue = getCustomDividerWidthValue(block);

	return (
		<CollapsiblePanel title="Style" defaultOpen>
			<div className="space-y-3">
				{supportsFontOverride && (
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							Font Family
						</label>
						<button
							type="button"
							onClick={onOpenFontModal}
							className="group flex w-full items-center justify-between rounded-xl border border-border bg-input/50 px-3 py-2 text-left transition-colors hover:border-primary/40">
							<div>
								<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
									{hasBlockFontOverride ? "Block Override" : "Using Global"}
								</p>
								<p
									className="text-sm text-foreground"
									style={{ fontFamily: selectedFont.fontFamily }}>
									{selectedFont.label}
								</p>
							</div>
							<span
								className="material-symbols-outlined text-muted-foreground transition-colors group-hover:text-foreground"
								style={{ fontSize: 18 }}>
								tune
							</span>
						</button>
					</div>
				)}

				{editableStyles.map((styleField) => {
					const value = block.style[styleField.key] ?? defaultStyle[styleField.key];

					if (styleField.type === "size-picker" || styleField.type === "align-picker") {
						const isCustomTextSizeField =
							supportsCustomTextSize && styleField.key === "fontSize";
						const isCustomDividerWidthField =
							supportsCustomDividerWidth && styleField.key === "width";
						const isCustomTextSizeSelected =
							isCustomTextSizeField && value === "custom";
						const isCustomDividerWidthSelected =
							isCustomDividerWidthField && value === "custom";
						const options = styleField.options ?? [];

						return (
							<div key={styleField.key} className="space-y-1.5">
								<label className="text-xs font-medium text-muted-foreground">
									{styleField.label}
								</label>
								<div className="flex gap-1">
									{options.map((option) => {
										const isCustomTextSizeOption =
											isCustomTextSizeField && option.value === "custom";
										const isCustomDividerWidthOption =
											isCustomDividerWidthField && option.value === "custom";
										const customOptionLabel = isCustomTextSizeOption
											? "Custom Size"
											: isCustomDividerWidthOption
												? "Custom Width"
												: undefined;

										return (
											<button
												key={option.value}
												onClick={() => {
													if (isCustomTextSizeOption) {
														onStyleChange({
															fontSize: "custom",
															fontSizePx: customTextSizeValue,
														});
														return;
													}

													if (isCustomDividerWidthOption) {
														onStyleChange({
															width: "custom",
															widthPx: customDividerWidthValue,
														});
														return;
													}

													onStyleChange({
														[styleField.key]: option.value,
													} as Partial<BlockStyle>);
												}}
												title={customOptionLabel}
												aria-label={customOptionLabel}
												className={cn(
													"flex-1 rounded-lg border py-1.5 text-[10px] font-medium transition-colors",
													value === option.value
														? "border-primary bg-primary/10 text-primary"
														: "border-border text-muted-foreground hover:border-primary/30",
												)}>
												{styleField.type === "align-picker" ? (
													<span
														className="material-symbols-outlined"
														style={{ fontSize: 14 }}>
														{option.value === "left"
															? "format_align_left"
															: option.value === "center"
																? "format_align_center"
																: "format_align_right"}
													</span>
												) : isCustomTextSizeOption ||
												  isCustomDividerWidthOption ? (
													<span
														className="material-symbols-outlined"
														style={{ fontSize: 14 }}>
														tune
													</span>
												) : (
													option.label
												)}
											</button>
										);
									})}
								</div>

								{isCustomTextSizeSelected && (
									<CustomValueControl
										label="Custom Size"
										value={customTextSizeValue}
										min={CUSTOM_TEXT_SIZE_MIN}
										max={CUSTOM_TEXT_SIZE_MAX}
										onChange={(nextValue) =>
											onStyleChange({
												fontSize: "custom",
												fontSizePx: clampCustomTextSize(nextValue),
											})
										}
									/>
								)}

								{isCustomDividerWidthSelected && (
									<CustomValueControl
										label="Custom Width"
										value={customDividerWidthValue}
										min={CUSTOM_DIVIDER_WIDTH_MIN}
										max={CUSTOM_DIVIDER_WIDTH_MAX}
										onChange={(nextValue) =>
											onStyleChange({
												width: "custom",
												widthPx: clampCustomDividerWidth(nextValue),
											})
										}
									/>
								)}
							</div>
						);
					}

					if (styleField.type === "color") {
						const colorValue = typeof value === "string" ? value : "";

						return (
							<div key={styleField.key}>
								<FieldRenderer
									field={{
										key: styleField.key,
										label: styleField.label,
										type: "color",
									}}
									value={colorValue}
									onChange={(nextValue) =>
										onStyleChange({
											[styleField.key]: nextValue,
										} as Partial<BlockStyle>)
									}
								/>
							</div>
						);
					}

					if (styleField.type === "slider") {
						const sliderValue =
							typeof value === "number" ? value : (styleField.min ?? 0);

						return (
							<div key={styleField.key} className="space-y-1.5">
								<div className="flex items-center justify-between">
									<label className="text-xs font-medium text-muted-foreground">
										{styleField.label}
									</label>
									<span className="text-[10px] text-muted-foreground">
										{sliderValue}
									</span>
								</div>
								<input
									type="range"
									min={styleField.min ?? 0}
									max={styleField.max ?? 100}
									step={styleField.step ?? 1}
									value={sliderValue}
									onChange={(event) =>
										onStyleChange({
											[styleField.key]: Number(event.target.value),
										} as Partial<BlockStyle>)
									}
									className="w-full accent-primary"
								/>
							</div>
						);
					}

					return null;
				})}
			</div>
		</CollapsiblePanel>
	);
}
