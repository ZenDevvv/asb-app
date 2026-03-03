import { Link, Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import asbLogo from "~/assets/images/asb_logo.png";

const formFade = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.1 } },
	exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function AuthLayout() {
	const location = useLocation();

	return (
		<main className="relative flex flex-col min-h-screen bg-background">
			{/* Top bar */}
			<header className="flex items-center justify-between px-6 py-4 shrink-0">
				<div className="flex justify-center pb-1">
					<Link to="/" className="inline-flex items-center">
						<img src={asbLogo} alt="ASB logo" className="h-10 w-auto" />
					</Link>
				</div>
				<a
					href="#"
					className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
					Help Center
				</a>
			</header>

			{/* Form area */}
			<div className="flex flex-1 items-center justify-center px-4 py-10">
				<AnimatePresence mode="wait">
					<motion.div
						key={location.pathname}
						variants={formFade}
						initial="initial"
						animate="animate"
						exit="exit"
						className="w-full flex justify-center">
						<Outlet />
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Footer */}
			<footer className="shrink-0 py-4 text-center">
				<p className="text-xs text-muted-foreground">
					&copy; {new Date().getFullYear()} AppSite Builder. All rights reserved.
				</p>
			</footer>
		</main>
	);
}
