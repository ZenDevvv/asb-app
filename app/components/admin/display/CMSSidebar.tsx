import { cn } from "~/lib/utils";
import { useDisplayStore } from "~/stores/displayStore";
import { CMSLibrary } from "./CMSLibrary";
import { CMSBlockSettings } from "./CMSBlockSettings";

interface CMSSidebarProps {
	className?: string;
}

export function CMSSidebar({ className }: CMSSidebarProps) {
	const blocks = useDisplayStore((state) => state.blocks);
	const selectedBlockId = useDisplayStore((state) => state.selectedBlockId);
	const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;

	return (
		<aside
			className={cn(
				"flex h-full w-[320px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar",
				className,
			)}>
			{selectedBlock ? <CMSBlockSettings block={selectedBlock} /> : <CMSLibrary />}
		</aside>
	);
}
