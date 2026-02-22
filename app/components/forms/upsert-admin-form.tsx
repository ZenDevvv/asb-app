import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	CreateUserSchema,
	UpdateUserSchema,
	type CreateUser,
	type UpdateUser,
	type User,
} from "~/zod/user.zod";
import { useGetUserById } from "~/hooks/use-user";

interface UpsertAdminFormProps {
	onSubmit: (data: CreateUser | UpdateUser) => void;
	onCancel: () => void;
	userId?: string;
	orgId: string;
}

export function UpsertAdminForm({ onSubmit, onCancel, userId = "", orgId }: UpsertAdminFormProps) {
	const { data: userData, isLoading: isUserLoading } = useGetUserById(userId, {
		fields: "userName,email,status",
	}) as { data: Partial<User> | undefined; isLoading: boolean };
	const isEditing = !!userId;

	const defaultValues: CreateUser = {
		userName: "",
		email: "",
		password: "",
		role: "admin",
		status: "active",
		loginMethod: "email",
		orgId: orgId,
	};

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CreateUser>({
		resolver: zodResolver(isEditing ? UpdateUserSchema : CreateUserSchema) as any,
		defaultValues,
	});

	useEffect(() => {
		if (isEditing && userData && !isUserLoading) {
			if (userData.userName) {
				setValue("userName", userData.userName);
			}
			if (userData.email) {
				setValue("email", userData.email);
			}
			if (userData.status) {
				setValue("status", userData.status);
			}
		}
	}, [userData, isUserLoading, isEditing, setValue]);

	if (isUserLoading && isEditing) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<div className="flex justify-end space-x-2">
					<Skeleton className="h-10 w-20" />
					<Skeleton className="h-10 w-20" />
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
			<div className="grid gap-1">
				<Label htmlFor="userName">Username</Label>
				<Input id="userName" {...register("userName")} placeholder="Enter username" />
				{errors.userName && (
					<p className="text-sm text-destructive">{errors.userName.message}</p>
				)}
			</div>
			<div className="grid gap-1">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					{...register("email")}
					placeholder="admin@example.com"
				/>
				{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
			</div>
			{!isEditing && (
				<div className="grid gap-1">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						{...register("password")}
						placeholder="Enter password"
					/>
					{errors.password && (
						<p className="text-sm text-destructive">{errors.password.message}</p>
					)}
				</div>
			)}
			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit">{isEditing ? "Update" : "Create"}</Button>
			</div>
		</form>
	);
}
