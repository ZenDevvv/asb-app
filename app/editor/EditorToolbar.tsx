import { useEditorStore } from "~/stores/editorStore";
import { cn } from "~/lib/utils";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";

const SHORTCUTS = [
	{
		keys: ["Ctrl", "Z"],
		macKeys: ["Cmd", "Z"],
		description: "Undo",
	},
	{
		keys: ["Ctrl", "Shift", "Z"],
		macKeys: ["Cmd", "Shift", "Z"],
		description: "Redo",
	},
	{
		keys: ["Ctrl", "S"],
		macKeys: ["Cmd", "S"],
		description: "Save",
	},
	{
		keys: ["Delete"],
		macKeys: ["Delete"],
		description: "Delete selected block or section",
	},
	{
		keys: ["Esc"],
		macKeys: ["Esc"],
		description: "Back / Deselect",
	},
] as const;

export function EditorToolbar() {
	const device = useEditorStore((s) => s.device);
	const setDevice = useEditorStore((s) => s.setDevice);
	const undo = useEditorStore((s) => s.undo);
	const redo = useEditorStore((s) => s.redo);
	const history = useEditorStore((s) => s.history);
	const future = useEditorStore((s) => s.future);
	const lastSaved = useEditorStore((s) => s.lastSaved);
	const saveToLocalStorage = useEditorStore((s) => s.saveToLocalStorage);
	const [shortcutsOpen, setShortcutsOpen] = useState(false);

	const savedAgo = useMemo(() => {
		if (!lastSaved) return null;
		const diff = Date.now() - new Date(lastSaved).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return "Just now";
		return `${mins} min${mins > 1 ? "s" : ""} ago`;
	}, [lastSaved]);

	return (
		<div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4">
			{/* Left */}
			<div className="flex items-center gap-3">
				<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
					<span
						className="material-symbols-outlined text-primary"
						style={{ fontSize: 18 }}>
						dashboard
					</span>
				</div>
				<div>
					<div className="text-sm font-semibold text-sidebar-foreground">
						Landing Page V1
					</div>
					<div className="text-[10px] text-muted-foreground">
						{savedAgo ? `Last saved ${savedAgo}` : "Not saved yet"}
					</div>
				</div>
			</div>

			{/* Center */}
			<div className="flex items-center gap-2">
				{/* Device Toggle */}
				<div className="flex items-center rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-0.5">
					<button
						onClick={() => setDevice("desktop")}
						className={cn(
							"flex size-8 items-center justify-center rounded-lg transition-colors",
							device === "desktop"
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}>
						<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
							monitor
						</span>
					</button>
					<button
						onClick={() => setDevice("mobile")}
						className={cn(
							"flex size-8 items-center justify-center rounded-lg transition-colors",
							device === "mobile"
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}>
						<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
							smartphone
						</span>
					</button>
				</div>

				<div className="mx-2 h-5 w-px bg-sidebar-border" />

				{/* Undo / Redo */}
				<button
					onClick={undo}
					disabled={history.length === 0}
					className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
					<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
						undo
					</span>
				</button>
				<button
					onClick={redo}
					disabled={future.length === 0}
					className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
					<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
						redo
					</span>
				</button>
			</div>

			{/* Right */}
			<div className="flex items-center gap-2">
				<button
					onClick={() => setShortcutsOpen(true)}
					className="flex items-center gap-1.5 rounded-xl border border-sidebar-border px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						keyboard
					</span>
					Shortcuts
				</button>
				<button
					onClick={() => {
						saveToLocalStorage();
						window.open("/editor/preview", "_blank");
					}}
					className="flex items-center gap-1.5 rounded-xl border border-sidebar-border px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						visibility
					</span>
					Preview
				</button>
				<button
					onClick={saveToLocalStorage}
					className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
					Publish
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						rocket_launch
					</span>
				</button>
			</div>

			<Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
				<DialogContent className="max-w-lg border-border bg-card rounded-2xl">
					<DialogHeader>
						<DialogTitle className="text-foreground">Keyboard Shortcuts</DialogTitle>
					</DialogHeader>
					<div className="space-y-2 pt-1">
						{SHORTCUTS.map((shortcut) => (
							<div
								key={shortcut.description}
								className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
								<span className="text-sm text-foreground">
									{shortcut.description}
								</span>
								<div className="flex items-center gap-2 text-[11px]">
									<div className="flex items-center gap-1">
										{shortcut.keys.map((key) => (
											<kbd
												key={`${shortcut.description}-${key}-pc`}
												className="rounded-md border border-border bg-background px-1.5 py-0.5 font-semibold text-muted-foreground">
												{key}
											</kbd>
										))}
									</div>
									<span className="text-muted-foreground/70">/</span>
									<div className="flex items-center gap-1">
										{shortcut.macKeys.map((key) => (
											<kbd
												key={`${shortcut.description}-${key}-mac`}
												className="rounded-md border border-border bg-background px-1.5 py-0.5 font-semibold text-muted-foreground">
												{key}
											</kbd>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
