import { BuildOptions } from "./types/config";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import path from "path";

export function buildDevServer(options: BuildOptions): DevServerConfiguration {
	return {
		port: options.port,
		open: true,
		historyApiFallback: {
			disableDotRule: true,
			index: "/index.html",
			htmlAcceptHeaders: ["text/html"],
		},
		hot: true,
		liveReload: true,
		compress: true,
		client: {
			overlay: {
				errors: true,
				warnings: false,
			},
		},
		// Обслуживаем статические файлы из public
		static: [
			{
				directory: path.resolve(options.paths.html, ".."),
				publicPath: "/",
				watch: true,
			},
		],
		// Настройка для правильной обработки JS файлов
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
	};
}
