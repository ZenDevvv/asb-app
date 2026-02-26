import type { RefObject } from "react";
import { motion } from "framer-motion";
import { Icon } from "~/components/ui/icon";
import type { Project } from "~/zod/project.zod";
import { fadeIn, fadeUp, stagger } from "./dashboard-constants";

interface DashboardProjectsSectionProps {
	projectsRef: RefObject<HTMLElement | null>;
	templatesRef: RefObject<HTMLElement | null>;
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	projectsInView: boolean;
	prefersReducedMotion: boolean | null;
	projects: Project[];
	projectCount: number;
	isProjectsLoading: boolean;
	isProjectsError: boolean;
	projectLoadError: unknown;
	onCreateNewProject: () => void;
	onProjectClick: (projectId: string) => void;
}

function formatRelativeTime(date: Date): string {
	const now = Date.now();
	const diff = now - new Date(date).getTime();
	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export function DashboardProjectsSection({
	projectsRef,
	templatesRef,
	textareaRef,
	projectsInView,
	prefersReducedMotion,
	projects,
	projectCount,
	isProjectsLoading,
	isProjectsError,
	projectLoadError,
	onCreateNewProject,
	onProjectClick,
}: DashboardProjectsSectionProps) {
	const safeFadeUp = prefersReducedMotion ? fadeIn : fadeUp;
	const hasProjects = projects.length > 0;

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

			{isProjectsLoading ? (
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5">
							<div className="mb-3 h-5 w-2/3 animate-pulse rounded-lg bg-muted/60" />
							<div className="mb-4 h-4 w-1/3 animate-pulse rounded-lg bg-muted/40" />
							<div className="flex items-center gap-3">
								<div className="h-3 w-20 animate-pulse rounded bg-muted/30" />
								<div className="h-3 w-16 animate-pulse rounded bg-muted/30" />
							</div>
						</div>
					))}
				</div>
			) : isProjectsError ? (
				<motion.div
					variants={safeFadeUp}
					className="rounded-3xl border border-destructive/35 bg-destructive/10 px-6 py-10 text-center">
					<p className="text-sm font-semibold text-destructive">
						Unable to load projects.
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{projectLoadError instanceof Error
							? projectLoadError.message
							: "Please try again shortly."}
					</p>
				</motion.div>
			) : hasProjects ? (
				<>
					<motion.div
						variants={stagger}
						initial="hidden"
						animate="show"
						className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{projects.map((project, index) => (
							<motion.article
								key={project.id}
								variants={safeFadeUp}
								custom={index}
								whileHover={
									prefersReducedMotion
										? undefined
										: { y: -4, transition: { duration: 0.18 } }
								}
								onClick={() => onProjectClick(project.slug)}
								className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card/70">
								<div className="p-5">
									<div className="mb-3 flex items-start justify-between gap-3">
										<h3 className="truncate text-base font-semibold">
											{project.name}
										</h3>
										<span
											className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
												project.status === "published"
													? "bg-emerald-500/15 text-emerald-400"
													: "bg-amber-500/15 text-amber-400"
											}`}>
											{project.status === "published" ? "Live" : "Draft"}
										</span>
									</div>

									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<span className="inline-flex items-center gap-1">
											<Icon name="schedule" size={13} />
											{formatRelativeTime(project.updatedAt)}
										</span>
										{project.publishedAt && (
											<span className="inline-flex items-center gap-1">
												<Icon name="public" size={13} />
												Published {formatRelativeTime(project.publishedAt)}
											</span>
										)}
									</div>
								</div>

								<div className="border-t border-border/40 px-5 py-3">
									<div className="flex items-center justify-between">
										<span className="text-xs text-muted-foreground/70">
											/{project.slug}
										</span>
										<Icon
											name="arrow_forward"
											size={14}
											className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
										/>
									</div>
								</div>
							</motion.article>
						))}
					</motion.div>

					{projectCount > projects.length && (
						<motion.div variants={safeFadeUp} className="mt-6 flex justify-center">
							<button
								type="button"
								onClick={onCreateNewProject}
								className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
								View all {projectCount} projects
								<Icon name="arrow_forward" size={14} />
							</button>
						</motion.div>
					)}
				</>
			) : (
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
									prefersReducedMotion
										? {}
										: { scale: [1, 1.4], opacity: [0.5, 0] }
								}
								transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
							/>
							<motion.span
								className="absolute h-20 w-20 rounded-full border border-primary/10"
								animate={
									prefersReducedMotion
										? {}
										: { scale: [1, 1.8], opacity: [0.4, 0] }
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
			)}
		</motion.section>
	);
}
