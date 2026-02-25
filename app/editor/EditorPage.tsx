import { useEffect, useCallback, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { DEFAULT_GLOBAL_STYLE, EDITOR_STORAGE_KEY, useEditorStore } from "~/stores/editorStore";
import { useGetTemplateProjectById, useUpdateTemplateProject } from "~/hooks/use-template-project";
import { EditorToolbar } from "./EditorToolbar";
import { SectionsListPanel } from "./SectionsListPanel";
import { EditorCanvas } from "./EditorCanvas";
import { SettingsPanel } from "./SettingsPanel";
import { AddSectionModal } from "./AddSectionModal";
import { debounce } from "lodash";
import { DEFAULT_SECTION_SEQUENCE } from "~/config/sectionRegistry";

type EditorSeedMode = "blank" | "basic";
type EditorLocationState = { editorSeed?: EditorSeedMode } | null;

function hasValidPersistedEditorState(): boolean {
	try {
		const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
		if (!raw) return false;

		const parsed = JSON.parse(raw) as { sections?: unknown; globalStyle?: unknown };
		return (
			Array.isArray(parsed.sections) &&
			!!parsed.globalStyle &&
			typeof parsed.globalStyle === "object"
		);
	} catch {
		return false;
	}
}

type ActiveTemplateContext = {
	templateId: string;
	pageMetadata: { id: string; name: string; slug: string; isDefault: boolean };
};

export default function EditorPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
	const isDirty = useEditorStore((s) => s.isDirty);
	const saveToLocalStorage = useEditorStore((s) => s.saveToLocalStorage);
	const setLastSaved = useEditorStore((s) => s.setLastSaved);
	const setIsSaving = useEditorStore((s) => s.setIsSaving);
	const locationState = location.state as EditorLocationState;
	const editorSeed = locationState?.editorSeed;
	const { templateId } = useParams<{ templateId?: string }>();

	// Persists the loaded template context after nav state is cleared.
	const activeTemplateRef = useRef<ActiveTemplateContext | null>(null);

	const { data: templateData, isLoading: isTemplateLoading } = useGetTemplateProjectById(
		templateId ?? "",
		{ fields: "id,name,pages,globalStyle" },
	);
	const { mutate: updateTemplate, isPending: isServerSaving } = useUpdateTemplateProject();

	useEffect(() => {
		setIsSaving(isServerSaving);
	}, [isServerSaving, setIsSaving]);

	// Seed/localStorage init — skipped when waiting on a template fetch.
	useEffect(() => {
		if (templateId) return;

		const store = useEditorStore.getState();

		if (editorSeed === "blank") {
			store.loadSections([], { ...DEFAULT_GLOBAL_STYLE });
			store.saveToLocalStorage();
			navigate("/editor", { replace: true, state: null });
			return;
		}

		if (editorSeed === "basic") {
			store.loadSections([], { ...DEFAULT_GLOBAL_STYLE });
			DEFAULT_SECTION_SEQUENCE.forEach((type) => {
				store.addSection(type);
			});
			store.saveToLocalStorage();
			navigate("/editor", { replace: true, state: null });
			return;
		}

		const hasPersistedState = hasValidPersistedEditorState();
		store.loadFromLocalStorage();

		if (!hasPersistedState && store.sections.length === 0) {
			DEFAULT_SECTION_SEQUENCE.forEach((type) => {
				store.addSection(type);
			});
		}
	}, [editorSeed, templateId, navigate]);

	// Load fetched template data into the editor store and cache context for saves.
	useEffect(() => {
		if (!templateId || !templateData) return;
		const store = useEditorStore.getState();
		const firstPage = templateData.pages?.[0];
		activeTemplateRef.current = {
			templateId: templateData.id,
			pageMetadata: {
				id: firstPage?.id,
				name: firstPage?.name,
				slug: firstPage?.slug,
				isDefault: firstPage?.isDefault ?? true,
			},
		};
		store.loadSections(
			firstPage?.sections ?? [],
			templateData.globalStyle ?? { ...DEFAULT_GLOBAL_STYLE },
		);
		store.saveToLocalStorage();
	}, [templateId, templateData]);

	// Auto-save debounced — also persists to server when editing a template.
	const debouncedSave = useCallback(
		debounce(() => {
			saveToLocalStorage();
			const ctx = activeTemplateRef.current;
			if (!ctx) return;
			const { sections, globalStyle } = useEditorStore.getState();
			updateTemplate(
				{
					templateProjectId: ctx.templateId,
					data: {
						pages: [{ ...ctx.pageMetadata, sections }],
						globalStyle,
					},
				},
				{
					onSuccess: (data) => {
						const updatedAt = data?.templateProject?.updatedAt;
						if (updatedAt) setLastSaved(new Date(updatedAt).toISOString());
					},
				},
			);
		}, 3000),
		[saveToLocalStorage, updateTemplate, setLastSaved],
	);

	useEffect(() => {
		if (isDirty) {
			debouncedSave();
		}
		return () => debouncedSave.cancel();
	}, [isDirty, debouncedSave]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const store = useEditorStore.getState();

			if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				store.undo();
			}

			if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
				e.preventDefault();
				store.redo();
			}

			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				debouncedSave.cancel();
				store.saveToLocalStorage();
				const ctx = activeTemplateRef.current;
				if (!ctx) return;
				const { sections, globalStyle } = useEditorStore.getState();
				updateTemplate(
					{
						templateProjectId: ctx.templateId,
						data: {
							pages: [{ ...ctx.pageMetadata, sections }],
							globalStyle,
						},
					},
					{
						onSuccess: (data) => {
							const updatedAt = data?.templateProject?.updatedAt;
							if (updatedAt) setLastSaved(new Date(updatedAt).toISOString());
						},
					},
				);
			}

			if (e.key === "Delete" && store.selectedSectionId) {
				const target = e.target as HTMLElement;
				if (
					target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable
				) {
					return;
				}

				e.preventDefault();

				if (store.selectedBlockId && store.selectedGroupId) {
					store.removeBlock(
						store.selectedSectionId,
						store.selectedGroupId,
						store.selectedBlockId,
					);
					return;
				}

				if (store.selectedGroupId) {
					store.removeGroup(store.selectedSectionId, store.selectedGroupId);
					return;
				}

				store.removeSection(store.selectedSectionId);
			}

			if (e.key === "Escape") {
				if (store.selectedBlockId && store.selectedSectionId && store.selectedGroupId) {
					store.selectBlock(store.selectedSectionId, store.selectedGroupId, null);
				} else if (store.selectedSectionId && store.selectedGroupId) {
					store.selectSection(store.selectedSectionId);
				} else {
					store.selectSection(null);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [debouncedSave, updateTemplate, setLastSaved]);

	if (templateId && isTemplateLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
				Loading template...
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			<EditorToolbar
				templateName={templateData?.name}
				onRenameTemplate={(name) => {
					const ctx = activeTemplateRef.current;
					if (!ctx) return;
					updateTemplate({ templateProjectId: ctx.templateId, data: { name } });
				}}
			/>

			<div className="flex flex-1 overflow-hidden">
				<SectionsListPanel onAddSection={() => setAddSectionModalOpen(true)} />
				<EditorCanvas />
				<SettingsPanel />
			</div>

			<AddSectionModal open={addSectionModalOpen} onOpenChange={setAddSectionModalOpen} />
		</div>
	);
}
