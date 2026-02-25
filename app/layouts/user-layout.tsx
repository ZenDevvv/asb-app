import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuth } from "~/hooks/use-auth";
import { SplashScreen } from "@/components/admin/splash-screen";

export default function UserLayout() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !user) {
			navigate("/login");
		}
	}, [user, isLoading, navigate]);

	if (isLoading) {
		return <SplashScreen />;
	}

	if (!user) {
		return null;
	}

	return <Outlet />;
}
