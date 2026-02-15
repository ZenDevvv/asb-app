// ~/components/ui/table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({
	rows = 5,
	colWidths = ["w-[36%]", "w-[15%]", "w-[12%]", "w-[9%]", "w-[13%]", "w-[15%]"],
}: {
	rows?: number;
	colWidths?: string[];
}) {
	return (
		<div className="w-full overflow-auto">
			<table className="w-full border-collapse">
				<thead>
					<tr className="bg-gray-100">
						{colWidths.map((width, j) => (
							<th key={j} className={`px-4 py-5 ${width} font-medium`}>
								<Skeleton className="h-4 w-full" />
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: rows }).map((_, i) => (
						<tr
							key={i}
							className="border-b border-border hover:bg-muted/50 transition-colors">
							{colWidths.map((width, j) => (
								<td key={j} className={`px-4 py-5 ${width}`}>
									<Skeleton className="h-4 w-full" />
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
