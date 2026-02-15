const ORG_COLORS = [
	"bg-indigo-500",
	"bg-blue-500",
	"bg-emerald-500",
	"bg-amber-500",
	"bg-rose-500",
	"bg-cyan-500",
];

export function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export function getOrgColor(id: string) {
	const hash = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
	return ORG_COLORS[hash % ORG_COLORS.length];
}

export function formatDate(date: string | Date | null | undefined) {
	if (!date) return "-";
	const parsedDate = date instanceof Date ? date : new Date(date);
	if (Number.isNaN(parsedDate.getTime())) return "-";

	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "2-digit",
	}).format(parsedDate);
}
