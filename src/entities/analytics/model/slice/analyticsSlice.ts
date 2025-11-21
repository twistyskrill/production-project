import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AnalyticsPeriod, AnalyticsSchema } from "../types/analytics";

const initialState: AnalyticsSchema = {
	period: "1W",
	benchmark: "SPX",
	isLive: true,
};

export const analyticsSlice = createSlice({
	name: "analytics",
	initialState,
	reducers: {
		setPeriod(state, action: PayloadAction<AnalyticsPeriod>) {
			state.period = action.payload;
		},
		setBenchmark(state, action: PayloadAction<string>) {
			state.benchmark = action.payload;
		},
		toggleLive(state) {
			state.isLive = !state.isLive;
		},
	},
});

export const { actions: analyticsActions } = analyticsSlice;
export const { reducer: analyticsReducer } = analyticsSlice;
