import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component; if not, use the span styling directly
import { AlertCircle, Clock } from "lucide-react"; // Icons for visual enhancement
import type { DeliveryStatus, Priority } from "~/zod/delivery-request.zod";

// Status Colored Text Component
interface StatusBadgeProps {
	status: DeliveryStatus;
	className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
	const statusConfig = {
		draft: {
			color: "text-muted-foreground",
			label: "Draft",
		},
		new: {
			color: "text-blue-600",
			label: "New",
		},
		for_approval: {
			color: "text-yellow-600",
			label: "For Approval",
		},
		approved: {
			color: "text-green-600",
			label: "Approved",
		},
		rejected: {
			color: "text-red-600",
			label: "Rejected",
		},
		pending: {
			color: "text-yellow-600",
			label: "Pending",
		},
		partially_delivered: {
			color: "text-orange-600",
			label: "Partially Delivered",
		},
		completed: {
			color: "text-green-600",
			label: "Completed",
		},
		cancelled: {
			color: "text-red-600",
			label: "Cancelled",
		},
		in_progress: {
			color: "text-blue-600",
			label: "In Progress",
		},
	};

	const config = statusConfig[status] || statusConfig.draft;

	return (
		<span className={`font-medium text-sm ${config.color} ${className}`}>{config.label}</span>
	);
}

// Priority Badge Component
interface PriorityBadgeProps {
	priority: Priority;
	className?: string;
}

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
	const priorityConfig = {
		urgent: {
			variant: "destructive" as const,
			icon: AlertCircle,
			label: "Urgent",
		},
		high: {
			variant: "default" as const,
			icon: Clock,
			label: "High",
		},
		normal: {
			variant: "secondary" as const,
			icon: null,
			label: "Normal",
		},
		low: {
			variant: "outline" as const,
			icon: null,
			label: "Low",
		},
	};

	const config = priorityConfig[priority] || priorityConfig.low;
	const Icon = config.icon;

	return (
		<Badge variant={config.variant} className={className}>
			{Icon && <Icon className="w-3 h-3 mr-1" />}
			{config.label}
		</Badge>
	);
}
