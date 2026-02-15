import { Construction } from "lucide-react";

interface ComingSoonProps {
	title: string;
	description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center py-24">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="rounded-full bg-muted p-4">
					<Construction className="size-10 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						{title}
					</h1>
					<p className="max-w-md text-sm text-muted-foreground">
						{description ?? "This page is under development and will be available soon."}
					</p>
				</div>
			</div>
		</div>
	);
}
