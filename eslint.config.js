import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import parser from "@typescript-eslint/parser";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
	globalIgnores([".react-router/", "build/", "node_modules/"]),
	eslintConfigPrettier,
	{
		files: ["app/**/*.tsx"],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2018,
				sourceType: "module",
			},
			parser: parser,
		},
	},
	eslintPluginPrettierRecommended,
]);
