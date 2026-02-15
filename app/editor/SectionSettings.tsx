import { useEditorStore } from "~/stores/editorStore";
import { SECTION_REGISTRY } from "~/config/sectionRegistry";
import { FieldRenderer } from "~/components/controls/FieldRenderer";
import { BackgroundControl } from "~/components/controls/BackgroundControl";
import { ColorControl } from "~/components/controls/ColorControl";
import { cn } from "~/lib/utils";
import { useState } from "react";
import type { SectionStyle } from "~/types/editor";

export function SectionSettings() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const sections = useEditorStore((s) => s.sections);
  const updateSectionProp = useEditorStore((s) => s.updateSectionProp);
  const updateSectionStyle = useEditorStore((s) => s.updateSectionStyle);
  const updateSectionVariant = useEditorStore((s) => s.updateSectionVariant);
  const removeSection = useEditorStore((s) => s.removeSection);
  const duplicateSection = useEditorStore((s) => s.duplicateSection);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const section = sections.find((s) => s.id === selectedId);
  const registry = section ? SECTION_REGISTRY[section.type] : null;

  const [openSections, setOpenSections] = useState({
    variant: true,
    content: true,
    background: true,
  });

  const togglePanel = (key: "variant" | "content" | "background") => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!section || !registry) {
    return <GlobalSettingsPanel />;
  }

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-sidebar-foreground">
            {registry.label}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-primary">
            Settings
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => duplicateSection(section.id)}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            title="Duplicate"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              content_copy
            </span>
          </button>
          <button
            onClick={() => removeSection(section.id)}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            title="Delete"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              delete
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 minimal-scrollbar space-y-1">
        {/* Variant Picker */}
        <CollapsibleSection
          title="Layout Variant"
          isOpen={openSections.variant}
          onToggle={() => togglePanel("variant")}
        >
          <div className="grid grid-cols-2 gap-2">
            {registry.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  pushHistory();
                  updateSectionVariant(section.id, v.id);
                }}
                className={cn(
                  "flex flex-col items-center rounded-xl border p-3 transition-colors",
                  section.variant === v.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30",
                )}
              >
                <div className="mb-1.5 flex size-12 items-center justify-center rounded-lg bg-muted/40">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {registry.icon}
                  </span>
                </div>
                <span className="text-[10px] font-medium">{v.label}</span>
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Content */}
        <CollapsibleSection
          title="Content"
          isOpen={openSections.content}
          onToggle={() => togglePanel("content")}
        >
          <div className="space-y-3">
            {registry.editableProps.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={section.props[field.key]}
                onChange={(value) => {
                  updateSectionProp(section.id, field.key, value);
                }}
              />
            ))}
          </div>
        </CollapsibleSection>

        {/* Background */}
        <CollapsibleSection
          title="Background"
          isOpen={openSections.background}
          onToggle={() => togglePanel("background")}
        >
          <BackgroundControl
            style={section.style}
            onChange={(style: Partial<SectionStyle>) =>
              updateSectionStyle(section.id, style)
            }
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
        </CollapsibleSection>
      </div>
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-sidebar-border pb-3 mb-3 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        <span
          className={cn(
            "material-symbols-outlined text-muted-foreground transition-transform",
            !isOpen && "-rotate-90",
          )}
          style={{ fontSize: 16 }}
        >
          expand_more
        </span>
      </button>
      {isOpen && <div className="pt-1">{children}</div>}
    </div>
  );
}

// ─── Global Settings (when no section selected) ──────────────────────────

function GlobalSettingsPanel() {
  const globalStyle = useEditorStore((s) => s.globalStyle);
  const updateGlobalStyle = useEditorStore((s) => s.updateGlobalStyle);

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-4 py-3">
        <div className="text-sm font-semibold text-sidebar-foreground">
          Page Settings
        </div>
        <div className="text-[10px] uppercase tracking-widest text-primary">
          Global
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 minimal-scrollbar">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Font Family</label>
          <select
            value={globalStyle.fontFamily}
            onChange={(e) => updateGlobalStyle({ fontFamily: e.target.value })}
            className="w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm text-foreground"
          >
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        <ColorControl
          label="Primary Color"
          value={globalStyle.primaryColor}
          onChange={(v) => updateGlobalStyle({ primaryColor: v })}
        />

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
                )}
              >
                {r === "none" ? "Sharp" : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
