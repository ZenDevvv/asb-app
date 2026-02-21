import { useMemo, useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { ColorControl } from "~/components/controls/ColorControl";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

const FONT_PREVIEW_TEXT = "The quick brown fox jumps over the lazy dog.";

const FONT_FAMILY_OPTIONS = [
	{
		value: "Inter",
		label: "Inter",
		fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Poppins",
		label: "Poppins",
		fontFamily: '"Poppins", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Roboto",
		label: "Roboto",
		fontFamily: '"Roboto", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Playfair Display",
		label: "Playfair Display",
		fontFamily: '"Playfair Display", ui-serif, Georgia, serif',
	},
	{
		value: "Montserrat",
		label: "Montserrat",
		fontFamily: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Open Sans",
		label: "Open Sans",
		fontFamily: '"Open Sans", ui-sans-serif, system-ui, sans-serif',
	},
] as const;

export function GlobalSettingsPanel() {
	const globalStyle = useEditorStore((s) => s.globalStyle);
	const updateGlobalStyle = useEditorStore((s) => s.updateGlobalStyle);
	const [fontModalOpen, setFontModalOpen] = useState(false);
	const [fontQuery, setFontQuery] = useState("");
	const [pendingFontFamily, setPendingFontFamily] = useState(globalStyle.fontFamily);
	const currentFontValue = FONT_FAMILY_OPTIONS.some(
		(option) => option.value === globalStyle.fontFamily,
	)
		? globalStyle.fontFamily
		: FONT_FAMILY_OPTIONS[0].value;
	const selectedFontFamily =
		FONT_FAMILY_OPTIONS.find((option) => option.value === currentFontValue)?.fontFamily ??
		currentFontValue;
	const selectedFontLabel =
		FONT_FAMILY_OPTIONS.find((option) => option.value === currentFontValue)?.label ??
		currentFontValue;
	const pendingFontOption =
		FONT_FAMILY_OPTIONS.find((option) => option.value === pendingFontFamily) ??
		FONT_FAMILY_OPTIONS[0];
	const filteredFontOptions = useMemo(() => {
		const term = fontQuery.trim().toLowerCase();
		if (!term) return FONT_FAMILY_OPTIONS;
		return FONT_FAMILY_OPTIONS.filter((option) => option.label.toLowerCase().includes(term));
	}, [fontQuery]);

	const handleFontModalOpenChange = (open: boolean) => {
		setFontModalOpen(open);
		if (open) {
			setPendingFontFamily(currentFontValue);
		}
		if (!open) {
			setFontQuery("");
		}
	};

	const applyFontSelection = () => {
		updateGlobalStyle({ fontFamily: pendingFontFamily });
		setFontModalOpen(false);
		setFontQuery("");
	};

	return (
		<>
			<div className="flex h-full w-[300px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
				<div className="border-b border-sidebar-border px-4 py-3">
					<div className="text-sm font-semibold text-sidebar-foreground">
						Page Settings
					</div>
					<div className="text-[10px] uppercase tracking-widest text-primary">Global</div>
				</div>

				<div className="minimal-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4">
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							Website Theme
						</label>
						<div className="grid grid-cols-2 gap-1.5">
							{(
								[
									{ value: "dark", label: "Dark", icon: "dark_mode" },
									{ value: "light", label: "Light", icon: "light_mode" },
								] as const
							).map((themeOption) => (
								<button
									key={themeOption.value}
									onClick={() =>
										updateGlobalStyle({ themeMode: themeOption.value })
									}
									className={cn(
										"flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[11px] font-medium transition-colors",
										globalStyle.themeMode === themeOption.value
											? "border-primary bg-primary/10 text-primary"
											: "border-border text-muted-foreground hover:border-primary/30",
									)}>
									<span
										className="material-symbols-outlined"
										style={{ fontSize: 14 }}>
										{themeOption.icon}
									</span>
									{themeOption.label}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							Font Family
						</label>
						<button
							type="button"
							onClick={() => handleFontModalOpenChange(true)}
							className="group flex w-full items-center justify-between rounded-xl border border-border bg-input/50 px-3 py-2 text-left transition-colors hover:border-primary/40">
							<div>
								<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
									Selected Font
								</p>
								<p
									className="text-sm text-foreground"
									style={{ fontFamily: selectedFontFamily }}>
									{selectedFontLabel}
								</p>
							</div>
							<span
								className="material-symbols-outlined text-muted-foreground transition-colors group-hover:text-foreground"
								style={{ fontSize: 18 }}>
								tune
							</span>
						</button>
					</div>

					<ColorControl
						label="Primary Color"
						value={globalStyle.primaryColor}
						onChange={(v) => updateGlobalStyle({ primaryColor: v })}
					/>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							Color Scheme
						</label>
						<Select
							value={globalStyle.colorScheme}
							onValueChange={(value) =>
								updateGlobalStyle({
									colorScheme: value as typeof globalStyle.colorScheme,
								})
							}>
							<SelectTrigger className="w-full rounded-xl border-border bg-input/50 text-sm text-foreground">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="monochromatic">Monochromatic</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-[11px] text-muted-foreground">
							Future schemes (complementary, analogous) can be added here.
						</p>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							Corner Style
						</label>
						<div className="grid grid-cols-5 gap-1.5">
							{(["none", "sm", "md", "lg", "full"] as const).map((r) => (
								<button
									key={r}
									onClick={() => updateGlobalStyle({ borderRadius: r })}
									className={cn(
										"rounded-lg border py-1.5 text-[10px] font-medium transition-colors",
										globalStyle.borderRadius === r
											? "border-primary bg-primary/10 text-primary"
											: "border-border text-muted-foreground hover:border-primary/30",
									)}>
									{r === "none" ? "Sharp" : r.toUpperCase()}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			<Dialog open={fontModalOpen} onOpenChange={handleFontModalOpenChange}>
				<DialogContent
					showCloseButton={false}
					className="max-w-3xl border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
					<DialogHeader className="border-b border-sidebar-border px-5 pb-4 pt-5">
						<div className="flex items-start justify-between gap-3">
							<div>
								<DialogTitle className="text-lg font-semibold text-sidebar-foreground">
									Typography Settings
								</DialogTitle>
								<DialogDescription className="mt-1 text-sm text-muted-foreground">
									Define global fonts for your website.
								</DialogDescription>
							</div>
							<button
								type="button"
								onClick={() => handleFontModalOpenChange(false)}
								className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground">
								<span
									className="material-symbols-outlined"
									style={{ fontSize: 18 }}>
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
								onClick={() => handleFontModalOpenChange(false)}
								className="border-border bg-transparent hover:bg-sidebar-accent">
								Cancel
							</Button>
							<Button type="button" onClick={applyFontSelection}>
								Apply Font
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
