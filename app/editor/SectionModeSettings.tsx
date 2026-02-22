import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { useEditorStore } from "~/stores/editorStore";
import { BackgroundControl } from "~/components/controls/BackgroundControl";
import { SettingsCollapsibleSection } from "./SettingsCollapsibleSection";
import { cn } from "~/lib/utils";
import type { Section, SectionStyle } from "~/types/editor";

interface SectionModeSettingsProps {
	section: Section;
}

export function SectionModeSettings({ section }: SectionModeSettingsProps) {
	const sections = useEditorStore((s) => s.sections);
	const renameSection = useEditorStore((s) => s.renameSection);
	const updateSectionStyle = useEditorStore((s) => s.updateSectionStyle);
	const globalStyle = useEditorStore((s) => s.globalStyle);
	const sectionIndex = sections.findIndex((entry) => entry.id === section.id);
	const presetLabel = SECTION_REGISTRY[section.type]?.label || section.type;

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
			<div className="space-y-1.5 pb-2">
				<label className="text-xs font-medium text-muted-foreground">Section Name</label>
				<input
					value={section.label}
					onChange={(e) => renameSection(section.id, e.target.value)}
					className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground"
					placeholder="Section name"
				/>
				<p className="text-[11px] text-muted-foreground">Preset: {presetLabel}</p>
			</div>
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
				<div className="space-y-1.5 pt-2">
					<label className="text-xs font-medium text-muted-foreground">
						Group Alignment
					</label>
					<div className="flex gap-1">
						{(["top", "center", "bottom"] as const).map((align) => (
							<button
								key={align}
								onClick={() =>
									updateSectionStyle(section.id, { groupVerticalAlign: align })
								}
								title={align.charAt(0).toUpperCase() + align.slice(1)}
								className={cn(
									"flex flex-1 items-center justify-center rounded-lg border py-1.5 transition-colors",
									(section.style.groupVerticalAlign ?? "top") === align
										? "border-primary bg-primary/10 text-primary"
										: "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
								)}>
								<span
									className="material-symbols-outlined"
									style={{ fontSize: 14 }}>
									{align === "top"
										? "vertical_align_top"
										: align === "center"
											? "vertical_align_center"
											: "vertical_align_bottom"}
								</span>
							</button>
						))}
					</div>
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
