import { Outlet } from "react-router";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<div className="flex h-screen overflow-hidden bg-muted/40 dark:bg-muted/10">
			<AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300 ease-in-out">
				<AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
				<main className="flex-1 p-6 overflow-y-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
