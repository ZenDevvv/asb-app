import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import type { Product } from "~/data/mock-admin-data";

interface ProductCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onProductCreate: (product: Product) => void;
}

export function ProductCreateDialog({
	open,
	onOpenChange,
	onProductCreate,
}: ProductCreateDialogProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleAddProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Add mock product
		// Note: In a real app, the ID would come from the backend response
		const newProduct: Product = {
			id: `PROD-NEW-${Date.now()}`,
			name: "New Added Product",
			category: "Electronics",
			price: 99.99,
			vendor: "Generic Vendor",
			status: "active",
			stock: 10,
		};

		onProductCreate(newProduct);
		setIsLoading(false);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add New Product</DialogTitle>
					<DialogDescription>
						Create a new product listing. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleAddProduct} className="space-y-6 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Product Name</Label>
						<Input id="name" placeholder="e.g. MacBook Pro M3" required />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select required>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="electronics">Electronics</SelectItem>
									<SelectItem value="furniture">Furniture</SelectItem>
									<SelectItem value="appliances">Appliances</SelectItem>
									<SelectItem value="accessories">Accessories</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="price">Price ($)</Label>
							<Input
								id="price"
								type="number"
								placeholder="0.00"
								min="0"
								step="0.01"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="vendor">Vendor</Label>
						<Select required>
							<SelectTrigger>
								<SelectValue placeholder="Select vendor" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="tech-supply-co">Tech Supply Co.</SelectItem>
								<SelectItem value="office-depot">Office Needs Inc.</SelectItem>
								<SelectItem value="home-comforts">Home Comforts</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Describe the product specs and features..."
							className="min-h-[100px]"
						/>
					</div>

					<div className="space-y-2">
						<Label>Product Image</Label>
						<div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
							<Upload className="h-8 w-8 text-muted-foreground mb-2" />
							<p className="text-xs text-muted-foreground">Click to upload image</p>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save Product"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
