/**
 * Типы для Order Book (стакан заявок)
 */

export interface OrderBookLevel {
	price: number;
	quantity: number;
	total?: number; // Накопительная сумма
}

export interface OrderBook {
	symbol: string;
	bids: OrderBookLevel[]; // Заявки на покупку (от высокой к низкой)
	asks: OrderBookLevel[]; // Заявки на продажу (от низкой к высокой)
	spread: number; // Спред между лучшим бидом и аском
	spreadPercent: number; // Спред в процентах
	lastUpdate: number;
}

export interface OrderBookSchema {
	books: Record<string, OrderBook>;
	selectedSymbol?: string;
}
