import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Icon } from "~/components/ui/icon";
import { useGetProjects } from "~/hooks/use-project";
import { resolveProjectEditorMode } from "~/lib/template-project-utils";

type ModeFilter = "all" | "website" | "cms";

function formatRelativeTime(date: Date): string {
	const now = Date.now();
	const diff = now - new Date(date).getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (diff < minute) return "just now";
	if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}m ago`;
	if (diff < day) return `${Math.max(1, Math.floor(diff / hour))}h ago`;
	return `${Math.max(1, Math.floor(diff / day))}d ago`;
}

export function meta() {
	return [{ title: "My Projects - AppSiteBuilder" }];
}

export default function UserProjectsRoute() {
	const navigate = useNavigate();
	const [modeFilter, setModeFilter] = useState<ModeFilter>("all");

	const { data, isLoading, isError, error } = useGetProjects({
		page: 1,
		limit: 120,
		fields: "id,name,slug,status,editorMode,updatedAt,publishedAt,createdAt,isDeleted",
		sort: "updatedAt",
		order: "desc",
		pagination: false,
		count: true,
	});

	const projects = useMemo(
		() => (data?.projects ?? []).filter((project) => !project.isDeleted),
		[data?.projects],
	);

	const counts = useMemo(() => {
		const website = projects.filter(
			(project) => resolveProjectEditorMode(project) === "website",
		).length;
		const cms = projects.filter(
			(project) => resolveProjectEditorMode(project) === "cms",
		).length;
		return {
			all: projects.length,
			website,
			cms,
		};
	}, [projects]);

	const filteredProjects = useMemo(() => {
		if (modeFilter === "all") return projects;
		return projects.filter((project) => resolveProjectEditorMode(project) === modeFilter);
	}, [modeFilter, projects]);

	return (
		<div className="mx-auto min-h-full w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
			<section className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-primary">
							Workspace
						</p>
						<h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Website and CMS projects in one place.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{(
							[
								["all", "All", counts.all],
								["website", "Website", counts.website],
								["cms", "CMS", counts.cms],
							] as const
						).map(([mode, label, count]) => (
							<button
								key={mode}
								type="button"
								onClick={() => setModeFilter(mode)}
								className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
									modeFilter === mode
										? "border-primary/40 bg-primary/15 text-primary"
										: "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
								}`}>
								{label} ({count})
							</button>
						))}
						<button
							type="button"
							onClick={() => navigate("/editor")}
							className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
							<Icon name="add" size={14} />
							New Project
						</button>
					</div>
				</div>
			</section>

			<section className="mt-6 rounded-2xl border border-border/70 bg-card/40 p-5">
				{isLoading ? (
					<div className="py-12 text-center text-sm text-muted-foreground">
						Loading projects...
					</div>
				) : isError ? (
					<div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-8 text-center text-sm text-destructive">
						{error instanceof Error ? error.message : "Failed to load projects."}
					</div>
				) : filteredProjects.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
							<Icon name="folder_open" size={28} />
						</div>
						<h2 className="text-lg font-semibold">
							No {modeFilter === "all" ? "" : `${modeFilter} `}projects yet
						</h2>
						<p className="max-w-md text-sm text-muted-foreground">
							Start from a template or create a blank project.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-2">
							<button
								type="button"
								onClick={() => navigate("/user/templates")}
								className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground">
								Browse Templates
							</button>
							<button
								type="button"
								onClick={() => navigate("/editor")}
								className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
								Create Blank Project
							</button>
						</div>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{filteredProjects.map((project, index) => {
							const mode = resolveProjectEditorMode(project);
							const isCms = mode === "cms";
							return (
								<motion.button
									key={project.id}
									type="button"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.24,
										delay: index * 0.03,
										ease: "easeOut",
									}}
									onClick={() => navigate(`/project/${project.slug}`)}
									className="group overflow-hidden rounded-2xl border border-border/70 bg-background/70 text-left transition-all hover:border-primary/40 hover:bg-background">
									<div
										className={`h-1 w-full ${
											isCms ? "bg-chart-5" : "bg-chart-2"
										}`}
									/>
									<div className="space-y-4 p-4">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<p className="truncate text-base font-semibold text-foreground">
													{project.name}
												</p>
												<p className="truncate text-xs text-muted-foreground">
													/{project.slug}
												</p>
											</div>
											<span
												className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${
													isCms
														? "border-chart-5/40 bg-chart-5/15 text-chart-5"
														: "border-chart-2/40 bg-chart-2/15 text-chart-2"
												}`}>
												{mode}
											</span>
										</div>

										<div className="flex flex-wrap items-center gap-2 text-xs">
											<span
												className={`rounded-full border px-2 py-0.5 ${
													project.status === "published"
														? "border-chart-2/40 bg-chart-2/15 text-chart-2"
														: "border-chart-4/40 bg-chart-4/15 text-chart-4"
												}`}>
												{project.status}
											</span>
											<span className="text-muted-foreground">
												Updated {formatRelativeTime(project.updatedAt)}
											</span>
										</div>

										<div className="flex items-center justify-between text-sm text-muted-foreground">
											<span className="inline-flex items-center gap-1">
												<Icon name="edit" size={14} />
												Open editor
											</span>
											<Icon
												name="arrow_forward"
												size={16}
												className="transition-transform group-hover:translate-x-0.5"
											/>
										</div>
									</div>
								</motion.button>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}
