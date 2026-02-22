import type { LucideIcon } from "lucide-react";
import {
	AlertTriangle,
	Bell,
	Bot,
	CircleDollarSign,
	Globe2,
	MoreHorizontal,
	RefreshCw,
	Rocket,
	TrendingDown,
	TrendingUp,
	UserPlus,
	Users,
} from "lucide-react";

type StatCard = {
	title: string;
	value: string;
	change: string;
	changeType: "up" | "down";
	subtitle: string;
	icon: LucideIcon;
	iconStyle: string;
};

type ActivityItem = {
	title: string;
	description: string;
	highlight?: string;
	descriptionTail?: string;
	time: string;
	icon: LucideIcon;
	iconStyle: string;
	showPreview?: boolean;
};

const statCards: StatCard[] = [
	{
		title: "Total Users",
		value: "24,582",
		change: "+12.5%",
		changeType: "up",
		subtitle: "Active in last 30 days: 18.2k",
		icon: Users,
		iconStyle: "text-chart-5",
	},
	{
		title: "Active Sites",
		value: "8,943",
		change: "+8.2%",
		changeType: "up",
		subtitle: "Published this week: 142",
		icon: Globe2,
		iconStyle: "text-chart-2",
	},
	{
		title: "Monthly Revenue",
		value: "$142.5k",
		change: "+24%",
		changeType: "up",
		subtitle: "Recurring: $118k",
		icon: CircleDollarSign,
		iconStyle: "text-chart-4",
	},
	{
		title: "AI Tokens Used",
		value: "4.2M",
		change: "-2%",
		changeType: "down",
		subtitle: "Cost impact: Low",
		icon: Bot,
		iconStyle: "text-chart-1",
	},
];

const templatePerformance = [
	{ name: "SaaS Landing", value: 78, color: "bg-chart-1" },
	{ name: "Portfolio", value: 62, color: "bg-chart-2" },
	{ name: "E-commerce", value: 45, color: "bg-chart-4" },
	{ name: "Blog", value: 30, color: "bg-chart-5" },
];

const recentActivity: ActivityItem[] = [
	{
		title: "New Site Published",
		description: "User ",
		highlight: "@sarah_design",
		descriptionTail: ' launched "TechFlow Agency"',
		time: "2 mins ago",
		icon: Rocket,
		iconStyle: "text-chart-2",
		showPreview: true,
	},
	{
		title: "New User Signup",
		description: "Michael Chen joined the Pro Plan.",
		time: "45 mins ago",
		icon: UserPlus,
		iconStyle: "text-chart-5",
	},
	{
		title: "Template Updated",
		description: '"Portfolio Minimal" updated to v2.1 with new AI features.',
		time: "3 hours ago",
		icon: RefreshCw,
		iconStyle: "text-chart-1",
	},
	{
		title: "System Alert",
		description: "High API usage detected on server US-East-1.",
		time: "5 hours ago",
		icon: AlertTriangle,
		iconStyle: "text-destructive",
	},
];

const chartPrimaryPoints =
	"0,268 70,250 140,238 210,220 280,188 350,170 420,154 490,128 560,120 630,112 700,98 770,68 840,46";
const chartSecondaryPoints =
	"0,286 70,278 140,268 210,254 280,240 350,226 420,214 490,206 560,198 630,186 700,168 770,142 840,128";

const panelClass = "rounded-3xl border border-border bg-card/90 p-5 shadow-sm";

export default function OrgAdminDashboard() {
	return (
		<div className="min-h-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-background to-background text-foreground shadow-xl">
			<header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 lg:px-6">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						Dashboard Overview
					</h1>
					<p className="mt-1 text-xs text-muted-foreground sm:text-sm">
						Real-time insights into platform performance and growth.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs">
						<span className="h-2 w-2 rounded-full bg-primary" />
						<span className="text-muted-foreground">System Status:</span>
						<span className="font-semibold text-foreground">Operational</span>
					</div>
					<button
						type="button"
						className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						aria-label="Notifications">
						<Bell className="h-4 w-4" />
						<span className="absolute right-[9px] top-[9px] h-1.5 w-1.5 rounded-full bg-destructive" />
					</button>
				</div>
			</header>

			<div className="space-y-5 px-5 py-5 lg:px-6">
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{statCards.map((stat) => (
						<div
							key={stat.title}
							className="rounded-3xl border border-border bg-card/95 p-4 shadow-sm">
							<div className="flex items-start justify-between">
								<div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70">
									<stat.icon className={`h-4 w-4 ${stat.iconStyle}`} />
								</div>
								<div
									className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
										stat.changeType === "up"
											? "bg-chart-2/20 text-chart-2"
											: "bg-destructive/20 text-destructive"
									}`}>
									{stat.changeType === "up" ? (
										<TrendingUp className="h-3 w-3" />
									) : (
										<TrendingDown className="h-3 w-3" />
									)}
									{stat.change}
								</div>
							</div>
							<div className="mt-4">
								<p className="text-sm font-medium text-muted-foreground">
									{stat.title}
								</p>
								<p className="mt-1 text-xl font-semibold leading-none text-foreground sm:text-2xl">
									{stat.value}
								</p>
								<p className="mt-2 text-xs text-muted-foreground">
									{stat.subtitle}
								</p>
							</div>
						</div>
					))}
				</div>

				<div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
					<div className="space-y-5">
						<section className={panelClass}>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<h2 className="text-base font-semibold text-foreground sm:text-lg">
										Platform Growth
									</h2>
									<p className="mt-1 text-xs text-muted-foreground sm:text-sm">
										User acquisition &amp; published sites over time
									</p>
								</div>
								<div className="inline-flex rounded-full border border-border bg-muted/40 p-1 text-xs">
									<button
										type="button"
										className="rounded-full bg-background px-3 py-1 font-semibold text-foreground">
										30 Days
									</button>
									<button
										type="button"
										className="rounded-full px-3 py-1 font-medium text-muted-foreground transition-colors hover:text-foreground">
										90 Days
									</button>
									<button
										type="button"
										className="rounded-full px-3 py-1 font-medium text-muted-foreground transition-colors hover:text-foreground">
										Year
									</button>
								</div>
							</div>

							<div className="relative mt-4 h-[300px] overflow-hidden rounded-2xl border border-border bg-background/70 p-4">
								<div
									className="absolute inset-4 rounded-xl opacity-30"
									style={{
										backgroundImage:
											"linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
										backgroundSize: "22px 22px",
									}}
								/>
								<svg
									viewBox="0 0 840 300"
									className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
									preserveAspectRatio="none">
									<defs>
										<filter
											id="line-glow-admin"
											x="-20%"
											y="-20%"
											width="140%"
											height="140%">
											<feDropShadow
												dx="0"
												dy="0"
												stdDeviation="2.5"
												floodColor="var(--primary)"
												floodOpacity="0.35"
											/>
										</filter>
									</defs>
									<polyline
										points={chartPrimaryPoints}
										fill="none"
										stroke="var(--primary)"
										strokeWidth="3.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										filter="url(#line-glow-admin)"
									/>
									<polyline
										points={chartSecondaryPoints}
										fill="none"
										stroke="var(--chart-5)"
										strokeWidth="3.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeDasharray="9 7"
									/>
								</svg>
								<div className="absolute left-[48%] top-[39%] rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
									<p className="text-muted-foreground">Feb 14</p>
									<p className="mt-1 font-semibold text-popover-foreground">
										<span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
										1,240 Users
									</p>
								</div>
							</div>
						</section>

						<section className={panelClass}>
							<div className="mb-4 flex items-center justify-between gap-3">
								<h2 className="text-base font-semibold text-foreground sm:text-lg">
									Template Performance
								</h2>
								<button
									type="button"
									className="text-sm font-semibold text-primary transition-colors hover:opacity-80">
									View Report
								</button>
							</div>
							<div className="space-y-3">
								{templatePerformance.map((template) => (
									<div
										key={template.name}
										className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)_auto] items-center gap-3 text-sm">
										<span className="text-sm text-muted-foreground">
											{template.name}
										</span>
										<div className="h-2 rounded-full bg-muted">
											<div
												className={`h-full rounded-full ${template.color}`}
												style={{ width: `${template.value}%` }}
											/>
										</div>
										<span className="text-sm font-semibold text-foreground">
											{template.value}%
										</span>
									</div>
								))}
							</div>
						</section>
					</div>

					<aside className={`${panelClass} relative`}>
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-base font-semibold text-foreground sm:text-lg">
								Recent Activity
							</h2>
							<button
								type="button"
								className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
								aria-label="More options">
								<MoreHorizontal className="h-4 w-4" />
							</button>
						</div>

						<div className="pointer-events-none absolute bottom-20 left-[35px] top-[72px] border-l border-border" />

						<div className="space-y-6">
							{recentActivity.map((item) => (
								<div key={item.title} className="relative pl-12">
									<div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
										<item.icon className={`h-4 w-4 ${item.iconStyle}`} />
									</div>
									<h3 className="text-sm font-semibold text-foreground">
										{item.title}
									</h3>
									<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
										{item.description}
										{item.highlight ? (
											<span className="text-primary">{item.highlight}</span>
										) : null}
										{item.descriptionTail ?? ""}
									</p>
									{item.showPreview ? (
										<div className="relative mt-3 h-20 overflow-hidden rounded-xl border border-border bg-gradient-to-r from-primary/35 via-chart-5/25 to-chart-2/35">
											<div className="absolute -right-3 -top-4 h-24 w-10 rounded-full bg-card/85" />
											<div className="absolute right-8 top-0 h-16 w-7 rounded-full bg-card/80" />
										</div>
									) : null}
									<p className="mt-2 text-[11px] text-muted-foreground">
										{item.time}
									</p>
								</div>
							))}
						</div>

						<button
							type="button"
							className="mt-7 w-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
							View All Activity
						</button>
					</aside>
				</div>
			</div>
		</div>
	);
}
