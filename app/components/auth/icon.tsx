export function Icon({ name, className = "" }: { name: string; className?: string }) {
	return (
		<span className={`material-symbols-outlined ${className}`} style={{ fontSize: "inherit" }}>
			{name}
		</span>
	);
}
