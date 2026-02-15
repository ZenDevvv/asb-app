import { PAGE_TITLES } from "~/config/page-titles";
import { LoginForm } from "~/components/auth/login-form";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
	return [{ title: PAGE_TITLES.login }];
}

export default function LoginPage() {
	return <LoginForm />;
}
