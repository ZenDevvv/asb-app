import { motion } from "framer-motion";

interface DashboardBackgroundProps {
	prefersReducedMotion: boolean | null;
}

export function DashboardBackground({ prefersReducedMotion }: DashboardBackgroundProps) {
	return (
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
	);
}
