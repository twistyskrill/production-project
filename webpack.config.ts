import webpack from "webpack";
import { buildWebpackConfig } from "./config/build/buildWebpackConfig";
import { BuildEnv, BuildPaths } from "./config/build/types/config";
import path from "path";

export default (env: BuildEnv) => {
	const paths: BuildPaths = {
		entry: path.resolve(__dirname, "src", "index.tsx"),
		build: path.resolve(__dirname, "build"),
		html: path.resolve(__dirname, "public", "index.html"),
		src: path.resolve(__dirname, "src"),
		locales: path.resolve(__dirname, "public", "locales"),
		buildLocales: path.resolve(__dirname, "build", "locales"),
		manifest: path.resolve(__dirname, "public", "manifest.json"),
		publicAssets: path.resolve(__dirname, "public", "icons"),
		buildAssets: path.resolve(__dirname, "build", "icons"),
		serviceWorker: path.resolve(__dirname, "public", "service-worker.js"),
	};

	const mode = env.mode || "development";
	const isDev = mode === "development";
	const apiUrl = env.apiUrl || "http://localhost:8000";
	const PORT = env.port || 3000;
	const config: webpack.Configuration = buildWebpackConfig({
		mode,
		paths,
		isDev,
		port: PORT,
		apiUrl,
		project: "frontend",
	});
	return config;
};
