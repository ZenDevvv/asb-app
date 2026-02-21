import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { BackgroundControl } from "~/components/controls/BackgroundControl";
import { ColorControl } from "~/components/controls/ColorControl";
import { SettingsCollapsibleSection } from "./SettingsCollapsibleSection";
import { cn } from "~/lib/utils";
import type { Section, SectionStyle } from "~/types/editor";

interface SectionModeSettingsProps {
	section: Section;
}

export function SectionModeSettings({ section }: SectionModeSettingsProps) {
	const updateSectionStyle = useEditorStore((s) => s.updateSectionStyle);
	const isUsingGlobalColors = (section.style.colorMode ?? "global") !== "custom";

	const [openSections, setOpenSections] = useState({
		background: true,
	});

	const togglePanel = (key: "background") => {
		setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleBackgroundChange = (style: Partial<SectionStyle>) => {
		const hasExplicitColorEdit =
			style.backgroundColor !== undefined ||
			style.gradientFrom !== undefined ||
			style.gradientTo !== undefined;

		updateSectionStyle(section.id, {
			...style,
			...(hasExplicitColorEdit ? { colorMode: "custom" } : {}),
		});
	};

	return (
		<>
			<SettingsCollapsibleSection
				title="Background"
				isOpen={openSections.background}
				onToggle={() => togglePanel("background")}>
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground">
						Color Source
					</label>
					<div className="grid grid-cols-2 gap-1.5">
						{(
							[
								{ value: "global", label: "Global Palette" },
								{ value: "custom", label: "Custom Colors" },
							] as const
						).map((option) => (
							<button
								key={option.value}
								onClick={() =>
									updateSectionStyle(section.id, { colorMode: option.value })
								}
								className={cn(
									"rounded-lg border py-2 text-[11px] font-medium transition-colors",
									(section.style.colorMode ?? "global") === option.value
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-muted-foreground hover:border-primary/30",
								)}>
								{option.label}
							</button>
						))}
					</div>
					<p className="text-[11px] text-muted-foreground">
						{isUsingGlobalColors
							? "Follows Global Settings primary color with monochromatic shades."
							: "This section uses custom colors and no longer follows the global palette."}
					</p>
				</div>

				<BackgroundControl style={section.style} onChange={handleBackgroundChange} />
				<div className="mt-3">
					<ColorControl
						label="Text Color"
						value={section.style.textColor || "#ffffff"}
						onChange={(v) =>
							updateSectionStyle(section.id, { textColor: v, colorMode: "custom" })
						}
					/>
				</div>
				<div className="mt-3">
					<ColorControl
						label="Accent Color"
						value={section.style.accentColor || "#00e5a0"}
						onChange={(v) =>
							updateSectionStyle(section.id, { accentColor: v, colorMode: "custom" })
						}
					/>
				</div>
			</SettingsCollapsibleSection>
		</>
	);
}
