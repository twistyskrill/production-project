import { Workbox } from "workbox-window";

const SW_PATH = "/service-worker.js";

export async function registerServiceWorker() {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return;
	}
	try {
		const wb = new Workbox(SW_PATH);
		wb.addEventListener("installed", (event) => {
			if (event.isUpdate) {
				console.info("[quantflow] new content is available, reloading...");
				window.location.reload();
			}
		});
		await wb.register();
	} catch (error) {
		console.warn("Service worker registration failed", error);
	}
}

export async function unregisterServiceWorker() {
	if (!("serviceWorker" in navigator)) {
		return;
	}
	const registrations = await navigator.serviceWorker.getRegistrations();
	await Promise.all(
		registrations.map((registration) => registration.unregister())
	);
}
