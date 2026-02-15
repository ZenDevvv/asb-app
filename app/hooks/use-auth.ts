import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import AuthContext, { type AuthContextType } from "~/context/auth/auth-context";
import { queryClient } from "~/lib/query-client";
import authService from "~/services/auth-service";
import type { Register } from "~/zod/auth.zod";

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};

export const useRegister = () => {
	return useMutation({
		mutationFn: (data: Register | FormData) => {
			return authService.register(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
};
