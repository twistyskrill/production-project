export async function ensureNotificationPermission(): Promise<boolean> {
	if (typeof window === "undefined" || !("Notification" in window)) {
		return false;
	}

	if (Notification.permission === "granted") {
		return true;
	}

	if (Notification.permission === "denied") {
		return false;
	}

	const permission = await Notification.requestPermission();
	return permission === "granted";
}
