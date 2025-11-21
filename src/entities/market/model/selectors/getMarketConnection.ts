import { StateSchema } from "app/providers/StoreProvider";
import { createSelector } from "@reduxjs/toolkit";

export const getMarketConnection = createSelector(
	(state: StateSchema) => state.market,
	(market) => ({
		isConnected: market.isConnected,
		latencyMs: market.latencyMs,
		updatesPerSecond: market.updatesPerSecond,
	})
);
