import { useState } from "react";
import { useEditorStore } from "~/stores/editorStore";
import { BackgroundControl } from "~/components/controls/BackgroundControl";
import { ColorControl } from "~/components/controls/ColorControl";
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

  return (
    <>
      <SettingsCollapsibleSection
        title="Background"
        isOpen={openSections.background}
        onToggle={() => togglePanel("background")}
      >
        <BackgroundControl
          style={section.style}
          onChange={(style: Partial<SectionStyle>) => updateSectionStyle(section.id, style)}
        />
        <div className="mt-3">
          <ColorControl
            label="Text Color"
            value={section.style.textColor || "#ffffff"}
            onChange={(v) => updateSectionStyle(section.id, { textColor: v })}
          />
        </div>
        <div className="mt-3">
          <ColorControl
            label="Accent Color"
            value={section.style.accentColor || "#00e5a0"}
            onChange={(v) => updateSectionStyle(section.id, { accentColor: v })}
          />
        </div>
      </SettingsCollapsibleSection>
    </>
  );
}
