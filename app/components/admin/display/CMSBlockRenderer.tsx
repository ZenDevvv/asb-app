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
type CMSContainerHorizontalAlignment = "left" | "center" | "right";
type CMSContainerVerticalAlignment = "top" | "middle" | "bottom";

function getContainerHorizontalAlignment(block: CMSBlock): CMSContainerHorizontalAlignment {
	const value = block.props.containerHorizontalAlign;
	if (value === "left" || value === "center" || value === "right") return value;
	return block.type === "image" || block.type === "video" ? "center" : "left";
}

function getContainerVerticalAlignment(block: CMSBlock): CMSContainerVerticalAlignment {
	const value = block.props.containerVerticalAlign;
	if (value === "top" || value === "middle" || value === "bottom") return value;
	return block.type === "image" || block.type === "video" ? "middle" : "top";
}

function getAlignItems(
	alignment: CMSContainerHorizontalAlignment,
): "flex-start" | "center" | "flex-end" {
	if (alignment === "left") return "flex-start";
	if (alignment === "center") return "center";
	return "flex-end";
}

function getJustifyContent(
	alignment: CMSContainerVerticalAlignment,
): "flex-start" | "center" | "flex-end" {
	if (alignment === "top") return "flex-start";
	if (alignment === "middle") return "center";
	return "flex-end";
}

export function CMSBlockRenderer({ block, globalStyle, canvasHeight }: CMSBlockRendererProps) {
	const overrideFontFamily =
		typeof block.style.fontFamily === "string" && block.style.fontFamily.trim().length > 0
			? block.style.fontFamily
			: globalStyle.fontFamily;
	const horizontalAlignment = getContainerHorizontalAlignment(block);
	const verticalAlignment = getContainerVerticalAlignment(block);
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
		<div
			className="flex h-full w-full overflow-hidden"
			style={{
				fontFamily: overrideFontFamily,
				alignItems: getAlignItems(horizontalAlignment),
				justifyContent: getJustifyContent(verticalAlignment),
			}}>
			<div className="max-h-full max-w-full">
				<BlockRenderer
					block={editorBlock}
					sectionStyle={DISPLAY_SECTION_STYLE}
					globalStyle={globalStyle}
					isEditing
					isSelected={false}
					onUpdateProp={() => undefined}
				/>
			</div>
		</div>
	);
}
