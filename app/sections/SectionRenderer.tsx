import { useMemo } from "react";
import { BlockRenderer } from "~/blocks/BlockRenderer";
import type { Section, Block, GlobalStyle, LayoutTemplate } from "~/types/editor";

interface SectionRendererProps {
  section: Section;
  globalStyle: GlobalStyle;
  isEditing: boolean;
  selectedBlockId: string | null;
  onBlockClick?: (blockId: string) => void;
  onUpdateBlockProp?: (blockId: string, key: string, value: unknown) => void;
}

function groupBlocksBySlot(blocks: Block[] | undefined): Record<string, Block[]> {
  const groups: Record<string, Block[]> = {};
  if (!blocks || !Array.isArray(blocks)) return groups;
  for (const block of blocks) {
    if (!groups[block.slot]) {
      groups[block.slot] = [];
    }
    groups[block.slot].push(block);
  }
  // Sort each group by order
  for (const slot of Object.keys(groups)) {
    groups[slot].sort((a, b) => a.order - b.order);
  }
  return groups;
}

function getLayoutGridClasses(layout: LayoutTemplate, sectionType: Section["type"]): string {
  const isNavbarLayout = sectionType === "navbar" || layout.id.startsWith("nav-");
  const base = isNavbarLayout ? "grid w-full gap-4" : "grid w-full gap-8";
  const alignment =
    layout.alignment === "center"
      ? "items-center"
      : layout.alignment === "bottom"
        ? "items-end"
        : "items-start";

  const direction = layout.direction === "row-reverse" ? "direction-rtl" : "";

  if (layout.columns === 1) {
    return `${base} grid-cols-1 ${alignment}`;
  }

  if (layout.columns === 2) {
    const colClass =
      layout.distribution === "60-40"
        ? "grid-cols-[3fr_2fr]"
        : layout.distribution === "40-60"
          ? "grid-cols-[2fr_3fr]"
          : layout.distribution === "30-70"
            ? "grid-cols-[3fr_7fr]"
            : layout.distribution === "70-30"
              ? "grid-cols-[7fr_3fr]"
          : "grid-cols-2";
    return `${base} ${colClass} ${alignment} ${direction}`;
  }

  if (layout.columns === 3) {
    if (layout.distribution === "25-50-25") {
      return `${base} grid-cols-[1fr_2fr_1fr] ${alignment}`;
    }
    if (layout.distribution === "20-60-20") {
      return `${base} grid-cols-[1fr_3fr_1fr] ${alignment}`;
    }
    return `${base} grid-cols-3 ${alignment}`;
  }

  return `${base} grid-cols-1`;
}

function getSectionBackground(section: Section): React.CSSProperties {
  const s = section.style;
  const style: React.CSSProperties = {
    paddingTop: s.paddingY ?? 80,
    paddingBottom: s.paddingY ?? 80,
  };

  if (s.backgroundType === "gradient" && s.gradientFrom && s.gradientTo) {
    style.background = `linear-gradient(${s.gradientDirection || "to bottom"}, ${s.gradientFrom}, ${s.gradientTo})`;
  } else if (s.backgroundType === "image" && s.backgroundImage) {
    style.backgroundImage = `url(${s.backgroundImage})`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
    if (s.backgroundColor) {
      style.backgroundColor = s.backgroundColor;
    }
  } else {
    style.backgroundColor = s.backgroundColor || "#0a0f0d";
  }

  return style;
}

export function SectionRenderer({
  section,
  globalStyle,
  isEditing,
  selectedBlockId,
  onBlockClick,
  onUpdateBlockProp,
}: SectionRendererProps) {
  const layout = section.layout;
  const blocksBySlot = useMemo(() => groupBlocksBySlot(section.blocks), [section.blocks]);
  const isNavbar = section.type === "navbar" || layout.id.startsWith("nav-");

  const gridClasses = getLayoutGridClasses(layout, section.type);
  const bgStyle = getSectionBackground(section);

  return (
    <section
      className={isNavbar ? "border-b border-white/10" : undefined}
      style={bgStyle}
    >
      <div className={isNavbar ? "mx-auto max-w-7xl px-6" : "mx-auto max-w-6xl px-6"}>
        <div
          className={gridClasses}
          style={{
            direction: layout.direction === "row-reverse" ? "rtl" : "ltr",
          }}
        >
          {layout.slots.map((slotName) => (
            <div
              key={slotName}
              className="flex flex-col"
              style={{ direction: "ltr" }}
            >
              {blocksBySlot[slotName]?.map((block) => {
                const isBlockSelected = block.id === selectedBlockId;

                return (
                  <div
                    key={block.id}
                    className={`relative transition-all ${
                      isEditing ? "cursor-pointer" : ""
                    } ${
                      isBlockSelected
                        ? "ring-2 ring-primary/60 ring-offset-1 ring-offset-transparent rounded-md"
                        : isEditing
                          ? "hover:ring-1 hover:ring-primary/20 rounded-md"
                          : ""
                    }`}
                    onClick={(e) => {
                      if (isEditing && onBlockClick) {
                        e.stopPropagation();
                        onBlockClick(block.id);
                      }
                    }}
                  >
                    <BlockRenderer
                      block={block}
                      sectionStyle={section.style}
                      globalStyle={globalStyle}
                      isEditing={isEditing}
                      isSelected={isBlockSelected}
                      onUpdateProp={(key, value) =>
                        onUpdateBlockProp?.(block.id, key, value)
                      }
                    />
                  </div>
                );
              })}

              {/* Empty slot placeholder in editor mode */}
              {isEditing && (!blocksBySlot[slotName] || blocksBySlot[slotName].length === 0) && (
                <div className="flex min-h-[60px] items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-white/20">
                  {slotName}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
