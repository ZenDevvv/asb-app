import { useState, type ReactNode } from "react";
import { cn } from "~/lib/utils";

interface CollapsiblePanelProps {
	title: string;
	defaultOpen?: boolean;
	children: ReactNode;
}

export function CollapsiblePanel({ title, defaultOpen = true, children }: CollapsiblePanelProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="mb-3 border-b border-sidebar-border pb-3 last:border-0">
			<button
				onClick={() => setIsOpen((prev) => !prev)}
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
