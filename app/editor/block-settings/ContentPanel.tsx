import { FieldRenderer } from "~/components/controls/FieldRenderer";
import type { Block, BlockVariantConfig, EditableField } from "~/types/editor";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { groupEditableFields } from "./utils";

interface ContentPanelProps {
	editableProps: EditableField[];
	variantConfig?: BlockVariantConfig;
	blockProps: Block["props"];
	onPropChange: (key: string, value: unknown) => void;
}

function getStringProp(props: Block["props"], key: string): string | undefined {
	const value = props[key];
	return typeof value === "string" ? value : undefined;
}

export function ContentPanel({
	editableProps,
	variantConfig,
	blockProps,
	onPropChange,
}: ContentPanelProps) {
	const variantKey = variantConfig?.variantKey ?? "variant";
	const appearanceKey = variantConfig?.appearanceKey ?? "appearance";
	const variantLabel = variantConfig?.variantLabel ?? "Variant";
	const appearanceLabel = variantConfig?.appearanceLabel ?? "Appearance";
	const variantOptions = variantConfig?.options ?? [];
	const firstVariant = variantOptions[0];

	const rawVariant = getStringProp(blockProps, variantKey);
	const hasExplicitVariant =
		typeof rawVariant === "string" &&
		variantOptions.some((variant) => variant.value === rawVariant);
	const selectedVariantValue = hasExplicitVariant
		? rawVariant
		: firstVariant?.value;
	const activeVariant =
		variantOptions.find((variant) => variant.value === selectedVariantValue) ??
		firstVariant;
	const appearanceOptions = activeVariant?.appearances ?? [];
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

	const generatedFields: EditableField[] = [];
	if (variantOptions.length > 1) {
		generatedFields.push({
			key: variantKey,
			label: variantLabel,
			type: "select",
			options: variantOptions.map((variant) => ({
				label: variant.label,
				value: variant.value,
			})),
		});
	}
	if (appearanceOptions.length > 0) {
		generatedFields.push({
			key: appearanceKey,
			label: appearanceLabel,
			type: "select",
			options: appearanceOptions.map((appearance) => ({
				label: appearance.label,
				value: appearance.value,
			})),
		});
	}

	const allFields = [...generatedFields, ...editableProps];
	if (allFields.length === 0) {
		return null;
	}

	const handleFieldChange = (field: EditableField, value: unknown) => {
		if (field.key === variantKey && variantOptions.length > 0) {
			if (typeof value !== "string") return;
			onPropChange(variantKey, value);

			const nextVariant = variantOptions.find((variant) => variant.value === value);
			if (!nextVariant || nextVariant.appearances.length === 0) return;

			const currentAppearance =
				getStringProp(blockProps, appearanceKey) || selectedAppearanceValue;
			const nextVariantHasCurrentAppearance = nextVariant.appearances.some(
				(appearance) => appearance.value === currentAppearance,
			);
			if (!nextVariantHasCurrentAppearance) {
				onPropChange(appearanceKey, nextVariant.appearances[0].value);
			}
			return;
		}

		if (field.key === appearanceKey && variantOptions.length > 0) {
			const onlyVariantValue = variantOptions[0]?.value;
			if (
				variantOptions.length === 1 &&
				onlyVariantValue &&
				blockProps[variantKey] !== onlyVariantValue
			) {
				onPropChange(variantKey, onlyVariantValue);
			}
			onPropChange(appearanceKey, value);
			return;
		}

		onPropChange(field.key, value);
	};

	const getFieldValue = (field: EditableField): unknown => {
		if (field.key === variantKey) {
			return selectedVariantValue ?? "";
		}
		if (field.key === appearanceKey) {
			return selectedAppearanceValue;
		}
		return blockProps[field.key];
	};

	return (
		<CollapsiblePanel title="Content" defaultOpen>
			<div className="space-y-3">
				{groupEditableFields(allFields).map((item, index) => {
					if (Array.isArray(item)) {
						return (
							<div key={`icon-pair-${index}`} className="grid grid-cols-2 gap-2">
								{item.map((field) => (
									<FieldRenderer
										key={field.key}
										field={field}
										value={getFieldValue(field)}
										onChange={(value) => handleFieldChange(field, value)}
									/>
								))}
							</div>
						);
					}

					return (
						<FieldRenderer
							key={item.key}
							field={item}
							value={getFieldValue(item)}
							onChange={(value) => handleFieldChange(item, value)}
						/>
					);
				})}
			</div>
		</CollapsiblePanel>
	);
}
