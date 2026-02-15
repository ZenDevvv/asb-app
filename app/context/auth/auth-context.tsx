import { createContext } from "react";
import type { loginResponse } from "~/types/auth";
import type { User } from "~/zod/user.zod";

export interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	error: string | null;
	login: (identifier: string, password: string) => Promise<loginResponse>;
	logout: () => Promise<void>;
	getCurrentUser: () => Promise<void>;
	clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
