import { nanoid } from "nanoid";
import { ArrowRight, Check, LayoutTemplate, Square, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { DEFAULT_SECTION_SEQUENCE, SECTION_REGISTRY } from "~/config/sectionRegistry";
import { getLayoutById } from "~/config/layoutTemplates";
import { useAuth } from "~/hooks/use-auth";
import { useCreateTemplateProject } from "~/hooks/use-template-project";
import { cn } from "~/lib/utils";
import { DEFAULT_GLOBAL_STYLE } from "~/stores/editorStore";
import type {
	Block,
	GlobalStyle,
	Group,
	LayoutTemplate as LayoutTemplateType,
	Section,
	SectionType,
} from "~/types/editor";

type InitialStructure = "blank" | "basic";

interface CreateTemplateModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fallbackCreatedById?: string;
}

interface TemplatePageSeed {
	id: string;
	name: string;
	slug: string;
	isDefault: boolean;
	sections: Section[];
}

const CATEGORY_OPTIONS = [
	"Marketing",
	"SaaS",
	"Business",
	"Personal",
	"Retail",
	"Content",
] as const;

function getSafeLayout(layoutId?: string): LayoutTemplateType {
	if (layoutId) {
		const byId = getLayoutById(layoutId);
		if (byId) return { ...byId, spans: [...byId.spans], slots: [...byId.slots] };
	}

	const fallback = getLayoutById("1col");
	if (fallback) return { ...fallback, spans: [...fallback.spans], slots: [...fallback.slots] };

	return {
		id: "1col",
		label: "Centered",
		spans: [6],
		alignment: "center",
		reversed: false,
		slots: ["main"],
	};
}

function cloneBlockSeed(block: Omit<Block, "id">): Block {
	return {
		...block,
		id: nanoid(10),
		props: { ...block.props },
		style: { ...block.style },
	};
}

function normalizeBlocksBySlotOrder(blocks: Block[], slots: string[]) {
	if (slots.length === 0) return;
	const flowBlocks = blocks.filter((block) => block.style.positionMode !== "absolute");
	if (flowBlocks.length === 0) return;

	const validSlots = new Set(slots);
	const fallbackSlot = slots[0];

	flowBlocks.forEach((block) => {
		if (!validSlots.has(block.slot)) {
			block.slot = fallbackSlot;
		}
	});

	slots.forEach((slot) => {
		const blocksInSlot = flowBlocks
			.filter((block) => block.slot === slot)
			.sort((a, b) => a.order - b.order);

		blocksInSlot.forEach((block, index) => {
			block.order = index;
		});
	});
}

function buildDefaultGroups(sectionType: SectionType): Group[] {
	const registry = SECTION_REGISTRY[sectionType];
	const fallbackLayout = getSafeLayout(registry.defaultLayoutId);

	const groupsFromRegistry = registry.defaultGroups?.length
		? registry.defaultGroups.map((seed, index) => {
				const layout = getSafeLayout(seed.layoutId);
				return {
					id: nanoid(10),
					label: seed.label || `Group ${index + 1}`,
					order: index,
					layout,
					blocks: seed.blocks.map((block) => cloneBlockSeed(block)),
					style: seed.style ? { ...seed.style } : {},
				} satisfies Group;
			})
		: null;

	const groups = groupsFromRegistry ?? [
		{
			id: nanoid(10),
			label: "Main Group",
			order: 0,
			layout: fallbackLayout,
			blocks: registry.defaultBlocks.map((block) => cloneBlockSeed(block)),
			style: {},
		} satisfies Group,
	];

	groups.forEach((group) => {
		normalizeBlocksBySlotOrder(group.blocks, group.layout.slots);
	});

	return groups;
}

function buildBasicSections(): Section[] {
	return DEFAULT_SECTION_SEQUENCE.map((type) => ({
		id: nanoid(10),
		type,
		label: SECTION_REGISTRY[type].label,
		groups: buildDefaultGroups(type),
		style: {
			...SECTION_REGISTRY[type].defaultStyle,
			colorMode: "global",
		},
		isVisible: true,
	}));
}

function buildPages(structure: InitialStructure): TemplatePageSeed[] {
	return [
		{
			id: nanoid(10),
			name: "Home",
			slug: "/",
			isDefault: true,
			sections: structure === "basic" ? buildBasicSections() : [],
		},
	];
}

function cloneDefaultGlobalStyle(): GlobalStyle {
	return { ...DEFAULT_GLOBAL_STYLE };
}

export function CreateTemplateModal({
	open,
	onOpenChange,
	fallbackCreatedById,
}: CreateTemplateModalProps) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { mutateAsync: createTemplate, isPending } = useCreateTemplateProject();

	const [templateName, setTemplateName] = useState("");
	const [category, setCategory] = useState("");
	const [tags, setTags] = useState("");
	const [description, setDescription] = useState("");
	const [structure, setStructure] = useState<InitialStructure>("blank");
	const [submitError, setSubmitError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setTemplateName("");
		setCategory("");
		setTags("");
		setDescription("");
		setStructure("blank");
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
		const safeName = templateName.trim();
		if (!safeName || !category) {
			setSubmitError("Template name and category are required.");
			return;
		}

		setSubmitError(null);
		const createdById = user?.id || fallbackCreatedById || "unknown"; // Fallback to "unknown" if no user ID is available
		const pages = buildPages(structure);
		const seo =
			parsedTags.length > 0 || description.trim().length > 0
				? {
						tags: parsedTags,
						summary: description.trim() || undefined,
					}
				: undefined;

		try {
			await createTemplate({
				name: safeName,
				description: description.trim() || undefined,
				category,
				createdById,
				pages,
				globalStyle: cloneDefaultGlobalStyle(),
				seo,
				isActive: true,
				usageCount: 0,
				isDeleted: false,
			});

			onOpenChange(false);
			navigate("/editor", { state: { editorSeed: structure } });
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Failed to create template.");
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
									Create New Template
								</DialogTitle>
								<p className="mt-1.5 text-sm text-emerald-100/70">
									Configure the basic settings for your new website template.
								</p>
							</div>
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="rounded-full p-2 text-emerald-100/70 transition hover:bg-white/10 hover:text-white"
								aria-label="Close create template modal">
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
								placeholder="e.g., Modern SaaS Landing Page"
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
									placeholder="e.g., dark-mode, minimal"
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
								placeholder="Briefly describe the purpose and style of this template..."
								className="min-h-[112px] w-full rounded-2xl border border-[#2f5f58] bg-[#0b2124]/65 px-4 py-3 text-sm text-white placeholder:text-emerald-100/30 focus:border-primary/70 focus:outline-none"
							/>
						</div>

						<div>
							<h3 className="mb-3 text-sm font-medium text-emerald-100">
								Initial Structure
							</h3>
							<div className="grid gap-3 sm:grid-cols-2">
								<button
									type="button"
									onClick={() => setStructure("blank")}
									className={cn(
										"rounded-2xl border p-4 text-left transition",
										structure === "blank"
											? "border-primary bg-primary/15"
											: "border-[#2f5f58] bg-[#0b2124]/65 hover:border-primary/40",
									)}>
									<div className="flex items-start gap-3">
										<span
											className={cn(
												"mt-[2px] flex h-4 w-4 items-center justify-center rounded-full border",
												structure === "blank"
													? "border-primary bg-primary/20"
													: "border-emerald-100/35",
											)}>
											{structure === "blank" ? (
												<span className="h-2 w-2 rounded-full bg-primary" />
											) : null}
										</span>
										<div className="min-w-0">
											<div className="flex items-center gap-2 text-base font-semibold text-white">
												<Square className="h-4 w-4 text-primary" />
												Blank State
											</div>
											<p className="mt-1 text-sm text-emerald-100/65">
												Start with an empty canvas and build from scratch.
											</p>
										</div>
									</div>
								</button>

								<button
									type="button"
									onClick={() => setStructure("basic")}
									className={cn(
										"rounded-2xl border p-4 text-left transition",
										structure === "basic"
											? "border-primary bg-primary/15"
											: "border-[#2f5f58] bg-[#0b2124]/65 hover:border-primary/40",
									)}>
									<div className="flex items-start gap-3">
										<span
											className={cn(
												"mt-[2px] flex h-4 w-4 items-center justify-center rounded-full border",
												structure === "basic"
													? "border-primary bg-primary/20"
													: "border-emerald-100/35",
											)}>
											{structure === "basic" ? (
												<Check className="h-2.5 w-2.5 text-primary" />
											) : null}
										</span>
										<div className="min-w-0">
											<div className="flex items-center gap-2 text-base font-semibold text-white">
												<LayoutTemplate className="h-4 w-4 text-primary" />
												Basic Layout
											</div>
											<p className="mt-1 text-sm text-emerald-100/65">
												Includes header, footer, and a hero section.
											</p>
										</div>
									</div>
								</button>
							</div>
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
							className={cn(
								"inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition",
								canSubmit
									? "bg-primary text-primary-foreground hover:bg-primary/90"
									: "cursor-not-allowed bg-primary/40 text-primary-foreground/80",
							)}>
							{isPending ? "Creating..." : "Create & Open Editor"}
							<ArrowRight className="h-4 w-4" />
						</button>
					</footer>
				</div>
			</DialogContent>
		</Dialog>
	);
}
