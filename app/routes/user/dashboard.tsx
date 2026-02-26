import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router";
import { DashboardBackground } from "~/components/user/dashboard/DashboardBackground";
import { DashboardHeroSection } from "~/components/user/dashboard/DashboardHeroSection";
import { DashboardProjectsSection } from "~/components/user/dashboard/DashboardProjectsSection";
import { DashboardTemplatesSection } from "~/components/user/dashboard/DashboardTemplatesSection";
import type { ToneId } from "~/components/user/dashboard/dashboard-constants";
import { useAuth } from "~/hooks/use-auth";
import { useGetProjects } from "~/hooks/use-project";
import { useGetTemplateProjects } from "~/hooks/use-template-project";
import {
	TEMPLATE_PROJECT_FIELDS,
	getTemplateCategories,
	getTemplateCategoryLabel,
} from "~/lib/template-project-utils";

export function meta() {
	return [{ title: "Dashboard - AppSiteBuilder" }];
}

export default function UserDashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const prefersReducedMotion = useReducedMotion();

	const [prompt, setPrompt] = useState("");
	const [tone, setTone] = useState<ToneId>("professional");
	const [activeCategory, setActiveCategory] = useState("All");
	const [chatFocused, setChatFocused] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const templatesRef = useRef<HTMLElement>(null);
	const projectsRef = useRef<HTMLElement>(null);

	const templatesInView = useInView(templatesRef, { once: true, margin: "-80px" });
	const projectsInView = useInView(projectsRef, { once: true, margin: "-80px" });

	const {
		data: projectData,
		isLoading: isProjectsLoading,
		isError: isProjectsError,
		error: projectLoadError,
	} = useGetProjects({
		page: 1,
		limit: 6,
		fields: "name,status,slug,createdAt,updatedAt,publishedAt",
		sort: "updatedAt",
		order: "desc",
		pagination: false,
		count: true,
	});

	const {
		data: templateData,
		isLoading: isTemplatesLoading,
		isError: isTemplatesError,
		error: templateLoadError,
	} = useGetTemplateProjects({
		page: 1,
		limit: 60,
		fields: TEMPLATE_PROJECT_FIELDS,
		sort: "usageCount",
		order: "desc",
		document: true,
		pagination: false,
		count: true,
	});

	const userProjects = useMemo(() => {
		const projects = projectData?.projects ?? [];
		return projects.filter((project) => !project.isDeleted);
	}, [projectData?.projects]);

	const projectCount = projectData?.count ?? userProjects.length;

	const templateProjects = useMemo(() => {
		const templates = templateData?.templateProjects ?? [];
		const nonDeleted = templates.filter((template) => !template.isDeleted);
		const activeTemplates = nonDeleted.filter((template) => template.isActive);
		return activeTemplates.length > 0 ? activeTemplates : nonDeleted;
	}, [templateData?.templateProjects]);

	const templateCategories = useMemo(
		() => getTemplateCategories(templateProjects),
		[templateProjects],
	);

	const filteredTemplates = useMemo(
		() =>
			activeCategory === "All"
				? templateProjects
				: templateProjects.filter(
						(template) =>
							getTemplateCategoryLabel(template.category) === activeCategory,
					),
		[activeCategory, templateProjects],
	);

	const templateCount = templateProjects.length;

	useEffect(() => {
		const element = textareaRef.current;
		if (!element) return;
		element.style.height = "auto";
		element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
	}, [prompt]);

	useEffect(() => {
		if (!templateCategories.includes(activeCategory)) {
			setActiveCategory("All");
		}
	}, [activeCategory, templateCategories]);

	function handleGenerate() {
		if (!prompt.trim()) return;
		navigate(`/editor?prompt=${encodeURIComponent(prompt.trim())}&tone=${tone}`);
	}

	const displayName = user?.userName || user?.email?.split("@")[0] || "Creator";

	return (
		<div className="relative overflow-x-hidden bg-background text-foreground">
			<DashboardBackground prefersReducedMotion={prefersReducedMotion} />

			<DashboardHeroSection
				displayName={displayName}
				prompt={prompt}
				tone={tone}
				chatFocused={chatFocused}
				textareaRef={textareaRef}
				prefersReducedMotion={prefersReducedMotion}
				onPromptChange={setPrompt}
				onToneChange={setTone}
				onChatFocusedChange={setChatFocused}
				onGenerate={handleGenerate}
			/>

			<DashboardProjectsSection
				projectsRef={projectsRef}
				templatesRef={templatesRef}
				textareaRef={textareaRef}
				projectsInView={projectsInView}
				prefersReducedMotion={prefersReducedMotion}
				projects={userProjects}
				projectCount={projectCount}
				isProjectsLoading={isProjectsLoading}
				isProjectsError={isProjectsError}
				projectLoadError={projectLoadError}
				onCreateNewProject={() => navigate("/editor")}
				onProjectClick={(slug) => navigate(`/project/${slug}`)}
			/>

			<DashboardTemplatesSection
				templatesRef={templatesRef}
				templatesInView={templatesInView}
				prefersReducedMotion={prefersReducedMotion}
				activeCategory={activeCategory}
				templateCategories={templateCategories}
				templateCount={templateCount}
				filteredTemplates={filteredTemplates}
				isTemplatesLoading={isTemplatesLoading}
				isTemplatesError={isTemplatesError}
				templateLoadError={templateLoadError}
				onResetCategory={() => setActiveCategory("All")}
				onCategoryChange={setActiveCategory}
				onTemplateClick={(templateId) => navigate(`/user/templates/${templateId}`)}
				onTemplatePreviewClick={(templateId) => navigate(`/view/${templateId}`)}
			/>
		</div>
	);
}
