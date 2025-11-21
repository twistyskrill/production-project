import { createSelector } from "@reduxjs/toolkit";
import { StateSchema } from "app/providers/StoreProvider";

export const getMarketQuotes = (state: StateSchema) => state.market.quotes;

export const getMarketQuotesArray = createSelector(getMarketQuotes, (quotes) =>
	Object.values(quotes)
);
