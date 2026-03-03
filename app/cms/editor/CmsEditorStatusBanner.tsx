import { AlertTriangle, WifiOff } from "lucide-react";

interface CmsEditorStatusBannerProps {
	saveError: string | null;
	offlineDraftRecovered: boolean;
}

export function CmsEditorStatusBanner({
	saveError,
	offlineDraftRecovered,
}: CmsEditorStatusBannerProps) {
	if (!saveError) return null;

	return (
		<div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
			{offlineDraftRecovered ? (
				<WifiOff className="h-3.5 w-3.5" />
			) : (
				<AlertTriangle className="h-3.5 w-3.5" />
			)}
			<span>{saveError}</span>
		</div>
	);
}
