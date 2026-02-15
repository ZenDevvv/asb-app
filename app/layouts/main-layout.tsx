import { Outlet } from "react-router";

export default function MainLayout() {
	return (
		<main className="max-w-md mx-auto min-h-screen bg-secondary">
			<p>This is MainLayout</p>
			<Outlet />
		</main>
	);
}
