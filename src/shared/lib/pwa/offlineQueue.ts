/**
 * Управление очередью ордеров для offline режима
 */

interface QueuedOrder {
	id: string;
	order: any;
	timestamp: string;
	retries: number;
}

const DB_NAME = "quantflow-db";
const DB_VERSION = 1;
const STORE_NAME = "offlineQueue";
const MAX_RETRIES = 3;

/**
 * Инициализация IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const objectStore = db.createObjectStore(STORE_NAME, {
					keyPath: "id",
				});
				objectStore.createIndex("timestamp", "timestamp", { unique: false });
			}
		};
	});
}

/**
 * Добавление ордера в очередь
 */
export async function addOrderToQueue(order: any): Promise<string> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);

		const queuedOrder: QueuedOrder = {
			id:
				order.id ||
				`offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			order,
			timestamp: new Date().toISOString(),
			retries: 0,
		};

		await new Promise<void>((resolve, reject) => {
			const request = store.add(queuedOrder);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});

		// Уведомляем service worker о новом ордере
		if ("serviceWorker" in navigator) {
			const registration = await navigator.serviceWorker.ready;
			registration.active?.postMessage({
				type: "ORDER_QUEUED",
				order: queuedOrder,
			});
		}

		return queuedOrder.id;
	} catch (error) {
		console.error("Error adding order to queue:", error);
		throw error;
	}
}

/**
 * Получение всех ордеров из очереди
 */
export async function getQueuedOrders(): Promise<QueuedOrder[]> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORE_NAME], "readonly");
		const store = transaction.objectStore(STORE_NAME);

		return new Promise((resolve, reject) => {
			const request = store.getAll();
			request.onsuccess = () => resolve(request.result || []);
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error("Error getting queued orders:", error);
		return [];
	}
}

/**
 * Удаление ордера из очереди
 */
export async function removeOrderFromQueue(orderId: string): Promise<void> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);

		await new Promise<void>((resolve, reject) => {
			const request = store.delete(orderId);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error("Error removing order from queue:", error);
		throw error;
	}
}

/**
 * Очистка всей очереди
 */
export async function clearQueue(): Promise<void> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);

		await new Promise<void>((resolve, reject) => {
			const request = store.clear();
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error("Error clearing queue:", error);
		throw error;
	}
}

/**
 * Синхронизация очереди с сервером
 */
export async function syncQueue(): Promise<number> {
	const queuedOrders = await getQueuedOrders();
	if (queuedOrders.length === 0) return 0;

	let syncedCount = 0;

	for (const queuedOrder of queuedOrders) {
		try {
			// Здесь должен быть реальный API вызов
			// Для демо используем fetch
			const response = await fetch("/api/orders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(queuedOrder.order),
			});

			if (response.ok) {
				await removeOrderFromQueue(queuedOrder.id);
				syncedCount++;
			} else {
				// Увеличиваем счетчик попыток
				await incrementRetry(queuedOrder.id);
			}
		} catch (error) {
			console.error("Error syncing order:", error);
			await incrementRetry(queuedOrder.id);
		}
	}

	return syncedCount;
}

/**
 * Увеличение счетчика попыток
 */
async function incrementRetry(orderId: string): Promise<void> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);

		const getRequest = store.get(orderId);
		await new Promise<void>((resolve, reject) => {
			getRequest.onsuccess = () => {
				const queuedOrder = getRequest.result;
				if (queuedOrder) {
					queuedOrder.retries++;
					if (queuedOrder.retries >= MAX_RETRIES) {
						// Удаляем после максимального количества попыток
						store.delete(orderId);
					} else {
						store.put(queuedOrder);
					}
				}
				resolve();
			};
			getRequest.onerror = () => reject(getRequest.error);
		});
	} catch (error) {
		console.error("Error incrementing retry:", error);
	}
}
