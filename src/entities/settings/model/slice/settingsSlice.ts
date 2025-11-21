import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SETTINGS_LOCALSTORAGE_KEY } from "shared/const/localstorage";
import { safeLocalStorage } from "shared/lib/storage/safeLocalStorage";
import { AlertRule, SettingsSchema, ThemePreset } from "../types/settings";

const DEFAULT_SETTINGS: SettingsSchema = {
	locale: "en",
	theme: "dark",
	defaultRoute: "/terminal",
	watchlist: [
		{ symbol: "AAPL", pinned: true },
		{ symbol: "NVDA" },
		{ symbol: "BTCUSD" },
	],
	alerts: [],
};

const loadSettings = (): SettingsSchema =>
	safeLocalStorage.get<SettingsSchema>(
		SETTINGS_LOCALSTORAGE_KEY,
		DEFAULT_SETTINGS
	);

const persistSettings = (settings: SettingsSchema) =>
	safeLocalStorage.set(SETTINGS_LOCALSTORAGE_KEY, settings);

const initialState: SettingsSchema = loadSettings();

export const settingsSlice = createSlice({
	name: "settings",
	initialState,
	reducers: {
		setLocale(state, action: PayloadAction<"en" | "ru">) {
			state.locale = action.payload;
			persistSettings(state);
		},
		setTheme(state, action: PayloadAction<ThemePreset>) {
			state.theme = action.payload;
			persistSettings(state);
		},
		setDefaultRoute(
			state,
			action: PayloadAction<"/terminal" | "/analytics" | "/settings">
		) {
			state.defaultRoute = action.payload;
			persistSettings(state);
		},
		upsertWatchlist(
			state,
			action: PayloadAction<{ symbol: string; pinned?: boolean }>
		) {
			const existing = state.watchlist.find(
				(item) => item.symbol === action.payload.symbol
			);
			if (existing) {
				existing.pinned = action.payload.pinned ?? existing.pinned;
			} else {
				state.watchlist.push({
					symbol: action.payload.symbol,
					pinned: !!action.payload.pinned,
				});
			}
			persistSettings(state);
		},
		removeFromWatchlist(state, action: PayloadAction<string>) {
			state.watchlist = state.watchlist.filter(
				(item) => item.symbol !== action.payload
			);
			persistSettings(state);
		},
		upsertAlert(state, action: PayloadAction<AlertRule>) {
			const index = state.alerts.findIndex(
				(alert) => alert.id === action.payload.id
			);
			if (index >= 0) {
				state.alerts[index] = action.payload;
			} else {
				state.alerts.push(action.payload);
			}
			persistSettings(state);
		},
		toggleAlert(state, action: PayloadAction<string>) {
			state.alerts = state.alerts.map((alert) =>
				alert.id === action.payload
					? { ...alert, active: !alert.active }
					: alert
			);
			persistSettings(state);
		},
		removeAlert(state, action: PayloadAction<string>) {
			state.alerts = state.alerts.filter(
				(alert) => alert.id !== action.payload
			);
			persistSettings(state);
		},
	},
});

export const { actions: settingsActions } = settingsSlice;
export const { reducer: settingsReducer } = settingsSlice;
