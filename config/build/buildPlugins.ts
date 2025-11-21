import path from "path";
import webpack from "webpack";
import HTMLWebpackPlugin from "html-webpack-plugin";
import { BuildOptions } from "./types/config";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

export function buildPlugins({
	paths,
	isDev,
	apiUrl,
	project,
}: BuildOptions): webpack.WebpackPluginInstance[] {
	const plugins = [
		new HTMLWebpackPlugin({
			template: paths.html,
			filename: "index.html",
			inject: true,
			// В dev режиме не используем хэши
			hash: false,
			cache: isDev,
		}),
		new webpack.ProgressPlugin(),
		new webpack.DefinePlugin({
			__IS_DEV__: JSON.stringify(isDev),
			__API__: JSON.stringify(apiUrl),
			__PROJECT__: JSON.stringify(project),
		}),
	];

	if (isDev) {
		plugins.push(new ReactRefreshWebpackPlugin());
		plugins.push(new webpack.HotModuleReplacementPlugin());
	} else {
		plugins.push(
			new MiniCssExtractPlugin({
				filename: "css/[name].[contenthash:8].css",
				chunkFilename: "css/[name].[contenthash:8].css",
			})
		);
		plugins.push(
			new CopyPlugin({
				patterns: [
					{ from: paths.locales, to: paths.buildLocales },
					{
						from: paths.manifest,
						to: path.resolve(paths.build, "manifest.json"),
					},
					{ from: paths.publicAssets, to: paths.buildAssets },
					{
						from: paths.serviceWorker,
						to: path.resolve(paths.build, "service-worker.js"),
					},
				],
			})
		);
		// BundleAnalyzer отключен в dev режиме, чтобы избежать конфликта портов
		// Для анализа бандла используйте: npm run build:prod
		// plugins.push(
		// 	new BundleAnalyzerPlugin({
		// 		openAnalyzer: false,
		// 	})
		// );
	}

	return plugins;
}
