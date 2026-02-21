import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import {
	FONT_FAMILY_OPTIONS,
	resolveFontOption,
	resolveFontValue,
} from "~/editor/fontFamilyOptions";

const FONT_PREVIEW_TEXT = "The quick brown fox jumps over the lazy dog.";

interface FontFamilyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	value: string;
	onApply: (fontFamily: string) => void;
	title: string;
	description: string;
	applyLabel?: string;
}

export function FontFamilyModal({
	open,
	onOpenChange,
	value,
	onApply,
	title,
	description,
	applyLabel = "Apply Font",
}: FontFamilyModalProps) {
	const [fontQuery, setFontQuery] = useState("");
	const [pendingFontFamily, setPendingFontFamily] = useState(resolveFontValue(value));

	useEffect(() => {
		if (!open) {
			setFontQuery("");
			return;
		}
		setPendingFontFamily(resolveFontValue(value));
	}, [open, value]);

	const filteredFontOptions = useMemo(() => {
		const term = fontQuery.trim().toLowerCase();
		if (!term) return FONT_FAMILY_OPTIONS;
		return FONT_FAMILY_OPTIONS.filter((option) => option.label.toLowerCase().includes(term));
	}, [fontQuery]);
	const pendingFontOption = resolveFontOption(pendingFontFamily);

	const applySelection = () => {
		onApply(pendingFontFamily);
		onOpenChange(false);
		setFontQuery("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="max-w-3xl border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
				<DialogHeader className="border-b border-sidebar-border px-5 pb-4 pt-5">
					<div className="flex items-start justify-between gap-3">
						<div>
							<DialogTitle className="text-lg font-semibold text-sidebar-foreground">
								{title}
							</DialogTitle>
							<DialogDescription className="mt-1 text-sm text-muted-foreground">
								{description}
							</DialogDescription>
						</div>
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground">
							<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
								close
							</span>
						</button>
					</div>
					<div className="relative mt-4">
						<span
							className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							style={{ fontSize: 16 }}>
							search
						</span>
						<input
							autoFocus
							placeholder="Search fonts..."
							value={fontQuery}
							onChange={(e) => setFontQuery(e.target.value)}
							className="w-full rounded-xl border border-border bg-input/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
						/>
					</div>
				</DialogHeader>

				<div className="minimal-scrollbar max-h-[56vh] space-y-3 overflow-y-auto px-5 py-4">
					{filteredFontOptions.length === 0 ? (
						<p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
							No fonts found for "{fontQuery}".
						</p>
					) : (
						filteredFontOptions.map((option) => {
							const active = pendingFontFamily === option.value;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => setPendingFontFamily(option.value)}
									className={cn(
										"w-full rounded-2xl border px-4 py-3 text-left transition-colors",
										active
											? "border-primary bg-primary/10"
											: "border-sidebar-border bg-sidebar-accent/20 hover:border-primary/30",
									)}>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-base font-semibold text-sidebar-foreground">
												{option.label}
											</p>
											<p className="text-xs text-muted-foreground">
												Primary font preview
											</p>
										</div>
										{active && (
											<span
												className="material-symbols-outlined text-primary"
												style={{ fontSize: 20 }}>
												check_circle
											</span>
										)}
									</div>
									<p
										className="mt-3 text-4xl leading-tight text-sidebar-foreground"
										style={{ fontFamily: option.fontFamily }}>
										{FONT_PREVIEW_TEXT}
									</p>
								</button>
							);
						})
					)}
				</div>

				<div className="flex items-center justify-between border-t border-sidebar-border px-5 py-4">
					<p className="text-xs text-muted-foreground">
						Selected:{" "}
						<span
							className="text-sidebar-foreground"
							style={{ fontFamily: pendingFontOption.fontFamily }}>
							{pendingFontOption.label}
						</span>
					</p>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="border-border bg-transparent hover:bg-sidebar-accent">
							Cancel
						</Button>
						<Button type="button" onClick={applySelection}>
							{applyLabel}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
