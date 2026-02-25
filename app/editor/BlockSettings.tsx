import { useState } from "react";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { FontFamilyModal } from "~/editor/FontFamilyModal";
import { useEditorStore } from "~/stores/editorStore";
import type { Block, BlockStyle } from "~/types/editor";
import { BlockSettingsHeader } from "./block-settings/BlockSettingsHeader";
import { ColorsPanel } from "./block-settings/ColorsPanel";
import { ContentPanel } from "./block-settings/ContentPanel";
import { ImageOverlayPanel } from "./block-settings/ImageOverlayPanel";
import { PositionPanel } from "./block-settings/PositionPanel";
import { SpacingPanel } from "./block-settings/SpacingPanel";
import { StylePanel } from "./block-settings/StylePanel";

interface BlockSettingsProps {
	sectionId: string;
	groupId: string;
	block: Block;
	onBack: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

export function BlockSettings({
	sectionId,
	groupId,
	block,
	onBack,
	onDuplicate,
	onDelete,
}: BlockSettingsProps) {
	const updateBlockProp = useEditorStore((s) => s.updateBlockProp);
	const updateBlockStyle = useEditorStore((s) => s.updateBlockStyle);
	const moveBlockToSlot = useEditorStore((s) => s.moveBlockToSlot);
	const globalStyle = useEditorStore((s) => s.globalStyle);
	const groupSlots = useEditorStore((s) => {
		const section = s.sections.find((sec) => sec.id === sectionId);
		const group = section?.groups.find((entry) => entry.id === groupId);
		return group?.layout.slots ?? [];
	});

	const blockEntry = BLOCK_REGISTRY[block.type];
	if (!blockEntry) return null;

	const supportsFontOverride =
		block.type === "heading" ||
		block.type === "text" ||
		block.type === "button" ||
		block.type === "image" ||
		block.type === "date";
	const [fontModalOpen, setFontModalOpen] = useState(false);
	const effectiveFontValue = block.style.fontFamily || globalStyle.fontFamily;

	const handlePropChange = (key: string, value: unknown) => {
		updateBlockProp(sectionId, groupId, block.id, key, value);
	};

	const handleStyleChange = (style: Partial<BlockStyle>) => {
		updateBlockStyle(sectionId, groupId, block.id, style);
	};

	const handleMoveToSlot = (slot: string) => {
		moveBlockToSlot(sectionId, groupId, block.id, slot);
	};

	return (
		<>
			<div className="flex h-full w-[300px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
				<BlockSettingsHeader
					blockLabel={blockEntry.label}
					onBack={onBack}
					onDuplicate={onDuplicate}
					onDelete={onDelete}
				/>

				<div className="minimal-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-3">
					<ContentPanel
						editableProps={blockEntry.editableProps}
						blockProps={block.props}
						onPropChange={handlePropChange}
					/>

					<StylePanel
						block={block}
						editableStyles={blockEntry.editableStyles}
						defaultStyle={blockEntry.defaultStyle}
						globalFontFamily={globalStyle.fontFamily}
						onStyleChange={handleStyleChange}
						onOpenFontModal={() => setFontModalOpen(true)}
					/>

					<ColorsPanel
						block={block}
						colorOptions={blockEntry.colorOptions}
						globalStyle={globalStyle}
						onStyleChange={handleStyleChange}
					/>

					<SpacingPanel blockStyle={block.style} onStyleChange={handleStyleChange} />

					{block.type === "image" && (
						<ImageOverlayPanel
							blockStyle={block.style}
							onStyleChange={handleStyleChange}
						/>
					)}

					<PositionPanel
						block={block}
						groupSlots={groupSlots}
						onStyleChange={handleStyleChange}
						onMoveToSlot={handleMoveToSlot}
					/>
				</div>
			</div>

			{supportsFontOverride && (
				<FontFamilyModal
					open={fontModalOpen}
					onOpenChange={setFontModalOpen}
					value={effectiveFontValue}
					onApply={(fontFamily) =>
						handleStyleChange({
							fontFamily: fontFamily === globalStyle.fontFamily ? "" : fontFamily,
						})
					}
					title="Typography Settings"
					description="Choose a font for this block. It will override the global font for this block only."
					applyLabel="Apply Font"
				/>
			)}
		</>
	);
}
