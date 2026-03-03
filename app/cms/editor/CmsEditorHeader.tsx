import {
	ArrowLeft,
	Eye,
	Loader2,
	RotateCcw,
	Save,
	ScreenShare,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { CMSResolution } from "~/stores/displayStore";
import type { PresetOrientation } from "./cmsEditorHelpers";

interface CmsEditorHeaderProps {
	templateName: string;
	statusMessage: string;
	backButtonTitle?: string;
	presetOrientation: PresetOrientation;
	onSetOrientation: (target: PresetOrientation) => void;
	selectedPresetLabel: string;
	selectedPresetTriggerLabel: string;
	orientationPresets: CMSResolution[];
	isCustomPreset: boolean;
	resolution: CMSResolution;
	onPresetChange: (value: string) => void;
	onCustomDimensionChange: (key: "width" | "height", raw: string) => void;
	zoom: number;
	onZoomChange: (next: number) => void;
	isSaving: boolean;
	onBackToTemplates: () => void;
	onOpenPreview: () => void;
	onSave: () => void;
	onReset: () => void;
	onRenameTemplate?: (name: string) => void;
}

export function CmsEditorHeader({
	templateName,
	statusMessage,
	backButtonTitle = "Back to CMS templates",
	presetOrientation,
	onSetOrientation,
	selectedPresetLabel,
	selectedPresetTriggerLabel,
	orientationPresets,
	isCustomPreset,
	resolution,
	onPresetChange,
	onCustomDimensionChange,
	zoom,
	onZoomChange,
	isSaving,
	onBackToTemplates,
	onOpenPreview,
	onSave,
	onReset,
	onRenameTemplate,
}: CmsEditorHeaderProps) {
	const [isEditingName, setIsEditingName] = useState(false);
	const [nameInputValue, setNameInputValue] = useState(templateName);
	const nameInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isEditingName) {
			nameInputRef.current?.select();
		}
	}, [isEditingName]);

	useEffect(() => {
		if (!isEditingName) {
			setNameInputValue(templateName);
		}
	}, [templateName, isEditingName]);

	function handleNameClick() {
		if (!onRenameTemplate) return;
		setNameInputValue(templateName);
		setIsEditingName(true);
	}

	function handleNameBlur() {
		setIsEditingName(false);
		const trimmed = nameInputValue.trim();
		if (trimmed && trimmed !== templateName) {
			onRenameTemplate?.(trimmed);
		}
	}

	function handleNameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter") {
			nameInputRef.current?.blur();
		} else if (event.key === "Escape") {
			setIsEditingName(false);
		}
	}

	return (
		<header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-2">
			<div className="flex items-center gap-3">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={onBackToTemplates}
					className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
					title={backButtonTitle}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<ScreenShare className="h-4 w-4" />
				</div>
				<div>
					{isEditingName ? (
						<input
							ref={nameInputRef}
							value={nameInputValue}
							onChange={(event) => setNameInputValue(event.target.value)}
							onBlur={handleNameBlur}
							onKeyDown={handleNameKeyDown}
							className="w-48 border-b border-sidebar-foreground bg-transparent text-sm font-semibold text-sidebar-foreground outline-none"
						/>
					) : (
						<div
							className={`text-sm font-semibold text-sidebar-foreground ${
								onRenameTemplate ? "cursor-pointer hover:opacity-70" : ""
							}`}
							onClick={handleNameClick}>
							{templateName}
						</div>
					)}
					<div className="text-[10px] text-muted-foreground">{statusMessage}</div>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-0.5">
					<Button
						type="button"
						size="sm"
						variant={presetOrientation === "landscape" ? "default" : "ghost"}
						onClick={() => onSetOrientation("landscape")}
						className="h-7 rounded-lg px-2.5 text-xs">
						Landscape
					</Button>
					<Button
						type="button"
						size="sm"
						variant={presetOrientation === "portrait" ? "default" : "ghost"}
						onClick={() => onSetOrientation("portrait")}
						className="h-7 rounded-lg px-2.5 text-xs">
						Portrait
					</Button>
				</div>

				<Select value={selectedPresetLabel} onValueChange={onPresetChange}>
					<SelectTrigger
						size="sm"
						className="h-8 rounded-lg border-sidebar-border bg-sidebar-accent/30 text-xs text-sidebar-foreground hover:bg-sidebar-accent/50">
						<SelectValue>{selectedPresetTriggerLabel}</SelectValue>
					</SelectTrigger>
					<SelectContent className="border-sidebar-border bg-sidebar text-sidebar-foreground">
						{orientationPresets.map((preset) => (
							<SelectItem key={preset.label} value={preset.label}>
								{preset.label}
							</SelectItem>
						))}
						<SelectItem value="Custom">Custom</SelectItem>
					</SelectContent>
				</Select>

				{isCustomPreset ? (
					<div className="flex items-center gap-1">
						<Input
							type="number"
							min={320}
							max={7680}
							value={resolution.width}
							onChange={(event) =>
								onCustomDimensionChange("width", event.target.value)
							}
							className="h-8 w-20 rounded-lg border-sidebar-border bg-sidebar-accent/30 text-xs"
						/>
						<span className="text-xs text-muted-foreground">x</span>
						<Input
							type="number"
							min={320}
							max={4320}
							value={resolution.height}
							onChange={(event) =>
								onCustomDimensionChange("height", event.target.value)
							}
							className="h-8 w-20 rounded-lg border-sidebar-border bg-sidebar-accent/30 text-xs"
						/>
					</div>
				) : null}

				<div className="flex items-center rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-0.5">
					<button
						type="button"
						onClick={() => onZoomChange(zoom - 10)}
						className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
						<ZoomOut className="h-3.5 w-3.5" />
					</button>
					<span className="min-w-[44px] text-center text-xs font-medium text-sidebar-foreground">
						{zoom}%
					</span>
					<button
						type="button"
						onClick={() => onZoomChange(zoom + 10)}
						className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
						<ZoomIn className="h-3.5 w-3.5" />
					</button>
				</div>

				<Button type="button" variant="outline" size="sm" onClick={onOpenPreview}>
					<Eye className="h-3.5 w-3.5" />
					Preview
				</Button>

				<Button type="button" variant="outline" size="sm" onClick={onSave}>
					{isSaving ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<Save className="h-3.5 w-3.5" />
					)}
					Save
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onReset}
					className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
					<RotateCcw className="h-3.5 w-3.5" />
					Reset
				</Button>
			</div>
		</header>
	);
}
