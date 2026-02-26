import { useMemo } from "react";
import { BlockRenderer } from "~/blocks/BlockRenderer";
import type { Block, GlobalStyle, SectionStyle } from "~/types/editor";
import type { CMSBlock } from "~/stores/displayStore";

interface CMSBlockRendererProps {
	block: CMSBlock;
	globalStyle: GlobalStyle;
	canvasHeight: number;
}

const DISPLAY_SECTION_STYLE: SectionStyle = {};

export function CMSBlockRenderer({ block, globalStyle, canvasHeight }: CMSBlockRendererProps) {
	const editorBlock = useMemo<Block>(
		() => ({
			id: block.id,
			type: block.type,
			slot: "main",
			order: 0,
			props:
				block.type === "video"
					? {
							...block.props,
							autoPlay: true,
							controls: false,
							muted: true,
							loop: true,
						}
					: { ...block.props },
			style:
				block.type === "image" || block.type === "video"
					? {
							...block.style,
							height: Math.max(24, Math.round((block.h / 100) * canvasHeight)),
						}
					: { ...block.style },
		}),
		[block, canvasHeight],
	);

	return (
		<BlockRenderer
			block={editorBlock}
			sectionStyle={DISPLAY_SECTION_STYLE}
			globalStyle={globalStyle}
			isEditing
			isSelected={false}
			onUpdateProp={() => undefined}
		/>
	);
}
