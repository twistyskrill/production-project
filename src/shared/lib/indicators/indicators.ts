/**
 * Технические индикаторы для анализа цен
 */

export interface IndicatorPoint {
	timestamp: string;
	value: number;
}

/**
 * Простое скользящее среднее (SMA)
 */
export function calculateSMA(prices: number[], period: number): number[] {
	if (prices.length < period) {
		return [];
	}

	const sma: number[] = [];
	for (let i = period - 1; i < prices.length; i++) {
		const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
		sma.push(sum / period);
	}
	return sma;
}

/**
 * Экспоненциальное скользящее среднее (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
	if (prices.length < period) {
		return [];
	}

	const ema: number[] = [];
	const multiplier = 2 / (period + 1);

	// Первое значение - SMA
	let sum = 0;
	for (let i = 0; i < period; i++) {
		sum += prices[i];
	}
	ema.push(sum / period);

	// Остальные значения - EMA
	for (let i = period; i < prices.length; i++) {
		const value =
			(prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
		ema.push(value);
	}

	return ema;
}

/**
 * RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
	if (prices.length < period + 1) {
		return [];
	}

	const rsi: number[] = [];
	const gains: number[] = [];
	const losses: number[] = [];

	// Вычисляем изменения
	for (let i = 1; i < prices.length; i++) {
		const change = prices[i] - prices[i - 1];
		gains.push(change > 0 ? change : 0);
		losses.push(change < 0 ? Math.abs(change) : 0);
	}

	// Первое значение RSI
	let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
	let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

	if (avgLoss === 0) {
		rsi.push(100);
	} else {
		const rs = avgGain / avgLoss;
		rsi.push(100 - 100 / (1 + rs));
	}

	// Остальные значения RSI (сглаженные)
	for (let i = period; i < gains.length; i++) {
		avgGain = (avgGain * (period - 1) + gains[i]) / period;
		avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

		if (avgLoss === 0) {
			rsi.push(100);
		} else {
			const rs = avgGain / avgLoss;
			rsi.push(100 - 100 / (1 + rs));
		}
	}

	return rsi;
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
	prices: number[],
	fastPeriod: number = 12,
	slowPeriod: number = 26,
	signalPeriod: number = 9
): {
	macd: number[];
	signal: number[];
	histogram: number[];
} {
	if (prices.length < slowPeriod) {
		return { macd: [], signal: [], histogram: [] };
	}

	const fastEMA = calculateEMA(prices, fastPeriod);
	const slowEMA = calculateEMA(prices, slowPeriod);

	// Выравниваем массивы
	const macd: number[] = [];
	const minLength = Math.min(fastEMA.length, slowEMA.length);
	const fastOffset = fastEMA.length - minLength;
	const slowOffset = slowEMA.length - minLength;

	for (let i = 0; i < minLength; i++) {
		macd.push(fastEMA[fastOffset + i] - slowEMA[slowOffset + i]);
	}

	// Signal line (EMA от MACD)
	const signal = calculateEMA(macd, signalPeriod);

	// Histogram (MACD - Signal)
	const histogram: number[] = [];
	const signalOffset = macd.length - signal.length;
	for (let i = 0; i < signal.length; i++) {
		histogram.push(macd[signalOffset + i] - signal[i]);
	}

	return { macd, signal, histogram };
}

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(
	prices: number[],
	period: number = 20,
	stdDev: number = 2
): {
	upper: number[];
	middle: number[];
	lower: number[];
} {
	if (prices.length < period) {
		return { upper: [], middle: [], lower: [] };
	}

	const sma = calculateSMA(prices, period);
	const upper: number[] = [];
	const lower: number[] = [];

	for (let i = period - 1; i < prices.length; i++) {
		const slice = prices.slice(i - period + 1, i + 1);
		const mean = sma[i - period + 1];
		const variance =
			slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
		const standardDeviation = Math.sqrt(variance);

		upper.push(mean + stdDev * standardDeviation);
		lower.push(mean - stdDev * standardDeviation);
	}

	return {
		upper,
		middle: sma,
		lower,
	};
}
