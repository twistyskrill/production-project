import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { MarketQuote, MarketSchema } from "../types/market";

const initialState: MarketSchema = {
	quotes: {},
	isConnected: false,
	updatesPerSecond: 0,
	latencyMs: 0,
};

export const marketSlice = createSlice({
	name: "market",
	initialState,
	reducers: {
		setConnection(state, action: PayloadAction<boolean>) {
			state.isConnected = action.payload;
		},
		seedQuotes(state, action: PayloadAction<MarketQuote[]>) {
			action.payload.forEach((quote) => {
				state.quotes[quote.symbol] = quote;
			});
		},
		updateQuote(state, action: PayloadAction<MarketQuote>) {
			state.quotes[action.payload.symbol] = action.payload;
		},
		setStats(
			state,
			action: PayloadAction<{ updatesPerSecond: number; latencyMs: number }>
		) {
			state.updatesPerSecond = action.payload.updatesPerSecond;
			state.latencyMs = action.payload.latencyMs;
		},
	},
});

export const { actions: marketActions } = marketSlice;
export const { reducer: marketReducer } = marketSlice;
