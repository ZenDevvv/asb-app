import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { useEditorStore } from "~/stores/editorStore";
import { BackgroundControl } from "~/components/controls/BackgroundControl";
import { SettingsCollapsibleSection } from "./SettingsCollapsibleSection";
import type { Section, SectionStyle } from "~/types/editor";

interface SectionModeSettingsProps {
	section: Section;
}

export function SectionModeSettings({ section }: SectionModeSettingsProps) {
	const sections = useEditorStore((s) => s.sections);
	const updateSectionStyle = useEditorStore((s) => s.updateSectionStyle);
	const globalStyle = useEditorStore((s) => s.globalStyle);
	const sectionIndex = sections.findIndex((entry) => entry.id === section.id);

	const [openSections, setOpenSections] = useState({
		layout: true,
		background: true,
	});

	const togglePanel = (key: "layout" | "background") => {
		setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleBackgroundChange = (style: Partial<SectionStyle>) => {
		const isColorEdit =
			"backgroundColor" in style || "gradientFrom" in style || "gradientTo" in style;
		updateSectionStyle(section.id, isColorEdit ? { ...style, colorMode: "custom" } : style);
	};

	return (
		<>
			<SettingsCollapsibleSection
				title="Layout"
				isOpen={openSections.layout}
				onToggle={() => togglePanel("layout")}>
				<div className="flex items-center justify-between py-1">
					<div>
						<p className="text-xs font-medium text-foreground">Fill screen height</p>
						<p className="text-[11px] text-muted-foreground">
							Section takes up the full screen
						</p>
					</div>
					<Switch.Root
						checked={section.style.fullHeight ?? false}
						onCheckedChange={(checked) =>
							updateSectionStyle(section.id, { fullHeight: checked })
						}
						className="relative h-5 w-9 cursor-pointer rounded-full bg-muted transition-colors data-[state=checked]:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[18px]" />
					</Switch.Root>
				</div>
			</SettingsCollapsibleSection>
			<SettingsCollapsibleSection
				title="Background"
				isOpen={openSections.background}
				onToggle={() => togglePanel("background")}>
				<BackgroundControl
					style={section.style}
					onChange={handleBackgroundChange}
					globalStyle={globalStyle}
					sectionIndex={sectionIndex >= 0 ? sectionIndex : 0}
				/>
			</SettingsCollapsibleSection>
		</>
	);
}
