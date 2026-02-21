import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { FieldRenderer } from "~/components/controls/FieldRenderer";
import { ColorControl } from "~/components/controls/ColorControl";
import { cn } from "~/lib/utils";
import type { Block, BlockStyle, EditableField } from "~/types/editor";

// Group consecutive icon-picker fields into pairs so they render side-by-side
function groupEditableFields(
  fields: EditableField[],
): (EditableField | [EditableField, EditableField])[] {
  const result: (EditableField | [EditableField, EditableField])[] = [];
  let i = 0;
  while (i < fields.length) {
    if (
      fields[i].type === "icon-picker" &&
      fields[i + 1]?.type === "icon-picker"
    ) {
      result.push([fields[i], fields[i + 1]]);
      i += 2;
    } else {
      result.push(fields[i]);
      i++;
    }
  }
  return result;
}

interface BlockSettingsProps {
	sectionId: string;
	groupId: string;
	block: Block;
	onBack: () => void;
	onDelete: () => void;
}

export function BlockSettings({ sectionId, groupId, block, onBack, onDelete }: BlockSettingsProps) {
	const updateBlockProp = useEditorStore((s) => s.updateBlockProp);
	const updateBlockStyle = useEditorStore((s) => s.updateBlockStyle);
	const moveBlockToSlot = useEditorStore((s) => s.moveBlockToSlot);
	const globalStyle = useEditorStore((s) => s.globalStyle);
	const groupSlots = useEditorStore((s) => {
		const section = s.sections.find((sec) => sec.id === sectionId);
		const group = section?.groups.find((g) => g.id === groupId);
		return group?.layout.slots ?? [];
	});

	const blockEntry = BLOCK_REGISTRY[block.type];
	if (!blockEntry) return null;

	const isAbsolute = block.style.positionMode === "absolute";
	const positionX = block.style.positionX ?? 0;
	const positionY = block.style.positionY ?? 0;
	const zIndex = block.style.zIndex ?? 20;
	const absoluteScale = block.style.scale ?? 100;

	return (
		<div className="flex h-full w-[300px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
				<div className="flex items-center gap-2">
					<button
						onClick={onBack}
						className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
						<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
							arrow_back
						</span>
					</button>
					<div>
						<div className="text-sm font-semibold text-sidebar-foreground">
							{blockEntry.label}
						</div>
						<div className="text-[10px] uppercase tracking-widest text-primary">
							Block
						</div>
					</div>
				</div>
				<button
					onClick={onDelete}
					className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
					title="Delete Block">
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						delete
					</span>
				</button>
			</div>

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto px-4 py-3 minimal-scrollbar space-y-1">
				{/* Content Controls */}
				{blockEntry.editableProps.length > 0 && (
					<CollapsiblePanel title="Content" defaultOpen>
						<div className="space-y-3">
							{groupEditableFields(blockEntry.editableProps).map((item, idx) => {
								if (Array.isArray(item)) {
									// Render paired icon-picker fields side by side
									return (
										<div key={`icon-pair-${idx}`} className="grid grid-cols-2 gap-2">
											{item.map((field) => (
												<FieldRenderer
													key={field.key}
													field={field}
													value={block.props[field.key]}
													onChange={(value) =>
														updateBlockProp(sectionId, groupId, block.id, field.key, value)
													}
												/>
											))}
										</div>
									);
								}
								return (
									<FieldRenderer
										key={item.key}
										field={item}
										value={block.props[item.key]}
										onChange={(value) =>
											updateBlockProp(sectionId, groupId, block.id, item.key, value)
										}
									/>
								);
							})}
						</div>
					</CollapsiblePanel>
				)}

				{/* Style Controls */}
				{blockEntry.editableStyles.length > 0 && (
					<CollapsiblePanel title="Style" defaultOpen>
						<div className="space-y-3">
							{blockEntry.editableStyles.map((styleField) => {
								const value = block.style[styleField.key];

								if (
									styleField.type === "size-picker" ||
									styleField.type === "align-picker"
								) {
									return (
										<div key={styleField.key} className="space-y-1.5">
											<label className="text-xs font-medium text-muted-foreground">
												{styleField.label}
											</label>
											<div className="flex gap-1">
												{styleField.options?.map((opt) => (
													<button
														key={opt.value}
														onClick={() =>
															updateBlockStyle(sectionId, groupId, block.id, {
																[styleField.key]: opt.value,
															} as Partial<BlockStyle>)
														}
														className={cn(
															"flex-1 rounded-lg border py-1.5 text-[10px] font-medium transition-colors",
															value === opt.value
																? "border-primary bg-primary/10 text-primary"
																: "border-border text-muted-foreground hover:border-primary/30",
														)}>
														{styleField.type === "align-picker" ? (
															<span
																className="material-symbols-outlined"
																style={{ fontSize: 14 }}>
																{opt.value === "left"
																	? "format_align_left"
																	: opt.value === "center"
																		? "format_align_center"
																		: "format_align_right"}
															</span>
														) : (
															opt.label
														)}
													</button>
												))}
											</div>
										</div>
									);
								}

								if (styleField.type === "color") {
									return (
										<div key={styleField.key}>
											<FieldRenderer
												field={{
													key: styleField.key,
													label: styleField.label,
													type: "color",
												}}
												value={value || ""}
												onChange={(v) =>
													updateBlockStyle(sectionId, groupId, block.id, {
														[styleField.key]: v,
													} as Partial<BlockStyle>)
												}
											/>
										</div>
									);
								}

								if (styleField.type === "slider") {
									return (
										<div key={styleField.key} className="space-y-1.5">
											<div className="flex items-center justify-between">
												<label className="text-xs font-medium text-muted-foreground">
													{styleField.label}
												</label>
												<span className="text-[10px] text-muted-foreground">
													{value ?? styleField.min ?? 0}
												</span>
											</div>
											<input
												type="range"
												min={styleField.min ?? 0}
												max={styleField.max ?? 100}
												step={styleField.step ?? 1}
												value={(value as number) ?? styleField.min ?? 0}
												onChange={(e) =>
													updateBlockStyle(sectionId, groupId, block.id, {
														[styleField.key]: Number(e.target.value),
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
				)}

				{/* Colors */}
				{blockEntry.colorOptions && (blockEntry.colorOptions.hasText || blockEntry.colorOptions.hasAccent) && (
					<CollapsiblePanel title="Colors" defaultOpen={false}>
						<div className="space-y-3">
							{/* Color Source toggle */}
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-muted-foreground">Color Source</label>
								<div className="grid grid-cols-2 gap-1.5">
									{(
										[
											{ value: "global", label: "Global Palette" },
											{ value: "custom", label: "Custom" },
										] as const
									).map((option) => (
										<button
											key={option.value}
											onClick={() =>
												updateBlockStyle(sectionId, groupId, block.id, {
													colorMode: option.value,
												})
											}
											className={cn(
												"rounded-lg border py-2 text-[11px] font-medium transition-colors",
												(block.style.colorMode ?? "global") === option.value
													? "border-primary bg-primary/10 text-primary"
													: "border-border text-muted-foreground hover:border-primary/30",
											)}>
											{option.label}
										</button>
									))}
								</div>
								<p className="text-[11px] text-muted-foreground">
									{(block.style.colorMode ?? "global") === "global"
										? "Follows Global Settings primary color and theme."
										: "This block uses custom colors."}
								</p>
							</div>

							{/* Custom color pickers — only shown in custom mode */}
							{block.style.colorMode === "custom" && (
								<>
									{blockEntry.colorOptions.hasText && (
										<ColorControl
											label="Text Color"
											value={block.style.textColor || (globalStyle.themeMode === "dark" ? "#ffffff" : "#111111")}
											onChange={(v) =>
												updateBlockStyle(sectionId, groupId, block.id, {
													textColor: v,
													colorMode: "custom",
												})
											}
										/>
									)}
									{blockEntry.colorOptions.hasAccent && (
										<ColorControl
											label="Accent Color"
											value={block.style.accentColor || globalStyle.primaryColor || "#00e5a0"}
											onChange={(v) =>
												updateBlockStyle(sectionId, groupId, block.id, {
													accentColor: v,
													colorMode: "custom",
												})
											}
										/>
									)}
								</>
							)}
						</div>
					</CollapsiblePanel>
				)}

				{/* Spacing */}
				<CollapsiblePanel title="Spacing" defaultOpen={false}>
					<div className="space-y-3">
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label className="text-xs font-medium text-muted-foreground">
									Top Margin
								</label>
								<span className="text-[10px] text-muted-foreground">
									{block.style.marginTop ?? 0}
								</span>
							</div>
							<input
								type="range"
								min={0}
								max={64}
								step={4}
								value={block.style.marginTop ?? 0}
								onChange={(e) =>
									updateBlockStyle(sectionId, groupId, block.id, {
										marginTop: Number(e.target.value),
									})
								}
								className="w-full accent-primary"
							/>
						</div>
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label className="text-xs font-medium text-muted-foreground">
									Bottom Margin
								</label>
								<span className="text-[10px] text-muted-foreground">
									{block.style.marginBottom ?? 0}
								</span>
							</div>
							<input
								type="range"
								min={0}
								max={64}
								step={4}
								value={block.style.marginBottom ?? 0}
								onChange={(e) =>
									updateBlockStyle(sectionId, groupId, block.id, {
										marginBottom: Number(e.target.value),
									})
								}
								className="w-full accent-primary"
							/>
						</div>
					</div>
				</CollapsiblePanel>

				{/* Position */}
				<CollapsiblePanel title="Position" defaultOpen={false}>
					<div className="space-y-3">
						{/* Column selector — only for flow blocks in multi-slot layouts */}
						{!isAbsolute && groupSlots.length > 1 && (
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-muted-foreground">Column</label>
								<div className={cn("grid gap-1", groupSlots.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
									{groupSlots.map((slot) => (
										<button
											key={slot}
											onClick={() => moveBlockToSlot(sectionId, groupId, block.id, slot)}
											className={cn(
												"rounded-lg border py-1.5 text-[10px] font-medium transition-colors",
												block.slot === slot
													? "border-primary bg-primary/10 text-primary"
													: "border-border text-muted-foreground hover:border-primary/30",
											)}
										>
											{formatSlotLabel(slot)}
										</button>
									))}
								</div>
							</div>
						)}
						<div className="grid grid-cols-2 gap-1">
							<button
								onClick={() =>
									updateBlockStyle(sectionId, groupId, block.id, { positionMode: "flow" })
								}
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
									updateBlockStyle(sectionId, groupId, block.id, {
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
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<label className="text-xs font-medium text-muted-foreground">
											X Position
										</label>
										<span className="text-[10px] text-muted-foreground">
											{positionX}px
										</span>
									</div>
									<input
										type="range"
										min={-300}
										max={1600}
										step={1}
										value={positionX}
										onChange={(e) =>
											updateBlockStyle(sectionId, groupId, block.id, {
												positionX: Number(e.target.value),
											})
										}
										className="w-full accent-primary"
									/>
								</div>

								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<label className="text-xs font-medium text-muted-foreground">
											Y Position
										</label>
										<span className="text-[10px] text-muted-foreground">
											{positionY}px
										</span>
									</div>
									<input
										type="range"
										min={-300}
										max={1600}
										step={1}
										value={positionY}
										onChange={(e) =>
											updateBlockStyle(sectionId, groupId, block.id, {
												positionY: Number(e.target.value),
											})
										}
										className="w-full accent-primary"
									/>
								</div>

								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<label className="text-xs font-medium text-muted-foreground">
											Layer
										</label>
										<span className="text-[10px] text-muted-foreground">
											{zIndex}
										</span>
									</div>
									<input
										type="range"
										min={1}
										max={100}
										step={1}
										value={zIndex}
										onChange={(e) =>
											updateBlockStyle(sectionId, groupId, block.id, {
												zIndex: Number(e.target.value),
											})
										}
										className="w-full accent-primary"
									/>
								</div>

								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<label className="text-xs font-medium text-muted-foreground">
											Scale
										</label>
										<span className="text-[10px] text-muted-foreground">
											{absoluteScale}%
										</span>
									</div>
									<input
										type="range"
										min={25}
										max={300}
										step={5}
										value={absoluteScale}
										onChange={(e) =>
											updateBlockStyle(sectionId, groupId, block.id, {
												scale: Number(e.target.value),
											})
										}
										className="w-full accent-primary"
									/>
								</div>
								<p className="text-[10px] text-muted-foreground">Absolute positioning is relative to the selected group.</p>
							</>
						)}
					</div>
				</CollapsiblePanel>
			</div>
		</div>
	);
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatSlotLabel(slot: string): string {
	if (slot === "main") return "Main";
	if (slot === "left") return "Left";
	if (slot === "right") return "Right";
	const colMatch = /^col-(\d+)$/.exec(slot);
	if (colMatch) return `Col ${colMatch[1]}`;
	return slot.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Collapsible Panel ───────────────────────────────────────────────────

function CollapsiblePanel({
	title,
	defaultOpen = true,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="border-b border-sidebar-border pb-3 mb-3 last:border-0">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between py-2">
				<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
					{title}
				</span>
				<span
					className={cn(
						"material-symbols-outlined text-muted-foreground transition-transform",
						!isOpen && "-rotate-90",
					)}
					style={{ fontSize: 16 }}>
					expand_more
				</span>
			</button>
			{isOpen && <div className="pt-1">{children}</div>}
		</div>
	);
}
