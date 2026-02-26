import type { Variants } from "framer-motion";

export function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 5) return "Working late";
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
	},
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.4 } },
};

export const stagger: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

export const TONES = [
	{ id: "professional", label: "Professional", icon: "business_center" },
	{ id: "creative", label: "Creative", icon: "palette" },
	{ id: "minimal", label: "Minimal", icon: "crop_square" },
	{ id: "bold", label: "Bold", icon: "bolt" },
] as const;

export type ToneId = (typeof TONES)[number]["id"];

export const TONE_GLOWS: Record<ToneId, string> = {
	professional:
		"radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.28) 0%, transparent 68%)",
	creative:
		"radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.28) 0%, transparent 68%)",
	minimal:
		"radial-gradient(ellipse at 50% 100%, rgba(100,116,139,0.18) 0%, transparent 68%)",
	bold: "radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.28) 0%, transparent 68%)",
};

export const QUICK_PROMPTS = [
	"A SaaS pricing page for my startup",
	"A minimal portfolio for a designer",
	"A cozy landing page for a coffee shop",
	"A crypto analytics dashboard",
	"A bold agency showcase with dark theme",
	"A blog for a tech writer",
];

export const RECENT_ACTIVITY = [
	{ text: "SaaS page generated", time: "2m ago", dotClassName: "bg-chart-1/70" },
	{ text: "Portfolio published", time: "1h ago", dotClassName: "bg-chart-2/70" },
	{ text: "Template forked", time: "3h ago", dotClassName: "bg-chart-5/70" },
] as const;

export const AI_CAPABILITIES = [
	{ icon: "psychology", label: "Context-aware" },
	{ icon: "layers", label: "Multi-section" },
	{ icon: "speed", label: "< 10 s build" },
	{ icon: "palette", label: "Auto-styled" },
] as const;
