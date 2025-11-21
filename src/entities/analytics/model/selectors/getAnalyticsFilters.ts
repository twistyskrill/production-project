import { StateSchema } from "app/providers/StoreProvider";

export const getAnalyticsPeriod = (state: StateSchema) =>
	state.analytics.period;
export const getAnalyticsBenchmark = (state: StateSchema) =>
	state.analytics.benchmark;
export const getAnalyticsLive = (state: StateSchema) => state.analytics.isLive;
