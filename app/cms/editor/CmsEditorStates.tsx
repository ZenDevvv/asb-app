import { Button } from "~/components/ui/button";

export function CmsEditorMissingTemplateState() {
	return (
		<div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
			Missing CMS template id.
		</div>
	);
}

interface CmsEditorLoadErrorStateProps {
	error: unknown;
	onBackToTemplates: () => void;
}

export function CmsEditorLoadErrorState({
	error,
	onBackToTemplates,
}: CmsEditorLoadErrorStateProps) {
	return (
		<div className="flex h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-xl rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
				<div className="font-semibold">Unable to load CMS template</div>
				<div className="mt-2 text-muted-foreground">
					{error instanceof Error ? error.message : "Please try again."}
				</div>
				<div className="mt-4">
					<Button type="button" onClick={onBackToTemplates}>
						Back to CMS Templates
					</Button>
				</div>
			</div>
		</div>
	);
}
