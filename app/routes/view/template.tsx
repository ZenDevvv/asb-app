import { useParams } from "react-router";
import { SectionRenderer } from "~/sections/SectionRenderer";
import { useGetTemplateProjectById } from "~/hooks/use-template-project";
import { DEFAULT_GLOBAL_STYLE } from "~/stores/editorStore";
import { cn } from "~/lib/utils";

export default function PublicTemplateViewRoute() {
	const { templateId } = useParams<{ templateId: string }>();

	const { data: templateData, isLoading, isError } = useGetTemplateProjectById(templateId ?? "", {
		fields: "id,pages,globalStyle",
		isPublic: true,
	});

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Loading...
			</div>
		);
	}

	if (isError || !templateData) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Template not found.
			</div>
		);
	}

	const sections = templateData.pages?.[0]?.sections ?? [];
	const globalStyle = templateData.globalStyle ?? { ...DEFAULT_GLOBAL_STYLE };
	const visibleSections = sections.filter((section) => section.isVisible);
	const themeClass = globalStyle.themeMode === "light" ? "light" : "dark";

	return (
		<div className={cn("min-h-screen bg-background text-foreground", themeClass)}>
			<div style={{ fontFamily: globalStyle.fontFamily }}>
				{visibleSections.length === 0 ? (
					<div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-6 text-sm text-muted-foreground">
						Nothing to see here.
					</div>
				) : (
					visibleSections.map((section, sectionIndex) => (
						<SectionRenderer
							key={section.id}
							section={section}
							sectionIndex={sectionIndex}
							globalStyle={globalStyle}
							isEditing={false}
							selectedGroupId={null}
							selectedBlockId={null}
						/>
					))
				)}
			</div>
		</div>
	);
}
