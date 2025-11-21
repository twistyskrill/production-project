import { SYMBOLS } from "entities/trading/api/constants";
import { MarketQuote } from "../model/types/market";
import { randomBetween } from "shared/lib/random/random";

type Listener = (payload: {
	quotes: MarketQuote[];
	latency: number;
	updatesPerSecond: number;
}) => void;

class MockMarketSocket {
	private listeners = new Set<Listener>();

	private timer?: ReturnType<typeof setInterval>;

	private lastTimestamp =
		typeof performance === "undefined" ? Date.now() : performance.now();

	private updatesPerSecond = 0;

	private baseQuotes: Record<string, MarketQuote>;

	constructor() {
		this.baseQuotes = SYMBOLS.reduce<Record<string, MarketQuote>>(
			(acc, symbol) => {
				const bid = randomBetween(10, 500);
				const ask = bid + randomBetween(0.05, 0.3);
				acc[symbol] = {
					symbol,
					bid,
					ask,
					last: (bid + ask) / 2,
					change: randomBetween(-2, 2),
					changePercent: randomBetween(-1, 1),
					updatedAt: Date.now(),
					trend: "flat",
				};
				return acc;
			},
			{}
		);
	}

	start() {
		if (this.timer) {
			return;
		}
		this.timer = setInterval(() => this.emit(), 16); // ~60fps
	}

	stop() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	getSnapshot() {
		return Object.values(this.baseQuotes);
	}

	subscribe(listener: Listener) {
		this.listeners.add(listener);
		this.start();
		return () => {
			this.listeners.delete(listener);
			if (this.listeners.size === 0) {
				this.stop();
			}
		};
	}

	private emit() {
		const now = performance.now();
		const delta = now - this.lastTimestamp;
		if (delta === 0) {
			return;
		}
		this.lastTimestamp = now;
		this.updatesPerSecond = Math.round(1000 / delta);
		const batchSize = 50;
		const symbols = SYMBOLS.sort(() => 0.5 - Math.random()).slice(0, batchSize);
		const quotes = symbols.map((symbol) => {
			const base = this.baseQuotes[symbol];
			const drift = randomBetween(-0.5, 0.5);
			const bid = Math.max(base.bid + drift, 0.01);
			const ask = bid + randomBetween(0.05, 0.2);
			const last = (bid + ask) / 2;
			const change = last - base.last;
			const changePercent = (change / base.last) * 100;
			const trend = change > 0.01 ? "up" : change < -0.01 ? "down" : "flat";
			const updated: MarketQuote = {
				...base,
				bid,
				ask,
				last,
				change,
				changePercent,
				trend,
				updatedAt: Date.now(),
			};
			this.baseQuotes[symbol] = updated;
			return updated;
		});

		const payload = {
			quotes,
			latency: delta,
			updatesPerSecond: this.updatesPerSecond,
		};
		this.listeners.forEach((listener) => listener(payload));
	}
}

export const mockMarketSocket = new MockMarketSocket();
