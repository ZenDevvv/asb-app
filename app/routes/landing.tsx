import type { Route } from "./+types/landing";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router";
import { PAGE_TITLES } from "~/config/page-titles";
import { Icon } from "~/components/ui/icon";

export function meta({}: Route.MetaArgs) {
	return [{ title: PAGE_TITLES.landing }];
}

export default function LandingPage() {
	const suggestions = [
		"Landing Page for SaaS",
		"UX Design Portfolio",
		"Local Coffee Shop",
		"Digital Agency",
		"Crypto Dashboard",
	];
	const prefersReducedMotion = useReducedMotion();

	const revealItem: Variants = {
		hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: prefersReducedMotion ? 0.2 : 0.55,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	};

	const revealContainer: Variants = {
		hidden: {},
		show: {
			transition: {
				delayChildren: prefersReducedMotion ? 0.05 : 0.15,
				staggerChildren: prefersReducedMotion ? 0.05 : 0.1,
			},
		},
	};

	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-0">
				<motion.div
					className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
					initial={{ opacity: 0 }}
					animate={
						prefersReducedMotion
							? { opacity: 1 }
							: { opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }
					}
					transition={
						prefersReducedMotion
							? { duration: 0.35, ease: "easeOut" }
							: { duration: 8, repeat: Infinity, ease: "easeInOut" }
					}
				/>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.1),transparent_42%),radial-gradient(circle_at_82%_0%,rgba(16,185,129,0.1),transparent_35%)]" />
				<div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/90 to-transparent" />
			</div>

			<motion.header
				className="relative border-b border-border/50 bg-background/60 backdrop-blur-xl"
				initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -18 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: prefersReducedMotion ? 0.25 : 0.45, ease: "easeOut" }}>
				<div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 md:px-10">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/40">
							<Icon name="auto_awesome" size={16} filled />
						</div>
						<span className="text-xl font-semibold tracking-tight">
							AppSite<span className="text-primary">Builder</span>
						</span>
					</div>

					<nav className="hidden items-center gap-10 text-sm text-muted-foreground md:flex">
						<span className="cursor-default transition-colors hover:text-foreground">
							Showcase
						</span>
						<span className="cursor-default transition-colors hover:text-foreground">
							Pricing
						</span>
						<span className="cursor-default transition-colors hover:text-foreground">
							Docs
						</span>
					</nav>

					<div className="flex items-center gap-3">
						<Link
							to="/login"
							className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex">
							Log In
						</Link>
						<button
							type="button"
							className="inline-flex rounded-full border border-primary/35 bg-card/90 px-5 py-2 text-sm font-semibold text-foreground shadow-lg shadow-primary/20 backdrop-blur transition-colors hover:bg-primary/20">
							Get Started
						</button>
					</div>
				</div>
			</motion.header>

			<main className="relative mx-auto flex w-full max-w-7xl flex-1 items-start justify-center px-6 pb-24 pt-24 md:px-10 md:pt-16">
				<motion.section
					className="relative isolate flex w-full max-w-4xl flex-col items-center text-center"
					variants={revealContainer}
					initial="hidden"
					animate="show">
					<motion.div
						className="pointer-events-none absolute -left-28 top-10 -z-10 hidden w-60 rounded-3xl border border-border/70 bg-card/45 p-4 backdrop-blur-xl lg:block"
						initial={{
							opacity: 0,
							x: prefersReducedMotion ? 0 : -20,
							y: prefersReducedMotion ? 0 : 10,
						}}
						animate={
							prefersReducedMotion
								? { opacity: 1, x: 0, y: 0 }
								: { opacity: 1, x: 0, y: [0, -10, 0] }
						}
						transition={
							prefersReducedMotion
								? { duration: 0.3, delay: 0.2, ease: "easeOut" }
								: { duration: 1, delay: 0.35, ease: "easeInOut" }
						}>
						<div className="mb-4 flex items-center gap-2">
							<span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
							<span className="h-2.5 w-2.5 rounded-full bg-chart-4/70" />
							<span className="h-2.5 w-2.5 rounded-full bg-chart-3/70" />
						</div>
						<div className="h-20 rounded-2xl bg-muted/55" />
						<div className="mt-3 h-3 w-4/5 rounded-full bg-muted/50" />
						<div className="mt-2 h-3 w-3/5 rounded-full bg-muted/45" />
						<div className="mt-2 h-3 w-2/5 rounded-full bg-muted/40" />
					</motion.div>

					<motion.div
						className="pointer-events-none absolute -right-36 top-4/5 -z-10 hidden w-52 rounded-3xl border border-border/70 bg-card/45 p-4 backdrop-blur-xl lg:block"
						initial={{
							opacity: 0,
							x: prefersReducedMotion ? 0 : 20,
							y: prefersReducedMotion ? 0 : 10,
						}}
						animate={
							prefersReducedMotion
								? { opacity: 1, x: 0, y: 0 }
								: { opacity: 1, x: 0, y: [0, 8, 0] }
						}
						transition={
							prefersReducedMotion
								? { duration: 0.3, delay: 0.25, ease: "easeOut" }
								: { duration: 1, delay: 0.45, ease: "easeInOut" }
						}>
						<div className="mb-3 h-2 w-4/5 rounded-full bg-muted/50" />
						<div className="mb-4 h-2 w-1/2 rounded-full bg-muted/35" />
						<div className="grid grid-cols-4 gap-1.5">
							<div className="h-9 rounded-lg bg-muted/45" />
							<div className="h-9 rounded-lg bg-muted/40" />
							<div className="h-9 rounded-lg bg-muted/35" />
							<div className="h-9 rounded-lg bg-muted/30" />
						</div>
						<div className="mt-3 h-2 w-3/4 rounded-full bg-muted/35" />
					</motion.div>

					<motion.div
						variants={revealItem}
						className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
						<span className="h-2 w-2 rounded-full bg-primary" />
						beta now available
					</motion.div>

					<motion.h1
						variants={revealItem}
						className="mt-7 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
						Build your dream website
						<br />
						<span className="text-primary">with one sentence.</span>
					</motion.h1>

					<motion.div
						variants={revealItem}
						className="mt-12 w-full rounded-[2rem] border border-border/70 bg-card/60 p-3 shadow-2xl shadow-primary/15 backdrop-blur-xl">
						<div className="flex flex-col gap-3 rounded-[1.6rem] bg-background/70 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
							<div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-1 text-left text-base text-muted-foreground sm:px-4">
								<Icon
									name="auto_awesome"
									className="shrink-0 text-primary"
									size={18}
								/>
								<span className="line-clamp-2 sm:line-clamp-1">
									Describe your website (e.g. a SaaS pricing page for startup
									teams)...
								</span>
							</div>
							<button
								type="button"
								className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/35">
								<Icon name="bolt" size={18} filled />
								Generate
							</button>
						</div>
					</motion.div>

					<motion.div
						variants={revealItem}
						className="mt-7 flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
						{suggestions.map((item) => (
							<span
								key={item}
								className="rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-muted-foreground">
								{item}
							</span>
						))}
					</motion.div>
				</motion.section>
			</main>

			<motion.footer
				className="relative border-t border-border/50 bg-background/55 backdrop-blur-xl"
				initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: prefersReducedMotion ? 0.2 : 0.45,
					ease: "easeOut",
					delay: 0.3,
				}}>
				<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-7 md:flex-row md:px-10">
					<p className="text-sm text-muted-foreground">
						Trusted by 10,000+ creators building the future.
					</p>
					<div className="flex items-center gap-5">
						{Array.from({ length: 4 }).map((_, index) => (
							<div
								key={index}
								className="flex h-8 w-18 items-center justify-center rounded-lg border border-border/70 bg-card/70 px-3">
								<div className="h-1.5 w-10 rounded-full bg-muted-foreground/45" />
							</div>
						))}
					</div>
				</div>
			</motion.footer>
		</div>
	);
}
