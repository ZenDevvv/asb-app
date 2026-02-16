import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { BLOCK_REGISTRY } from "~/config/blockRegistry";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { useEditorStore } from "~/stores/editorStore";
import type { BlockType, SectionType } from "~/types/editor";

interface AddBlockModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	sectionId: string;
	sectionType: SectionType;
	groupId: string;
	groupSlots: string[];
}

export function AddBlockModal({
	open,
	onOpenChange,
	sectionId,
	sectionType,
	groupId,
	groupSlots,
}: AddBlockModalProps) {
	const addBlock = useEditorStore((s) => s.addBlock);
	const registry = SECTION_REGISTRY[sectionType];
	const allowedTypes = registry?.allowedBlockTypes || [];
	const [selectedSlot, setSelectedSlot] = useState(groupSlots[0] || "main");
	const [addAsAbsolute, setAddAsAbsolute] = useState(false);

	const targetSlot = useMemo(() => {
		if (groupSlots.includes(selectedSlot)) return selectedSlot;
		return groupSlots[0] || "main";
	}, [groupSlots, selectedSlot]);

	useEffect(() => {
		if (!open) return;
		setSelectedSlot((prev) => (groupSlots.includes(prev) ? prev : groupSlots[0] || "main"));
		setAddAsAbsolute(false);
	}, [open, groupSlots]);

	const handleAdd = (type: BlockType) => {
		addBlock(sectionId, groupId, type, targetSlot, { addAsAbsolute });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md bg-card border-border rounded-2xl">
				<DialogHeader>
					<DialogTitle className="text-foreground">Add Block</DialogTitle>
				</DialogHeader>

				{groupSlots.length > 1 && (
					<div className="pt-2">
						<div className="mb-2 text-xs font-medium text-muted-foreground">Column</div>
						<div className="grid grid-cols-3 gap-2">
							{groupSlots.map((slot) => {
								const isActive = slot === targetSlot;
								return (
									<button
										key={slot}
										type="button"
										onClick={() => setSelectedSlot(slot)}
										className={`rounded-lg border px-2 py-1.5 text-[11px] transition-colors ${
											isActive
												? "border-primary bg-primary/10 text-primary"
												: "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
										}`}>
										{formatSlotLabel(slot)}
									</button>
								);
							})}
						</div>
					</div>
				)}

				<div className="pt-2">
					<button
						type="button"
						onClick={() => setAddAsAbsolute((prev) => !prev)}
						className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
							addAsAbsolute
								? "border-primary bg-primary/10 text-primary"
								: "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
						}`}>
						<span>Add as absolute block (group-relative)</span>
						<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
							{addAsAbsolute ? "check_circle" : "radio_button_unchecked"}
						</span>
					</button>
				</div>

				<div className="grid grid-cols-2 gap-2 pt-2">
					{allowedTypes.map((type) => {
						const entry = BLOCK_REGISTRY[type];
						if (!entry) return null;

						return (
							<button
								key={type}
								onClick={() => handleAdd(type)}
								className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5">
								<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<span
										className="material-symbols-outlined text-primary"
										style={{ fontSize: 18 }}>
										{entry.icon}
									</span>
								</div>
								<div>
									<div className="text-sm font-medium text-foreground">
										{entry.label}
									</div>
								</div>
							</button>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function formatSlotLabel(slot: string): string {
	if (slot === "main") return "Main";
	if (slot === "left") return "Left";
	if (slot === "right") return "Right";
	const colMatch = /^col-(\d+)$/.exec(slot);
	if (colMatch) return `Column ${colMatch[1]}`;
	return slot.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
