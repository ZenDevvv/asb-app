import type { User } from "~/zod/user.zod";

export type loginResponse = {
	user: User;
	token: string;
};
