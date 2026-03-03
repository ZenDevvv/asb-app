import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { useAuth } from "~/hooks/use-auth";
import { useCreateTemplateProject } from "~/hooks/use-template-project";
import { DEFAULT_GLOBAL_STYLE } from "~/stores/editorStore";
import { createDefaultCmsPersistedState } from "~/stores/displayStore";

interface CreateCmsTemplateModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const CATEGORY_OPTIONS = [
	"Signage",
	"Events",
	"Menu Board",
	"Broadcast",
	"Announcements",
	"Display",
] as const;

export function CreateCmsTemplateModal({ open, onOpenChange }: CreateCmsTemplateModalProps) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { mutateAsync: createTemplate, isPending } = useCreateTemplateProject();

	const [templateName, setTemplateName] = useState("");
	const [category, setCategory] = useState("");
	const [tags, setTags] = useState("");
	const [description, setDescription] = useState("");
	const [submitError, setSubmitError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setTemplateName("");
		setCategory("");
		setTags("");
		setDescription("");
		setSubmitError(null);
	}, [open]);

	const parsedTags = useMemo(
		() =>
			tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0),
		[tags],
	);

	const canSubmit = templateName.trim().length > 0 && category.length > 0 && !isPending;

	const handleCreate = async () => {
		const name = templateName.trim();
		if (!name || !category) {
			setSubmitError("Template name and category are required.");
			return;
		}
		if (!user?.id) {
			setSubmitError("You must be logged in to create a CMS template.");
			return;
		}

		setSubmitError(null);

		try {
			const created = await createTemplate({
				name,
				description: description.trim() || undefined,
				category,
				createdById: user.id,
				pages: [],
				globalStyle: { ...DEFAULT_GLOBAL_STYLE },
				editorMode: "cms",
				cmsState: createDefaultCmsPersistedState(),
				seo:
					parsedTags.length > 0 || description.trim().length > 0
						? {
								tags: parsedTags,
								summary: description.trim() || undefined,
							}
						: undefined,
				isActive: true,
				usageCount: 0,
				isDeleted: false,
			});

			onOpenChange(false);
			navigate(`/admin/cms/editor/${created.id}`);
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Failed to create CMS template.",
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="max-w-3xl overflow-hidden rounded-[2rem] border border-[#2e5852] bg-gradient-to-br from-[#173a36] via-[#173531] to-[#132c29] p-0 text-foreground shadow-2xl">
				<div className="flex flex-col">
					<DialogHeader className="border-b border-[#2f5d57] px-7 pb-5 pt-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<DialogTitle className="text-[2rem] font-semibold tracking-tight text-white">
									Create CMS Template
								</DialogTitle>
								<p className="mt-1.5 text-sm text-emerald-100/70">
									Create a blank CMS template for free-canvas display editing.
								</p>
							</div>
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="rounded-full p-2 text-emerald-100/70 transition hover:bg-white/10 hover:text-white"
								aria-label="Close create CMS template modal">
								<X className="h-5 w-5" />
							</button>
						</div>
					</DialogHeader>

					<div className="space-y-5 px-7 py-6">
						<div>
							<label className="mb-2 block text-sm font-medium text-emerald-100">
								Template Name <span className="text-primary">*</span>
							</label>
							<input
								value={templateName}
								onChange={(event) => setTemplateName(event.target.value)}
								placeholder="e.g., Lobby Announcements"
								className="h-12 w-full rounded-2xl border border-[#2f5f58] bg-[#0b2124]/65 px-4 text-sm text-white placeholder:text-emerald-100/30 focus:border-primary/70 focus:outline-none"
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="mb-2 block text-sm font-medium text-emerald-100">
									Category <span className="text-primary">*</span>
								</label>
								<Select value={category || undefined} onValueChange={setCategory}>
									<SelectTrigger className="h-12 w-full rounded-2xl border-[#2f5f58] bg-[#0b2124]/65 px-4 text-sm text-white data-[placeholder]:text-emerald-100/40">
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
									<SelectContent className="border-[#2f5f58] bg-[#0e2327] text-emerald-50">
										{CATEGORY_OPTIONS.map((option) => (
											<SelectItem key={option} value={option}>
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-emerald-100">
									Tags
								</label>
								<input
									value={tags}
									onChange={(event) => setTags(event.target.value)}
									placeholder="e.g., portrait, menu, event"
									className="h-12 w-full rounded-2xl border border-[#2f5f58] bg-[#0b2124]/65 px-4 text-sm text-white placeholder:text-emerald-100/30 focus:border-primary/70 focus:outline-none"
								/>
							</div>
						</div>

						<div>
							<label className="mb-2 block text-sm font-medium text-emerald-100">
								Description
							</label>
							<textarea
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								placeholder="Describe where this CMS template is used..."
								className="min-h-[112px] w-full rounded-2xl border border-[#2f5f58] bg-[#0b2124]/65 px-4 py-3 text-sm text-white placeholder:text-emerald-100/30 focus:border-primary/70 focus:outline-none"
							/>
						</div>

						{submitError ? (
							<div className="rounded-xl border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{submitError}
							</div>
						) : null}
					</div>

					<footer className="flex flex-wrap items-center justify-end gap-3 border-t border-[#2f5d57] px-7 py-5">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
							className="rounded-xl px-4 py-2 text-sm font-semibold text-emerald-100/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50">
							Cancel
						</button>
						<button
							type="button"
							onClick={handleCreate}
							disabled={!canSubmit}
							className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40 disabled:text-primary-foreground/80">
							{isPending ? "Creating..." : "Create CMS Template"}
							<ArrowRight className="h-4 w-4" />
						</button>
					</footer>
				</div>
			</DialogContent>
		</Dialog>
	);
}
