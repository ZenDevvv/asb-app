import type { RefObject } from "react";
import { motion } from "framer-motion";
import { Icon } from "~/components/ui/icon";
import { fadeIn, fadeUp, stagger } from "./dashboard-constants";

interface DashboardProjectsSectionProps {
	projectsRef: RefObject<HTMLElement | null>;
	templatesRef: RefObject<HTMLElement | null>;
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	projectsInView: boolean;
	prefersReducedMotion: boolean | null;
	onCreateNewProject: () => void;
}

export function @DashboardProjectsSection({
	projectsRef,
	templatesRef,
	textareaRef,
	projectsInView,
	prefersReducedMotion,
	onCreateNewProject,
}: DashboardProjectsSectionProps) {
	const safeFadeUp = prefersReducedMotion ? fadeIn : fadeUp;

	return (
		<motion.section
			ref={projectsRef}
			variants={stagger}
			initial="hidden"
			animate={projectsInView ? "show" : "hidden"}
			className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
			<motion.div variants={safeFadeUp} className="mb-8 flex items-center justify-between">
				<div>
					<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
						My Projects
					</p>
					<h2 className="text-2xl font-bold tracking-tight">Your workspace</h2>
				</div>
				<button
					type="button"
					onClick={onCreateNewProject}
					className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-95">
					<Icon name="add" size={16} />
					New Project
				</button>
			</motion.div>

			<motion.div
				variants={safeFadeUp}
				className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center backdrop-blur-sm">
				<div
					className="pointer-events-none absolute inset-0 opacity-[0.04]"
					style={{
						backgroundImage:
							"radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
						backgroundSize: "22px 22px",
					}}
				/>
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.06),transparent_65%)]" />

				<div className="relative">
					<div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
						<motion.span
							className="absolute h-20 w-20 rounded-full border border-primary/15"
							animate={
								prefersReducedMotion ? {} : { scale: [1, 1.4], opacity: [0.5, 0] }
							}
							transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
						/>
						<motion.span
							className="absolute h-20 w-20 rounded-full border border-primary/10"
							animate={
								prefersReducedMotion ? {} : { scale: [1, 1.8], opacity: [0.4, 0] }
							}
							transition={{
								duration: 2.2,
								repeat: Infinity,
								ease: "easeOut",
								delay: 0.6,
							}}
						/>
						<div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 shadow-lg shadow-primary/10">
							<Icon name="rocket_launch" size={36} className="text-primary" filled />
						</div>
					</div>

					<h3 className="mb-2 text-xl font-bold">Your canvas awaits</h3>
					<p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
						You haven&apos;t created any projects yet. Describe your vision above or
						pick a template below to get started.
					</p>

					<div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
						<button
							type="button"
							onClick={() => {
								window.scrollTo({ top: 0, behavior: "smooth" });
								setTimeout(() => textareaRef.current?.focus(), 600);
							}}
							className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-95">
							<Icon name="auto_awesome" size={15} filled />
							Start with AI
						</button>
						<button
							type="button"
							onClick={() =>
								templatesRef.current?.scrollIntoView({ behavior: "smooth" })
							}
							className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 px-6 py-2.5 text-sm font-semibold backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/10">
							<Icon name="grid_view" size={15} />
							Browse Templates
						</button>
					</div>
				</div>
			</motion.div>
		</motion.section>
	);
}
