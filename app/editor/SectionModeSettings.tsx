import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { BackgroundControl } from "~/components/controls/BackgroundControl";
import { SettingsCollapsibleSection } from "./SettingsCollapsibleSection";
import type { Section, SectionStyle } from "~/types/editor";

interface SectionModeSettingsProps {
	section: Section;
}

export function SectionModeSettings({ section }: SectionModeSettingsProps) {
	const updateSectionStyle = useEditorStore((s) => s.updateSectionStyle);

	const [openSections, setOpenSections] = useState({
		background: true,
	});

	const togglePanel = (key: "background") => {
		setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleBackgroundChange = (style: Partial<SectionStyle>) => {
		updateSectionStyle(section.id, style);
	};

	return (
		<>
			<SettingsCollapsibleSection
				title="Background"
				isOpen={openSections.background}
				onToggle={() => togglePanel("background")}>
				<BackgroundControl style={section.style} onChange={handleBackgroundChange} />
			</SettingsCollapsibleSection>
		</>
	);
}
