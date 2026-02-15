export const MOCK_ORG_STATS = {
	totalStudents: 2845,
	totalStudentsTrend: "+12%",
	activeInstructors: 142,
	activeInstructorsTrend: "+4%",
	activeCourses: 315,
	activeCoursesTrend: "~0%",
	completionRate: 87.4,
	completionRateTrend: "~2%",
};

export const MOCK_AT_RISK_STUDENTS = [
	{
		id: "1",
		name: "Michael Scott",
		initials: "MS",
		avatarColor: "bg-violet-600",
		course: "Intro to Management",
		riskFactor: "Grade: 54%",
		riskType: "grade" as const,
	},
	{
		id: "2",
		name: "Dwight Schrute",
		initials: "DS",
		avatarColor: "bg-amber-600",
		course: "Advanced Beets",
		riskFactor: "Attendance: 65%",
		riskType: "attendance" as const,
	},
	{
		id: "3",
		name: "Jim Halpert",
		initials: "JH",
		avatarColor: "bg-blue-600",
		course: "Sales Strategies",
		riskFactor: "Grade: 48%",
		riskType: "grade" as const,
	},
];

export const MOCK_PERFORMANCE_OVERVIEW = [
	{ department: "Science", rate: 85, color: "bg-blue-400" },
	{ department: "Business", rate: 92, color: "bg-blue-600" },
	{ department: "Arts", rate: 70, color: "bg-blue-400" },
	{ department: "Engineering", rate: 88, color: "bg-blue-600" },
	{ department: "Medicine", rate: 78, color: "bg-blue-400" },
];

export type CourseStatus = "Active" | "Archived" | "Draft";
export type CourseLevel = "Undergraduate" | "Graduate";

export interface MockCourse {
	id: string;
	code: string;
	name: string;
	description: string;
	category: string;
	level: CourseLevel;
	hasPrereqs: boolean;
	prereqLabel?: string;
	lastUpdated: string;
	updatedBy: string;
	status: CourseStatus;
}

export const MOCK_COURSE_CATEGORIES = [
	"Computer Science",
	"Mathematics",
	"Physics",
	"Humanities",
	"Business",
	"Engineering",
	"Biology",
	"Chemistry",
];

export const MOCK_COURSES: MockCourse[] = [
	{
		id: "1",
		code: "CS101",
		name: "Intro to Computer Science",
		description: "Foundational concepts in computing",
		category: "Computer Science",
		level: "Undergraduate",
		hasPrereqs: false,
		lastUpdated: "Oct 24, 2023",
		updatedBy: "Admin",
		status: "Active",
	},
	{
		id: "2",
		code: "MATH202",
		name: "Advanced Calculus II",
		description: "Multivariable calculus and vector analysis",
		category: "Mathematics",
		level: "Undergraduate",
		hasPrereqs: true,
		prereqLabel: "MATH101 Req",
		lastUpdated: "Sep 12, 2023",
		updatedBy: "System",
		status: "Archived",
	},
	{
		id: "3",
		code: "PHY400",
		name: "Quantum Mechanics I",
		description: "Wave mechanics and Schrödinger equation",
		category: "Physics",
		level: "Graduate",
		hasPrereqs: true,
		prereqLabel: "PHY300 Req",
		lastUpdated: "Nov 01, 2023",
		updatedBy: "Prof. Hawk",
		status: "Active",
	},
	{
		id: "4",
		code: "HIS205",
		name: "Modern European History",
		description: "From the Renaissance to the Present",
		category: "Humanities",
		level: "Undergraduate",
		hasPrereqs: false,
		lastUpdated: "Oct 15, 2023",
		updatedBy: "Admin",
		status: "Draft",
	},
	{
		id: "5",
		code: "CS310",
		name: "Data Structures",
		description: "Trees, graphs, and algorithms",
		category: "Computer Science",
		level: "Undergraduate",
		hasPrereqs: true,
		prereqLabel: "CS101 Req",
		lastUpdated: "Nov 10, 2023",
		updatedBy: "Admin",
		status: "Active",
	},
	{
		id: "6",
		code: "BUS101",
		name: "Introduction to Business",
		description: "Fundamentals of business operations",
		category: "Business",
		level: "Undergraduate",
		hasPrereqs: false,
		lastUpdated: "Aug 20, 2023",
		updatedBy: "Admin",
		status: "Active",
	},
	{
		id: "7",
		code: "ENG301",
		name: "Thermodynamics",
		description: "Laws of thermodynamics and applications",
		category: "Engineering",
		level: "Undergraduate",
		hasPrereqs: true,
		prereqLabel: "PHY200 Req",
		lastUpdated: "Sep 05, 2023",
		updatedBy: "Prof. Chen",
		status: "Active",
	},
	{
		id: "8",
		code: "BIO210",
		name: "Molecular Biology",
		description: "DNA, RNA, and protein synthesis",
		category: "Biology",
		level: "Undergraduate",
		hasPrereqs: true,
		prereqLabel: "BIO101 Req",
		lastUpdated: "Oct 02, 2023",
		updatedBy: "Admin",
		status: "Archived",
	},
	{
		id: "9",
		code: "CHEM400",
		name: "Organic Chemistry II",
		description: "Advanced organic reactions and synthesis",
		category: "Chemistry",
		level: "Graduate",
		hasPrereqs: true,
		prereqLabel: "CHEM301 Req",
		lastUpdated: "Nov 08, 2023",
		updatedBy: "Prof. Williams",
		status: "Active",
	},
	{
		id: "10",
		code: "CS450",
		name: "Machine Learning",
		description: "Supervised and unsupervised learning algorithms",
		category: "Computer Science",
		level: "Graduate",
		hasPrereqs: true,
		prereqLabel: "CS310 Req",
		lastUpdated: "Nov 12, 2023",
		updatedBy: "Prof. Lee",
		status: "Draft",
	},
];

export const MOCK_COURSES_TOTAL = 42;

export const MOCK_EVENTS = [
	{
		id: "1",
		date: "Today, 10:00 AM",
		title: "System Maintenance",
		description:
			"Scheduled downtime for LMS server upgrades. Expected duration: 2...",
		dotColor: "bg-blue-500",
	},
	{
		id: "2",
		date: "Nov 15, 2023",
		title: "End of Term Grading",
		description:
			"Deadline for all instructors to submit final grades for the Fall semester.",
		dotColor: "bg-amber-500",
	},
	{
		id: "3",
		date: "Nov 20, 2023",
		title: "Department Head Meeting",
		description:
			"Quarterly review of curriculum effectiveness in Conference Room A.",
		dotColor: "bg-emerald-500",
	},
];
