const CACHE_NAME = "quantflow-cache-v1";
const CORE_ASSETS = [
	"/",
	"/terminal",
	"/analytics",
	"/settings",
	"/manifest.json",
	"/service-worker.js",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(CORE_ASSETS).catch((err) => {
				console.warn("[SW] Failed to cache some assets:", err);
			});
		})
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME)
						.map((key) => caches.delete(key))
				)
			)
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const { request } = event;

	// Пропускаем не-GET запросы
	if (request.method !== "GET") {
		return;
	}

	// Стратегия: stale-while-revalidate для API запросов
	if (request.url.includes("/trading") || request.url.includes("/api")) {
		event.respondWith(
			caches.open(CACHE_NAME).then((cache) => {
				return cache.match(request).then((cached) => {
					const fetchPromise = fetch(request)
						.then((response) => {
							// Кэшируем только успешные ответы
							if (response.status === 200) {
								cache.put(request, response.clone());
							}
							return response;
						})
						.catch(() => {
							// В случае ошибки сети, возвращаем кэш если есть
							return (
								cached ||
								new Response(JSON.stringify({ error: "Network error" }), {
									status: 503,
									headers: { "Content-Type": "application/json" },
								})
							);
						});

					// Возвращаем кэш немедленно, если есть, и обновляем в фоне
					return cached || fetchPromise;
				});
			})
		);
		return;
	}

	// Стратегия: cache-first для статических ресурсов
	if (
		request.url.includes(".js") ||
		request.url.includes(".css") ||
		request.url.includes(".svg") ||
		request.url.includes(".png") ||
		request.url.includes(".json")
	) {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) {
					return cached;
				}
				return fetch(request)
					.then((response) => {
						if (response.status === 200) {
							const copy = response.clone();
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(request, copy);
							});
						}
						return response;
					})
					.catch(() => {
						// Fallback для оффлайн режима
						return new Response("Offline", {
							status: 503,
							headers: { "Content-Type": "text/plain" },
						});
					});
			})
		);
		return;
	}

	// Стратегия: network-first для навигационных запросов
	event.respondWith(
		fetch(request)
			.then((response) => {
				// Кэшируем успешные ответы
				if (response.status === 200) {
					const copy = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, copy);
					});
				}
				return response;
			})
			.catch(() => {
				// В оффлайн режиме возвращаем кэш или fallback
				return (
					caches.match(request) ||
					caches.match("/") ||
					new Response("Offline", {
						status: 503,
						headers: { "Content-Type": "text/plain" },
					})
				);
			})
	);
});

self.addEventListener("push", (event) => {
	const data = event.data?.json() || {
		title: "Quantflow alert",
		body: "Market update",
	};
	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: "/icons/quantflow-192.svg",
		})
	);
});
