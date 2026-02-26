import { cn } from "~/lib/utils";
import type { Block, BlockVariantConfig } from "~/types/editor";
import { CollapsiblePanel } from "./CollapsiblePanel";

interface VariantPanelProps {
	variantConfig?: BlockVariantConfig;
	blockProps: Block["props"];
	onPropChange: (key: string, value: unknown) => void;
}

type PreviewKind =
	| "form-classic"
	| "form-postcard"
	| "button-solid"
	| "button-outline"
	| "button-ghost"
	| "button-link"
	| "button-text"
	| "badge-subtle"
	| "badge-filled"
	| "badge-outline"
	| "badge-pill-dot"
	| "generic";

function getStringProp(props: Block["props"], key: string): string | undefined {
	const value = props[key];
	return typeof value === "string" ? value : undefined;
}

function resolvePreviewKind(value: string): PreviewKind {
	switch (value) {
		case "classic":
			return "form-classic";
		case "postal-card":
			return "form-postcard";
		case "solid":
			return "button-solid";
		case "outline":
			return "button-outline";
		case "ghost":
			return "button-ghost";
		case "link":
			return "button-link";
		case "text":
			return "button-text";
		case "subtle":
			return "badge-subtle";
		case "filled":
			return "badge-filled";
		case "pill-dot":
			return "badge-pill-dot";
		default:
			return "generic";
	}
}

function PreviewCanvas({ kind }: { kind: PreviewKind }) {
	if (kind === "form-postcard") {
		return (
			<div className="grid h-16 grid-cols-2 gap-1">
				<div className="rounded border border-border/70 bg-muted/20 p-1">
					<div className="h-1.5 w-8 rounded bg-foreground/40" />
					<div className="mt-1 h-1.5 w-10 rounded bg-foreground/25" />
					<div className="mt-1 h-1.5 w-6 rounded bg-foreground/25" />
				</div>
				<div className="rounded border border-border/70 bg-muted/20 p-1">
					<div className="h-1.5 w-9 rounded bg-foreground/30" />
					<div className="mt-2 h-3 rounded border border-border/80 bg-background/80" />
					<div className="mt-1 h-3 rounded border border-border/80 bg-background/80" />
				</div>
			</div>
		);
	}

	if (kind === "form-classic") {
		return (
			<div className="h-16 space-y-1.5">
				<div className="h-1.5 w-16 rounded bg-foreground/35" />
				<div className="h-3 rounded border border-border/80 bg-background/80" />
				<div className="h-3 rounded border border-border/80 bg-background/80" />
				<div className="h-2.5 w-12 rounded-full bg-primary/35" />
			</div>
		);
	}

	if (kind === "button-solid") {
		return (
			<div className="flex h-16 items-center justify-center">
				<div className="rounded-md bg-primary px-4 py-1.5 text-[10px] font-semibold text-primary-foreground">
					Button
				</div>
			</div>
		);
	}

	if (kind === "button-outline") {
		return (
			<div className="flex h-16 items-center justify-center">
				<div className="rounded-md border border-primary px-4 py-1.5 text-[10px] font-semibold text-primary">
					Button
				</div>
			</div>
		);
	}

	if (kind === "button-ghost") {
		return (
			<div className="flex h-16 items-center justify-center">
				<div className="rounded-md bg-primary/10 px-4 py-1.5 text-[10px] font-semibold text-primary">
					Button
				</div>
			</div>
		);
	}

	if (kind === "button-link" || kind === "button-text") {
		return (
			<div className="flex h-16 items-center justify-center">
				<div
					className={cn(
						"text-[10px] font-semibold text-primary",
						kind === "button-link" && "underline",
					)}>
					Button
				</div>
			</div>
		);
	}

	if (kind === "badge-filled") {
		return (
			<div className="flex h-16 items-center justify-center">
				<div className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
					Badge
				</div>
			</div>
		);
	}

	if (kind === "badge-outline") {
		return (
			<div className="flex h-16 items-center justify-center">
				<div className="rounded-full border border-primary px-3 py-1 text-[10px] font-semibold text-primary">
					Badge
				</div>
			</div>
		);
	}

	if (kind === "badge-pill-dot") {
		return (
			<div className="flex h-16 items-center justify-center">
				<div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-semibold text-foreground">
					<span className="h-1.5 w-1.5 rounded-full bg-primary" />
					Badge
				</div>
			</div>
		);
	}

	if (kind === "badge-subtle") {
		return (
			<div className="flex h-16 items-center justify-center">
				<div className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold text-primary">
					Badge
				</div>
			</div>
		);
	}

	return (
		<div className="h-16 space-y-1.5">
			<div className="h-1.5 w-14 rounded bg-foreground/35" />
			<div className="h-1.5 w-12 rounded bg-foreground/20" />
			<div className="h-3 rounded bg-muted/50" />
			<div className="h-2.5 w-10 rounded bg-foreground/15" />
		</div>
	);
}

interface OptionCardProps {
	label: string;
	selected: boolean;
	previewKind: PreviewKind;
	onSelect: () => void;
}

function OptionCard({ label, selected, previewKind, onSelect }: OptionCardProps) {
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={selected}
			className={cn(
				"rounded-lg border p-2 text-left transition-colors",
				selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/30",
			)}>
			<div className="rounded-md border border-border/60 bg-muted/20 px-2 py-1.5">
				<PreviewCanvas kind={previewKind} />
			</div>
			<div className={cn("mt-1.5 text-[11px] font-medium", selected && "text-primary")}>
				{label}
			</div>
		</button>
	);
}

export function VariantPanel({ variantConfig, blockProps, onPropChange }: VariantPanelProps) {
	const variantOptions = variantConfig?.options ?? [];
	if (!variantConfig || variantOptions.length === 0) {
		return null;
	}

	const variantKey = variantConfig.variantKey ?? "variant";
	const appearanceKey = variantConfig.appearanceKey ?? "appearance";
	const variantLabel = variantConfig.variantLabel ?? "Variant";
	const appearanceLabel = variantConfig.appearanceLabel ?? "Appearance";
	const firstVariant = variantOptions[0];

	const rawVariant = getStringProp(blockProps, variantKey);
	const hasExplicitVariant =
		typeof rawVariant === "string" &&
		variantOptions.some((variant) => variant.value === rawVariant);
	const selectedVariantValue = hasExplicitVariant ? rawVariant : firstVariant.value;
	const activeVariant =
		variantOptions.find((variant) => variant.value === selectedVariantValue) ?? firstVariant;
	const appearanceOptions = activeVariant.appearances;

	const rawAppearance = getStringProp(blockProps, appearanceKey);
	const legacyAppearanceCandidate = hasExplicitVariant ? undefined : rawVariant;
	const selectedAppearanceValue =
		(typeof rawAppearance === "string" &&
		appearanceOptions.some((appearance) => appearance.value === rawAppearance)
			? rawAppearance
			: typeof legacyAppearanceCandidate === "string" &&
				  appearanceOptions.some(
						(appearance) => appearance.value === legacyAppearanceCandidate,
				  )
				? legacyAppearanceCandidate
				: appearanceOptions[0]?.value) ?? "";

	const handleVariantSelect = (nextVariantValue: string) => {
		if (nextVariantValue !== selectedVariantValue) {
			onPropChange(variantKey, nextVariantValue);
		}

		const nextVariant = variantOptions.find((variant) => variant.value === nextVariantValue);
		if (!nextVariant || nextVariant.appearances.length === 0) return;

		const currentAppearance =
			getStringProp(blockProps, appearanceKey) || selectedAppearanceValue;
		const nextVariantHasCurrentAppearance = nextVariant.appearances.some(
			(appearance) => appearance.value === currentAppearance,
		);
		if (!nextVariantHasCurrentAppearance) {
			onPropChange(appearanceKey, nextVariant.appearances[0].value);
		}
	};

	const handleAppearanceSelect = (nextAppearanceValue: string) => {
		const onlyVariantValue = variantOptions[0]?.value;
		if (
			variantOptions.length === 1 &&
			onlyVariantValue &&
			blockProps[variantKey] !== onlyVariantValue
		) {
			onPropChange(variantKey, onlyVariantValue);
		}
		onPropChange(appearanceKey, nextAppearanceValue);
	};

	return (
		<CollapsiblePanel title="Variant" defaultOpen={variantOptions.length > 1}>
			<div className="space-y-3">
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground">
						{variantLabel}
					</label>
					<div
						className={cn(
							"grid gap-2",
							variantOptions.length > 1 ? "grid-cols-2" : "",
						)}>
						{variantOptions.map((variant) => (
							<OptionCard
								key={variant.value}
								label={variant.label}
								selected={selectedVariantValue === variant.value}
								previewKind={resolvePreviewKind(
									variant.appearances[0]?.value ?? "",
								)}
								onSelect={() => handleVariantSelect(variant.value)}
							/>
						))}
					</div>
				</div>

				{appearanceOptions.length > 1 && (
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							{appearanceLabel}
						</label>
						<div
							className={cn(
								"grid gap-2",
								appearanceOptions.length > 2 ? "grid-cols-2" : "",
							)}>
							{appearanceOptions.map((appearance) => (
								<OptionCard
									key={appearance.value}
									label={appearance.label}
									selected={selectedAppearanceValue === appearance.value}
									previewKind={resolvePreviewKind(appearance.value)}
									onSelect={() => handleAppearanceSelect(appearance.value)}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</CollapsiblePanel>
	);
}
