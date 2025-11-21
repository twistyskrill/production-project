export type AnalyticsPeriod = "1D" | "1W" | "1M" | "3M" | "1Y";

export interface PnLPoint {
	timestamp: string;
	value: number;
	benchmark: number;
}

export interface PortfolioSlice {
	label: string;
	weight: number;
	value: number;
}

export interface TradeHistoryRow {
	id: string;
	symbol: string;
	side: "buy" | "sell";
	quantity: number;
	price: number;
	pnl: number;
	timestamp: string;
	strategy: string;
}

export interface AnalyticsSchema {
	period: AnalyticsPeriod;
	benchmark: string;
	isLive: boolean;
}
