import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "app/providers/ThemeProvider";
import { StoreProvider } from "app/providers/StoreProvider";
import App from "./app/App";
import "app/styles/index.scss";
import "./shared/config/i18n/i18n";
import { ErrorBoundary } from "./app/providers/ErrorBoundary";
import { registerServiceWorker } from "./shared/lib/pwa/registerServiceWorker";

const container = document.getElementById("root");

if (!container) {
	throw new Error("Root container not found. Cannot mount React app.");
}

const root = createRoot(container);

try {
	root.render(
		<BrowserRouter>
			<StoreProvider>
				<ErrorBoundary>
					<ThemeProvider>
						<App />
					</ThemeProvider>
				</ErrorBoundary>
			</StoreProvider>
		</BrowserRouter>
	);
} catch (error) {
	console.error("Failed to render app:", error);
}

// Регистрируем service worker (в dev режиме тоже для тестирования)
if ("serviceWorker" in navigator) {
	registerServiceWorker().catch((error) => {
		console.warn("Failed to register service worker:", error);
	});
}
