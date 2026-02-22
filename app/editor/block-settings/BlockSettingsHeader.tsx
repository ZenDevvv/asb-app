interface BlockSettingsHeaderProps {
	blockLabel: string;
	onBack: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

export function BlockSettingsHeader({
	blockLabel,
	onBack,
	onDuplicate,
	onDelete,
}: BlockSettingsHeaderProps) {
	return (
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
						{blockLabel}
					</div>
					<div className="text-[10px] uppercase tracking-widest text-primary">Block</div>
				</div>
			</div>

			<div className="flex items-center gap-1">
				<button
					onClick={onDuplicate}
					className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
					title="Duplicate Block">
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						content_copy
					</span>
				</button>
				<button
					onClick={onDelete}
					className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
					title="Delete Block">
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						delete
					</span>
				</button>
			</div>
		</div>
	);
}
