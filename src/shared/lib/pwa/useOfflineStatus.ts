import { useEffect, useState } from "react";

/**
 * Хук для отслеживания online/offline статуса
 */
export function useOfflineStatus() {
	const [isOnline, setIsOnline] = useState(
		typeof navigator !== "undefined" ? navigator.onLine : true
	);
	const [wasOffline, setWasOffline] = useState(false);

	useEffect(() => {
		const handleOnline = async () => {
			setIsOnline(true);
			if (wasOffline) {
				// Уведомляем о восстановлении соединения
				console.log("Connection restored");

				// Автоматически синхронизируем очередь при восстановлении
				// Используем динамический импорт чтобы избежать циклических зависимостей
				try {
					const { syncQueue } = await import("./offlineQueue");
					const syncedCount = await syncQueue();
					if (syncedCount > 0) {
						console.log(`Synced ${syncedCount} queued orders`);
						// Можно показать уведомление пользователю
						if (
							"Notification" in window &&
							Notification.permission === "granted"
						) {
							new Notification("Orders synced", {
								body: `${syncedCount} order(s) have been synced successfully.`,
								icon: "/icons/quantflow-192.svg",
							});
						}
					}
				} catch (error) {
					console.error("Error syncing queue:", error);
				}
			}
			setWasOffline(false);
		};

		const handleOffline = () => {
			setIsOnline(false);
			setWasOffline(true);
			console.log("Connection lost");
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [wasOffline]);

	return { isOnline, wasOffline };
}
