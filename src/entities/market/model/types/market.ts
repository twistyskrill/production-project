export interface MarketQuote {
	symbol: string;
	bid: number;
	ask: number;
	last: number;
	change: number;
	changePercent: number;
	updatedAt: number;
	trend: "up" | "down" | "flat";
}

export interface MarketSchema {
	quotes: Record<string, MarketQuote>;
	isConnected: boolean;
	updatesPerSecond: number;
	latencyMs: number;
}
