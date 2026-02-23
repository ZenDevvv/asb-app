import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { SectionRenderer } from "~/sections/SectionRenderer";
import { useEditorStore } from "~/stores/editorStore";
import { useGetTemplateProjectById } from "~/hooks/use-template-project";
import { DEFAULT_GLOBAL_STYLE } from "~/stores/editorStore";
import { cn } from "~/lib/utils";

const STORAGE_KEY = "asb-editor-state";

export default function EditorPreviewRoute() {
	const [searchParams] = useSearchParams();
	const templateId = searchParams.get("templateId");

	// Template-backed preview
	const { data: templateData, isLoading } = useGetTemplateProjectById(templateId ?? "", {
		fields: "id,pages,globalStyle",
	});

	// Fallback: localStorage-backed preview
	const storeSections = useEditorStore((s) => s.sections);
	const storeGlobalStyle = useEditorStore((s) => s.globalStyle);
	const loadFromLocalStorage = useEditorStore((s) => s.loadFromLocalStorage);

	useEffect(() => {
		if (templateId) return;

		loadFromLocalStorage();

		const handleStorage = (event: StorageEvent) => {
			if (event.key !== STORAGE_KEY) return;
			loadFromLocalStorage();
		};

		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, [templateId, loadFromLocalStorage]);

	const sections = templateId
		? (templateData?.pages?.[0]?.sections ?? [])
		: storeSections;

	const globalStyle = templateId
		? (templateData?.globalStyle ?? { ...DEFAULT_GLOBAL_STYLE })
		: storeGlobalStyle;

	const visibleSections = sections.filter((section) => section.isVisible);
	const themeClass = globalStyle.themeMode === "light" ? "light" : "dark";

	const backHref = templateId ? `/editor/${templateId}` : "/editor";

	if (templateId && isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Loading preview...
			</div>
		);
	}

	return (
		<div className={cn("min-h-screen bg-background text-foreground", themeClass)}>
			<div className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
				<div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
					<div className="text-sm font-semibold tracking-wide">Live Preview</div>
					<Link
						to={backHref}
						className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
						<span className="material-symbols-outlined" style={{ fontSize: 14 }}>
							arrow_back
						</span>
						Back to Editor
					</Link>
				</div>
			</div>

			<div style={{ fontFamily: globalStyle.fontFamily }}>
				{visibleSections.length === 0 ? (
					<div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-6 text-sm text-muted-foreground">
						No sections available to preview.
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
