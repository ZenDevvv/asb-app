import { PAGE_TITLES } from "~/config/page-titles";
import { RegisterForm } from "~/components/auth/register-form";
import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
	return [{ title: PAGE_TITLES.register }];
}

export default function RegisterPage() {
	return <RegisterForm />;
}
