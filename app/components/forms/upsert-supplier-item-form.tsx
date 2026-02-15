// ~/components/forms/upsert-supplier-item-form.tsx
import { useEffect, useMemo } from "react";
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
import { CreateSupplierItemSchema, type CreateSupplierItem } from "~/zod/supplier-item.zod";
import { useGetProducts } from "~/hooks/use-product";
import type { ProductWithRelation } from "~/zod/product.zod";

interface UpsertSupplierItemFormProps {
	initialData?: CreateSupplierItem;
	onSubmit: (data: CreateSupplierItem) => void;
	onCancel: () => void;
	isEditing?: boolean;
	supplierId?: string;
}

export function UpsertSupplierItemForm({
	initialData,
	onSubmit,
	onCancel,
	isEditing = false,
	supplierId,
}: UpsertSupplierItemFormProps) {
	// Stabilize defaultValues with useMemo to prevent recreation on every render
	const defaultValues = useMemo<Partial<CreateSupplierItem>>(
		() => ({
			asp: 0,
			srp: 0,
			productId: "",
			supplierId: supplierId || "",
		}),
		[supplierId],
	);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<CreateSupplierItem>({
		resolver: zodResolver(CreateSupplierItemSchema),
		defaultValues, // Now stable
	});

	// Only reset when initialData changes (e.g., for editing mode)
	// Exclude defaultValues from deps to avoid loops
	useEffect(() => {
		if (initialData) {
			reset(initialData);
		} else {
			reset(defaultValues);
		}
	}, [initialData, reset, defaultValues]);
	const { data, isLoading: isProductsLoading } = useGetProducts({
		fields: "id,name,category.id,category.name,productType.id,productType.name",
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
			<div className="grid gap-1">
				<Label htmlFor="productId">Product</Label>
				<Controller
					name="productId"
					control={control}
					render={({ field }) => (
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger>
								<SelectValue
									placeholder={
										isProductsLoading
											? "Loading products..."
											: "Select a product"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{data?.products.map((product: ProductWithRelation) => (
									<SelectItem key={product.id} value={product.id}>
										{product.name} ({product.category?.name} -{" "}
										{product.productType?.name})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.productId && (
					<p className="text-sm text-destructive">{errors.productId.message}</p>
				)}
			</div>
			<div className="grid gap-1">
				<Label htmlFor="asp">Acquired Supplier Price</Label>
				<Input
					id="asp"
					type="number"
					{...register("asp", { valueAsNumber: true })}
					placeholder="Enter acquired supplier price"
				/>
				{errors.asp && <p className="text-sm text-destructive">{errors.asp.message}</p>}
			</div>
			<div className="grid gap-1">
				<Label htmlFor="srp">Suggested Retail Price</Label>
				<Input
					id="srp"
					type="number"
					{...register("srp", { valueAsNumber: true })}
					placeholder="Enter suggested retail price"
				/>
				{errors.srp && <p className="text-sm text-destructive">{errors.srp.message}</p>}
			</div>
			<div className="flex justify-end space-x-2">
				<Button
					className="cursor-pointer"
					type="button"
					variant="outline"
					onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" className="cursor-pointer">
					{isEditing ? "Update" : "Create"}
				</Button>
			</div>
		</form>
	);
}
