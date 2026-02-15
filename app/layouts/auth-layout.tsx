import { Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "~/components/auth/icon";

const formFade = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.15 } },
	exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

function HeroContent({ isRegister }: { isRegister: boolean }) {
	return (
		<div className="relative z-10 flex flex-col justify-between w-full h-full p-10">
			{/* Logo */}
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-sm">
					<Icon name="school" className="text-xl" />
				</div>
				<span className="text-white font-semibold text-lg tracking-tight">ALMA LMS</span>
			</div>

			{/* Headline */}
			<div className="max-w-lg space-y-6">
				<AnimatePresence mode="wait">
					<motion.div
						key={isRegister ? "reg-text" : "login-text"}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
						className="space-y-4">
						<h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
							{isRegister ? (
								<>
									Start your learning{" "}
									<span className="italic">journey today.</span>
								</>
							) : (
								<>
									Empowering the next generation of{" "}
									<span className="italic">innovators.</span>
								</>
							)}
						</h1>
						<p className="text-white/80 text-base leading-relaxed max-w-md">
							{isRegister
								? "Join thousands of learners and educators on the most intuitive learning management platform."
								: "Access your courses, collaborate with peers, and track your progress in one secure, unified learning environment."}
						</p>
					</motion.div>
				</AnimatePresence>

				{/* Badges */}
				<div className="flex items-center gap-3 pt-2">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
						<Icon name="lock" className="text-sm" />
						Secure Access
					</span>
					<span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
						<Icon name="monitoring" className="text-sm" />
						Real-time Analytics
					</span>
				</div>
			</div>

			{/* Footer */}
			<p className="text-white/50 text-sm">
				&copy; {new Date().getFullYear()} ALMA Education Systems. All rights reserved.
			</p>
		</div>
	);
}

export default function AuthLayout() {
	const location = useLocation();
	const isRegister = location.pathname === "/register";

	return (
		<main className="relative w-full h-screen overflow-hidden bg-white dark:bg-gray-950">
			{/* ── Desktop: Form layers behind the hero overlay ── */}

			{/* Login form slot — right half */}
			<div className="hidden lg:flex absolute inset-y-0 right-0 w-1/2 flex-col">
				<AnimatePresence mode="wait">
					{!isRegister && (
						<motion.div
							key="login-slot"
							variants={formFade}
							initial="initial"
							animate="animate"
							exit="exit"
							className="flex flex-col flex-1">
							<div className="flex justify-end p-6">
								<a
									href="#"
									className="text-sm font-medium text-primary hover:underline underline-offset-4">
									Need help?
								</a>
							</div>
							<div className="flex flex-1 items-center justify-center px-6 pb-12">
								<Outlet />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Register form slot — left half */}
			<div className="hidden lg:flex absolute inset-y-0 left-0 w-1/2 flex-col">
				<AnimatePresence mode="wait">
					{isRegister && (
						<motion.div
							key="register-slot"
							variants={formFade}
							initial="initial"
							animate="animate"
							exit="exit"
							className="flex flex-col flex-1">
							<div className="flex justify-end p-6">
								<a
									href="#"
									className="text-sm font-medium text-primary hover:underline underline-offset-4">
									Need help?
								</a>
							</div>
							<div className="flex flex-1 items-center justify-center px-6 pb-12">
								<Outlet />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* ── Sliding Hero Overlay ── */}
			<motion.div
				className="hidden lg:flex absolute inset-y-0 w-1/2 z-20"
				animate={{ left: isRegister ? "50%" : "0%" }}
				transition={{ type: "spring", stiffness: 300, damping: 30 }}>
				<img
					src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2670"
					alt="Modern office interior"
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-primary/85" />
				<HeroContent isRegister={isRegister} />
			</motion.div>

			{/* ── Mobile: single column, no hero ── */}
			<div className="lg:hidden flex flex-col min-h-screen">
				<AnimatePresence mode="wait">
					<motion.div
						key={location.pathname}
						variants={formFade}
						initial="initial"
						animate="animate"
						exit="exit"
						className="flex flex-col flex-1 bg-white dark:bg-gray-950">
						<div className="flex justify-end p-6">
							<a
								href="#"
								className="text-sm font-medium text-primary hover:underline underline-offset-4">
								Need help?
							</a>
						</div>
						<div className="flex flex-1 items-center justify-center px-6 pb-12">
							<div className="w-full max-w-[400px] space-y-8">
								{/* Mobile logo */}
								<div className="flex items-center gap-3 justify-center">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
										<Icon name="school" className="text-xl" />
									</div>
									<span className="text-foreground font-semibold text-lg tracking-tight">
										ALMA LMS
									</span>
								</div>
								<Outlet />
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</main>
	);
}
