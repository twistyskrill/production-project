/**
 * Подписка на push уведомления
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return null;
	}

	if (!("PushManager" in window)) {
		console.warn("Push messaging is not supported");
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.ready;

		// Проверяем существующую подписку
		let subscription = await registration.pushManager.getSubscription();

		if (!subscription) {
			// Создаем новую подписку
			// В реальном приложении здесь должен быть реальный VAPID ключ
			const vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa40HIe8v3Xz5Q8vX8";

			const keyArray = urlBase64ToUint8Array(vapidPublicKey);
			subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: keyArray as BufferSource,
			});
		}

		console.log("Push subscription:", subscription);
		return subscription;
	} catch (error) {
		console.error("Error subscribing to push:", error);
		return null;
	}
}

/**
 * Отписка от push уведомлений
 */
export async function unsubscribeFromPush(): Promise<boolean> {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return false;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();

		if (subscription) {
			await subscription.unsubscribe();
			return true;
		}

		return false;
	} catch (error) {
		console.error("Error unsubscribing from push:", error);
		return false;
	}
}

/**
 * Проверка подписки на push
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		return await registration.pushManager.getSubscription();
	} catch (error) {
		console.error("Error getting push subscription:", error);
		return null;
	}
}

/**
 * Конвертация VAPID ключа из base64 в Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
