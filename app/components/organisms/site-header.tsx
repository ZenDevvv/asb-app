import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router";
import asbLogo from "~/assets/images/asb_logo.png";
import { cn } from "~/lib/utils";

type SiteHeaderProps = {
	nav?: ReactNode;
	actions?: ReactNode;
	logoHref?: string;
	className?: string;
	containerClassName?: string;
	navClassName?: string;
	actionsClassName?: string;
	logoClassName?: string;
	animationDuration?: number;
};

export function SiteHeader({
	nav,
	actions,
	logoHref,
	className,
	containerClassName,
	navClassName = "hidden items-center gap-8 text-sm text-muted-foreground md:flex",
	actionsClassName = "flex items-center gap-2",
	logoClassName = "h-10 w-auto",
	animationDuration = 0.45,
}: SiteHeaderProps) {
	const prefersReducedMotion = useReducedMotion();
	const logo = <img src={asbLogo} alt="ASB logo" className={logoClassName} />;

	return (
		<motion.header
			className={cn(
				"z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl",
				className,
			)}
			initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: prefersReducedMotion ? 0.2 : animationDuration,
				ease: "easeOut",
			}}>
			<div
				className={cn(
					"mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-10",
					containerClassName,
				)}>
				{logoHref ? (
					<Link to={logoHref} className="flex items-center">
						{logo}
					</Link>
				) : (
					<div className="flex items-center">{logo}</div>
				)}

				{nav ? <nav className={navClassName}>{nav}</nav> : null}
				{actions ? <div className={actionsClassName}>{actions}</div> : null}
			</div>
		</motion.header>
	);
}
