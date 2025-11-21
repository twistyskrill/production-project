export const safeLocalStorage = {
	get<T>(key: string, fallback: T): T {
		if (typeof window === "undefined") {
			return fallback;
		}
		try {
			const raw = window.localStorage.getItem(key);
			return raw ? (JSON.parse(raw) as T) : fallback;
		} catch (error) {
			console.warn("localStorage#get failed", error);
			return fallback;
		}
	},
	set<T>(key: string, value: T) {
		if (typeof window === "undefined") {
			return;
		}
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.warn("localStorage#set failed", error);
		}
	},
	remove(key: string) {
		if (typeof window === "undefined") {
			return;
		}
		try {
			window.localStorage.removeItem(key);
		} catch (error) {
			console.warn("localStorage#remove failed", error);
		}
	},
};
