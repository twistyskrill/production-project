module.exports = {
	env: {
		browser: true,
		es2021: true,
		jest: true,
	},
	extends: [], // убрать все расширения
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["twisty-plugin"], // убрать все плагины
	rules: {
		// Отключить все правила
		"twisty-plugin/path-checker": "error",
	},
	globals: {
		__IS_DEV__: true,
		__API__: true,
		__PROJECT__: true,
	},
	overrides: [],
};
