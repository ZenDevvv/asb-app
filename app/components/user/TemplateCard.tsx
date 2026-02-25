import { useState, type MouseEvent } from "react";
import { motion, type MotionProps, type Variants } from "framer-motion";
import { Icon } from "~/components/ui/icon";
import { getTemplateDescription, getTemplateTheme } from "~/lib/template-project-utils";
import { cn } from "~/lib/utils";
import type { TemplateProject } from "~/zod/templateProject.zod";

interface TemplatePreviewCanvasProps {
	thumbnail?: string;
	name: string;
	placeholderClassName: string;
}

function TemplatePreviewCanvas({
	thumbnail,
	name,
	placeholderClassName,
}: TemplatePreviewCanvasProps) {
	const [imageFailed, setImageFailed] = useState(false);

	if (thumbnail && !imageFailed) {
		return (
			<img
				src={thumbnail}
				alt={`${name} preview`}
				className="h-full w-full object-cover"
				onError={() => setImageFailed(true)}
			/>
		);
	}

	return (
		<div className={cn("relative h-full w-full", placeholderClassName)}>
			<div className="absolute left-5 right-5 top-6 rounded-2xl bg-white/90 p-4 shadow-xl shadow-slate-900/20">
				<div className="mb-3 flex items-center gap-1.5">
					<div className="h-2 w-2 rounded-full bg-slate-300" />
					<div className="h-2 w-2 rounded-full bg-slate-200" />
					<div className="h-2 w-2 rounded-full bg-slate-200" />
				</div>
				<div className="h-2 w-2/3 rounded-full bg-slate-200" />
				<div className="mt-2 h-2 w-1/2 rounded-full bg-slate-200" />
				<div className="mt-5 grid grid-cols-6 gap-1">
					{Array.from({ length: 24 }).map((_, index) => (
						<span key={index} className="h-2 rounded-full bg-slate-200/90" />
					))}
				</div>
			</div>
		</div>
	);
}

interface TemplateCardProps {
	template: TemplateProject;
	onClick: (templateId: string) => void;
	onPreviewClick?: (templateId: string) => void;
	variants?: Variants;
	custom?: number;
	shouldLiftOnHover?: boolean;
	className?: string;
}

export function TemplateCard({
	template,
	onClick,
	onPreviewClick,
	variants,
	custom,
	shouldLiftOnHover = true,
	className,
}: TemplateCardProps) {
	const templateTheme = getTemplateTheme(template.category);
	const description = getTemplateDescription(template);
	const whileHover: MotionProps["whileHover"] | undefined = shouldLiftOnHover
		? { y: -4, transition: { duration: 0.18 } }
		: undefined;

	function handlePreviewClick(event: MouseEvent<HTMLButtonElement>) {
		event.stopPropagation();
		onPreviewClick?.(template.id);
	}

	return (
		<motion.article
			variants={variants}
			custom={custom}
			whileHover={whileHover}
			onClick={() => onClick(template.id)}
			className={cn(
				"group relative cursor-pointer overflow-hidden rounded-[1.65rem] border border-slate-800/80 bg-slate-950/80 shadow-xl shadow-black/20",
				className,
			)}>
			<div
				className={cn(
					"relative flex min-h-[4.5rem] items-start gap-3 px-5 pb-4 pt-4",
					templateTheme.headerClassName,
				)}>
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-xl font-semibold text-white">{template.name}</h3>
					<p className="mt-0.5 line-clamp-1 text-sm text-white/75">{description}</p>
				</div>
				{onPreviewClick ? (
					<button
						type="button"
						onClick={handlePreviewClick}
						className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white/85 transition-colors hover:bg-black/40 hover:text-white"
						aria-label={`Preview ${template.name}`}>
						<Icon name="visibility" size={15} />
					</button>
				) : null}
			</div>

			<div
				className={cn(
					"relative overflow-hidden border-t border-white/10 px-3 pb-3 pt-2",
					templateTheme.surfaceClassName,
				)}>
				<div className="relative h-64 overflow-hidden rounded-[1.35rem] border border-white/35 bg-white/90 shadow-[0_20px_35px_-24px_rgba(15,23,42,0.8)]">
					<TemplatePreviewCanvas
						thumbnail={template.thumbnail}
						name={template.name}
						placeholderClassName={templateTheme.placeholderClassName}
					/>
					<div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/45 to-transparent" />
				</div>
			</div>
		</motion.article>
	);
}
