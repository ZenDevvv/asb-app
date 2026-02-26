import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import { CMS_ALLOWED_BLOCKS, type CMSBlockType, useDisplayStore } from "~/stores/displayStore";
import type { BlockCategory } from "~/types/editor";
import { CMSCanvasBackgroundSettings } from "./CMSCanvasBackgroundSettings";

interface CMSLibraryProps {
	className?: string;
}

const CATEGORY_ORDER: BlockCategory[] = ["basic", "media", "layout", "content"];
const CATEGORY_LABELS: Record<BlockCategory, string> = {
	basic: "Basic",
	media: "Media",
	layout: "Layout",
	content: "Content",
};

function getBlocksByCategory(category: BlockCategory): CMSBlockType[] {
	return CMS_ALLOWED_BLOCKS.filter((type) => BLOCK_REGISTRY[type].category === category);
}

export function CMSLibrary({ className }: CMSLibraryProps) {
	const addBlock = useDisplayStore((state) => state.addBlock);

	return (
		<section className={cn("flex h-full flex-col", className)}>
			<div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
				<div>
					<div className="text-sm font-semibold text-sidebar-foreground">CMS Library</div>
					<div className="text-[10px] uppercase tracking-widest text-primary">
						Visual Blocks
					</div>
				</div>
			</div>

			<div className="minimal-scrollbar flex-1 space-y-4 overflow-y-auto p-3">
				<CMSCanvasBackgroundSettings />

				{CATEGORY_ORDER.map((category) => {
					const blockTypes = getBlocksByCategory(category);
					if (blockTypes.length === 0) return null;

					return (
						<div key={category} className="space-y-2">
							<p className="text-[10px] uppercase tracking-widest text-muted-foreground">
								{CATEGORY_LABELS[category]}
							</p>
							<div className="grid grid-cols-2 gap-2">
								{blockTypes.map((type) => {
									const entry = BLOCK_REGISTRY[type];
									return (
										<button
											key={type}
											type="button"
											onClick={() => addBlock(type)}
											className="flex min-h-20 w-full flex-col items-start justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-3 py-2 text-left text-xs text-sidebar-foreground transition-colors hover:border-primary/40 hover:bg-sidebar-accent">
											<span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<Icon name={entry.icon} size={15} />
											</span>
											<div className="min-w-0 text-sm font-medium leading-tight">
												{entry.label}
											</div>
										</button>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
