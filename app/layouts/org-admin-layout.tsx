import { Outlet } from "react-router";
import { useState } from "react";
import { OrgAdminSidebar } from "@/components/org-admin/org-admin-sidebar";
import { OrgAdminHeader } from "@/components/org-admin/org-admin-header";

export default function OrgAdminLayout() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<div className="flex h-screen overflow-hidden bg-muted/40 dark:bg-muted/10">
			<OrgAdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300 ease-in-out">
				<OrgAdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
				<main className="flex-1 p-6 overflow-y-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
