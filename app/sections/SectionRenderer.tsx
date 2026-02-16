import { GroupRenderer } from "~/sections/GroupRenderer";
import type { BlockStyle, GlobalStyle, Section } from "~/types/editor";

interface SectionRendererProps {
	section: Section;
	globalStyle: GlobalStyle;
	isEditing: boolean;
	selectedGroupId: string | null;
	selectedBlockId: string | null;
	onGroupClick?: (groupId: string) => void;
	onBlockClick?: (groupId: string, blockId: string) => void;
	onUpdateBlockProp?: (groupId: string, blockId: string, key: string, value: unknown) => void;
	onUpdateBlockStyle?: (groupId: string, blockId: string, style: Partial<BlockStyle>) => void;
}

function getSectionBackground(section: Section): React.CSSProperties {
	const s = section.style;
	const style: React.CSSProperties = {
		paddingTop: s.paddingY ?? 80,
		paddingBottom: s.paddingY ?? 80,
	};

	if (s.backgroundType === "gradient" && s.gradientFrom && s.gradientTo) {
		style.background = `linear-gradient(${s.gradientDirection || "to bottom"}, ${s.gradientFrom}, ${s.gradientTo})`;
	} else if (s.backgroundType === "image" && s.backgroundImage) {
		style.backgroundImage = `url(${s.backgroundImage})`;
		style.backgroundSize = "cover";
		style.backgroundPosition = "center";
		if (s.backgroundColor) {
			style.backgroundColor = s.backgroundColor;
		}
	} else {
		style.backgroundColor = s.backgroundColor || "#0a0f0d";
	}

	return style;
}

export function SectionRenderer({
	section,
	globalStyle,
	isEditing,
	selectedGroupId,
	selectedBlockId,
	onGroupClick,
	onBlockClick,
	onUpdateBlockProp,
	onUpdateBlockStyle,
}: SectionRendererProps) {
	const orderedGroups = section.groups.slice().sort((a, b) => a.order - b.order);
	const hasNavbarLayout =
		section.type === "navbar" ||
		orderedGroups.some((group) => group.layout.id.startsWith("nav-"));
	const bgStyle = getSectionBackground(section);

	return (
		<section
			className={hasNavbarLayout ? "border-b border-white/10" : undefined}
			style={bgStyle}>
			<div className={hasNavbarLayout ? "mx-auto max-w-7xl px-6" : "mx-auto max-w-6xl px-6"}>
				<div className="space-y-8">
					{orderedGroups.map((group) => (
						<GroupRenderer
							key={group.id}
							section={section}
							group={group}
							globalStyle={globalStyle}
							isEditing={isEditing}
							isGroupSelected={selectedGroupId === group.id}
							selectedBlockId={selectedBlockId}
							onGroupClick={() => onGroupClick?.(group.id)}
							onBlockClick={(blockId) => onBlockClick?.(group.id, blockId)}
							onUpdateBlockProp={(blockId, key, value) =>
								onUpdateBlockProp?.(group.id, blockId, key, value)
							}
							onUpdateBlockStyle={(blockId, style) =>
								onUpdateBlockStyle?.(group.id, blockId, style)
							}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
