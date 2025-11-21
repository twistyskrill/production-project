import Decimal from "decimal.js";
import { subMinutes } from "date-fns";
import { nanoid } from "nanoid";
import { withLatency } from "shared/lib/async/withLatency";
import {
	pickRandom,
	randomBetween,
	randomBoolean,
} from "shared/lib/random/random";
import { Order, OrderDraft, OrderStatus, OrderType } from "entities/order";
import {
	Position,
	PositionDirection,
	PositionSortField,
	PositionStatus,
} from "entities/position";
import {
	AnalyticsPeriod,
	PnLPoint,
	PortfolioSlice,
	TradeHistoryRow,
} from "entities/analytics";
import { SYMBOLS, STRATEGIES, PORTFOLIOS } from "./constants";

export interface ListPositionsRequest {
	query?: string;
	statuses?: PositionStatus[];
	sort?: {
		field: PositionSortField;
		order: "asc" | "desc";
	};
	symbol?: string;
	limit?: number;
}

export interface ListPositionsResponse {
	total: number;
	items: Position[];
	updatedAt: string;
}

export interface PlaceOrderResponse {
	order: Order;
	willSucceed?: boolean;
	executionPrice?: number;
}

export interface AnalyticsResponse {
	pnl: PnLPoint[];
	distribution: PortfolioSlice[];
	trades: TradeHistoryRow[];
}

const assetClassBySymbol = (symbol: string) => {
	if (symbol.endsWith("USD") || symbol.includes("=F")) {
		return "Macro / Futures";
	}
	if (symbol === "BTCUSD" || symbol === "ETHUSD" || symbol === "BNBUSD") {
		return "Digital Assets";
	}
	return "Equities";
};

class MockTradingApi {
	private positions: Position[];

	private trades: TradeHistoryRow[];

	constructor() {
		this.positions = this.generatePositions(2500);
		this.trades = this.generateTrades(400);
	}

	private generatePositions(amount: number) {
		const now = Date.now();
		return Array.from({ length: amount }).map(() => {
			const symbol = pickRandom(SYMBOLS);
			const direction = pickRandom([
				PositionDirection.LONG,
				PositionDirection.SHORT,
			]);
			const size = randomBetween(1, 200, 0);
			const entryPrice = randomBetween(10, 500);
			const drift = randomBetween(-5, 5);
			const markPrice = entryPrice + drift;
			const pnl = new Decimal(markPrice - entryPrice)
				.times(direction === PositionDirection.LONG ? size : -size)
				.toNumber();
			const pnlPercent = new Decimal(markPrice - entryPrice)
				.div(entryPrice)
				.times(100)
				.toNumber();
			const openedAt = subMinutes(
				now,
				randomBetween(60, 60 * 24 * 5, 0)
			).toISOString();
			const updatedAt = subMinutes(now, randomBetween(1, 120, 0)).toISOString();

			return {
				id: nanoid(),
				symbol,
				description: `${symbol} ${pickRandom(PORTFOLIOS)} book`,
				size,
				direction,
				entryPrice,
				markPrice,
				pnl,
				pnlPercent,
				currency: "USD",
				openedAt,
				updatedAt,
				status: randomBoolean(0.1)
					? PositionStatus.CLOSING
					: PositionStatus.OPEN,
				strategy: pickRandom(STRATEGIES),
				tags: [assetClassBySymbol(symbol)],
			};
		});
	}

	private generateTrades(amount: number): TradeHistoryRow[] {
		const now = Date.now();
		return Array.from({ length: amount }).map(() => {
			const symbol = pickRandom(SYMBOLS);
			const side = pickRandom(["buy", "sell"] as const);
			const quantity = randomBetween(1, 50, 0);
			const price = randomBetween(20, 400);
			const pnl = randomBetween(-1500, 2200);
			const timestamp = subMinutes(
				now,
				randomBetween(10, 60 * 24 * 90, 0)
			).toISOString();
			return {
				id: nanoid(),
				symbol,
				side,
				quantity,
				price,
				pnl,
				timestamp,
				strategy: pickRandom(STRATEGIES),
			};
		});
	}

	private sortPositions(
		items: Position[],
		sort?: ListPositionsRequest["sort"]
	) {
		if (!sort) {
			return items;
		}
		const { field, order } = sort;
		return [...items].sort((a, b) => {
			const factor = order === "asc" ? 1 : -1;
			return a[field] > b[field] ? factor : -factor;
		});
	}

	async listPositions(
		params: ListPositionsRequest
	): Promise<ListPositionsResponse> {
		return withLatency(() => {
			const limit = params.limit ?? 2000;
			let filtered = [...this.positions];
			if (params.symbol) {
				filtered = filtered.filter(
					(position) => position.symbol === params.symbol
				);
			}
			if (params.query) {
				const query = params.query.toLowerCase();
				filtered = filtered.filter(
					(position) =>
						position.symbol.toLowerCase().includes(query) ||
						position.description.toLowerCase().includes(query)
				);
			}
			if (params.statuses && params.statuses.length > 0) {
				filtered = filtered.filter((position) =>
					params.statuses?.includes(position.status)
				);
			}
			const sorted = this.sortPositions(filtered, params.sort);
			return {
				items: sorted.slice(0, limit),
				total: filtered.length,
				updatedAt: new Date().toISOString(),
			};
		});
	}

	async placeOrder(draft: OrderDraft): Promise<PlaceOrderResponse> {
		return withLatency(() => {
			const now = new Date().toISOString();
			const executionPrice =
				draft.type === OrderType.MARKET
					? randomBetween(20, 500)
					: draft.price ?? randomBetween(20, 500);

			// Более реалистичная обработка статусов
			const isMarketOrder = draft.type === OrderType.MARKET;
			const willSucceed = randomBoolean(0.92);

			// Для market ордеров - сразу FILLED/REJECTED
			// Для limit/stop - сначала SENT, затем через некоторое время FILLED/REJECTED
			let status: OrderStatus;
			if (isMarketOrder) {
				status = willSucceed ? OrderStatus.FILLED : OrderStatus.REJECTED;
			} else {
				// Limit/Stop ордера сначала отправляются
				status = OrderStatus.SENT;
			}

			const order: Order = {
				id: nanoid(),
				...draft,
				status,
				createdAt: now,
				updatedAt: now,
				executionPrice:
					status === OrderStatus.FILLED ? executionPrice : undefined,
				fillPrice: status === OrderStatus.FILLED ? executionPrice : undefined,
				failReason:
					status === OrderStatus.REJECTED ? "Risk limits exceeded" : undefined,
			};

			// Если ордер сразу исполнен, создаем позицию
			if (status === OrderStatus.FILLED) {
				const direction =
					draft.side === "buy"
						? PositionDirection.LONG
						: PositionDirection.SHORT;
				this.positions.unshift({
					id: nanoid(),
					symbol: draft.symbol,
					description: `${draft.symbol} tactical`,
					size: draft.quantity,
					direction,
					entryPrice: executionPrice,
					markPrice: executionPrice + randomBetween(-2, 2),
					pnl: randomBetween(-200, 450),
					pnlPercent: randomBetween(-5, 6),
					currency: "USD",
					openedAt: now,
					updatedAt: now,
					status: PositionStatus.OPEN,
					strategy: pickRandom(STRATEGIES),
					tags: [assetClassBySymbol(draft.symbol)],
				});
			}

			return { order, willSucceed, executionPrice };
		});
	}

	createPositionFromOrder(order: Order, executionPrice: number): void {
		if (order.status !== OrderStatus.FILLED) {
			return;
		}
		const direction =
			order.side === "buy" ? PositionDirection.LONG : PositionDirection.SHORT;
		const now = new Date().toISOString();
		this.positions.unshift({
			id: nanoid(),
			symbol: order.symbol,
			description: `${order.symbol} tactical`,
			size: order.quantity,
			direction,
			entryPrice: executionPrice,
			markPrice: executionPrice + randomBetween(-2, 2),
			pnl: randomBetween(-200, 450),
			pnlPercent: randomBetween(-5, 6),
			currency: "USD",
			openedAt: now,
			updatedAt: now,
			status: PositionStatus.OPEN,
			strategy: pickRandom(STRATEGIES),
			tags: [assetClassBySymbol(order.symbol)],
		});
	}

	async closePosition(id: string): Promise<Position> {
		return withLatency(() => {
			const position = this.positions.find((item) => item.id === id);
			if (!position) {
				throw new Error("Position not found");
			}
			const closed = {
				...position,
				status: PositionStatus.CLOSED,
				updatedAt: new Date().toISOString(),
			};
			this.positions = this.positions.map((item) =>
				item.id === id ? closed : item
			);
			this.trades.unshift({
				id: nanoid(),
				symbol: closed.symbol,
				side: closed.direction === PositionDirection.LONG ? "sell" : "buy",
				quantity: closed.size,
				price: closed.markPrice,
				pnl: closed.pnl,
				timestamp: closed.updatedAt,
				strategy: closed.strategy,
			});
			return closed;
		});
	}

	async getAnalytics(period: AnalyticsPeriod): Promise<AnalyticsResponse> {
		return withLatency(
			() => {
				const points = this.buildPnlSeries(period);
				const distribution = this.buildDistribution();
				const trades = this.trades.slice(0, 80);
				return { pnl: points, distribution, trades };
			},
			80,
			140
		);
	}

	async exportTrades(symbol?: string): Promise<TradeHistoryRow[]> {
		return withLatency(() =>
			symbol
				? this.trades.filter((trade) => trade.symbol === symbol)
				: this.trades
		);
	}

	private buildPnlSeries(period: AnalyticsPeriod): PnLPoint[] {
		const bucketConfig: Record<
			AnalyticsPeriod,
			{ points: number; step: number }
		> = {
			"1D": { points: 24, step: 60 },
			"1W": { points: 14, step: 12 * 60 },
			"1M": { points: 30, step: 24 * 60 },
			"3M": { points: 36, step: 2 * 24 * 60 },
			"1Y": { points: 52, step: 7 * 24 * 60 },
		};
		const { points, step } = bucketConfig[period];
		const now = Date.now();
		let cumulative = 0;
		return Array.from({ length: points }).map((_, index) => {
			cumulative += randomBetween(-2500, 3200);
			const benchmark = cumulative - randomBetween(-800, 800);
			return {
				timestamp: subMinutes(now, step * (points - index)).toISOString(),
				value: cumulative,
				benchmark,
			};
		});
	}

	private buildDistribution(): PortfolioSlice[] {
		const buckets: Record<string, number> = {};
		this.positions.slice(0, 1000).forEach((position) => {
			const key = assetClassBySymbol(position.symbol);
			const current = buckets[key] ?? 0;
			const exposure = Math.abs(position.size * position.markPrice);
			buckets[key] = current + exposure;
		});
		const total = Object.values(buckets).reduce((sum, value) => sum + value, 0);
		return Object.entries(buckets).map(([label, value]) => ({
			label,
			value,
			weight: value / total,
		}));
	}
}

export const mockTradingApi = new MockTradingApi();
