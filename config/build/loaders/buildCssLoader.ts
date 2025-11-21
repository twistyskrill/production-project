import MiniCssExtractPlugin from "mini-css-extract-plugin";

export function buildCssLoader(isDev: boolean) {
	return {
		test: /\.s[ac]ss$/i,
		exclude: /node_modules/,
		oneOf: [
			// CSS модули (файлы с .module.)
			{
				test: /\.module\.s[ac]ss$/i,
				use: [
					isDev ? "style-loader" : MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							modules: {
								auto: (resPath: string) =>
									Boolean(resPath.includes(".module.")),
								localIdentName: isDev
									? "[path][name]__[local]--[hash:base64:5]"
									: "[hash:base64:8]",
								exportLocalsConvention: "camelCase",
							},
							sourceMap: isDev,
						},
					},
					{
						loader: "sass-loader",
						options: {
							implementation: require("sass"),
							sourceMap: isDev,
						},
					},
				],
			},
			// Обычные SCSS файлы (без .module.)
			{
				use: [
					isDev ? "style-loader" : MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							sourceMap: isDev,
						},
					},
					{
						loader: "sass-loader",
						options: {
							implementation: require("sass"),
							sourceMap: isDev,
						},
					},
				],
			},
		],
	};
}
