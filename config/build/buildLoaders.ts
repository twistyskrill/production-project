import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";
import { BuildOptions } from "./types/config";
import { buildBabelLoader } from "./loaders/buildBabelLoader";

export function buildLoaders(options: BuildOptions): webpack.RuleSetRule[] {
	const { isDev } = options;
	const svgLoader = {
		test: /\.svg$/,
		use: ["@svgr/webpack"],
	};
	const fileLoader = {
		test: /\.(png|jpe?g|gif|woff|woff2)$/i,
		use: [
			{
				loader: "file-loader",
			},
		],
	};
	// CSS модули (должен быть ПЕРВЫМ, чтобы обработать .module.scss файлы)
	const cssModulesLoader = {
		test: /\.module\.s[ac]ss$/i,
		exclude: /node_modules/,
		use: [
			isDev
				? {
						loader: "style-loader",
						options: {
							injectType: "styleTag",
							insert: "head",
						},
				  }
				: MiniCssExtractPlugin.loader,
			{
				loader: "css-loader",
				options: {
					modules: {
						mode: "local",
						localIdentName: isDev
							? "[path][name]__[local]--[hash:base64:5]"
							: "[hash:base64:8]",
						exportLocalsConvention: "camelCase",
					},
					sourceMap: isDev,
					esModule: false,
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
	};

	const babelLoader = buildBabelLoader(options);

	// Обычные SCSS файлы (без .module.)
	const cssLoader = {
		test: /\.s[ac]ss$/i,
		exclude: [/node_modules/, /\.module\.s[ac]ss$/i],
		use: [
			isDev
				? {
						loader: "style-loader",
						options: {
							injectType: "styleTag",
							insert: "head",
						},
				  }
				: MiniCssExtractPlugin.loader,
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
	};

	const typescriptLoader = {
		test: /\.tsx?$/,
		use: "ts-loader",
		exclude: /node_modules/,
	};

	// Важно: cssModulesLoader должен быть ПЕРЕД cssLoader и typescriptLoader
	// Порядок имеет значение - webpack обрабатывает правила сверху вниз
	// CSS loaders должны быть ПЕРВЫМИ, чтобы не перехватывались другими loaders
	return [
		cssModulesLoader, // Сначала обрабатываем CSS модули
		cssLoader, // Затем обычные SCSS файлы
		fileLoader,
		svgLoader,
		babelLoader,
		typescriptLoader,
	];
}
