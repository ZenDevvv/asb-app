import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrgAdminHeaderProps {
	onToggleSidebar: () => void;
}

export function OrgAdminHeader({ onToggleSidebar }: OrgAdminHeaderProps) {
	return (
		<header className="flex h-16 items-center gap-4 border-b bg-background pl-3 pr-6">
			<Button
				variant="ghost"
				size="icon"
				className="cursor-pointer"
				onClick={onToggleSidebar}>
				<Menu className="h-6 w-6" />
			</Button>
			<div className="ml-auto flex items-center gap-4">
				<div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
					OA
				</div>
			</div>
		</header>
	);
}
