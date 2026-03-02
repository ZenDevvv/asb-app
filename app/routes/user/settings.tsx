import { motion } from "framer-motion";
import { Icon } from "~/components/ui/icon";

type MockPreference = {
	id: string;
	label: string;
	value: string;
	icon: string;
	tone: "primary" | "chart-2" | "chart-4" | "chart-5";
};

type MockNotification = {
	id: string;
	label: string;
	channel: string;
	status: "enabled" | "paused";
};

const mockProfile = {
	name: "Alex Rivera",
	email: "alex.rivera@appsitebuilder.dev",
	role: "Creator",
	workspace: "Northwind Studio",
	plan: "Pro",
};

const mockPreferences: MockPreference[] = [
	{
		id: "editor-mode",
		label: "Default editor mode",
		value: "Website + CMS visible",
		icon: "web",
		tone: "primary",
	},
	{
		id: "autosave",
		label: "Autosave cadence",
		value: "Every 3 seconds",
		icon: "save",
		tone: "chart-2",
	},
	{
		id: "timezone",
		label: "Workspace timezone",
		value: "Asia/Manila (GMT+8)",
		icon: "schedule",
		tone: "chart-5",
	},
	{
		id: "theme",
		label: "Theme preset",
		value: "Dark teal",
		icon: "palette",
		tone: "chart-4",
	},
];

const mockNotifications: MockNotification[] = [
	{
		id: "build-updates",
		label: "Build and publish updates",
		channel: "In-app + email",
		status: "enabled",
	},
	{
		id: "template-releases",
		label: "New template releases",
		channel: "In-app",
		status: "enabled",
	},
	{
		id: "tips",
		label: "Weekly tips and walkthroughs",
		channel: "Email digest",
		status: "paused",
	},
];

const mockSecurity = [
	{ id: "2fa", title: "Two-factor auth", detail: "Disabled in mock mode", icon: "shield" },
	{ id: "sessions", title: "Active sessions", detail: "2 devices", icon: "devices" },
	{ id: "password", title: "Password rotation", detail: "Updated 29 days ago", icon: "key" },
];

function toneClasses(tone: MockPreference["tone"]): string {
	if (tone === "chart-2") return "border-chart-2/35 bg-chart-2/15 text-chart-2";
	if (tone === "chart-4") return "border-chart-4/35 bg-chart-4/15 text-chart-4";
	if (tone === "chart-5") return "border-chart-5/35 bg-chart-5/15 text-chart-5";
	return "border-primary/35 bg-primary/15 text-primary";
}

export function meta() {
	return [{ title: "Settings - AppSiteBuilder" }];
}

export default function UserSettingsRoute() {
	return (
		<div className="mx-auto min-h-full w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
			<motion.section
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.28, ease: "easeOut" }}
				className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl"
			>
				<div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-primary/18 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-chart-5/16 blur-3xl" />

				<div className="relative flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-primary">
							Account Settings
						</p>
						<h1 className="mt-1 text-3xl font-bold tracking-tight">Workspace Preferences</h1>
						<p className="mt-2 max-w-xl text-sm text-muted-foreground">
							This page is currently mock data only. Controls are read-only and have no
							functionality yet.
						</p>
					</div>
					<span className="inline-flex items-center gap-1 rounded-full border border-chart-4/35 bg-chart-4/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-chart-4">
						<Icon name="science" size={13} />
						Mock data
					</span>
				</div>

				<div className="relative mt-6 grid gap-4 md:grid-cols-2">
					<div className="rounded-2xl border border-border/70 bg-background/60 p-4">
						<p className="text-xs uppercase tracking-widest text-muted-foreground">
							Profile Snapshot
						</p>
						<div className="mt-3 flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 font-semibold text-primary">
								{mockProfile.name
									.split(" ")
									.map((part) => part.charAt(0))
									.join("")
									.slice(0, 2)
									.toUpperCase()}
							</div>
							<div className="min-w-0">
								<p className="truncate text-base font-semibold">{mockProfile.name}</p>
								<p className="truncate text-sm text-muted-foreground">{mockProfile.email}</p>
							</div>
						</div>
					</div>
					<div className="grid gap-3 sm:grid-cols-3">
						{[
							{ label: "Role", value: mockProfile.role },
							{ label: "Workspace", value: mockProfile.workspace },
							{ label: "Plan", value: mockProfile.plan },
						].map((item) => (
							<div
								key={item.label}
								className="rounded-2xl border border-border/70 bg-background/60 p-3"
							>
								<p className="text-xs uppercase tracking-widest text-muted-foreground">
									{item.label}
								</p>
								<p className="mt-1 truncate text-sm font-semibold">{item.value}</p>
							</div>
						))}
					</div>
				</div>
			</motion.section>

			<section className="mt-6 grid gap-4 xl:grid-cols-3">
				<motion.article
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.28, delay: 0.04, ease: "easeOut" }}
					className="rounded-2xl border border-border/70 bg-card/45 p-5"
				>
					<div className="mb-4 flex items-center justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-primary">
								Editor Defaults
							</p>
							<h2 className="text-lg font-semibold">Preferences</h2>
						</div>
						<Icon name="tune" size={18} className="text-muted-foreground" />
					</div>
					<div className="space-y-3">
						{mockPreferences.map((item) => (
							<div
								key={item.id}
								className="rounded-2xl border border-border/70 bg-background/65 p-3"
							>
								<div className="flex items-start justify-between gap-2">
									<div>
										<p className="text-sm font-semibold">{item.label}</p>
										<p className="text-xs text-muted-foreground">{item.value}</p>
									</div>
									<span
										className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${toneClasses(
											item.tone,
										)}`}
									>
										<Icon name={item.icon} size={12} />
										Mock
									</span>
								</div>
							</div>
						))}
					</div>
				</motion.article>

				<motion.article
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.28, delay: 0.08, ease: "easeOut" }}
					className="rounded-2xl border border-border/70 bg-card/45 p-5"
				>
					<div className="mb-4 flex items-center justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-primary">
								Notifications
							</p>
							<h2 className="text-lg font-semibold">Delivery Channels</h2>
						</div>
						<Icon name="notifications" size={18} className="text-muted-foreground" />
					</div>
					<div className="space-y-3">
						{mockNotifications.map((item) => {
							const enabled = item.status === "enabled";
							return (
								<div
									key={item.id}
									className="rounded-2xl border border-border/70 bg-background/65 p-3"
								>
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="text-sm font-semibold">{item.label}</p>
											<p className="text-xs text-muted-foreground">{item.channel}</p>
										</div>
										<span
											className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${
												enabled
													? "border-chart-2/35 bg-chart-2/15 text-chart-2"
													: "border-muted-foreground/35 bg-muted/80 text-muted-foreground"
											}`}
										>
											{item.status}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</motion.article>

				<motion.article
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.28, delay: 0.12, ease: "easeOut" }}
					className="rounded-2xl border border-border/70 bg-card/45 p-5"
				>
					<div className="mb-4 flex items-center justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-primary">
								Security
							</p>
							<h2 className="text-lg font-semibold">Read-only status</h2>
						</div>
						<Icon name="verified_user" size={18} className="text-muted-foreground" />
					</div>
					<div className="space-y-3">
						{mockSecurity.map((item) => (
							<div
								key={item.id}
								className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/65 p-3"
							>
								<div className="mt-0.5 rounded-xl border border-border/70 bg-card/60 p-1.5 text-primary">
									<Icon name={item.icon} size={14} />
								</div>
								<div>
									<p className="text-sm font-semibold">{item.title}</p>
									<p className="text-xs text-muted-foreground">{item.detail}</p>
								</div>
							</div>
						))}
					</div>
					<button
						type="button"
						disabled
						className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground"
					>
						<Icon name="lock" size={15} />
						No actions available in mock mode
					</button>
				</motion.article>
			</section>
		</div>
	);
}
