// ~/components/supplier-products-table.tsx
import { useState } from "react";
import { Plus, Edit, Eye, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "~/components/molecule/data-table-updated";
import type { SupplierItemWithRelation } from "~/zod/supplier-item.zod";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CreateSupplierItem, UpdateSupplierItem } from "~/zod/supplier-item.zod";
import { UpsertSupplierItemForm } from "../forms/upsert-supplier-item-form";
import { useNavigate } from "react-router";
import { useCreateSupplierItem, useUpdateSupplierItem } from "~/hooks/use-supplier-item";

type SupplierItemTableRow = SupplierItemWithRelation & {
	productName: string;
	sku: string;
	category: string;
	productType: string;
};

interface SupplierProductsTableProps {
	products: SupplierItemWithRelation[];
	supplierId: string;
}

export function SupplierProductsTable({ products, supplierId }: SupplierProductsTableProps) {
	const [openAddModal, setOpenAddModal] = useState(false);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const navigate = useNavigate();

	// Assume hooks
	const createSupplierItem = useCreateSupplierItem();
	const updateSupplierItem = useUpdateSupplierItem();

	const editingItem = editingItemId ? products.find((p) => p.id === editingItemId) : null;

	const initialData = editingItem
		? {
				asp: editingItem.asp,
				srp: editingItem.srp,
				supplierId: editingItem.supplierId,
				productId: editingItem.productId,
			}
		: undefined;

	const productsColumns: DataTableColumn<SupplierItemTableRow>[] = [
		{
			key: "productName",
			label: "Product Name",
			sortable: true,
			render: (_, row) => (
				<button
					className="p-0 h-auto font-medium cursor-pointer hover:underline"
					onClick={() => navigate(`/ppp-office/inventory/products/${row.product?.id}`)}>
					{row.product?.name || "N/A"}
				</button>
			),
		},
		{
			key: "sku",
			label: "SKU",
			sortable: true,
			render: (_, row) => <span>{row.product?.sku || "N/A"}</span>,
		},
		{
			key: "category",
			label: "Category",
			sortable: true,
			render: (_, row) => <span>{row.product?.category?.name || "N/A"}</span>,
		},
		{
			key: "productType",
			label: "Product Type",
			sortable: true,
			render: (_, row) => <span>{row.product?.productType?.name || "N/A"}</span>,
		},
		{
			key: "actions" as keyof SupplierItemTableRow,
			label: "Actions",
			render: (_, row) => (
				<div className="text-right">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									setEditingItemId(row.id);
									setOpenAddModal(true);
								}}>
								<Edit className="mr-2 size-4" />
								Edit Item
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() =>
									(window.location.href = `/ppp-office/suppliers/items/${row.id}`)
								}>
								<Eye className="mr-2 size-4" />
								View Details
							</DropdownMenuItem>
							<DropdownMenuItem className="text-destructive">
								<Trash2 className="mr-2 size-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			),
		},
	];

	const handleFormSubmit = (data: CreateSupplierItem) => {
		console.log(data);
		const isUpdate = !!editingItemId;
		let mutationPromise: Promise<any>;

		// Placeholder for mutations - replace with actual hooks
		if (isUpdate) {
			mutationPromise = updateSupplierItem.mutateAsync({
				supplierItemId: editingItemId!,
				data: data as UpdateSupplierItem,
			});
			// mutationPromise = Promise.resolve(); // Placeholder
		} else {
			const createData = { ...data, supplierId };
			mutationPromise = createSupplierItem.mutateAsync(createData);
			// mutationPromise = Promise.resolve(); // Placeholder
		}

		toast.promise(mutationPromise, {
			loading: isUpdate ? "Updating Supplier Item..." : "Creating Supplier Item...",
			success: () => ({
				message: isUpdate ? "Supplier Item Updated" : "Supplier Item Created",
			}),
			error: () => ({
				message: isUpdate ? "Supplier Item Update Failed" : "Supplier Item Creation Failed",
			}),
		});

		setOpenAddModal(false);
		setEditingItemId(null);
		// Optionally refetch products here
	};

	const handleCancel = () => {
		setOpenAddModal(false);
		setEditingItemId(null);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<div>
						<CardTitle>Products</CardTitle>
						<CardDescription>Manage supplier products</CardDescription>
					</div>
					<Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 size-4" />
								Add Product
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>
									{editingItem ? "Edit Supplier Item" : "Add New Supplier Item"}
								</DialogTitle>
								<DialogDescription>
									Enter supplier item details below.
								</DialogDescription>
							</DialogHeader>
							<UpsertSupplierItemForm
								initialData={initialData}
								onSubmit={handleFormSubmit}
								onCancel={handleCancel}
								isEditing={!!editingItem}
								supplierId={supplierId}
							/>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				<DataTable columns={productsColumns} data={products as SupplierItemTableRow[]} />
			</CardContent>
		</Card>
	);
}
