export interface FontFamilyOption {
	value: string;
	label: string;
	fontFamily: string;
}

export const FONT_FAMILY_OPTIONS: readonly FontFamilyOption[] = [
	{
		value: "Inter",
		label: "Inter",
		fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Poppins",
		label: "Poppins",
		fontFamily: '"Poppins", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Roboto",
		label: "Roboto",
		fontFamily: '"Roboto", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Playfair Display",
		label: "Playfair Display",
		fontFamily: '"Playfair Display", ui-serif, Georgia, serif',
	},
	{
		value: "Montserrat",
		label: "Montserrat",
		fontFamily: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Open Sans",
		label: "Open Sans",
		fontFamily: '"Open Sans", ui-sans-serif, system-ui, sans-serif',
	},
];

export function resolveFontValue(fontFamily: string): string {
	const found = FONT_FAMILY_OPTIONS.find((option) => option.value === fontFamily);
	return found ? found.value : FONT_FAMILY_OPTIONS[0].value;
}

export function resolveFontOption(fontFamily: string): FontFamilyOption {
	const normalizedValue = resolveFontValue(fontFamily);
	return (
		FONT_FAMILY_OPTIONS.find((option) => option.value === normalizedValue) ??
		FONT_FAMILY_OPTIONS[0]
	);
}
