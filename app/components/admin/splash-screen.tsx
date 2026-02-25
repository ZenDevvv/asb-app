import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LayoutGrid, Layers, Users, Settings } from "lucide-react";

// ─── Tab definitions ────────────────────────────────────────────────────────
const ADMIN_TABS = [
	{
		icon: LayoutGrid,
		label: "Overview",
		message: "Assembling your workspace...",
	},
	{ icon: Layers, label: "Templates", message: "Loading templates..." },
	{ icon: Users, label: "Users", message: "Fetching your users..." },
	{ icon: Settings, label: "Settings", message: "Configuring your tools..." },
];

const EDITOR_TABS = [
	{ icon: Layers, label: "Templates", message: "Fetching your template..." },
	{ icon: LayoutGrid, label: "Overview", message: "Preparing the canvas..." },
	{ icon: Settings, label: "Settings", message: "Restoring styles..." },
	{ icon: Users, label: "Users", message: "Almost ready to edit..." },
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

// ─── Per-tab content skeletons ───────────────────────────────────────────────
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
						<div
							className="w-1.5 h-1.5 rounded"
							style={{ background: `oklch(0.78 0.16 ${hue} / 0.6)` }}
						/>
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
				<div
					className="ml-auto h-1.5 w-5 rounded"
					style={{ background: "oklch(0.78 0.16 170 / 0.35)" }}
				/>
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
						<div
							className="w-full h-7 rounded"
							style={{ background: "oklch(0.78 0.16 170 / 0.07)" }}
						/>
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
					<div
						className="w-2.5 h-2.5 rounded"
						style={{ background: `oklch(0.78 0.16 ${150 + i * 14} / 0.32)` }}
					/>
					<div
						className="h-1 rounded bg-primary/15"
						style={{ width: `${28 + i * 12}%` }}
					/>
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
			<motion.div
				variants={skeletonPop}
				className="h-4 flex items-center gap-2 px-1"
			>
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
					<div
						className="w-3 h-3 rounded-full shrink-0"
						style={{ background: `oklch(0.78 0.16 ${158 + i * 9} / 0.38)` }}
					/>
					<div
						className="h-1 rounded bg-primary/20"
						style={{ width: `${30 + i * 7}%` }}
					/>
					<div
						className="ml-auto h-2.5 w-7 rounded-full border"
						style={{
							background: "oklch(0.78 0.16 170 / 0.08)",
							borderColor: "oklch(0.78 0.16 170 / 0.2)",
						}}
					/>
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
			<motion.div
				variants={skeletonPop}
				className="flex items-center gap-1.5"
			>
				<div className="h-1.5 rounded bg-primary/28 w-14" />
				<div className="flex-1 h-px bg-primary/8" />
			</motion.div>
			{[0, 1, 2].map((i) => (
				<motion.div key={i} variants={skeletonPop} className="flex flex-col gap-1">
					<div className="h-1 rounded bg-primary/15 w-10" />
					<div
						className="h-4 rounded-md border border-primary/12 flex items-center px-2"
						style={{ background: "oklch(0.18 0.02 175)" }}
					>
						<div className="h-1 rounded bg-primary/10 w-2/3" />
					</div>
				</motion.div>
			))}
			<motion.div
				variants={skeletonPop}
				className="mt-auto h-4 w-12 rounded-md self-end"
				style={{
					background: "oklch(0.78 0.16 170 / 0.22)",
					border: "1px solid oklch(0.78 0.16 170 / 0.3)",
				}}
			/>
		</motion.div>
	);
}

const TAB_CONTENT = [
	OverviewSkeleton,
	TemplatesSkeleton,
	UsersSkeleton,
	SettingsSkeleton,
];

// ─── Main component ───────────────────────────────────────────────────────────
interface SplashScreenProps {
	mode?: "admin" | "editor";
}

export function SplashScreen({ mode = "admin" }: SplashScreenProps) {
	const TABS = mode === "editor" ? EDITOR_TABS : ADMIN_TABS;
	const badge = mode === "editor" ? "EDITOR" : "LIVE";

	const [activeTab, setActiveTab] = useState(0);

	// Cycle tabs every 2.2 s
	useEffect(() => {
		setActiveTab(0);
		const id = setInterval(
			() => setActiveTab((i) => (i + 1) % TABS.length),
			2200,
		);
		return () => clearInterval(id);
	}, [TABS.length]);

	const ActiveContent = TAB_CONTENT[activeTab];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden select-none">
			{/* Dot grid */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						"radial-gradient(circle, oklch(0.78 0.16 170 / 0.12) 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>

			{/* Centre radial glow */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 65% 55% at 50% 50%, oklch(0.78 0.16 170 / 0.08), transparent 70%)",
				}}
			/>

			{/* Ambient corner orbs */}
			<motion.div
				className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full"
				style={{
					background:
						"radial-gradient(circle, oklch(0.78 0.16 170 / 0.07), transparent 70%)",
				}}
				animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
				transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full"
				style={{
					background:
						"radial-gradient(circle, oklch(0.60 0.12 190 / 0.08), transparent 70%)",
				}}
				animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 1, 0.6] }}
				transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
			/>

			{/* ── Main content ── */}
			<div className="relative flex flex-col items-center gap-10">
				{/* ── Mini UI preview ── */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 12 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					className="relative w-80 h-52 rounded-2xl overflow-hidden border border-primary/20"
					style={{
						background: "oklch(0.16 0.025 175)",
						boxShadow:
							"0 0 0 1px oklch(0.78 0.16 170 / 0.07), 0 24px 64px -12px oklch(0.78 0.16 170 / 0.28)",
					}}
				>
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
							<div
								className="w-2 h-2 rounded-full"
								style={{ background: "oklch(0.80 0.17 130 / 0.65)" }}
							/>
							<div className="w-2 h-2 rounded-full bg-primary/60" />
						</div>
						{/* URL bar — updates with active tab */}
						<div
							className="flex-1 h-3.5 rounded-md flex items-center gap-1.5 px-2 overflow-hidden"
							style={{ background: "oklch(0.78 0.16 170 / 0.06)" }}
						>
							<div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
							<AnimatePresence mode="wait">
								<motion.div
									key={activeTab}
									initial={{ opacity: 0, x: 6 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -6 }}
									transition={{ duration: 0.2 }}
									className="h-1 rounded bg-primary/20"
									style={{ width: `${40 + activeTab * 12}%` }}
								/>
							</AnimatePresence>
						</div>
					</motion.div>

					{/* Sidebar + content */}
					<div className="flex" style={{ height: "calc(100% - 2rem)" }}>
						{/* Mini sidebar */}
						<motion.div
							variants={sidebarStagger}
							initial="hidden"
							animate="show"
							className="relative w-[4.25rem] flex flex-col gap-1 p-2 border-r border-primary/10 shrink-0"
							style={{ background: "oklch(0.10 0.02 175)" }}
						>
							{/* Avatar */}
							<motion.div
								variants={sidebarItemVariant}
								className="flex items-center gap-1 mb-1.5 px-0.5"
							>
								<div
									className="w-4 h-4 rounded-full border border-primary/50 flex items-center justify-center shrink-0"
									style={{ background: "oklch(0.78 0.16 170 / 0.12)" }}
								>
									<div className="w-1.5 h-1.5 rounded-full bg-primary/80" />
								</div>
								<div className="h-1.5 rounded w-6 bg-primary/20" />
							</motion.div>

							{/* Nav items — active indicator slides via layoutId */}
							{TABS.map((tab, i) => (
								<motion.div
									key={i}
									variants={sidebarItemVariant}
									className="relative flex items-center gap-1.5 px-1 py-1 rounded-md overflow-hidden"
								>
									{/* Sliding background highlight */}
									{activeTab === i && (
										<motion.div
											layoutId="nav-bg"
											className="absolute inset-0 rounded-md"
											style={{ background: "oklch(0.78 0.16 170 / 0.13)" }}
											transition={{
												type: "spring",
												stiffness: 380,
												damping: 32,
											}}
										/>
									)}
									{/* Left border pill */}
									{activeTab === i && (
										<motion.div
											layoutId="nav-pill"
											className="absolute left-0 top-[3px] bottom-[3px] w-[3px] rounded-r"
											style={{ background: "oklch(0.78 0.16 170)" }}
											transition={{
												type: "spring",
												stiffness: 380,
												damping: 32,
											}}
										/>
									)}
									<tab.icon
										style={{
											width: 9,
											height: 9,
											position: "relative",
											color:
												activeTab === i
													? "oklch(0.78 0.16 170)"
													: "oklch(0.78 0.16 170 / 0.32)",
											transition: "color 0.2s",
										}}
									/>
									<div
										className="h-1 rounded flex-1 relative"
										style={{
											background:
												activeTab === i
													? "oklch(0.78 0.16 170 / 0.28)"
													: "oklch(0.78 0.16 170 / 0.09)",
											transition: "background 0.2s",
										}}
									/>
								</motion.div>
							))}
						</motion.div>

						{/* Content area with tab transitions */}
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

					{/* Scan line */}
					<motion.div
						className="absolute inset-x-0 h-px pointer-events-none"
						style={{
							background:
								"linear-gradient(90deg, transparent, oklch(0.78 0.16 170 / 0.7) 40%, oklch(0.78 0.16 170 / 0.7) 60%, transparent)",
						}}
						animate={{ y: [32, 210, 32] }}
						transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
					/>

					{/* LIVE badge */}
					<motion.div
						initial={{ opacity: 0, scale: 0.7 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							delay: 1.0,
							type: "spring",
							stiffness: 300,
							damping: 20,
						}}
						className="absolute top-10 right-2 text-[7px] font-medium px-1.5 py-0.5 rounded-full border border-primary/30"
						style={{
							background: "oklch(0.78 0.16 170 / 0.1)",
							color: "oklch(0.78 0.16 170)",
						}}
					>
						{badge}
					</motion.div>
				</motion.div>

				{/* Brand + status */}
				<div className="flex flex-col items-center gap-3">
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
						className="text-2xl font-semibold tracking-tight"
					>
						<span className="text-foreground">AppSite</span>
						<span className="text-primary">Builder</span>
					</motion.div>

					{/* Cycling message synced to active tab */}
					<div className="h-4 overflow-hidden">
						<AnimatePresence mode="wait">
							<motion.p
								key={activeTab}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.22 }}
								className="text-xs text-muted-foreground text-center"
							>
								{TABS[activeTab].message}
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
							className="w-1.5 h-1.5 rounded-full bg-primary"
							animate={{ opacity: [0.2, 1, 0.2], scale: [0.75, 1, 0.75] }}
							transition={{
								duration: 1.4,
								repeat: Infinity,
								delay: i * 0.22,
								ease: "easeInOut",
							}}
						/>
					))}
				</motion.div>
			</div>
		</div>
	);
}
