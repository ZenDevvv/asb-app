import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	MOCK_ORG_STATS,
	MOCK_AT_RISK_STUDENTS,
	MOCK_PERFORMANCE_OVERVIEW,
	MOCK_EVENTS,
} from "~/data/mock-org-admin-data";
import {
	Users,
	GraduationCap,
	BookOpen,
	CheckCircle2,
	TrendingUp,
	TrendingDown,
	Minus,
	AlertTriangle,
	Plus,
	UserPlus,
	FileBarChart,
	ExternalLink,
} from "lucide-react";

const statCards = [
	{
		title: "Total Students",
		value: MOCK_ORG_STATS.totalStudents.toLocaleString(),
		trend: MOCK_ORG_STATS.totalStudentsTrend,
		trendType: "up" as const,
		icon: Users,
		iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
	},
	{
		title: "Active Instructors",
		value: MOCK_ORG_STATS.activeInstructors.toLocaleString(),
		trend: MOCK_ORG_STATS.activeInstructorsTrend,
		trendType: "up" as const,
		icon: GraduationCap,
		iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
	},
	{
		title: "Active Courses",
		value: MOCK_ORG_STATS.activeCourses.toLocaleString(),
		trend: MOCK_ORG_STATS.activeCoursesTrend,
		trendType: "neutral" as const,
		icon: BookOpen,
		iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
	},
	{
		title: "Completion Rate",
		value: `${MOCK_ORG_STATS.completionRate}%`,
		trend: MOCK_ORG_STATS.completionRateTrend,
		trendType: "down" as const,
		icon: CheckCircle2,
		iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
	},
];

// Max bar height for performance chart
const maxRate = Math.max(...MOCK_PERFORMANCE_OVERVIEW.map((d) => d.rate));

export default function OrgAdminDashboard() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-foreground">
					Organization Dashboard
				</h1>
				<p className="text-sm text-muted-foreground">
					Welcome back to Lincoln State University Admin Portal
				</p>
			</div>

			{/* Stat Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat) => (
					<Card key={stat.title} className="border-border/50">
						<CardContent className="p-5">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium text-muted-foreground">
									{stat.title}
								</p>
								<div className={`rounded-lg p-2 ${stat.iconBg}`}>
									<stat.icon className="size-4" />
								</div>
							</div>
							<div className="mt-3">
								<p className="text-3xl font-bold tracking-tight text-foreground">
									{stat.value}
								</p>
								<div className="mt-1 flex items-center gap-1.5">
									{stat.trendType === "up" && (
										<TrendingUp className="size-3.5 text-emerald-600" />
									)}
									{stat.trendType === "down" && (
										<TrendingDown className="size-3.5 text-red-500" />
									)}
									{stat.trendType === "neutral" && (
										<Minus className="size-3.5 text-muted-foreground" />
									)}
									<span
										className={`text-xs font-medium ${
											stat.trendType === "up"
												? "text-emerald-600"
												: stat.trendType === "down"
													? "text-red-500"
													: "text-muted-foreground"
										}`}>
										{stat.trend}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Middle Section: At-Risk Alerts + Quick Actions */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* At-Risk Student Alerts */}
				<Card className="border-border/50 lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<div className="flex items-center gap-2">
							<AlertTriangle className="size-5 text-red-500" />
							<div>
								<CardTitle className="text-lg font-semibold">
									At-Risk Student Alerts
								</CardTitle>
								<p className="text-xs text-muted-foreground">
									Students with attendance &lt; 70% or grade &lt; 60%
								</p>
							</div>
						</div>
						<Button variant="link" size="sm" className="text-primary">
							View All Risk Report
						</Button>
					</CardHeader>
					<CardContent className="px-6 pb-6">
						{/* Table Header */}
						<div className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 border-b border-border/50 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							<span>Student</span>
							<span>Course</span>
							<span className="w-28 text-center">Risk Factor</span>
							<span className="w-20 text-center">Action</span>
						</div>

						{/* Table Rows */}
						<div className="divide-y divide-border/40">
							{MOCK_AT_RISK_STUDENTS.map((student) => (
								<div
									key={student.id}
									className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 py-4">
									{/* Student Info */}
									<div className="flex items-center gap-3">
										<Avatar className="size-9">
											<AvatarFallback
												className={`${student.avatarColor} text-white text-xs font-semibold`}>
												{student.initials}
											</AvatarFallback>
										</Avatar>
										<span className="text-sm font-medium text-foreground">
											{student.name}
										</span>
									</div>

									{/* Course */}
									<span className="text-sm text-muted-foreground">
										{student.course}
									</span>

									{/* Risk Factor */}
									<div className="w-28 text-center">
										<Badge
											className={`text-[11px] ${
												student.riskType === "grade"
													? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
													: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
											}`}>
											{student.riskFactor}
										</Badge>
									</div>

									{/* Action */}
									<div className="w-20 text-center">
										<Button variant="link" size="sm" className="text-primary">
											Contact
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card className="border-border/50 bg-primary text-primary-foreground">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg font-semibold text-primary-foreground">
							Quick Actions
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 px-6 pb-6">
						<Button
							variant="secondary"
							className="w-full justify-start gap-3 bg-white/15 text-primary-foreground hover:bg-white/25 border-0">
							<Plus className="size-4" />
							Create New Course
						</Button>
						<Button
							variant="secondary"
							className="w-full justify-start gap-3 bg-white/15 text-primary-foreground hover:bg-white/25 border-0">
							<UserPlus className="size-4" />
							Register Student
						</Button>
						<Button
							variant="secondary"
							className="w-full justify-start gap-3 bg-white/15 text-primary-foreground hover:bg-white/25 border-0">
							<FileBarChart className="size-4" />
							Generate Report
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Bottom Section: Performance Overview + Events & News */}
			<div className="grid gap-6 lg:grid-cols-5">
				{/* Performance Overview */}
				<Card className="border-border/50 lg:col-span-3">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-lg font-semibold">
							Performance Overview
						</CardTitle>
						<Select defaultValue="this-semester">
							<SelectTrigger className="w-40 h-9">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="this-semester">This Semester</SelectItem>
								<SelectItem value="last-semester">Last Semester</SelectItem>
								<SelectItem value="this-year">This Year</SelectItem>
							</SelectContent>
						</Select>
					</CardHeader>
					<CardContent className="px-6 pb-6">
						{/* Bar Chart */}
						<div className="flex items-end justify-around gap-4 h-52 pt-4">
							{MOCK_PERFORMANCE_OVERVIEW.map((dept) => (
								<div key={dept.department} className="flex flex-col items-center gap-2 flex-1">
									<div className="w-full flex justify-center">
										<div
											className={`w-12 rounded-t-md ${dept.color} transition-all`}
											style={{
												height: `${(dept.rate / maxRate) * 180}px`,
											}}
										/>
									</div>
									<div className="text-center">
										<p className="text-xs font-medium text-foreground">
											{dept.department}
										</p>
										<p className="text-xs text-muted-foreground">
											{dept.rate}%
										</p>
									</div>
								</div>
							))}
						</div>
						<p className="mt-4 text-center text-xs text-muted-foreground">
							Departmental Graduation Rate Comparison
						</p>
					</CardContent>
				</Card>

				{/* Events & News */}
				<Card className="border-border/50 lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-lg font-semibold">
							Events & News
						</CardTitle>
						<Button variant="ghost" size="icon" className="size-8 text-primary">
							<Plus className="size-4" />
						</Button>
					</CardHeader>
					<CardContent className="px-6 pb-6">
						<div className="space-y-5">
							{MOCK_EVENTS.map((event) => (
								<div key={event.id} className="flex gap-3">
									<div className="flex flex-col items-center pt-1.5">
										<div className={`size-2.5 rounded-full ${event.dotColor}`} />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium text-primary">
											{event.date}
										</p>
										<p className="text-sm font-semibold text-foreground mt-0.5">
											{event.title}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
											{event.description}
										</p>
									</div>
								</div>
							))}
						</div>
						<Button
							variant="link"
							className="mt-4 w-full justify-center gap-1 text-primary text-sm">
							View All Events
							<ExternalLink className="size-3.5" />
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
