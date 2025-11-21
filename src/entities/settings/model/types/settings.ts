export type ThemePreset = "light" | "dark" | "system";

export interface WatchlistEntry {
	symbol: string;
	notes?: string;
	pinned?: boolean;
}

export interface AlertRule {
	id: string;
	symbol: string;
	threshold: number;
	type: "price" | "pnl";
	direction: "above" | "below";
	active: boolean;
}

export interface SettingsSchema {
	locale: "en" | "ru";
	theme: ThemePreset;
	defaultRoute: "/terminal" | "/analytics" | "/settings";
	watchlist: WatchlistEntry[];
	alerts: AlertRule[];
}
