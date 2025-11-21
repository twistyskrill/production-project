import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { AnalyticsPeriod } from "entities/analytics";
import { Position } from "entities/position";
import { OrderDraft } from "entities/order";
import {
	ListPositionsRequest,
	ListPositionsResponse,
	AnalyticsResponse,
	mockTradingApi,
	PlaceOrderResponse,
} from "./mockTradingApi";

export const tradingApi = createApi({
	reducerPath: "tradingApi",
	baseQuery: fakeBaseQuery(),
	tagTypes: ["Positions", "Orders", "Analytics", "Trades"],
	endpoints: (builder) => ({
		getPositions: builder.query<ListPositionsResponse, ListPositionsRequest>({
			queryFn: async (params) => {
				try {
					const data = await mockTradingApi.listPositions(params);
					return { data };
				} catch (error) {
					return {
						error: {
							status: 500,
							data: (error as Error).message,
						},
					};
				}
			},
			providesTags: (result) =>
				result
					? [
							...result.items.map(({ id }) => ({
								type: "Positions" as const,
								id,
							})),
							{ type: "Positions" as const, id: "LIST" },
					  ]
					: [{ type: "Positions" as const, id: "LIST" }],
		}),
		placeOrder: builder.mutation<PlaceOrderResponse, OrderDraft>({
			queryFn: async (payload) => {
				try {
					const data = await mockTradingApi.placeOrder(payload);
					return { data };
				} catch (error) {
					return {
						error: {
							status: 500,
							data: (error as Error).message,
						},
					};
				}
			},
			invalidatesTags: [
				{ type: "Orders", id: "LIST" },
				{ type: "Positions", id: "LIST" },
			],
		}),
		closePosition: builder.mutation<Position, string>({
			queryFn: async (id) => {
				try {
					const data = await mockTradingApi.closePosition(id);
					return { data };
				} catch (error) {
					return {
						error: {
							status: 500,
							data: (error as Error).message,
						},
					};
				}
			},
			invalidatesTags: (result) =>
				result
					? [
							{ type: "Positions", id: result.id },
							{ type: "Trades", id: "LIST" },
					  ]
					: [{ type: "Trades", id: "LIST" }],
		}),
		getAnalytics: builder.query<AnalyticsResponse, { period: AnalyticsPeriod }>(
			{
				queryFn: async ({ period }) => {
					try {
						const data = await mockTradingApi.getAnalytics(period);
						return { data };
					} catch (error) {
						return {
							error: {
								status: 500,
								data: (error as Error).message,
							},
						};
					}
				},
				providesTags: [{ type: "Analytics", id: "SUMMARY" }],
			}
		),
		exportTrades: builder.query<
			AnalyticsResponse["trades"],
			{ symbol?: string }
		>({
			queryFn: async ({ symbol }) => {
				try {
					const data = await mockTradingApi.exportTrades(symbol);
					return { data };
				} catch (error) {
					return {
						error: {
							status: 500,
							data: (error as Error).message,
						},
					};
				}
			},
			providesTags: [{ type: "Trades", id: "LIST" }],
		}),
	}),
});

export const {
	useGetPositionsQuery,
	useLazyGetPositionsQuery,
	useClosePositionMutation,
	usePlaceOrderMutation,
	useGetAnalyticsQuery,
	useExportTradesQuery,
	useLazyExportTradesQuery,
} = tradingApi;
