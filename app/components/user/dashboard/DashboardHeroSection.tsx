import type { RefObject } from "react";
import { motion } from "framer-motion";
import { Icon } from "~/components/ui/icon";
import {
	AI_CAPABILITIES,
	fadeIn,
	fadeUp,
	getGreeting,
	QUICK_PROMPTS,
	RECENT_ACTIVITY,
	TONE_GLOWS,
	TONES,
	type ToneId,
} from "./dashboard-constants";

interface DashboardHeroSectionProps {
	displayName: string;
	prompt: string;
	tone: ToneId;
	chatFocused: boolean;
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	prefersReducedMotion: boolean | null;
	onPromptChange: (value: string) => void;
	onToneChange: (tone: ToneId) => void;
	onChatFocusedChange: (focused: boolean) => void;
	onGenerate: () => void;
}

export function DashboardHeroSection({
	displayName,
	prompt,
	tone,
	chatFocused,
	textareaRef,
	prefersReducedMotion,
	onPromptChange,
	onToneChange,
	onChatFocusedChange,
	onGenerate,
}: DashboardHeroSectionProps) {
	const safeFadeUp = prefersReducedMotion ? fadeIn : fadeUp;

	return (
		<section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-12 pt-16 text-center md:px-10 md:pt-20">
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
					<span className="text-xs font-semibold text-foreground">Recent activity</span>
				</div>
				{RECENT_ACTIVITY.map(({ text, time, dotClassName }) => (
					<div key={text} className="mt-2.5 flex items-center gap-2">
						<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClassName}`} />
						<span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
							{text}
						</span>
						<span className="shrink-0 text-[10px] text-muted-foreground/55">
							{time}
						</span>
					</div>
				))}
			</motion.div>

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
				{AI_CAPABILITIES.map(({ icon, label }) => (
					<div key={label} className="mt-2 flex items-center gap-2">
						<Icon name={icon} size={13} className="shrink-0 text-primary/70" />
						<span className="text-[11px] text-muted-foreground">{label}</span>
					</div>
				))}
			</motion.div>

			<motion.p
				variants={safeFadeUp}
				initial="hidden"
				animate="show"
				transition={{ delay: 0.04 }}
				className="text-xs font-semibold uppercase tracking-widest text-primary">
				{getGreeting()},
			</motion.p>

			<motion.h1
				variants={safeFadeUp}
				initial="hidden"
				animate="show"
				transition={{ delay: 0.1 }}
				className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
				<span className="bg-gradient-to-r from-foreground via-foreground/85 to-foreground/60 bg-clip-text text-transparent">
					{displayName}.
				</span>
			</motion.h1>

			<motion.p
				variants={safeFadeUp}
				initial="hidden"
				animate="show"
				transition={{ delay: 0.16 }}
				className="mt-3 text-lg text-muted-foreground">
				What will you bring to life today?
			</motion.p>

			<motion.div
				variants={safeFadeUp}
				initial="hidden"
				animate="show"
				transition={{ delay: 0.24 }}
				className="relative mt-10 w-full max-w-3xl">
				<motion.div
					className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] opacity-70 blur-2xl"
					animate={{ background: TONE_GLOWS[tone] }}
					transition={{ duration: 0.6, ease: "easeInOut" }}
				/>

				<motion.div
					animate={
						chatFocused
							? { borderColor: "rgba(34,211,238,0.45)" }
							: { borderColor: "rgba(255,255,255,0.12)" }
					}
					transition={{ duration: 0.25 }}
					className="overflow-hidden rounded-[1.75rem] border bg-card/75 shadow-2xl shadow-black/20 backdrop-blur-xl">
					<div className="flex items-center gap-2 border-b border-border/40 px-5 py-2.5">
						<span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/20">
							<Icon name="auto_awesome" size={12} className="text-primary" filled />
						</span>
						<span className="text-xs font-medium text-muted-foreground">
							ASB AI Generator
						</span>
						<span className="ml-auto inline-flex items-center gap-1 rounded-full bg-chart-3/15 px-2 py-0.5 text-[10px] font-semibold text-chart-3">
							<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-3" />
							Online
						</span>
					</div>

					<div className="px-5 pb-3 pt-4">
						<textarea
							ref={textareaRef}
							value={prompt}
							onChange={(event) => onPromptChange(event.target.value.slice(0, 500))}
							onFocus={() => onChatFocusedChange(true)}
							onBlur={() => onChatFocusedChange(false)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
									onGenerate();
								}
							}}
							placeholder="Describe your website... e.g. 'A bold SaaS landing page for a project management tool - dark theme, pricing section, and waitlist form'"
							className="minimal-scrollbar w-full resize-none bg-transparent text-base leading-relaxed text-foreground placeholder:text-muted-foreground/45 focus:outline-none"
							style={{ minHeight: 80, maxHeight: 180 }}
						/>
					</div>

					<div className="flex flex-col gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center">
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="shrink-0 text-xs text-muted-foreground/70">Tone:</span>
							{TONES.map(({ id, label, icon }) => (
								<button
									key={id}
									type="button"
									onClick={() => onToneChange(id)}
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

						<div className="flex shrink-0 items-center gap-3 sm:ml-auto">
							<span className="text-xs tabular-nums text-muted-foreground">
								{prompt.length}
								<span className="text-muted-foreground/40">/500</span>
							</span>
							<button
								type="button"
								onClick={onGenerate}
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

			<motion.div
				variants={safeFadeUp}
				initial="hidden"
				animate="show"
				transition={{ delay: 0.33 }}
				className="mt-5 flex flex-wrap items-center justify-center gap-2">
				<span className="text-xs text-muted-foreground/60">Try:</span>
				{QUICK_PROMPTS.map((quickPrompt) => (
					<button
						key={quickPrompt}
						type="button"
						onClick={() => {
							onPromptChange(quickPrompt);
							textareaRef.current?.focus();
						}}
						className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground active:scale-95">
						{quickPrompt}
					</button>
				))}
			</motion.div>

			<motion.div
				variants={safeFadeUp}
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
	);
}
