import { FieldRenderer } from "~/components/controls/FieldRenderer";
import type { Block, EditableField } from "~/types/editor";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { groupEditableFields } from "./utils";

interface ContentPanelProps {
	editableProps: EditableField[];
	blockProps: Block["props"];
	onPropChange: (key: string, value: unknown) => void;
}

export function ContentPanel({ editableProps, blockProps, onPropChange }: ContentPanelProps) {
	if (editableProps.length === 0) {
		return null;
	}

	const handleFieldChange = (field: EditableField, value: unknown) => {
		onPropChange(field.key, value);
	};

	return (
		<CollapsiblePanel title="Content" defaultOpen>
			<div className="space-y-3">
				{groupEditableFields(editableProps).map((item, index) => {
					if (Array.isArray(item)) {
						return (
							<div key={`icon-pair-${index}`} className="grid grid-cols-2 gap-2">
								{item.map((field) => (
									<FieldRenderer
										key={field.key}
										field={field}
										value={blockProps[field.key]}
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
							value={blockProps[item.key]}
							onChange={(value) => handleFieldChange(item, value)}
						/>
					);
				})}
			</div>
		</CollapsiblePanel>
	);
}
