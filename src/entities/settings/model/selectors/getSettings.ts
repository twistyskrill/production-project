import { StateSchema } from "app/providers/StoreProvider";

export const getSettings = (state: StateSchema) => state.settings;
export const getWatchlist = (state: StateSchema) => state.settings.watchlist;
export const getAlertRules = (state: StateSchema) => state.settings.alerts;
