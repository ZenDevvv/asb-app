import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Plus, ScreenShare, Search } from "lucide-react";
import { CreateCmsTemplateModal } from "~/components/admin/CreateCmsTemplateModal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/use-auth";
import { useGetTemplateProjects } from "~/hooks/use-template-project";
import { CMS_TEMPLATE_FILTER, TEMPLATE_PROJECT_FIELDS } from "~/lib/template-project-utils";
import type { TemplateProject } from "~/zod/templateProject.zod";

function formatRelativeTime(date: Date): string {
	const now = Date.now();
	const diffMs = Math.max(0, now - new Date(date).getTime());
	const hour = 60 * 60 * 1000;
	const day = 24 * hour;

	if (diffMs < day) {
		const hours = Math.max(1, Math.floor(diffMs / hour));
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	}
	if (diffMs < 7 * day) {
		const days = Math.floor(diffMs / day);
		return `${days} day${days === 1 ? "" : "s"} ago`;
	}

	const weeks = Math.max(1, Math.floor(diffMs / (7 * day)));
	return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

function getCmsBlockCount(template: TemplateProject): number {
	const state = template.cmsState;
	if (!state || typeof state !== "object") return 0;
	const blocks = (state as { blocks?: unknown }).blocks;
	return Array.isArray(blocks) ? blocks.length : 0;
}

export default function CmsTemplatesPage() {
	const navigate = useNavigate();
	const { user, isLoading: isAuthLoading } = useAuth();
	const [query, setQuery] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	useEffect(() => {
		if (isAuthLoading) return;
		if (!user) {
			navigate("/login", { replace: true });
			return;
		}
		if (user.role !== "admin") {
			navigate("/user/dashboard", { replace: true });
		}
	}, [isAuthLoading, navigate, user]);

	const { data, isLoading, isError, error } = useGetTemplateProjects({
		page: 1,
		limit: 100,
		fields: TEMPLATE_PROJECT_FIELDS,
		query: query.trim(),
		filter: CMS_TEMPLATE_FILTER,
		sort: "updatedAt",
		order: "desc",
		document: true,
		pagination: false,
		count: true,
	});

	const templates = useMemo(() => data?.templateProjects ?? [], [data?.templateProjects]);

	return (
		<div className="min-h-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-background to-background text-foreground shadow-xl">
			<header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 lg:px-6">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						CMS Template Library
					</h1>
					<p className="mt-1 text-xs text-muted-foreground sm:text-sm">
						Admin-only templates for free-canvas CMS displays.
					</p>
				</div>
				<Button type="button" onClick={() => setIsCreateModalOpen(true)}>
					<Plus className="h-4 w-4" />
					Create CMS Template
				</Button>
			</header>

			<div className="space-y-4 px-5 py-5 lg:px-6">
				<div className="rounded-2xl border border-border bg-card/65 p-3 shadow-sm">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<label className="relative flex-1">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								type="search"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search CMS templates"
								className="h-11 rounded-2xl border-border bg-background/85 pl-11 pr-4 text-sm"
							/>
						</label>
						<div className="text-xs text-muted-foreground">
							{data?.count ?? templates.length} CMS template
							{(data?.count ?? templates.length) === 1 ? "" : "s"}
						</div>
					</div>
				</div>

				<div className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-sm">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[840px] border-separate border-spacing-0">
							<thead className="bg-sidebar-accent/65">
								<tr className="text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
									<th className="px-5 py-3.5 font-semibold">Template</th>
									<th className="px-5 py-3.5 font-semibold">Category</th>
									<th className="px-5 py-3.5 font-semibold">Blocks</th>
									<th className="px-5 py-3.5 font-semibold">Updated</th>
									<th className="px-5 py-3.5 font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody>
								{isLoading || isAuthLoading ? (
									<tr>
										<td
											className="px-5 py-12 text-center text-sm text-muted-foreground"
											colSpan={5}>
											Loading CMS templates...
										</td>
									</tr>
								) : isError ? (
									<tr>
										<td
											className="px-5 py-12 text-center text-sm text-destructive"
											colSpan={5}>
											{error instanceof Error
												? error.message
												: "Failed to load CMS templates."}
										</td>
									</tr>
								) : templates.length > 0 ? (
									templates.map((template) => (
										<tr
											key={template.id}
											onClick={() =>
												navigate(`/admin/cms/editor/${template.id}`)
											}
											className="cursor-pointer border-t border-border/80 text-sm text-foreground transition hover:bg-background/45">
											<td className="px-5 py-4">
												<div className="flex items-start gap-3">
													<div className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
														<ScreenShare className="h-4 w-4" />
													</div>
													<div className="min-w-0">
														<p className="truncate font-semibold leading-tight text-foreground">
															{template.name}
														</p>
														<p className="mt-1 truncate text-xs text-muted-foreground">
															{template.id}
														</p>
													</div>
												</div>
											</td>
											<td className="px-5 py-4 text-muted-foreground">
												{template.category || "Display"}
											</td>
											<td className="px-5 py-4">
												<span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
													{getCmsBlockCount(template)} blocks
												</span>
											</td>
											<td className="px-5 py-4 text-muted-foreground">
												{formatRelativeTime(template.updatedAt)}
											</td>
											<td className="px-5 py-4">
												<div className="flex items-center gap-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={(event) => {
															event.stopPropagation();
															navigate(
																`/admin/cms/view/${template.id}`,
															);
														}}>
														<Eye className="h-3.5 w-3.5" />
														View
													</Button>
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											className="px-5 py-12 text-center text-sm text-muted-foreground"
											colSpan={5}>
											No CMS templates found.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<CreateCmsTemplateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
		</div>
	);
}
