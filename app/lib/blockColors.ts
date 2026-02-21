import type { BlockStyle, GlobalStyle } from "~/types/editor";

/**
 * Resolves the effective text color for a block.
 * - "custom" colorMode + textColor set → use the block's custom textColor
 * - Otherwise → derive from globalStyle.themeMode (white for dark, near-black for light)
 */
export function resolveTextColor(style: BlockStyle, globalStyle: GlobalStyle): string {
  if (style.colorMode === "custom" && style.textColor) return style.textColor;
  return globalStyle.themeMode === "dark" ? "#ffffff" : "#111111";
}

/**
 * Resolves the effective accent color for a block.
 * - "custom" colorMode + accentColor set → use the block's custom accentColor
 * - Otherwise → use globalStyle.primaryColor
 */
export function resolveAccentColor(style: BlockStyle, globalStyle: GlobalStyle): string {
  if (style.colorMode === "custom" && style.accentColor) return style.accentColor;
  return globalStyle.primaryColor || "#00e5a0";
}
