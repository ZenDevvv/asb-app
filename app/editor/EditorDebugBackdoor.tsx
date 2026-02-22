import { useMemo, useRef, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useEditorStore } from "~/stores/editorStore";
import type { GlobalStyle, Section } from "~/types/editor";

function parseDebugFlag(value: string | null): boolean {
	if (value === null) return false;
	const normalized = value.trim().toLowerCase();
	if (normalized === "") return true;
	return (
		normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on"
	);
}

function resolveImportedState(payload: unknown): {
	sections: Section[] | undefined;
	globalStyle: GlobalStyle | undefined;
} {
	if (!payload || typeof payload !== "object") {
		return { sections: undefined, globalStyle: undefined };
	}

	const root = payload as {
		sections?: unknown;
		globalStyle?: unknown;
		state?: { sections?: unknown; globalStyle?: unknown };
	};
	const source = root.state && typeof root.state === "object" ? root.state : root;

	return {
		sections: Array.isArray(source.sections) ? (source.sections as Section[]) : undefined,
		globalStyle:
			source.globalStyle && typeof source.globalStyle === "object"
				? (source.globalStyle as GlobalStyle)
				: undefined,
	};
}

export function EditorDebugBackdoor() {
	const [searchParams] = useSearchParams();
	const importInputRef = useRef<HTMLInputElement | null>(null);

	const sections = useEditorStore((s) => s.sections);
	const globalStyle = useEditorStore((s) => s.globalStyle);
	const loadSections = useEditorStore((s) => s.loadSections);
	const saveToLocalStorage = useEditorStore((s) => s.saveToLocalStorage);

	const showDebugButtons = useMemo(() => {
		const debugParam = searchParams.get("debug") ?? searchParams.get("debugMode");
		return parseDebugFlag(debugParam);
	}, [searchParams]);

	const handleExportState = () => {
		const payload = {
			version: 1,
			exportedAt: new Date().toISOString(),
			state: {
				sections,
				globalStyle,
			},
		};

		const blob = new Blob([JSON.stringify(payload, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		link.href = url;
		link.download = `asb-editor-state-${timestamp}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			const raw = await file.text();
			const parsed = JSON.parse(raw) as unknown;
			const { sections: importedSections, globalStyle: importedGlobalStyle } =
				resolveImportedState(parsed);

			if (!importedSections) {
				throw new Error("Missing sections array in imported payload.");
			}

			loadSections(importedSections, importedGlobalStyle);
			saveToLocalStorage();
		} catch (error) {
			console.error("Failed to import editor state file.", error);
			window.alert("Import failed. Please choose a valid editor state JSON file.");
		} finally {
			event.target.value = "";
		}
	};

	if (!showDebugButtons) return null;

	return (
		<>
			<input
				ref={importInputRef}
				type="file"
				accept="application/json,.json"
				className="hidden"
				onChange={handleImportFile}
			/>
			<button
				onClick={() => importInputRef.current?.click()}
				className="flex items-center gap-1.5 rounded-xl border border-sidebar-border px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
				<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
					upload_file
				</span>
				Import
			</button>
			<button
				onClick={handleExportState}
				className="flex items-center gap-1.5 rounded-xl border border-sidebar-border px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
				<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
					download
				</span>
				Export
			</button>
		</>
	);
}
