import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ScreenShare } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/use-auth";
import { useGetTemplateProjects } from "~/hooks/use-template-project";
import { CMS_TEMPLATE_FILTER, TEMPLATE_PROJECT_FIELDS } from "~/lib/template-project-utils";
import type { TemplateProject } from "~/zod/templateProject.zod";

function getCmsBlockCount(template: TemplateProject): number {
	const state = template.cmsState;
	if (!state || typeof state !== "object") return 0;
	const blocks = (state as { blocks?: unknown }).blocks;
	return Array.isArray(blocks) ? blocks.length : 0;
}

export default function UserCmsTemplatesPage() {
	const navigate = useNavigate();
	const { user, isLoading: isAuthLoading } = useAuth();
	const [query, setQuery] = useState("");

	useEffect(() => {
		if (isAuthLoading) return;
		if (!user) {
			navigate("/login", { replace: true });
		}
	}, [isAuthLoading, navigate, user]);

	const { data, isLoading, isError, error } = useGetTemplateProjects({
		page: 1,
		limit: 80,
		fields: TEMPLATE_PROJECT_FIELDS,
		query: query.trim(),
		filter: CMS_TEMPLATE_FILTER,
		sort: "usageCount",
		order: "desc",
		document: true,
		pagination: false,
		count: true,
	});

	const templates = useMemo(() => {
		const records = data?.templateProjects ?? [];
		const nonDeleted = records.filter((item) => !item.isDeleted);
		const active = nonDeleted.filter((item) => item.isActive);
		return active.length > 0 ? active : nonDeleted;
	}, [data?.templateProjects]);

	return (
		<div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
			<div className="rounded-3xl border border-border/60 bg-card/50 p-6 backdrop-blur">
				<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-primary">
							CMS Templates
						</p>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Choose a display template
						</h1>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate("/user/dashboard")}>
						Back to Dashboard
					</Button>
				</div>

				<div className="mb-6">
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search CMS templates"
						className="max-w-md"
					/>
				</div>

				{isLoading || isAuthLoading ? (
					<div className="py-12 text-center text-sm text-muted-foreground">
						Loading CMS templates...
					</div>
				) : isError ? (
					<div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-8 text-center text-sm text-destructive">
						{error instanceof Error ? error.message : "Failed to load CMS templates."}
					</div>
				) : templates.length === 0 ? (
					<div className="rounded-2xl border border-border/70 bg-background/50 px-4 py-12 text-center text-sm text-muted-foreground">
						No CMS templates found.
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{templates.map((template) => (
							<button
								key={template.id}
								type="button"
								onClick={() => navigate(`/user/cms/templates/${template.id}`)}
								className="text-left overflow-hidden rounded-2xl border border-border/70 bg-background/55 p-4 transition hover:border-primary/50 hover:bg-background/80">
								<div className="mb-3 flex items-start justify-between gap-2">
									<div className="flex min-w-0 items-center gap-2">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<ScreenShare className="h-4 w-4" />
										</div>
										<div className="min-w-0">
											<div className="truncate text-sm font-semibold text-foreground">
												{template.name}
											</div>
											<div className="truncate text-xs text-muted-foreground">
												{template.category || "Display"}
											</div>
										</div>
									</div>
									<span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
										{template.usageCount} uses
									</span>
								</div>
								<div className="text-xs text-muted-foreground">
									{getCmsBlockCount(template)} blocks
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
