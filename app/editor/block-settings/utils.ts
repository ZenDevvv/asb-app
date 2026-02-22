import type { Block, EditableField } from "~/types/editor";
import {
	CUSTOM_DIVIDER_WIDTH_MAX,
	CUSTOM_DIVIDER_WIDTH_MIN,
	CUSTOM_TEXT_SIZE_DEFAULT_BY_BLOCK,
	CUSTOM_TEXT_SIZE_MAX,
	CUSTOM_TEXT_SIZE_MIN,
	FONT_SIZE_PRESET_TO_PX,
	WIDTH_PRESET_TO_PX,
} from "./constants";

export function groupEditableFields(
	fields: EditableField[],
): Array<EditableField | [EditableField, EditableField]> {
	const result: Array<EditableField | [EditableField, EditableField]> = [];
	let index = 0;

	while (index < fields.length) {
		if (fields[index].type === "icon-picker" && fields[index + 1]?.type === "icon-picker") {
			result.push([fields[index], fields[index + 1]]);
			index += 2;
			continue;
		}

		result.push(fields[index]);
		index++;
	}

	return result;
}

export function clampCustomTextSize(value: number): number {
	if (!Number.isFinite(value)) {
		return FONT_SIZE_PRESET_TO_PX.base;
	}

	return Math.min(CUSTOM_TEXT_SIZE_MAX, Math.max(CUSTOM_TEXT_SIZE_MIN, Math.round(value)));
}

export function getCustomTextSizeValue(block: Block): number {
	if (typeof block.style.fontSizePx === "number") {
		return clampCustomTextSize(block.style.fontSizePx);
	}

	if (typeof block.style.fontSize === "string") {
		const presetValue = FONT_SIZE_PRESET_TO_PX[block.style.fontSize];
		if (typeof presetValue === "number") {
			return presetValue;
		}
	}

	return CUSTOM_TEXT_SIZE_DEFAULT_BY_BLOCK[block.type] ?? FONT_SIZE_PRESET_TO_PX.base;
}

export function clampCustomDividerWidth(value: number): number {
	if (!Number.isFinite(value)) {
		return WIDTH_PRESET_TO_PX.md;
	}

	return Math.min(
		CUSTOM_DIVIDER_WIDTH_MAX,
		Math.max(CUSTOM_DIVIDER_WIDTH_MIN, Math.round(value)),
	);
}

export function getCustomDividerWidthValue(block: Block): number {
	if (typeof block.style.widthPx === "number") {
		return clampCustomDividerWidth(block.style.widthPx);
	}

	if (typeof block.style.width === "string") {
		const presetValue = WIDTH_PRESET_TO_PX[block.style.width];
		if (typeof presetValue === "number") {
			return presetValue;
		}
	}

	return WIDTH_PRESET_TO_PX.md;
}

export function formatSlotLabel(slot: string): string {
	if (slot === "main") return "Main";
	if (slot === "left") return "Left";
	if (slot === "right") return "Right";

	const columnMatch = /^col-(\d+)$/.exec(slot);
	if (columnMatch) return `Col ${columnMatch[1]}`;

	return slot.replace(/[-_]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
