import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Package, Edit, Archive, ArchiveRestore } from "lucide-react";
import type { Product } from "~/data/mock-admin-data";

interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
	return (
		<Card className="group overflow-hidden border-border/40 bg-card/50 transition-all hover:bg-card hover:shadow-sm py-0 gap-0">
			<div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
				{product.image ? (
					<img
						src={product.image}
						alt={product.name}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<Package className="h-12 w-12 text-muted-foreground/20" />
					</div>
				)}
				<div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="secondary"
								size="icon"
								className="h-8 w-8 bg-background/80 backdrop-blur-sm">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem>
								<Edit className="mr-2 h-4 w-4" /> Edit Details
							</DropdownMenuItem>
							<DropdownMenuItem>
								<ArchiveRestore className="mr-2 h-4 w-4" /> Update Stock
							</DropdownMenuItem>
							<DropdownMenuItem className="text-red-600">
								<Archive className="mr-2 h-4 w-4" /> Archive Product
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="absolute left-2 top-2">
					<Badge
						variant={product.status === "active" ? "secondary" : "outline"}
						className="bg-background/80 font-normal backdrop-blur-sm">
						{product.status}
					</Badge>
				</div>
			</div>
			<div className="p-4">
				<div className="mb-2 flex items-start justify-between gap-2">
					<h3
						className="line-clamp-1 font-medium leading-none tracking-tight"
						title={product.name}>
						{product.name}
					</h3>
					<span className="shrink-0 font-semibold text-sm">
						${product.price.toLocaleString()}
					</span>
				</div>
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>{product.category}</span>
					<span className={product.stock > 0 ? "" : "text-destructive"}>
						{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
					</span>
				</div>
			</div>
		</Card>
	);
}
