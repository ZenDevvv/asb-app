import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateSupplierSchema, type CreateSupplier } from "~/zod/supplier.zod";
import { useGetSupplierById } from "~/hooks/use-supplier";

interface UpsertSupplierFormProps {
	onSubmit: (data: CreateSupplier) => void;
	onCancel: () => void;
	supplierId?: string;
}

export function UpsertSupplierForm({
	onSubmit,
	onCancel,
	supplierId = "",
}: UpsertSupplierFormProps) {
	const { data: supplierData, isLoading: isSupplierLoading } = useGetSupplierById(supplierId, {
		fields: "code,name,contactPerson,email,phone,address,gln,isActive",
	});
	const isEditing = !!supplierId;
	const defaultValues: CreateSupplier = {
		code: "",
		name: "",
		contactPerson: "",
		email: "",
		phone: "",
		address: {},
		isActive: true,
	};

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm<CreateSupplier>({
		resolver: zodResolver(CreateSupplierSchema),
		defaultValues,
	});

	useEffect(() => {
		if (isEditing && supplierData && !isSupplierLoading) {
			setValue("code", supplierData.code || "");
			setValue("name", supplierData.name || "");
			setValue("contactPerson", supplierData.contactPerson || "");
			setValue("email", supplierData.email || "");
			setValue("phone", supplierData.phone || "");
			setValue("address.street", supplierData.address?.street || "");
			setValue("address.city", supplierData.address?.city || "");
			setValue("address.state", supplierData.address?.state || "");
			setValue("address.postalCode", supplierData.address?.postalCode || "");
			setValue("address.country", supplierData.address?.country || "");
			setValue("isActive", supplierData.isActive ?? true);
		}
	}, [supplierData, isSupplierLoading, isEditing, setValue]);

	if (isSupplierLoading && isEditing) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<div className="space-y-2">
					<div className="grid gap-1 md:grid-cols-2">
						<Skeleton className="h-10" />
						<Skeleton className="h-10" />
					</div>
					<div className="grid gap-1 md:grid-cols-2">
						<Skeleton className="h-10" />
						<Skeleton className="h-10" />
					</div>
					<Skeleton className="h-10 w-full" />
				</div>
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
				<Label htmlFor="code">Code</Label>
				<Input id="code" {...register("code")} placeholder="SUP001" />
				{errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
			</div>
			<div className="grid gap-1">
				<Label htmlFor="name">Supplier Name</Label>
				<Input id="name" {...register("name")} placeholder="Enter supplier name" />
				{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
			</div>
			<div className="grid gap-1">
				<Label htmlFor="contactPerson">Contact Person</Label>
				<Input
					id="contactPerson"
					{...register("contactPerson")}
					placeholder="Enter contact person name"
				/>
				{errors.contactPerson && (
					<p className="text-sm text-destructive">{errors.contactPerson.message}</p>
				)}
			</div>
			<div className="grid gap-1">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					{...register("email")}
					placeholder="supplier@example.com"
				/>
				{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
			</div>
			<div className="grid gap-1">
				<Label htmlFor="phone">Phone</Label>
				<Input id="phone" {...register("phone")} placeholder="+1-234-567-8900" />
				{errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
			</div>
			<div className="space-y-2">
				<div className="grid gap-1 md:grid-cols-2">
					<div className="grid gap-1">
						<Label htmlFor="address.street">Street</Label>
						<Input
							id="address.street"
							{...register("address.street")}
							placeholder="123 Main Street"
						/>
					</div>
					<div className="grid gap-1">
						<Label htmlFor="address.city">City</Label>
						<Input
							id="address.city"
							{...register("address.city")}
							placeholder="Anytown"
						/>
					</div>
				</div>
				<div className="grid gap-1 md:grid-cols-2">
					<div className="grid gap-1">
						<Label htmlFor="address.state">State</Label>
						<Input id="address.state" {...register("address.state")} placeholder="CA" />
					</div>
					<div className="grid gap-1">
						<Label htmlFor="address.postalCode">Postal Code</Label>
						<Input
							id="address.postalCode"
							{...register("address.postalCode")}
							placeholder="12345"
						/>
					</div>
				</div>
				<div className="grid gap-1">
					<Label htmlFor="address.country">Country</Label>
					<Input
						id="address.country"
						{...register("address.country")}
						placeholder="USA"
					/>
				</div>
			</div>
			<div className="grid gap-1">
				<Label htmlFor="isActive">Status</Label>
				<Controller
					control={control}
					name="isActive"
					render={({ field }) => (
						<Select
							onValueChange={(value) => field.onChange(value === "Active")}
							value={field.value ? "Active" : "Inactive"}>
							<SelectTrigger id="isActive">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Active">Active</SelectItem>
								<SelectItem value="Inactive">Inactive</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
				{errors.isActive && (
					<p className="text-sm text-destructive">{errors.isActive.message}</p>
				)}
			</div>
			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit">{isEditing ? "Update" : "Create"}</Button>
			</div>
		</form>
	);
}
