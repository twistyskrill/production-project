export enum OrderType {
	MARKET = "market",
	LIMIT = "limit",
	STOP = "stop",
}

export enum OrderSide {
	BUY = "buy",
	SELL = "sell",
}

export enum OrderTimeInForce {
	GTC = "GTC",
	IOC = "IOC",
	FOK = "FOK",
}

export enum OrderStatus {
	DRAFT = "draft",
	PENDING = "pending",
	SENT = "sent",
	FILLED = "filled",
	REJECTED = "rejected",
}

export interface OrderDraft {
	symbol: string;
	side: OrderSide;
	type: OrderType;
	quantity: number;
	price?: number;
	stopPrice?: number;
	timeInForce: OrderTimeInForce;
	reduceOnly: boolean;
	algo?: "twap" | "vwap" | "none";
	comment?: string;
}

export interface Order extends OrderDraft {
	id: string;
	status: OrderStatus;
	createdAt: string;
	updatedAt: string;
	executionPrice?: number;
	fillPrice?: number;
	failReason?: string;
}

export interface OrdersSchema {
	draft: OrderDraft;
	confirmation?: OrderDraft;
	submitting: boolean;
	lastOrder?: Order;
	history: Order[];
	error?: string;
}
