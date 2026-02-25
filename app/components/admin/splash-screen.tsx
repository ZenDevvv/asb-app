import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LayoutGrid, Layers, Users, Settings, Pencil } from "lucide-react";

// ─── Theme tokens per mode ───────────────────────────────────────────────────
const THEMES = {
	admin: {
		accent: "oklch(0.78 0.16 170)",
		accentDim: "oklch(0.78 0.16 170 / 0.13)",
		accentSubtle: "oklch(0.78 0.16 170 / 0.07)",
		glow: "oklch(0.78 0.16 170 / 0.08)",
		glowCorner1: "oklch(0.78 0.16 170 / 0.07)",
		glowCorner2: "oklch(0.60 0.12 190 / 0.08)",
		dot: "oklch(0.78 0.16 170 / 0.12)",
		badge: "LIVE",
		brand: { prefix: "AppSite", suffix: "Builder" },
	},
	editor: {
		accent: "oklch(0.55 0.14 170)",
		accentDim: "oklch(0.55 0.14 170 / 0.14)",
		accentSubtle: "oklch(0.55 0.14 170 / 0.07)",
		glow: "oklch(0.55 0.14 170 / 0.08)",
		glowCorner1: "oklch(0.55 0.14 170 / 0.07)",
		glowCorner2: "oklch(0.60 0.12 190 / 0.07)",
		dot: "oklch(0.55 0.14 170 / 0.12)",
		badge: "EDITOR",
		brand: { prefix: "Template ", suffix: "Editor" },
	},
} as const;

// ─── Admin tab definitions ───────────────────────────────────────────────────
const ADMIN_TABS = [
	{ icon: LayoutGrid, message: "Assembling your workspace..." },
	{ icon: Layers, message: "Loading templates..." },
	{ icon: Users, message: "Fetching your users..." },
	{ icon: Settings, message: "Configuring your tools..." },
];

// ─── Editor section definitions ──────────────────────────────────────────────
const EDITOR_SECTIONS = [
	{ label: "Hero", hue: 170, message: "Fetching your template..." },
	{ label: "Features", hue: 190, message: "Preparing the canvas..." },
	{ label: "Gallery", hue: 155, message: "Restoring styles..." },
	{ label: "CTA", hue: 142, message: "Almost ready to edit..." },
];

// ─── Shared animation variants ───────────────────────────────────────────────
const contentStagger = {
	hidden: {},
	show: { transition: { staggerChildren: 0.075, delayChildren: 0.04 } },
};

const skeletonPop = {
	hidden: { opacity: 0, y: 6, scale: 0.93 },
	show: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: "spring" as const, stiffness: 300, damping: 26 },
	},
};

const sidebarStagger = {
	hidden: {},
	show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};

const sidebarItemVariant = {
	hidden: { opacity: 0, x: -6 },
	show: { opacity: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
};

// ─── Admin per-tab content skeletons ─────────────────────────────────────────
function OverviewSkeleton() {
	return (
		<motion.div
			key="overview"
			variants={contentStagger}
			initial="hidden"
			animate="show"
			exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
			className="flex-1 p-2 grid grid-cols-2 gap-1.5 content-start overflow-hidden"
		>
			{([170, 155, 142, 190] as number[]).map((hue, i) => (
				<motion.div
					key={i}
					variants={skeletonPop}
					className="rounded-lg border border-primary/10 flex flex-col gap-1.5 p-1.5"
					style={{ background: "oklch(0.20 0.03 175)" }}
				>
					<div className="flex items-center gap-1">
						<div className="w-1.5 h-1.5 rounded" style={{ background: `oklch(0.78 0.16 ${hue} / 0.6)` }} />
						<div className="h-1 rounded bg-primary/15 w-8" />
					</div>
					<div className="h-2.5 rounded bg-primary/12 w-10" />
					<div className="h-1 rounded bg-primary/8 w-6" />
				</motion.div>
			))}
			<motion.div
				variants={skeletonPop}
				className="col-span-2 rounded-lg border border-primary/10 h-5 flex items-center gap-2 px-2"
				style={{ background: "oklch(0.20 0.03 175)" }}
			>
				<div className="h-1 rounded bg-primary/20 w-1/4" />
				<div className="h-1 rounded bg-primary/10 w-1/3" />
				<div className="ml-auto h-1.5 w-5 rounded" style={{ background: "oklch(0.78 0.16 170 / 0.35)" }} />
			</motion.div>
		</motion.div>
	);
}

function TemplatesSkeleton() {
	return (
		<motion.div
			key="templates"
			variants={contentStagger}
			initial="hidden"
			animate="show"
			exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
			className="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden"
		>
			<div className="flex gap-1.5">
				{[0, 1].map((i) => (
					<motion.div
						key={i}
						variants={skeletonPop}
						className="flex-1 rounded-lg border border-primary/10 flex flex-col gap-1.5 p-1.5"
						style={{ background: "oklch(0.20 0.03 175)" }}
					>
						<div className="w-full h-7 rounded" style={{ background: "oklch(0.78 0.16 170 / 0.07)" }} />
						<div className="h-1 rounded bg-primary/18 w-full" />
						<div className="h-1 rounded bg-primary/8 w-2/3" />
					</motion.div>
				))}
			</div>
			{[0, 1, 2].map((i) => (
				<motion.div
					key={i}
					variants={skeletonPop}
					className="h-5 rounded-lg border border-primary/10 flex items-center gap-2 px-2"
					style={{ background: "oklch(0.20 0.03 175)" }}
				>
					<div className="w-2.5 h-2.5 rounded" style={{ background: `oklch(0.78 0.16 ${150 + i * 14} / 0.32)` }} />
					<div className="h-1 rounded bg-primary/15" style={{ width: `${28 + i * 12}%` }} />
					<div className="ml-auto h-1 rounded bg-primary/8 w-8" />
				</motion.div>
			))}
		</motion.div>
	);
}

function UsersSkeleton() {
	return (
		<motion.div
			key="users"
			variants={contentStagger}
			initial="hidden"
			animate="show"
			exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
			className="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden"
		>
			<motion.div variants={skeletonPop} className="h-4 flex items-center gap-2 px-1">
				<div className="h-1 rounded bg-primary/22 w-5" />
				<div className="h-1 rounded bg-primary/12 w-14" />
				<div className="ml-auto h-1 rounded bg-primary/12 w-8" />
			</motion.div>
			{[0, 1, 2, 3].map((i) => (
				<motion.div
					key={i}
					variants={skeletonPop}
					className="h-6 rounded-lg border border-primary/10 flex items-center gap-2 px-2"
					style={{ background: "oklch(0.20 0.03 175)" }}
				>
					<div className="w-3 h-3 rounded-full shrink-0" style={{ background: `oklch(0.78 0.16 ${158 + i * 9} / 0.38)` }} />
					<div className="h-1 rounded bg-primary/20" style={{ width: `${30 + i * 7}%` }} />
					<div className="ml-auto h-2.5 w-7 rounded-full border" style={{ background: "oklch(0.78 0.16 170 / 0.08)", borderColor: "oklch(0.78 0.16 170 / 0.2)" }} />
				</motion.div>
			))}
		</motion.div>
	);
}

function SettingsSkeleton() {
	return (
		<motion.div
			key="settings"
			variants={contentStagger}
			initial="hidden"
			animate="show"
			exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
			className="flex-1 p-2 flex flex-col gap-2 overflow-hidden"
		>
			<motion.div variants={skeletonPop} className="flex items-center gap-1.5">
				<div className="h-1.5 rounded bg-primary/28 w-14" />
				<div className="flex-1 h-px bg-primary/8" />
			</motion.div>
			{[0, 1, 2].map((i) => (
				<motion.div key={i} variants={skeletonPop} className="flex flex-col gap-1">
					<div className="h-1 rounded bg-primary/15 w-10" />
					<div className="h-4 rounded-md border border-primary/12 flex items-center px-2" style={{ background: "oklch(0.18 0.02 175)" }}>
						<div className="h-1 rounded bg-primary/10 w-2/3" />
					</div>
				</motion.div>
			))}
			<motion.div
				variants={skeletonPop}
				className="mt-auto h-4 w-12 rounded-md self-end"
				style={{ background: "oklch(0.78 0.16 170 / 0.22)", border: "1px solid oklch(0.78 0.16 170 / 0.3)" }}
			/>
		</motion.div>
	);
}

const ADMIN_TAB_CONTENT = [OverviewSkeleton, TemplatesSkeleton, UsersSkeleton, SettingsSkeleton];

// ─── Admin mini preview ───────────────────────────────────────────────────────
function AdminMiniPreview({ activeTab, accent }: { activeTab: number; accent: string }) {
	const ActiveContent = ADMIN_TAB_CONTENT[activeTab];
	return (
		<>
			{/* Browser chrome */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.25 }}
				className="h-8 flex items-center gap-2 px-3 border-b border-primary/10 shrink-0"
				style={{ background: "oklch(0.12 0.02 175)" }}
			>
				<div className="flex gap-1.5 shrink-0">
					<div className="w-2 h-2 rounded-full bg-destructive/60" />
					<div className="w-2 h-2 rounded-full" style={{ background: "oklch(0.80 0.17 130 / 0.65)" }} />
					<div className="w-2 h-2 rounded-full" style={{ background: `${accent} / 0.6`.replace("/ 0.6", "").replace(")", " / 0.6)") }} />
				</div>
				<div className="flex-1 h-3.5 rounded-md flex items-center gap-1.5 px-2 overflow-hidden" style={{ background: `oklch(0.78 0.16 170 / 0.06)` }}>
					<div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `oklch(0.78 0.16 170 / 0.5)` }} />
					<AnimatePresence mode="wait">
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, x: 6 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -6 }}
							transition={{ duration: 0.2 }}
							className="h-1 rounded"
							style={{ background: "oklch(0.78 0.16 170 / 0.2)", width: `${40 + activeTab * 12}%` }}
						/>
					</AnimatePresence>
				</div>
			</motion.div>

			{/* Sidebar + content */}
			<div className="flex" style={{ height: "calc(100% - 2rem)" }}>
				<motion.div
					variants={sidebarStagger}
					initial="hidden"
					animate="show"
					className="relative w-[4.25rem] flex flex-col gap-1 p-2 border-r border-primary/10 shrink-0"
					style={{ background: "oklch(0.10 0.02 175)" }}
				>
					<motion.div variants={sidebarItemVariant} className="flex items-center gap-1 mb-1.5 px-0.5">
						<div className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: `${accent.replace(")", " / 0.5)")}`, background: `${accent.replace(")", " / 0.12)")}` }}>
							<div className="w-1.5 h-1.5 rounded-full" style={{ background: `${accent.replace(")", " / 0.8)")}` }} />
						</div>
						<div className="h-1.5 rounded w-6 bg-primary/20" />
					</motion.div>

					{ADMIN_TABS.map((tab, i) => (
						<motion.div key={i} variants={sidebarItemVariant} className="relative flex items-center gap-1.5 px-1 py-1 rounded-md overflow-hidden">
							{activeTab === i && (
								<motion.div layoutId="nav-bg" className="absolute inset-0 rounded-md" style={{ background: `${accent.replace(")", " / 0.13)")}` }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />
							)}
							{activeTab === i && (
								<motion.div layoutId="nav-pill" className="absolute left-0 top-[3px] bottom-[3px] w-[3px] rounded-r" style={{ background: accent }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />
							)}
							<tab.icon style={{ width: 9, height: 9, position: "relative", color: activeTab === i ? accent : `${accent.replace(")", " / 0.32)")}`, transition: "color 0.2s" }} />
							<div className="h-1 rounded flex-1 relative" style={{ background: activeTab === i ? `${accent.replace(")", " / 0.28)")}` : `${accent.replace(")", " / 0.09)")}`, transition: "background 0.2s" }} />
						</motion.div>
					))}
				</motion.div>

				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0, transition: { duration: 0.18 } }}
						exit={{ opacity: 0, x: -10, transition: { duration: 0.14 } }}
						className="flex flex-1 overflow-hidden"
					>
						<ActiveContent />
					</motion.div>
				</AnimatePresence>
			</div>
		</>
	);
}

// ─── Editor mini preview ──────────────────────────────────────────────────────
function EditorMiniPreview({ step, generation, accent }: { step: number; generation: number; accent: string }) {
	const visibleSections = EDITOR_SECTIONS.slice(0, step + 1);

	return (
		<>
			{/* Editor toolbar */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.25 }}
				className="h-8 flex items-center gap-1.5 px-2.5 border-b shrink-0"
				style={{ background: "oklch(0.12 0.02 175)", borderColor: `${accent.replace(")", " / 0.12)")}` }}
			>
				{/* Back arrow */}
				<div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: `${accent.replace(")", " / 0.1)")}` }}>
					<div className="w-1.5 h-1 rounded-sm" style={{ background: `${accent.replace(")", " / 0.5)")}` }} />
				</div>
				{/* Template name */}
				<AnimatePresence mode="wait">
					<motion.div
						key={step}
						initial={{ opacity: 0, x: 4 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="h-1.5 rounded flex-1 max-w-[48px]"
						style={{ background: `${accent.replace(")", " / 0.22)")}` }}
					/>
				</AnimatePresence>
				{/* Right toolbar buttons */}
				<div className="ml-auto flex gap-1">
					{[0, 1, 2].map((i) => (
						<div key={i} className="w-3.5 h-3.5 rounded" style={{ background: `${accent.replace(")", ` / ${0.08 + i * 0.06})`)}` }} />
					))}
					{/* Save button */}
					<div className="w-7 h-3.5 rounded" style={{ background: `${accent.replace(")", " / 0.28)")}`, border: `1px solid ${accent.replace(")", " / 0.4)")}` }} />
				</div>
			</motion.div>

			{/* 3-column editor layout */}
			<motion.div
				variants={sidebarStagger}
				initial="hidden"
				animate="show"
				className="flex overflow-hidden"
				style={{ height: "calc(100% - 2rem)" }}
			>
				{/* Left: Sections list panel */}
				<motion.div
					variants={sidebarItemVariant}
					className="w-11 flex flex-col border-r shrink-0"
					style={{ background: "oklch(0.10 0.02 175)", borderColor: `${accent.replace(")", " / 0.1)")}` }}
				>
					{/* Panel header */}
					<div className="h-5 flex items-center px-1.5 border-b" style={{ borderColor: `${accent.replace(")", " / 0.08)")}` }}>
						<div className="h-1 rounded w-full" style={{ background: `${accent.replace(")", " / 0.15)")}` }} />
					</div>
					{/* Section list items */}
					<div className="flex flex-col gap-1 p-1.5 flex-1">
						{EDITOR_SECTIONS.map((sec, i) => (
							<motion.div
								key={`${generation}-${i}`}
								initial={i > step ? { opacity: 0 } : { opacity: 0, x: -4 }}
								animate={i <= step ? { opacity: 1, x: 0 } : { opacity: 0 }}
								transition={{ duration: 0.22, delay: i <= step ? i * 0.06 : 0 }}
								className="h-5 rounded flex items-center gap-1 px-1"
								style={{
									background: i === step ? `oklch(0.72 0.18 ${sec.hue} / 0.15)` : `oklch(0.72 0.18 ${sec.hue} / 0.05)`,
									border: `1px solid oklch(0.72 0.18 ${sec.hue} / ${i === step ? 0.25 : 0.08})`,
								}}
							>
								<div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: `oklch(0.72 0.18 ${sec.hue} / ${i === step ? 0.7 : 0.35})` }} />
								<div className="h-1 rounded flex-1" style={{ background: `oklch(0.72 0.18 ${sec.hue} / ${i === step ? 0.3 : 0.12})` }} />
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* Center: Canvas */}
				<div className="flex-1 flex flex-col gap-1 p-1.5 overflow-hidden" style={{ background: "oklch(0.14 0.02 175)" }}>
					<AnimatePresence>
						{visibleSections.map((sec, i) => (
							<motion.div
								key={`${generation}-canvas-${i}`}
								initial={{ opacity: 0, y: 8, scaleY: 0.85 }}
								animate={{ opacity: 1, y: 0, scaleY: 1 }}
								transition={{ type: "spring", stiffness: 280, damping: 24, delay: i === step ? 0.05 : 0 }}
								className="rounded border flex items-center px-2 shrink-0"
								style={{
									height: i === 0 ? 28 : i === 1 ? 22 : 18,
									background: `oklch(0.72 0.18 ${sec.hue} / 0.07)`,
									borderColor: `oklch(0.72 0.18 ${sec.hue} / ${i === step ? 0.3 : 0.12})`,
									boxShadow: i === step ? `0 0 8px oklch(0.72 0.18 ${sec.hue} / 0.18)` : "none",
								}}
							>
								<div className="h-1 rounded" style={{ width: `${45 + i * 12}%`, background: `oklch(0.72 0.18 ${sec.hue} / ${i === step ? 0.3 : 0.15})` }} />
								<div className="ml-auto h-1 rounded w-6" style={{ background: `oklch(0.72 0.18 ${sec.hue} / 0.12)` }} />
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				{/* Right: Properties panel */}
				<motion.div
					variants={sidebarItemVariant}
					className="w-14 flex flex-col border-l shrink-0"
					style={{ background: "oklch(0.10 0.02 175)", borderColor: `${accent.replace(")", " / 0.1)")}` }}
				>
					<div className="h-5 flex items-center px-1.5 border-b" style={{ borderColor: `${accent.replace(")", " / 0.08)")}` }}>
						<div className="h-1 rounded w-3/4" style={{ background: `${accent.replace(")", " / 0.15)")}` }} />
					</div>
					<AnimatePresence mode="wait">
						<motion.div
							key={`${generation}-${step}`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="flex flex-col gap-1.5 p-1.5 flex-1"
						>
							{[0, 1, 2].map((i) => (
								<div key={i} className="flex flex-col gap-0.5">
									<div className="h-1 rounded w-6" style={{ background: `${accent.replace(")", " / 0.15)")}` }} />
									<div className="h-3 rounded border" style={{ background: `${accent.replace(")", " / 0.05)")}`, borderColor: `${accent.replace(")", " / 0.1)")}` }}>
										<motion.div
											className="h-full rounded"
											style={{ background: `${accent.replace(")", " / 0.18)")}` }}
											animate={{ width: ["20%", `${35 + i * 15}%`, "20%"] }}
											transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
										/>
									</div>
								</div>
							))}
						</motion.div>
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</>
	);
}

// ─── Main SplashScreen ────────────────────────────────────────────────────────
interface SplashScreenProps {
	mode?: "admin" | "editor";
}

export function SplashScreen({ mode = "admin" }: SplashScreenProps) {
	const theme = THEMES[mode];
	const isEditor = mode === "editor";

	// Admin: cycles through tabs
	const [activeTab, setActiveTab] = useState(0);
	// Editor: accumulates sections then resets
	const [editorStep, setEditorStep] = useState(0);
	const [generation, setGeneration] = useState(0);

	useEffect(() => {
		if (isEditor) {
			const id = setInterval(() => {
				setEditorStep((prev) => {
					if (prev >= EDITOR_SECTIONS.length - 1) {
						setGeneration((g) => g + 1);
						return 0;
					}
					return prev + 1;
				});
			}, 1900);
			return () => clearInterval(id);
		} else {
			setActiveTab(0);
			const id = setInterval(
				() => setActiveTab((i) => (i + 1) % ADMIN_TABS.length),
				2200,
			);
			return () => clearInterval(id);
		}
	}, [isEditor]);

	const currentMessage = isEditor
		? EDITOR_SECTIONS[editorStep].message
		: ADMIN_TABS[activeTab].message;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden select-none">
			{/* Dot grid */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `radial-gradient(circle, ${theme.dot} 1px, transparent 1px)`,
					backgroundSize: "28px 28px",
				}}
			/>

			{/* Centre radial glow */}
			<div
				className="absolute inset-0"
				style={{
					background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${theme.glow}, transparent 70%)`,
				}}
			/>

			{/* Ambient corner orbs */}
			<motion.div
				className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full"
				style={{ background: `radial-gradient(circle, ${theme.glowCorner1}, transparent 70%)` }}
				animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
				transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full"
				style={{ background: `radial-gradient(circle, ${theme.glowCorner2}, transparent 70%)` }}
				animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 1, 0.6] }}
				transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
			/>

			{/* ── Main content ── */}
			<div className="relative flex flex-col items-center gap-10">
				{/* Mini UI preview */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 12 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					className="relative w-80 h-52 rounded-2xl overflow-hidden border"
					style={{
						borderColor: `${theme.accent.replace(")", " / 0.2)")}`,
						background: "oklch(0.16 0.025 175)",
						boxShadow: `0 0 0 1px ${theme.accent.replace(")", " / 0.07)")}, 0 24px 64px -12px ${theme.accent.replace(")", " / 0.28)")}`,
					}}
				>
					{isEditor ? (
						<EditorMiniPreview step={editorStep} generation={generation} accent={theme.accent} />
					) : (
						<AdminMiniPreview activeTab={activeTab} accent={theme.accent} />
					)}

					{/* Scan line */}
					<motion.div
						className="absolute inset-x-0 h-px pointer-events-none"
						style={{
							background: `linear-gradient(90deg, transparent, ${theme.accent.replace(")", " / 0.7)")} 40%, ${theme.accent.replace(")", " / 0.7)")} 60%, transparent)`,
						}}
						animate={{ y: [32, 210, 32] }}
						transition={{ duration: isEditor ? 2.4 : 3, repeat: Infinity, ease: "linear" }}
					/>

					{/* Mode badge */}
					<motion.div
						initial={{ opacity: 0, scale: 0.7 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 1.0, type: "spring", stiffness: 300, damping: 20 }}
						className="absolute top-10 right-2 text-[7px] font-medium px-1.5 py-0.5 rounded-full border"
						style={{
							background: `${theme.accent.replace(")", " / 0.1)")}`,
							borderColor: `${theme.accent.replace(")", " / 0.3)")}`,
							color: theme.accent,
						}}
					>
						{theme.badge}
					</motion.div>

					{/* Editor-only: Pencil icon in badge */}
					{isEditor && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1.4 }}
							className="absolute bottom-2 right-2"
						>
							<Pencil style={{ width: 8, height: 8, color: `${theme.accent.replace(")", " / 0.4)")}` }} />
						</motion.div>
					)}
				</motion.div>

				{/* Brand */}
				<div className="flex flex-col items-center gap-3">
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
						className="text-2xl font-semibold tracking-tight"
					>
						<span className="text-foreground">{theme.brand.prefix}</span>
						<span style={{ color: theme.accent }}>{theme.brand.suffix}</span>
					</motion.div>

					{/* Cycling status */}
					<div className="h-4 overflow-hidden">
						<AnimatePresence mode="wait">
							<motion.p
								key={currentMessage}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.22 }}
								className="text-xs text-muted-foreground text-center"
							>
								{currentMessage}
							</motion.p>
						</AnimatePresence>
					</div>
				</div>

				{/* Pulsing dots */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.9 }}
					className="flex gap-2"
				>
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className="w-1.5 h-1.5 rounded-full"
							style={{ background: theme.accent }}
							animate={{ opacity: [0.2, 1, 0.2], scale: [0.75, 1, 0.75] }}
							transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
						/>
					))}
				</motion.div>
			</div>
		</div>
	);
}
