import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, useReducedMotion, useInView, AnimatePresence, type Variants } from "framer-motion";
import { useAuth } from "~/hooks/use-auth";
import { Icon } from "~/components/ui/icon";
import { useGetTemplateProjects } from "~/hooks/use-template-project";
import {
	TEMPLATE_PROJECT_FIELDS,
	getTemplateCategories,
	getTemplateCategoryLabel,
	getTemplateDescription,
	getTemplateTheme,
} from "~/lib/template-project-utils";
import { cn } from "~/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting() {
	const h = new Date().getHours();
	if (h < 5) return "Working late";
	if (h < 12) return "Good morning";
	if (h < 17) return "Good afternoon";
	return "Good evening";
}

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
	},
};
const fadeIn: Variants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.4 } },
};
const stagger: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

// ─── Static Data ─────────────────────────────────────────────────────────────
const TONES = [
	{ id: "professional", label: "Professional", icon: "business_center" },
	{ id: "creative", label: "Creative", icon: "palette" },
	{ id: "minimal", label: "Minimal", icon: "crop_square" },
	{ id: "bold", label: "Bold", icon: "bolt" },
] as const;
type ToneId = (typeof TONES)[number]["id"];

const TONE_GLOWS: Record<ToneId, string> = {
	professional: "radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.28) 0%, transparent 68%)",
	creative: "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.28) 0%, transparent 68%)",
	minimal: "radial-gradient(ellipse at 50% 100%, rgba(100,116,139,0.18) 0%, transparent 68%)",
	bold: "radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.28) 0%, transparent 68%)",
};

const QUICK_PROMPTS = [
	"A SaaS pricing page for my startup",
	"A minimal portfolio for a designer",
	"A cozy landing page for a coffee shop",
	"A crypto analytics dashboard",
	"A bold agency showcase with dark theme",
	"A blog for a tech writer",
];

function TemplatePreviewCanvas({
	thumbnail,
	name,
	placeholderClassName,
}: {
	thumbnail?: string;
	name: string;
	placeholderClassName: string;
}) {
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

export function meta() {
	return [{ title: "Dashboard — AppSiteBuilder" }];
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

	const safeFadeUp = prefersReducedMotion ? (fadeIn as Variants) : fadeUp;
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

	// Auto-resize textarea
	useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
	}, [prompt]);

	useEffect(() => {
		if (!templateCategories.includes(activeCategory)) {
			setActiveCategory("All");
		}
	}, [activeCategory, templateCategories]);

	const handleGenerate = () => {
		if (!prompt.trim()) return;
		navigate(`/editor?prompt=${encodeURIComponent(prompt.trim())}&tone=${tone}`);
	};

	const displayName = user?.userName || user?.email?.split("@")[0] || "Creator";

	return (
		<div className="relative overflow-x-hidden bg-background text-foreground">
			{/* ── Ambient Background ─────────────────────────────────── */}
			<div className="pointer-events-none fixed inset-0 -z-10">
				<motion.div
					className="absolute -top-48 left-1/2 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
					animate={
						prefersReducedMotion
							? { opacity: 1 }
							: { opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] }
					}
					transition={
						prefersReducedMotion
							? {}
							: { duration: 14, repeat: Infinity, ease: "easeInOut" }
					}
				/>
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(34,211,238,0.07),transparent_50%),radial-gradient(ellipse_at_100%_100%,rgba(139,92,246,0.06),transparent_50%)]" />
				<div
					className="absolute inset-0 opacity-[0.022]"
					style={{
						backgroundImage:
							"linear-gradient(hsl(var(--border)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--border)) 1px,transparent 1px)",
						backgroundSize: "48px 48px",
					}}
				/>
			</div>

			{/* ── Hero / AI Chatbox ──────────────────────────────────── */}
			<section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-12 pt-16 text-center md:px-10 md:pt-20">
				{/* Left floating card — Recent Activity */}
				<motion.div
					className="pointer-events-none absolute left-0 top-12 hidden w-52 rounded-2xl border border-border/60 bg-card/55 p-4 shadow-xl backdrop-blur-xl lg:block xl:-left-4"
					initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -28 }}
					animate={
						prefersReducedMotion
							? { opacity: 1, x: 0 }
							: { opacity: 1, x: 0, y: [0, -10, 0] }
					}
					transition={
						prefersReducedMotion
							? { duration: 0.4, delay: 0.7 }
							: { duration: 5.5, delay: 0.9, ease: "easeInOut", repeat: Infinity }
					}>
					<div className="mb-3 flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-chart-3/20">
							<Icon name="history" size={13} className="text-chart-3" />
						</div>
						<span className="text-xs font-semibold text-foreground">
							Recent activity
						</span>
					</div>
					{[
						{ text: "SaaS page generated", time: "2m ago", dot: "bg-chart-1/70" },
						{ text: "Portfolio published", time: "1h ago", dot: "bg-chart-2/70" },
						{ text: "Template forked", time: "3h ago", dot: "bg-chart-5/70" },
					].map(({ text, time, dot }) => (
						<div key={text} className="mt-2.5 flex items-center gap-2">
							<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
							<span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
								{text}
							</span>
							<span className="shrink-0 text-[10px] text-muted-foreground/55">
								{time}
							</span>
						</div>
					))}
				</motion.div>

				{/* Right floating card — AI Capabilities */}
				<motion.div
					className="pointer-events-none absolute right-0 top-16 hidden w-48 rounded-2xl border border-border/60 bg-card/55 p-4 shadow-xl backdrop-blur-xl lg:block xl:-right-2"
					initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 28 }}
					animate={
						prefersReducedMotion
							? { opacity: 1, x: 0 }
							: { opacity: 1, x: 0, y: [0, 10, 0] }
					}
					transition={
						prefersReducedMotion
							? { duration: 0.4, delay: 0.85 }
							: { duration: 5, delay: 1.1, ease: "easeInOut", repeat: Infinity }
					}>
					<div className="mb-3 flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20">
							<Icon name="auto_awesome" size={13} className="text-primary" filled />
						</div>
						<span className="text-xs font-semibold">AI Ready</span>
					</div>
					{[
						{ icon: "psychology", label: "Context-aware" },
						{ icon: "layers", label: "Multi-section" },
						{ icon: "speed", label: "< 10 s build" },
						{ icon: "palette", label: "Auto-styled" },
					].map(({ icon, label }) => (
						<div key={label} className="mt-2 flex items-center gap-2">
							<Icon name={icon} size={13} className="shrink-0 text-primary/70" />
							<span className="text-[11px] text-muted-foreground">{label}</span>
						</div>
					))}
				</motion.div>

				{/* Greeting label */}
				<motion.p
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.04 }}
					className="text-xs font-semibold uppercase tracking-widest text-primary">
					{getGreeting()},
				</motion.p>

				{/* Name headline */}
				<motion.h1
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.1 }}
					className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
					<span className="bg-gradient-to-r from-foreground via-foreground/85 to-foreground/60 bg-clip-text text-transparent">
						{displayName}.
					</span>
				</motion.h1>

				<motion.p
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.16 }}
					className="mt-3 text-lg text-muted-foreground">
					What will you bring to life today?
				</motion.p>

				{/* ── AI Chatbox ───────────────────────────────────────── */}
				<motion.div
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.24 }}
					className="relative mt-10 w-full max-w-3xl">
					{/* Tone-reactive aurora glow */}
					<motion.div
						className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] opacity-70 blur-2xl"
						animate={{ background: TONE_GLOWS[tone] }}
						transition={{ duration: 0.6, ease: "easeInOut" }}
					/>

					{/* Chatbox card */}
					<motion.div
						animate={
							chatFocused
								? { borderColor: "rgba(34,211,238,0.45)" }
								: { borderColor: "rgba(255,255,255,0.12)" }
						}
						transition={{ duration: 0.25 }}
						className="overflow-hidden rounded-[1.75rem] border bg-card/75 shadow-2xl shadow-black/20 backdrop-blur-xl">
						{/* Top bar: model hint */}
						<div className="flex items-center gap-2 border-b border-border/40 px-5 py-2.5">
							<span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/20">
								<Icon
									name="auto_awesome"
									size={12}
									className="text-primary"
									filled
								/>
							</span>
							<span className="text-xs font-medium text-muted-foreground">
								ASB AI Generator
							</span>
							<span className="ml-auto inline-flex items-center gap-1 rounded-full bg-chart-3/15 px-2 py-0.5 text-[10px] font-semibold text-chart-3">
								<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-3" />
								Online
							</span>
						</div>

						{/* Textarea */}
						<div className="px-5 pt-4 pb-3">
							<textarea
								ref={textareaRef}
								value={prompt}
								onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
								onFocus={() => setChatFocused(true)}
								onBlur={() => setChatFocused(false)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
										handleGenerate();
								}}
								placeholder="Describe your website... e.g. 'A bold SaaS landing page for a project management tool — dark theme, pricing section, and waitlist form'"
								className="minimal-scrollbar w-full resize-none bg-transparent text-base leading-relaxed text-foreground placeholder:text-muted-foreground/45 focus:outline-none"
								style={{ minHeight: 80, maxHeight: 180 }}
							/>
						</div>

						{/* Toolbar */}
						<div className="flex flex-col gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center">
							{/* Tone selector */}
							<div className="flex flex-wrap items-center gap-1.5">
								<span className="shrink-0 text-xs text-muted-foreground/70">
									Tone:
								</span>
								{TONES.map(({ id, label, icon }) => (
									<button
										key={id}
										type="button"
										onClick={() => setTone(id)}
										className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
											tone === id
												? "bg-primary/20 text-primary ring-1 ring-primary/40"
												: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
										}`}>
										<Icon name={icon} size={11} />
										{label}
									</button>
								))}
							</div>

							{/* Right: char count + generate */}
							<div className="flex shrink-0 items-center gap-3 sm:ml-auto">
								<span className="text-xs tabular-nums text-muted-foreground">
									{prompt.length}
									<span className="text-muted-foreground/40">/500</span>
								</span>
								<button
									type="button"
									onClick={handleGenerate}
									disabled={!prompt.trim()}
									className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40">
									<Icon name="auto_awesome" size={15} filled />
									Generate
									<kbd className="hidden rounded border border-primary-foreground/25 px-1.5 py-0.5 font-mono text-[10px] sm:block">
										⌘↵
									</kbd>
								</button>
							</div>
						</div>
					</motion.div>
				</motion.div>

				{/* Quick prompt chips */}
				<motion.div
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.33 }}
					className="mt-5 flex flex-wrap items-center justify-center gap-2">
					<span className="text-xs text-muted-foreground/60">Try:</span>
					{QUICK_PROMPTS.map((qp) => (
						<button
							key={qp}
							type="button"
							onClick={() => {
								setPrompt(qp);
								textareaRef.current?.focus();
							}}
							className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground active:scale-95">
							{qp}
						</button>
					))}
				</motion.div>

				{/* Scroll hint */}
				<motion.div
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.5 }}
					className="mt-12 flex flex-col items-center gap-1.5">
					<span className="text-xs text-muted-foreground/50">scroll to explore</span>
					<motion.div
						animate={prefersReducedMotion ? {} : { y: [0, 5, 0] }}
						transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
						<Icon
							name="keyboard_arrow_down"
							size={18}
							className="text-muted-foreground/40"
						/>
					</motion.div>
				</motion.div>
			</section>

			{/* ── My Projects ────────────────────────────────────────── */}
			<motion.section
				ref={projectsRef}
				variants={stagger}
				initial="hidden"
				animate={projectsInView ? "show" : "hidden"}
				className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
				<motion.div
					variants={safeFadeUp}
					className="mb-8 flex items-center justify-between">
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
							My Projects
						</p>
						<h2 className="text-2xl font-bold tracking-tight">Your workspace</h2>
					</div>
					<button
						type="button"
						onClick={() => navigate("/editor")}
						className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-95">
						<Icon name="add" size={16} />
						New Project
					</button>
				</motion.div>

				{/* Empty state */}
				<motion.div
					variants={safeFadeUp}
					className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center backdrop-blur-sm">
					{/* Dot grid texture */}
					<div
						className="pointer-events-none absolute inset-0 opacity-[0.04]"
						style={{
							backgroundImage:
								"radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
							backgroundSize: "22px 22px",
						}}
					/>
					{/* Subtle centre glow */}
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.06),transparent_65%)]" />

					<div className="relative">
						{/* Icon with floating rings */}
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
								<Icon
									name="rocket_launch"
									size={36}
									className="text-primary"
									filled
								/>
							</div>
						</div>

						<h3 className="mb-2 text-xl font-bold">Your canvas awaits</h3>
						<p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
							You haven't created any projects yet. Describe your vision above or pick
							a template below to get started.
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

			{/* ── Templates Browser ──────────────────────────────────── */}
			<motion.section
				ref={templatesRef}
				variants={stagger}
				initial="hidden"
				animate={templatesInView ? "show" : "hidden"}
				className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
				{/* Section header + controls */}
				<motion.div variants={safeFadeUp} className="mb-8">
					<div className="mb-5 flex flex-wrap items-end justify-between gap-4">
						<div>
							<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
								Templates
							</p>
							<h2 className="text-2xl font-bold tracking-tight">
								Start with something beautiful.
							</h2>
						</div>
						<button
							type="button"
							onClick={() => setActiveCategory("All")}
							className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-5 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground">
							<Icon name="grid_view" size={14} />
							Browse {templateCount.toLocaleString("en-US")}
							<Icon name="arrow_forward" size={14} />
						</button>
					</div>

					{/* Category filter */}
					<div className="flex flex-wrap gap-2">
						{templateCategories.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setActiveCategory(cat)}
								className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
									activeCategory === cat
										? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
										: "border border-border/60 bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
								}`}>
								{cat}
							</button>
						))}
					</div>
				</motion.div>

				{/* Template grid */}
				{isTemplatesLoading ? (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className="overflow-hidden rounded-[1.65rem] border border-slate-800/75 bg-slate-950/80 shadow-xl shadow-black/20">
								<div className="h-24 animate-pulse bg-slate-800/85" />
								<div className="h-72 animate-pulse bg-slate-200/90" />
								<div className="h-12 animate-pulse border-t border-slate-700/70 bg-slate-900/85" />
							</div>
						))}
					</div>
				) : isTemplatesError ? (
					<motion.div
						variants={safeFadeUp}
						className="rounded-3xl border border-destructive/35 bg-destructive/10 px-6 py-10 text-center">
						<p className="text-sm font-semibold text-destructive">
							Unable to load templates.
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{templateLoadError instanceof Error
								? templateLoadError.message
								: "Please try again shortly."}
						</p>
					</motion.div>
				) : filteredTemplates.length === 0 ? (
					<motion.div
						variants={safeFadeUp}
						className="rounded-3xl border border-border/60 bg-card/40 px-6 py-12 text-center">
						<p className="text-sm font-semibold text-foreground">
							No templates in this category.
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Try another filter or check back later.
						</p>
					</motion.div>
				) : (
					<AnimatePresence mode="wait">
						<motion.div
							key={activeCategory}
							variants={stagger}
							initial="hidden"
							animate="show"
							exit={{ opacity: 0, transition: { duration: 0.15 } }}
							className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{filteredTemplates.map((template, index) => {
								const templateTheme = getTemplateTheme(template.category);
								const description = getTemplateDescription(template);

								return (
									<motion.article
										key={template.id}
										variants={safeFadeUp}
										custom={index}
										whileHover={
											prefersReducedMotion
												? {}
												: { y: -4, transition: { duration: 0.18 } }
										}
										onClick={() => navigate(`/editor/${template.id}`)}
										className="group relative cursor-pointer overflow-hidden rounded-[1.65rem] border border-slate-800/80 bg-slate-950/80 shadow-xl shadow-black/20">
										<div
											className={cn(
												"relative flex min-h-[4.5rem] items-start gap-3 px-5 pb-4 pt-4",
												templateTheme.headerClassName,
											)}>
											<div className="min-w-0 flex-1">
												<h3 className="truncate text-xl font-semibold text-white">
													{template.name}
												</h3>
												<p className="mt-0.5 line-clamp-1 text-sm text-white/75">
													{description}
												</p>
											</div>
											<button
												type="button"
												onClick={(event) => {
													event.stopPropagation();
													navigate(`/view/${template.id}`);
												}}
												className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white/85 transition-colors hover:bg-black/40 hover:text-white"
												aria-label={`Preview ${template.name}`}>
												<Icon name="visibility" size={15} />
											</button>
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
													placeholderClassName={
														templateTheme.placeholderClassName
													}
												/>
												<div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/45 to-transparent" />
											</div>
										</div>
									</motion.article>
								);
							})}
						</motion.div>
					</AnimatePresence>
				)}

				{/* Bottom CTA */}
				<motion.div variants={safeFadeUp} className="mt-10 flex justify-center">
					<button
						type="button"
						onClick={() => setActiveCategory("All")}
						className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/60 px-7 py-3 text-sm font-semibold text-muted-foreground backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground active:scale-95">
						<Icon name="grid_view" size={16} />
						View {templateCount.toLocaleString("en-US")} templates
						<Icon name="arrow_forward" size={16} />
					</button>
				</motion.div>
			</motion.section>
		</div>
	);
}
