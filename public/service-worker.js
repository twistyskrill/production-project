const CACHE_NAME = "quantflow-cache-v2";
const OFFLINE_QUEUE_KEY = "quantflow-offline-queue";
const CORE_ASSETS = [
	"/",
	"/terminal",
	"/analytics",
	"/settings",
	"/manifest.json",
	"/service-worker.js",
];

// Установка service worker
self.addEventListener("install", (event) => {
	console.log("[SW] Installing service worker...");
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(CORE_ASSETS).catch((err) => {
				console.warn("[SW] Failed to cache some assets:", err);
			});
		})
	);
	self.skipWaiting();
});

// Активация service worker
self.addEventListener("activate", (event) => {
	console.log("[SW] Activating service worker...");
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME)
						.map((key) => {
							console.log("[SW] Deleting old cache:", key);
							return caches.delete(key);
						})
				)
			)
			.then(() => {
				// Синхронизируем очередь при активации
				return syncOfflineQueue();
			})
	);
	self.clients.claim();
});

// Синхронизация очереди offline ордеров
async function syncOfflineQueue() {
	try {
		const queue = await getOfflineQueue();
		if (queue.length === 0) return;

		console.log(`[SW] Syncing ${queue.length} queued orders...`);

		// Отправляем все ордера из очереди
		for (const order of queue) {
			try {
				await fetch("/api/orders", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(order),
				});
				console.log("[SW] Synced order:", order.id);
			} catch (error) {
				console.error("[SW] Failed to sync order:", error);
				// Если не удалось синхронизировать, оставляем в очереди
				return;
			}
		}

		// Очищаем очередь после успешной синхронизации
		await clearOfflineQueue();
		console.log("[SW] Queue synced successfully");
	} catch (error) {
		console.error("[SW] Error syncing queue:", error);
	}
}

// Получение очереди из IndexedDB
async function getOfflineQueue() {
	return new Promise((resolve) => {
		const request = indexedDB.open("quantflow-db", 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("offlineQueue")) {
				db.createObjectStore("offlineQueue", { keyPath: "id" });
			}
		};
		request.onsuccess = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("offlineQueue")) {
				resolve([]);
				return;
			}
			const transaction = db.transaction(["offlineQueue"], "readonly");
			const store = transaction.objectStore("offlineQueue");
			const getAllRequest = store.getAll();
			getAllRequest.onsuccess = () => {
				resolve(getAllRequest.result || []);
			};
			getAllRequest.onerror = () => resolve([]);
		};
		request.onerror = () => resolve([]);
	});
}

// Очистка очереди
async function clearOfflineQueue() {
	return new Promise((resolve) => {
		const request = indexedDB.open("quantflow-db", 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("offlineQueue")) {
				db.createObjectStore("offlineQueue", { keyPath: "id" });
			}
		};
		request.onsuccess = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("offlineQueue")) {
				resolve();
				return;
			}
			const transaction = db.transaction(["offlineQueue"], "readwrite");
			const store = transaction.objectStore("offlineQueue");
			store.clear().onsuccess = () => resolve();
			store.clear().onerror = () => resolve();
		};
		request.onerror = () => resolve();
	});
}

// Инициализация IndexedDB при первом запуске
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "INIT_DB") {
		const request = indexedDB.open("quantflow-db", 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("offlineQueue")) {
				db.createObjectStore("offlineQueue", { keyPath: "id" });
			}
		};
	}
});

// Обработка fetch запросов
self.addEventListener("fetch", (event) => {
	const { request } = event;

	// Обработка POST запросов для ордеров (offline queue)
	if (request.method === "POST" && request.url.includes("/api/orders")) {
		event.respondWith(
			fetch(request)
				.then((response) => {
					if (response.ok) {
						return response;
					}
					throw new Error("Network error");
				})
				.catch(async () => {
					// Если оффлайн, сохраняем в очередь
					const orderData = await request.clone().json();
					await addToOfflineQueue({
						...orderData,
						id: orderData.id || `offline-${Date.now()}`,
						timestamp: new Date().toISOString(),
					});

					// Уведомляем клиент о добавлении в очередь
					const clients = await self.clients.matchAll();
					clients.forEach((client) => {
						client.postMessage({
							type: "ORDER_QUEUED",
							order: orderData,
						});
					});

					return new Response(
						JSON.stringify({
							success: true,
							queued: true,
							message: "Order queued for sync when online",
						}),
						{
							status: 202,
							headers: { "Content-Type": "application/json" },
						}
					);
				})
		);
		return;
	}

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

// Добавление ордера в очередь
async function addToOfflineQueue(order) {
	return new Promise((resolve) => {
		const request = indexedDB.open("quantflow-db", 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("offlineQueue")) {
				db.createObjectStore("offlineQueue", { keyPath: "id" });
			}
		};
		request.onsuccess = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("offlineQueue")) {
				// Если store не существует, создаем его через upgrade
				const upgradeRequest = indexedDB.open("quantflow-db", 2);
				upgradeRequest.onupgradeneeded = () => {
					const upgradeDb = upgradeRequest.result;
					if (!upgradeDb.objectStoreNames.contains("offlineQueue")) {
						upgradeDb.createObjectStore("offlineQueue", { keyPath: "id" });
					}
				};
				upgradeRequest.onsuccess = () => {
					const upgradeDb = upgradeRequest.result;
					const transaction = upgradeDb.transaction(
						["offlineQueue"],
						"readwrite"
					);
					const store = transaction.objectStore("offlineQueue");
					store.add(order).onsuccess = () => {
						console.log("[SW] Order added to queue:", order.id);
						resolve();
					};
					store.add(order).onerror = () => resolve();
				};
				return;
			}
			const transaction = db.transaction(["offlineQueue"], "readwrite");
			const store = transaction.objectStore("offlineQueue");
			store.add(order).onsuccess = () => {
				console.log("[SW] Order added to queue:", order.id);
				resolve();
			};
			store.add(order).onerror = () => resolve();
		};
		request.onerror = () => resolve();
	});
}

// Обработка push уведомлений
self.addEventListener("push", (event) => {
	console.log("[SW] Push notification received");
	let data = {
		title: "Quantflow alert",
		body: "Market update",
		icon: "/icons/quantflow-192.svg",
		badge: "/icons/quantflow-192.svg",
		tag: "quantflow-alert",
	};

	if (event.data) {
		try {
			data = { ...data, ...event.data.json() };
		} catch (e) {
			data.body = event.data.text() || data.body;
		}
	}

	const notificationOptions = {
		body: data.body,
		icon: data.icon || "/icons/quantflow-192.svg",
		badge: data.badge || "/icons/quantflow-192.svg",
		tag: data.tag || "quantflow-alert",
		data: data.data || {},
		requireInteraction: data.requireInteraction || false,
		actions: data.actions || [],
	};

	event.waitUntil(
		self.registration.showNotification(data.title, notificationOptions)
	);
});

// Обработка кликов по уведомлениям
self.addEventListener("notificationclick", (event) => {
	console.log("[SW] Notification clicked");
	event.notification.close();

	const data = event.notification.data || {};
	const action = event.action;

	// Обработка действий из уведомления
	if (action === "view") {
		event.waitUntil(clients.openWindow(data.url || "/terminal"));
	} else if (action === "dismiss") {
		// Просто закрываем уведомление
	} else {
		// По умолчанию открываем приложение
		event.waitUntil(
			clients
				.matchAll({ type: "window", includeUncontrolled: true })
				.then((clientList) => {
					if (clientList.length > 0) {
						return clientList[0].focus();
					}
					return clients.openWindow(data.url || "/terminal");
				})
		);
	}
});

// Синхронизация при восстановлении соединения
self.addEventListener("sync", (event) => {
	if (event.tag === "sync-orders") {
		console.log("[SW] Background sync triggered");
		event.waitUntil(syncOfflineQueue());
	}
});

// Периодическая синхронизация (если поддерживается)
if ("periodicSync" in self.registration) {
	self.addEventListener("periodicsync", (event) => {
		if (event.tag === "sync-orders-periodic") {
			event.waitUntil(syncOfflineQueue());
		}
	});
}
