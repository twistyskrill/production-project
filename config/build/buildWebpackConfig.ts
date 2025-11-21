import path from "path";
import webpack from "webpack";
import { buildPlugins } from "./buildPlugins";
import { buildLoaders } from "./buildLoaders";
import { buildResolvers } from "./buildResolvers";
import { BuildOptions } from "./types/config";
import { buildDevServer } from "./buildDevServer";
export function buildWebpackConfig(
	options: BuildOptions
): webpack.Configuration {
	const { paths, mode, isDev } = options;
	return {
		mode,
		entry: paths.entry,
		output: {
			filename: isDev ? "[name].js" : "[name].[contenthash].js",
			chunkFilename: isDev
				? "[name].chunk.js"
				: "[name].[contenthash].chunk.js",
			path: paths.build,
			clean: !isDev,
			publicPath: "/",
			assetModuleFilename: isDev
				? "assets/[name][ext]"
				: "assets/[name].[contenthash][ext]",
		},
		plugins: buildPlugins(options),
		module: {
			rules: buildLoaders(options),
		},
		resolve: buildResolvers(options),
		devtool: isDev ? "inline-source-map" : undefined,
		devServer: isDev ? buildDevServer(options) : undefined,
	};
}
