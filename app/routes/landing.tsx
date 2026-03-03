import type { Route } from "./+types/landing";
import {
	motion,
	useReducedMotion,
	useInView,
	useMotionValue,
	useSpring,
	type Variants,
} from "framer-motion";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { PAGE_TITLES } from "~/config/page-titles";
import { Icon } from "~/components/ui/icon";
import { SiteHeader } from "~/components/organisms/site-header";

export function meta({}: Route.MetaArgs) {
	return [{ title: PAGE_TITLES.landing }];
}

// ─── Typing Animation Hook ────────────────────────────────────────────────────
function useTypingEffect(phrases: string[], speed = 60, pause = 1800) {
	const [display, setDisplay] = useState("");
	const [phraseIdx, setPhraseIdx] = useState(0);
	const [charIdx, setCharIdx] = useState(0);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const current = phrases[phraseIdx];
		const timeout = setTimeout(
			() => {
				if (!deleting) {
					if (charIdx < current.length) {
						setDisplay(current.slice(0, charIdx + 1));
						setCharIdx((c) => c + 1);
					} else {
						setTimeout(() => setDeleting(true), pause);
					}
				} else {
					if (charIdx > 0) {
						setDisplay(current.slice(0, charIdx - 1));
						setCharIdx((c) => c - 1);
					} else {
						setDeleting(false);
						setPhraseIdx((i) => (i + 1) % phrases.length);
					}
				}
			},
			deleting ? speed / 2 : speed,
		);
		return () => clearTimeout(timeout);
	}, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

	return display;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true });
	const motionVal = useMotionValue(0);
	const spring = useSpring(motionVal, { stiffness: 60, damping: 15 });
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		if (isInView) motionVal.set(target);
	}, [isInView, motionVal, target]);

	useEffect(() => {
		return spring.on("change", (v) => setDisplay(Math.round(v)));
	}, [spring]);

	return (
		<span ref={ref}>
			{display.toLocaleString()}
			{suffix}
		</span>
	);
}

// ─── Shared Variants ──────────────────────────────────────────────────────────
const fadeUp: Variants = {
	hidden: { opacity: 0, y: 24 },
	show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn: Variants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.5 } },
};
const stagger: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const staggerFast: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const TYPING_PHRASES = [
	"A SaaS pricing page for startups",
	"A portfolio for a UX designer",
	"A landing page for a coffee shop",
	"A crypto analytics dashboard",
	"A digital agency showcase",
	"A product launch page",
];

const FEATURES = [
	{
		icon: "edit_note",
		title: "Visual Block Editor",
		desc: "Drag, drop, and rearrange 11+ content blocks — headings, buttons, cards, images, quotes, and more — without touching a line of code.",
	},
	{
		icon: "auto_awesome",
		title: "AI-Powered Generation",
		desc: "Describe your vision in plain language and watch ASB scaffold your full page instantly — sections, layout, copy, and style included.",
	},
	{
		icon: "palette",
		title: "Global Style System",
		desc: "Set your font, primary colour, border radius, and dark/light theme once. Every block on every page inherits it automatically.",
	},
	{
		icon: "content_copy",
		title: "Website Templates",
		desc: "Fork a professionally designed website template in one click. Your copy is fully independent — template updates never affect your project.",
	},
	{
		icon: "cloud_upload",
		title: "One-Click Publishing",
		desc: "Auto-save keeps your draft safe. When you're ready, publish renders static HTML instantly — fast, secure, and SEO-ready.",
	},
	{
		icon: "lock",
		title: "Role-Based Access",
		desc: "Admins manage the template library; users own their projects. Clean separation of concerns with zero overlap.",
	},
];

const STEPS = [
	{
		num: "01",
		icon: "description",
		title: "Describe your site",
		desc: "Type a sentence about what you want to build. ASB interprets your intent and prepares the perfect structure.",
	},
	{
		num: "02",
		icon: "tune",
		title: "Customise with ease",
		desc: "Use the visual editor to tweak every block. Adjust text, colours, layout, and style — no dev skills needed.",
	},
	{
		num: "03",
		icon: "rocket_launch",
		title: "Publish in seconds",
		desc: "Hit publish and your site goes live as blazing-fast static HTML — ready to share with the world.",
	},
];

const BLOCK_ITEMS = [
	{ icon: "title", label: "Heading" },
	{ icon: "notes", label: "Text" },
	{ icon: "smart_button", label: "Button" },
	{ icon: "style", label: "Card" },
	{ icon: "image", label: "Image" },
	{ icon: "emoji_symbols", label: "Icon" },
	{ icon: "label", label: "Badge" },
	{ icon: "horizontal_rule", label: "Divider" },
	{ icon: "format_list_bulleted", label: "List" },
	{ icon: "format_quote", label: "Quote" },
	{ icon: "height", label: "Spacer" },
];

const TESTIMONIALS = [
	{
		quote: "I built my entire agency portfolio in under 20 minutes. No developer, no agency fees — just ASB.",
		name: "Jamie Rivera",
		role: "Freelance Designer",
		avatar: "J",
	},
	{
		quote: "The template system is a game-changer. I forked a SaaS template, tweaked the copy, and had a live page before lunch.",
		name: "Priya Nair",
		role: "Indie Founder",
		avatar: "P",
	},
	{
		quote: "ASB's block editor is the most intuitive thing I've used. The AI prompt feature alone saved me hours of work.",
		name: "Marcus Chen",
		role: "Product Manager",
		avatar: "M",
	},
];

const STATS = [
	{ value: 10000, suffix: "+", label: "Creators" },
	{ value: 85, suffix: "+", label: "Templates" },
	{ value: 11, suffix: "", label: "Block Types" },
	{ value: 99, suffix: "%", label: "Uptime" },
];

const TEMPLATES = [
	{
		name: "SaaS Launch",
		category: "Marketing",
		desc: "High-converting launch page with hero, feature grid, pricing table, and waitlist CTA.",
		gradient: "from-chart-1/55 via-chart-5/35 to-chart-1/20",
		categoryClass: "border-chart-1/50 bg-chart-1/12 text-chart-1",
		usageCount: "4.1k",
		pages: 4,
		icon: "rocket_launch",
		popular: true,
	},
	{
		name: "Designer Portfolio",
		category: "Personal",
		desc: "Minimal and elegant showcase for creatives. Works pages, about section, and contact form.",
		gradient: "from-card via-chart-5/20 to-card",
		categoryClass: "border-chart-5/50 bg-chart-5/12 text-chart-5",
		usageCount: "2.8k",
		pages: 3,
		icon: "palette",
		popular: false,
	},
	{
		name: "Agency Showcase",
		category: "Marketing",
		desc: "Bold, dynamic layout built to impress. Ideal for creative studios and digital agencies.",
		gradient: "from-primary/40 via-cyan-400/20 to-primary/10",
		categoryClass: "border-chart-1/50 bg-chart-1/12 text-chart-1",
		usageCount: "3.2k",
		pages: 5,
		icon: "auto_awesome",
		popular: false,
	},
	{
		name: "Coffee & Co.",
		category: "Retail",
		desc: "Warm, inviting storefront for cafés, bakeries, and local shops. Menu and hours included.",
		gradient: "from-chart-4/40 via-muted to-card",
		categoryClass: "border-chart-4/50 bg-chart-4/12 text-chart-4",
		usageCount: "1.6k",
		pages: 2,
		icon: "storefront",
		popular: false,
	},
	{
		name: "Blog & Journal",
		category: "Content",
		desc: "Clean editorial layout with article cards, featured posts, and a newsletter signup.",
		gradient: "from-card via-card to-muted",
		categoryClass: "border-destructive/45 bg-destructive/12 text-destructive",
		usageCount: "1.1k",
		pages: 3,
		icon: "article",
		popular: false,
	},
	{
		name: "Startup MVP",
		category: "Marketing",
		desc: "Ship your idea page in minutes. Waitlist capture, social proof, and FAQ ready to go.",
		gradient: "from-emerald-400/30 via-primary/15 to-card",
		categoryClass: "border-chart-1/50 bg-chart-1/12 text-chart-1",
		usageCount: "5.0k",
		pages: 2,
		icon: "bolt",
		popular: true,
	},
];

const CMS_FEATURES = [
	{
		icon: "open_with",
		title: "Free-Canvas Editor",
		desc: "Place any block anywhere — no grid constraints, pure creative freedom.",
	},
	{
		icon: "rotate_right",
		title: "Rotation & Layering",
		desc: "Rotate elements to any angle and layer them with full z-index control.",
	},
	{
		icon: "aspect_ratio",
		title: "Multi-Resolution Presets",
		desc: "Design for 4K, FHD, portrait kiosks, and custom screen dimensions.",
	},
	{
		icon: "wallpaper",
		title: "Rich Backgrounds",
		desc: "Set canvas backgrounds to solid colour, image, or live video feeds.",
	},
];

const NAV_LINKS = ["Showcase", "Templates", "Pricing", "Docs"];

// ─── Page Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
	const prefersReducedMotion = useReducedMotion();
	const typedText = useTypingEffect(TYPING_PHRASES);

	// Scroll-section refs
	const featuresRef = useRef<HTMLElement>(null);
	const stepsRef = useRef<HTMLElement>(null);
	const blocksRef = useRef<HTMLElement>(null);
	const templatesRef = useRef<HTMLElement>(null);
	const testimonialsRef = useRef<HTMLElement>(null);
	const statsRef = useRef<HTMLElement>(null);
	const ctaRef = useRef<HTMLElement>(null);
	const cmsRef = useRef<HTMLElement>(null);

	const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
	const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });
	const blocksInView = useInView(blocksRef, { once: true, margin: "-80px" });
	const templatesInView = useInView(templatesRef, { once: true, margin: "-80px" });
	const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-80px" });
	const statsInView = useInView(statsRef, { once: true, margin: "-80px" });
	const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });
	const cmsInView = useInView(cmsRef, { once: true, margin: "-80px" });

	const safeFadeUp = prefersReducedMotion
		? ({
				hidden: { opacity: 0 },
				show: { opacity: 1, transition: { duration: 0.2 } },
			} as Variants)
		: fadeUp;

	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden minimal-scrollbar bg-background text-foreground">
			{/* ── Ambient Gradient Background ──────────────────────────── */}
			<div className="pointer-events-none fixed inset-0 -z-10">
				<motion.div
					className="absolute -top-40 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl"
					animate={
						prefersReducedMotion
							? { opacity: 1 }
							: { opacity: [0.5, 0.9, 0.5], scale: [1, 1.06, 1] }
					}
					transition={
						prefersReducedMotion
							? { duration: 0.35 }
							: { duration: 10, repeat: Infinity, ease: "easeInOut" }
					}
				/>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.08),transparent_40%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.08),transparent_38%),radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.06),transparent_45%)]" />
				{/* subtle grid pattern */}
				<div
					className="absolute inset-0 opacity-[0.025]"
					style={{
						backgroundImage:
							"linear-gradient(hsl(var(--border)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--border)) 1px,transparent 1px)",
						backgroundSize: "64px 64px",
					}}
				/>
			</div>

			{/* ── Header ───────────────────────────────────────────────── */}
			<SiteHeader
				logoHref="/"
				className="sticky top-0"
				nav={NAV_LINKS.map((link) => (
					<span
						key={link}
						className="cursor-default transition-colors duration-150 hover:text-foreground">
						{link}
					</span>
				))}
				actions={
					<>
						<Link
							to="/login"
							className="hidden rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex">
							Log In
						</Link>
						<Link
							to="/login"
							className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-95">
							<Icon name="bolt" size={15} filled />
							Get Started
						</Link>
					</>
				}
			/>

			{/* ── HERO ─────────────────────────────────────────────────── */}
			<section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-24 pt-20 text-center md:px-10">
				{/* Decorative floating cards */}
				<motion.div
					className="pointer-events-none absolute left-0 top-16 hidden w-56 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-xl backdrop-blur-xl lg:block xl:-left-6"
					initial={{
						opacity: 0,
						x: prefersReducedMotion ? 0 : -28,
						y: prefersReducedMotion ? 0 : 12,
					}}
					animate={
						prefersReducedMotion
							? { opacity: 1, x: 0, y: 0 }
							: { opacity: 1, x: 0, y: [0, -12, 0] }
					}
					transition={
						prefersReducedMotion
							? { duration: 0.3, delay: 0.5 }
							: { duration: 5, delay: 0.6, ease: "easeInOut", repeat: Infinity }
					}>
					<div className="mb-3 flex items-center gap-1.5">
						<span className="h-2 w-2 rounded-full bg-destructive/70" />
						<span className="h-2 w-2 rounded-full bg-chart-4/70" />
						<span className="h-2 w-2 rounded-full bg-chart-3/70" />
					</div>
					<div className="h-16 rounded-xl bg-primary/15" />
					<div className="mt-2.5 h-2.5 w-5/6 rounded-full bg-muted/60" />
					<div className="mt-1.5 h-2.5 w-3/5 rounded-full bg-muted/45" />
					<div className="mt-1.5 h-2.5 w-2/5 rounded-full bg-muted/35" />
					<div className="mt-3 inline-flex rounded-full bg-primary/20 px-3 py-1">
						<div className="h-2 w-12 rounded-full bg-primary/60" />
					</div>
				</motion.div>

				<motion.div
					className="pointer-events-none absolute right-0 top-28 hidden w-48 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-xl backdrop-blur-xl lg:block xl:-right-4"
					initial={{
						opacity: 0,
						x: prefersReducedMotion ? 0 : 28,
						y: prefersReducedMotion ? 0 : 12,
					}}
					animate={
						prefersReducedMotion
							? { opacity: 1, x: 0, y: 0 }
							: { opacity: 1, x: 0, y: [0, 10, 0] }
					}
					transition={
						prefersReducedMotion
							? { duration: 0.3, delay: 0.65 }
							: { duration: 4.5, delay: 0.8, ease: "easeInOut", repeat: Infinity }
					}>
					<div className="mb-3 h-2 w-3/4 rounded-full bg-muted/55" />
					<div className="mb-4 h-2 w-1/2 rounded-full bg-muted/35" />
					<div className="grid grid-cols-3 gap-1.5">
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className="h-8 rounded-lg"
								style={{ background: `hsl(var(--muted) / ${0.55 - i * 0.05})` }}
							/>
						))}
					</div>
					<div className="mt-3 h-2 w-4/5 rounded-full bg-muted/35" />
				</motion.div>

				{/* Badge */}
				<motion.div
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.05 }}
					className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
					</span>
					Beta now live
				</motion.div>

				{/* Headline */}
				<motion.h1
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.12 }}
					className="mt-6 max-w-4xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
					Build websites that
					<br />
					<span className="bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
						wow the world.
					</span>
				</motion.h1>

				{/* Sub */}
				<motion.p
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.2 }}
					className="mt-5 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
					AppSiteBuilder turns a single sentence into a fully structured, beautifully
					styled website. No code. No designer. Just you and your idea.
				</motion.p>

				{/* Prompt Input */}
				<motion.div
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.28 }}
					className="mt-10 w-full max-w-2xl">
					<div className="group relative rounded-[2rem] border border-border/60 bg-card/60 p-2.5 shadow-2xl shadow-primary/10 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-primary/20">
						<div className="flex flex-col gap-3 rounded-[1.6rem] bg-background/60 p-3 sm:flex-row sm:items-center sm:gap-0 sm:p-2">
							<div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-1">
								<Icon
									name="auto_awesome"
									className="shrink-0 text-primary"
									size={18}
								/>
								<span className="min-h-[1.5em] flex-1 truncate text-left text-base text-muted-foreground">
									{typedText}
									<span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[1px] animate-pulse rounded-full bg-primary" />
								</span>
							</div>
							<Link
								to="/login"
								className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-95">
								<Icon name="bolt" size={18} filled />
								Generate
							</Link>
						</div>
					</div>
				</motion.div>

				{/* Quick chips */}
				<motion.div
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.36 }}
					className="mt-5 flex flex-wrap items-center justify-center gap-2">
					{["SaaS Landing", "Portfolio", "Coffee Shop", "Agency", "Crypto Dashboard"].map(
						(item) => (
							<button
								key={item}
								type="button"
								className="rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground active:scale-95">
								{item}
							</button>
						),
					)}
				</motion.div>

				{/* Social proof strip */}
				<motion.div
					variants={prefersReducedMotion ? fadeIn : fadeUp}
					initial="hidden"
					animate="show"
					transition={{ delay: 0.44 }}
					className="mt-10 flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
					<div className="flex -space-x-2">
						{["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#ec4899"].map((color, i) => (
							<div
								key={i}
								className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-bold text-white shadow"
								style={{ background: color }}>
								{["J", "P", "M", "A", "R"][i]}
							</div>
						))}
					</div>
					<p className="text-sm text-muted-foreground">
						<span className="font-semibold text-foreground">10,000+ creators</span>{" "}
						already building
					</p>
				</motion.div>
			</section>

			{/* ── STATS ────────────────────────────────────────────────── */}
			<motion.section
				ref={statsRef}
				variants={stagger}
				initial="hidden"
				animate={statsInView ? "show" : "hidden"}
				className="relative mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
				<div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/50 bg-border/50 shadow-xl md:grid-cols-4">
					{STATS.map(({ value, suffix, label }, i) => (
						<motion.div
							key={label}
							variants={safeFadeUp}
							custom={i}
							className="flex flex-col items-center gap-1 bg-card/70 px-6 py-8 backdrop-blur-sm">
							<span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
								<AnimatedNumber target={value} suffix={suffix} />
							</span>
							<span className="text-sm font-medium text-muted-foreground">
								{label}
							</span>
						</motion.div>
					))}
				</div>
			</motion.section>

			{/* ── HOW IT WORKS ─────────────────────────────────────────── */}
			<motion.section
				ref={stepsRef}
				variants={stagger}
				initial="hidden"
				animate={stepsInView ? "show" : "hidden"}
				className="mx-auto w-full max-w-7xl px-6 py-20 md:px-10">
				<motion.div variants={safeFadeUp} className="mb-14 text-center">
					<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
						How it works
					</p>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						From idea to live site
						<br />
						<span className="text-muted-foreground">in three steps.</span>
					</h2>
				</motion.div>

				<div className="relative grid gap-8 md:grid-cols-3">
					{/* connector line */}
					<div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
					{STEPS.map(({ num, icon, title, desc }, i) => (
						<motion.div
							key={num}
							variants={safeFadeUp}
							custom={i}
							className="group relative flex flex-col items-center text-center">
							<div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 shadow-lg shadow-primary/10 transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/20 group-hover:shadow-primary/25">
								<Icon name={icon} className="text-primary" size={32} filled />
								<span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow">
									{num.replace("0", "")}
								</span>
							</div>
							<h3 className="mb-2 text-xl font-bold">{title}</h3>
							<p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
						</motion.div>
					))}
				</div>
			</motion.section>

			{/* ── FEATURES ─────────────────────────────────────────────── */}
			<motion.section
				ref={featuresRef}
				variants={stagger}
				initial="hidden"
				animate={featuresInView ? "show" : "hidden"}
				className="relative mx-auto w-full max-w-7xl px-6 py-20 md:px-10">
				{/* Background accent */}
				<div className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/5 to-transparent" />

				<motion.div variants={safeFadeUp} className="mb-14 text-center">
					<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
						Features
					</p>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						Everything you need
						<br />
						<span className="text-muted-foreground">to ship beautiful sites.</span>
					</h2>
				</motion.div>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{FEATURES.map(({ icon, title, desc }, i) => (
						<motion.div
							key={title}
							variants={safeFadeUp}
							custom={i}
							whileHover={
								prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }
							}
							className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-primary/10">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<div className="relative">
								<div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-sm shadow-primary/20">
									<Icon name={icon} className="text-primary" size={22} filled />
								</div>
								<h3 className="mb-2 text-base font-bold">{title}</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{desc}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</motion.section>

			{/* ── BLOCK TYPES SHOWCASE ─────────────────────────────────── */}
			<motion.section
				ref={blocksRef}
				variants={stagger}
				initial="hidden"
				animate={blocksInView ? "show" : "hidden"}
				className="mx-auto w-full max-w-7xl px-6 py-20 md:px-10">
				<motion.div variants={safeFadeUp} className="mb-12 text-center">
					<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
						Content Blocks
					</p>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
						11 powerful blocks.
						<br />
						<span className="text-muted-foreground">Infinite combinations.</span>
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-muted-foreground">
						Every element you could need — from call-to-action buttons to testimonial
						quotes — is a drag-and-drop block ready to use.
					</p>
				</motion.div>

				<motion.div
					variants={staggerFast}
					className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
					{BLOCK_ITEMS.map(({ icon, label }, i) => (
						<motion.div
							key={label}
							variants={safeFadeUp}
							custom={i}
							whileHover={
								prefersReducedMotion
									? {}
									: { scale: 1.08, transition: { duration: 0.15 } }
							}
							className="group flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/60 py-4 px-2 text-center shadow-sm backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/10 hover:shadow-primary/15">
							<Icon
								name={icon}
								className="text-muted-foreground transition-colors group-hover:text-primary"
								size={22}
								filled
							/>
							<span className="text-[10px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
								{label}
							</span>
						</motion.div>
					))}
				</motion.div>
			</motion.section>

			{/* ── CMS STUDIO ───────────────────────────────────────────── */}
			<motion.section
				ref={cmsRef}
				variants={stagger}
				initial="hidden"
				animate={cmsInView ? "show" : "hidden"}
				className="mx-auto w-full max-w-7xl px-6 py-20 md:px-10">
				<div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/40 p-8 shadow-xl backdrop-blur-sm md:p-12 lg:p-16">
					{/* Ambient glow orbs */}
					<div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-violet-500/12 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />

					<div className="relative grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
						{/* ── Left: Copy ── */}
						<motion.div variants={safeFadeUp}>
							<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
								<Icon name="tv" size={12} filled />
								CMS Studio
							</div>
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
								Pixel-perfect displays,
								<br />
								<span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
									free-canvas freedom.
								</span>
							</h2>
							<p className="mt-4 max-w-sm text-muted-foreground">
								Place every block exactly where you want it — no grid, no
								constraints.
							</p>

							<div className="mt-7 flex flex-wrap gap-2">
								{CMS_FEATURES.map(({ icon, title }) => (
									<div
										key={title}
										className="flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/8 px-3 py-1.5 text-xs font-medium text-violet-300">
										<Icon name={icon} className="shrink-0" size={13} filled />
										{title}
									</div>
								))}
							</div>

							<div className="mt-8">
								<Link
									to="/login"
									className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:brightness-110 active:scale-95">
									<Icon name="content_copy" size={15} filled />
									Browse CMS Templates
								</Link>
							</div>
						</motion.div>

						{/* ── Right: Canvas Mockup ── */}
						<motion.div variants={safeFadeUp} className="relative">
							{/* Glow halo behind editor */}
							<div className="pointer-events-none absolute inset-0 scale-95 rounded-2xl bg-violet-500/15 blur-2xl" />

							{/* Editor shell */}
							<div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-[#09090b] shadow-2xl shadow-violet-500/10">
								{/* Titlebar */}
								<div className="flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/80 px-4 py-2.5">
									<div className="flex items-center gap-1.5">
										<span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
										<span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
										<span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
									</div>
									<div className="flex items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1 font-mono text-[10px] text-zinc-400">
										<Icon name="monitor" size={10} />
										1920 × 1080
									</div>
									<div className="flex items-center gap-1.5">
										<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
										<span className="text-[10px] text-zinc-500">
											Auto-saved
										</span>
									</div>
								</div>

								{/* Canvas area */}
								<div
									className="relative aspect-[16/9] overflow-hidden"
									style={{
										backgroundImage:
											"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
										backgroundSize: "28px 28px",
										backgroundColor: "#09090b",
									}}>
									{/* Canvas ambient gradient */}
									<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_22%,rgba(139,92,246,0.20),transparent_55%),radial-gradient(ellipse_at_82%_75%,rgba(99,102,241,0.12),transparent_50%)]" />

									{/* Ruler — left strip */}
									<div className="absolute inset-y-0 left-0 w-5 border-r border-white/[0.05] bg-zinc-900/70" />
									{/* Ruler — top strip */}
									<div className="absolute inset-x-5 top-0 h-4 border-b border-white/[0.05] bg-zinc-900/70" />

									{/* ── Canvas Blocks ── */}

									{/* Hero heading block */}
									<div
										className="absolute left-[10%] top-[15%] w-[46%] rounded-lg border border-violet-400/25 bg-violet-500/15 px-3.5 py-3 backdrop-blur-sm"
										style={{ transform: "rotate(-1.2deg)" }}>
										<div className="h-2 w-4/5 rounded-full bg-violet-300/55" />
										<div className="mt-1.5 h-1.5 w-3/5 rounded-full bg-violet-300/30" />
										<div className="mt-3 h-5 w-16 rounded-full bg-violet-500/55" />
										<span className="absolute -top-4 left-0 whitespace-nowrap font-mono text-[7px] text-violet-400/60">
											x:10% y:15% ↻ -1.2°
										</span>
									</div>

									{/* Image block (selected with handles) */}
									<div
										className="absolute right-[7%] top-[8%] h-[37%] w-[26%] overflow-hidden rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 backdrop-blur-sm"
										style={{ transform: "rotate(2.5deg)" }}>
										<div className="absolute inset-0 flex items-center justify-center opacity-50">
											<Icon
												name="image"
												className="text-cyan-300"
												size={26}
											/>
										</div>
										{/* Selection ring */}
										<div className="absolute inset-0 rounded-xl ring-2 ring-violet-400/60" />
										{/* Corner resize handles */}
										{(
											[
												"-top-1 -left-1",
												"-top-1 -right-1",
												"-bottom-1 -left-1",
												"-bottom-1 -right-1",
											] as const
										).map((pos) => (
											<div
												key={pos}
												className={`absolute ${pos} h-2 w-2 rounded-sm border border-violet-400/80 bg-[#09090b]`}
											/>
										))}
										<span className="absolute -top-4 left-0 whitespace-nowrap font-mono text-[7px] text-cyan-400/60">
											x:67% y:8% ↻ 2.5°
										</span>
									</div>

									{/* Badge block */}
									<div
										className="absolute left-[12%] top-[53%] rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 backdrop-blur-sm"
										style={{ transform: "rotate(2.8deg)" }}>
										<div className="h-1.5 w-14 rounded-full bg-emerald-300/55" />
									</div>

									{/* Text body block */}
									<div
										className="absolute bottom-[22%] left-[8%] w-[37%] space-y-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm"
										style={{ transform: "rotate(-0.8deg)" }}>
										<div className="h-1.5 w-full rounded-full bg-white/22" />
										<div className="h-1.5 w-5/6 rounded-full bg-white/15" />
										<div className="h-1.5 w-2/3 rounded-full bg-white/10" />
									</div>

									{/* CTA Button block */}
									<div
										className="absolute bottom-[12%] right-[9%] rounded-full border border-violet-400/35 bg-violet-500/20 px-5 py-2 backdrop-blur-sm"
										style={{ transform: "rotate(-1.5deg)" }}>
										<div className="h-2 w-14 rounded-full bg-violet-300/60" />
									</div>

									{/* Divider block */}
									<div
										className="absolute right-[7%] bottom-[48%] w-[26%] border-t border-dashed border-zinc-500/35"
										style={{ transform: "rotate(2.5deg)" }}
									/>
								</div>

								{/* Bottom block-picker toolbar */}
								<div className="flex items-center justify-between border-t border-white/[0.06] bg-zinc-900/80 px-4 py-2.5">
									<div className="flex items-center gap-1.5">
										{[
											"title",
											"image",
											"smart_button",
											"label",
											"format_quote",
											"height",
										].map((ic) => (
											<div
												key={ic}
												className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white/[0.05] text-zinc-500 transition-colors hover:bg-white/[0.10] hover:text-zinc-200">
												<Icon name={ic} size={13} />
											</div>
										))}
									</div>
									<div className="flex items-center gap-2">
										<div className="rounded-md border border-violet-500/25 bg-violet-500/12 px-3 py-1 text-[10px] font-semibold text-violet-400">
											Preview
										</div>
										<div className="rounded-md bg-violet-600 px-3 py-1 text-[10px] font-semibold text-white">
											Publish
										</div>
									</div>
								</div>
							</div>

							{/* Floating badge — bottom left */}
							<motion.div
								className="absolute -bottom-5 -left-5 rounded-2xl border border-border/60 bg-card/90 p-3 shadow-xl backdrop-blur-xl"
								animate={prefersReducedMotion ? {} : { y: [0, -7, 0] }}
								transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
								<div className="flex items-center gap-2.5">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20">
										<Icon
											name="layers"
											className="text-violet-400"
											size={18}
											filled
										/>
									</div>
									<div>
										<p className="text-xs font-bold">Free Canvas</p>
										<p className="text-[10px] text-muted-foreground">
											Drag · Rotate · Scale
										</p>
									</div>
								</div>
							</motion.div>

							{/* Floating badge — top right */}
							<motion.div
								className="absolute -right-5 -top-5 rounded-2xl border border-border/60 bg-card/90 p-3 shadow-xl backdrop-blur-xl"
								animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 0.6,
								}}>
								<div className="flex items-center gap-2">
									<Icon
										name="display_settings"
										className="text-violet-400"
										size={16}
										filled
									/>
									<div>
										<p className="text-xs font-bold">Multi-Resolution</p>
										<p className="text-[10px] text-muted-foreground">
											4K · FHD · Portrait
										</p>
									</div>
								</div>
							</motion.div>
						</motion.div>
					</div>
				</div>
			</motion.section>

			{/* ── WEBSITE TEMPLATES ─────────────────────────────────────── */}
			<motion.section
				ref={templatesRef}
				variants={stagger}
				initial="hidden"
				animate={templatesInView ? "show" : "hidden"}
				className="mx-auto w-full max-w-7xl px-6 py-20 md:px-10">
				<motion.div variants={safeFadeUp} className="mb-14 text-center">
					<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
						Website Templates
					</p>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						Start with something
						<br />
						<span className="text-muted-foreground">beautiful.</span>
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-muted-foreground">
						Pick a professionally designed website template, fork it with one click, and
						make it yours. Your copy is fully independent — template updates never touch
						your project.
					</p>
				</motion.div>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{TEMPLATES.map(
						(
							{
								name,
								category,
								desc,
								gradient,
								categoryClass,
								usageCount,
								pages,
								icon,
								popular,
							},
							i,
						) => (
							<motion.div
								key={name}
								variants={safeFadeUp}
								custom={i}
								whileHover={
									prefersReducedMotion
										? {}
										: { y: -5, transition: { duration: 0.2 } }
								}
								className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm transition-shadow hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
								{/* Preview area */}
								<div
									className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
									{/* Mini page skeleton mockup */}
									<div className="absolute inset-4 flex flex-col gap-2">
										<div className="flex items-center gap-1.5">
											<div className="h-1.5 w-1.5 rounded-full bg-card/70" />
											<div className="h-1.5 w-8 rounded-full bg-card/60" />
											<div className="ml-auto h-1.5 w-12 rounded-full bg-card/50" />
										</div>
										<div className="mt-1 h-5 w-3/4 rounded-lg bg-card/75" />
										<div className="h-2 w-1/2 rounded-full bg-card/50" />
										<div className="mt-1.5 flex gap-2">
											<div className="h-6 w-14 rounded-lg bg-primary/65" />
											<div className="h-6 w-14 rounded-lg bg-card/50" />
										</div>
										<div className="mt-auto grid grid-cols-3 gap-1.5">
											<div className="h-9 rounded-lg bg-card/55" />
											<div className="h-9 rounded-lg bg-card/45" />
											<div className="h-9 rounded-lg bg-card/35" />
										</div>
									</div>
									{/* Hover overlay CTA */}
									<div className="absolute inset-0 flex items-center justify-center bg-background/55 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
										<button
											type="button"
											className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all hover:brightness-110 active:scale-95">
											<Icon name="content_copy" size={15} filled />
											Use Template
										</button>
									</div>
									{/* Popular badge */}
									{popular && (
										<div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
											<Icon name="local_fire_department" size={10} filled />
											Popular
										</div>
									)}
								</div>

								{/* Card body */}
								<div className="flex flex-1 flex-col gap-3 p-5">
									<div className="flex items-start justify-between gap-2">
										<div className="flex items-center gap-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
												<Icon
													name={icon}
													className="text-primary"
													size={16}
													filled
												/>
											</div>
											<h3 className="font-bold text-foreground">{name}</h3>
										</div>
										<span
											className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryClass}`}>
											{category}
										</span>
									</div>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{desc}
									</p>
									<div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<Icon name="description" size={12} />
											{pages} page{pages !== 1 ? "s" : ""}
										</span>
										<span className="flex items-center gap-1">
											<Icon name="content_copy" size={12} />
											{usageCount} uses
										</span>
									</div>
								</div>
							</motion.div>
						),
					)}
				</div>

				{/* Browse all CTA */}
				<motion.div variants={safeFadeUp} className="mt-12 flex justify-center">
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-7 py-3 text-sm font-semibold backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground active:scale-95">
						<Icon name="grid_view" size={16} />
						Browse all 85+ website templates
						<Icon name="arrow_forward" size={16} />
					</button>
				</motion.div>
			</motion.section>

			{/* ── TESTIMONIALS ─────────────────────────────────────────── */}
			<motion.section
				ref={testimonialsRef}
				variants={stagger}
				initial="hidden"
				animate={testimonialsInView ? "show" : "hidden"}
				className="mx-auto w-full max-w-7xl px-6 py-20 md:px-10">
				<motion.div variants={safeFadeUp} className="mb-12 text-center">
					<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
						Testimonials
					</p>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Loved by builders
						<br />
						<span className="text-muted-foreground">around the world.</span>
					</h2>
				</motion.div>

				<div className="grid gap-5 md:grid-cols-3">
					{TESTIMONIALS.map(({ quote, name, role, avatar }, i) => (
						<motion.div
							key={name}
							variants={safeFadeUp}
							custom={i}
							whileHover={
								prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }
							}
							className="flex flex-col justify-between gap-5 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm">
							<div>
								<div className="mb-3 flex gap-0.5">
									{[...Array(5)].map((_, s) => (
										<Icon
											key={s}
											name="star"
											className="text-chart-4"
											size={14}
											filled
										/>
									))}
								</div>
								<p className="text-sm leading-relaxed text-foreground/90">
									"{quote}"
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
									{avatar}
								</div>
								<div>
									<p className="text-sm font-semibold">{name}</p>
									<p className="text-xs text-muted-foreground">{role}</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</motion.section>

			{/* ── CTA ──────────────────────────────────────────────────── */}
			<motion.section
				ref={ctaRef}
				variants={stagger}
				initial="hidden"
				animate={ctaInView ? "show" : "hidden"}
				className="mx-auto w-full max-w-7xl px-6 py-20 md:px-10">
				<motion.div
					variants={safeFadeUp}
					className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-10 shadow-2xl shadow-primary/15 md:p-16">
					{/* decorative orbs */}
					<div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

					<div className="relative flex flex-col items-center text-center">
						<div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40">
							<Icon
								name="rocket_launch"
								className="text-primary-foreground"
								size={28}
								filled
							/>
						</div>
						<h2 className="mb-4 max-w-2xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
							Your next site is one
							<br />
							<span className="text-primary">sentence away.</span>
						</h2>
						<p className="mb-8 max-w-lg text-muted-foreground">
							Join thousands of creators who skipped the dev agency and shipped faster
							with AppSiteBuilder.
						</p>
						<div className="flex flex-col items-center gap-3 sm:flex-row">
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-xl shadow-primary/35 transition-all hover:brightness-110 active:scale-95">
								<Icon name="bolt" size={18} filled />
								Start Building — It's Free
							</button>
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-8 py-3.5 text-base font-semibold backdrop-blur transition-all hover:bg-card">
								<Icon name="play_circle" size={18} />
								Watch Demo
							</button>
						</div>
						<p className="mt-4 text-xs text-muted-foreground">
							No credit card required · Free tier always available
						</p>
					</div>
				</motion.div>
			</motion.section>

			{/* ── FOOTER ───────────────────────────────────────────────── */}
			<motion.footer
				className="relative border-t border-border/40 bg-background/60 backdrop-blur-xl"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.5 }}>
				<div className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10">
					<div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
						{/* Brand */}
						<div>
							<div className="mb-2 flex items-center gap-2">
								<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Icon name="auto_awesome" size={14} filled />
								</div>
								<span className="font-bold">
									AppSite<span className="text-primary">Builder</span>
								</span>
							</div>
							<p className="max-w-xs text-xs text-muted-foreground">
								The no-code website builder for creators, founders, and teams who
								move fast.
							</p>
						</div>

						{/* Links */}
						<div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
							{[
								"Product",
								"Templates",
								"Pricing",
								"Docs",
								"Blog",
								"Privacy",
								"Terms",
							].map((l) => (
								<span
									key={l}
									className="cursor-default transition-colors hover:text-foreground">
									{l}
								</span>
							))}
						</div>
					</div>

					<div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
						<p>© {new Date().getFullYear()} AppSiteBuilder. All rights reserved.</p>
						<div className="flex items-center gap-4">
							{["twitter", "github", "linkedin"].map((sn) => (
								<span
									key={sn}
									className="cursor-default capitalize transition-colors hover:text-foreground">
									{sn}
								</span>
							))}
						</div>
					</div>
				</div>
			</motion.footer>
		</div>
	);
}
