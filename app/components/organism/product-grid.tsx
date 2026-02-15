import type { Product } from "~/data/mock-admin-data";
import { ProductCard } from "~/components/molecule/product-card";

interface ProductGridProps {
	products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
	if (products.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-10 text-center">
				<p className="text-muted-foreground">No products found.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
