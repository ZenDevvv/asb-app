import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { ColorControl } from "~/components/controls/ColorControl";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { FontFamilyModal } from "~/editor/FontFamilyModal";
import { resolveFontOption } from "~/editor/fontFamilyOptions";
import { cn } from "~/lib/utils";

export function GlobalSettingsPanel() {
	const globalStyle = useEditorStore((s) => s.globalStyle);
	const updateGlobalStyle = useEditorStore((s) => s.updateGlobalStyle);
	const [fontModalOpen, setFontModalOpen] = useState(false);
	const selectedFont = resolveFontOption(globalStyle.fontFamily);

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
							onClick={() => setFontModalOpen(true)}
							className="group flex w-full items-center justify-between rounded-xl border border-border bg-input/50 px-3 py-2 text-left transition-colors hover:border-primary/40">
							<div>
								<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
									Selected Font
								</p>
								<p
									className="text-sm text-foreground"
									style={{ fontFamily: selectedFont.fontFamily }}>
									{selectedFont.label}
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

			<FontFamilyModal
				open={fontModalOpen}
				onOpenChange={setFontModalOpen}
				value={globalStyle.fontFamily}
				onApply={(fontFamily) => updateGlobalStyle({ fontFamily })}
				title="Typography Settings"
				description="Define global fonts for your website."
				applyLabel="Apply Font"
			/>
		</>
	);
}
