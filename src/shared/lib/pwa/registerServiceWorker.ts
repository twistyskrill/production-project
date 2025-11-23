import { Workbox } from "workbox-window";

const SW_PATH = "/service-worker.js";

export async function registerServiceWorker() {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		console.warn("[PWA] Service workers not supported");
		return;
	}

	try {
		const wb = new Workbox(SW_PATH);

		// Обработка обновлений
		wb.addEventListener("installed", (event) => {
			if (event.isUpdate) {
				console.info("[PWA] New content is available, reloading...");
				// В dev режиме не перезагружаем автоматически
				if (!__IS_DEV__) {
					window.location.reload();
				}
			} else {
				console.info("[PWA] Service worker installed");
			}
		});

		// Обработка сообщений от service worker
		wb.addEventListener("message", (event) => {
			if (event.data && event.data.type === "ORDER_QUEUED") {
				console.log("[PWA] Order queued:", event.data.order);
				// Можно добавить уведомление пользователю
			}
		});

		await wb.register();

		// Инициализируем IndexedDB в service worker
		const activeWorker = await wb.getSW();
		if (activeWorker) {
			activeWorker.postMessage({ type: "INIT_DB" });
		}

		console.info("[PWA] Service worker registered successfully");
	} catch (error) {
		console.warn("[PWA] Service worker registration failed:", error);
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
