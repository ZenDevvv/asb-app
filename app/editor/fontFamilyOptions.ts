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
		value: "Alex Brush",
		label: "Alex Brush",
		fontFamily: '"Alex Brush", "Brush Script MT", "Segoe Script", cursive',
	},
	{
		value: "Allura",
		label: "Allura",
		fontFamily: '"Allura", "Brush Script MT", "Segoe Script", cursive',
	},
	{
		value: "Cinzel",
		label: "Cinzel",
		fontFamily: '"Cinzel", "Times New Roman", serif',
	},
	{
		value: "Cormorant Garamond",
		label: "Cormorant Garamond",
		fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
	},
	{
		value: "EB Garamond",
		label: "EB Garamond",
		fontFamily: '"EB Garamond", "Times New Roman", serif',
	},
	{
		value: "Great Vibes",
		label: "Great Vibes",
		fontFamily: '"Great Vibes", "Brush Script MT", "Segoe Script", cursive',
	},
	{
		value: "Poppins",
		label: "Poppins",
		fontFamily: '"Poppins", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Parisienne",
		label: "Parisienne",
		fontFamily: '"Parisienne", "Brush Script MT", "Segoe Script", cursive',
	},
	{
		value: "Roboto",
		label: "Roboto",
		fontFamily: '"Roboto", ui-sans-serif, system-ui, sans-serif',
	},
	{
		value: "Sacramento",
		label: "Sacramento",
		fontFamily: '"Sacramento", "Brush Script MT", "Segoe Script", cursive',
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
