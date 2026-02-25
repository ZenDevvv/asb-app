import { Outlet, useNavigate } from "react-router";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "~/hooks/use-auth";

export default function AdminLayout() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();
	if (!user) {
		navigate("/login");
	}

	return (
		<div className="flex h-screen overflow-hidden bg-muted/40 dark:bg-muted/10">
			<AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300 ease-in-out">
				<main className="minimal-scrollbar flex-1 overflow-y-auto p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
