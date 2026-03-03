import { useParams } from "react-router";
import { useGetProjectBySlug } from "~/hooks/use-project";
import { resolveProjectEditorMode } from "~/lib/template-project-utils";
import { cn } from "~/lib/utils";
import { SectionRenderer } from "~/sections/SectionRenderer";
import { DEFAULT_GLOBAL_STYLE } from "~/stores/editorStore";
import type { Section } from "~/types/editor";

export default function PublicProjectViewRoute() {
	const { slug } = useParams<{ slug: string }>();

	const {
		data: projectData,
		isLoading,
		isError,
	} = useGetProjectBySlug(slug ?? "", {
		fields: "id,slug,pages,globalStyle,editorMode,cmsState",
		isPublic: true,
	});

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Loading...
			</div>
		);
	}

	if (isError || !projectData || resolveProjectEditorMode(projectData) !== "website") {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Project not found.
			</div>
		);
	}

	const sections = (projectData.pages?.[0]?.sections ?? []) as Section[];
	const globalStyle = projectData.globalStyle ?? { ...DEFAULT_GLOBAL_STYLE };
	const visibleSections = sections.filter((section: Section) => section.isVisible);
	const themeClass = globalStyle.themeMode === "light" ? "light" : "dark";

	return (
		<div className={cn("min-h-screen bg-background text-foreground", themeClass)}>
			<div style={{ fontFamily: globalStyle.fontFamily }}>
				{visibleSections.length === 0 ? (
					<div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-6 text-sm text-muted-foreground">
						Nothing to see here.
					</div>
				) : (
					visibleSections.map((section: Section, sectionIndex: number) => (
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
