import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "shared/ui/Card/Card";
import { Text, TextSize } from "shared/ui/Text/Text";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	CartesianGrid,
} from "recharts";
import {
	calculateSMA,
	calculateEMA,
	calculateRSI,
	calculateMACD,
} from "shared/lib/indicators/indicators";
import cls from "./TechnicalIndicators.module.scss";

interface TechnicalIndicatorsProps {
	prices: Array<{ timestamp: string; value: number }>;
	symbol?: string;
}

export const TechnicalIndicators = memo(
	({ prices, symbol = "AAPL" }: TechnicalIndicatorsProps) => {
		const { t } = useTranslation("analytics");

		const indicators = useMemo(() => {
			const priceValues = prices.map((p) => p.value);
			const timestamps = prices.map((p) => p.timestamp);

			// Вычисляем индикаторы
			const sma20 = calculateSMA(priceValues, 20);
			const sma50 = calculateSMA(priceValues, 50);
			const ema12 = calculateEMA(priceValues, 12);
			const rsi = calculateRSI(priceValues, 14);
			const macd = calculateMACD(priceValues);

			// Формируем данные для графика
			const chartData = prices.map((point, index) => {
				const data: any = {
					timestamp: new Date(point.timestamp).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					}),
					price: point.value,
					overbought: 70,
					oversold: 30,
				};

				// SMA 20
				if (index >= 19) {
					data.sma20 = sma20[index - 19];
				}

				// SMA 50
				if (index >= 49) {
					data.sma50 = sma50[index - 49];
				}

				// EMA 12
				if (index >= 11) {
					data.ema12 = ema12[index - 11];
				}

				// RSI
				if (index >= 14) {
					data.rsi = rsi[index - 14];
				}

				// MACD
				if (index >= 25) {
					const macdIndex = index - 25;
					if (macdIndex < macd.macd.length) {
						data.macd = macd.macd[macdIndex];
						if (macdIndex < macd.signal.length) {
							data.macdSignal = macd.signal[macdIndex];
						}
					}
				}

				return data;
			});

			return {
				chartData,
				rsi: rsi[rsi.length - 1] || 50,
				macdValue: macd.macd[macd.macd.length - 1] || 0,
				signalValue: macd.signal[macd.signal.length - 1] || 0,
			};
		}, [prices]);

		const getRSISignal = (rsi: number) => {
			if (rsi > 70) return { text: "Overbought", color: "#ff4976" };
			if (rsi < 30) return { text: "Oversold", color: "#00d395" };
			return { text: "Neutral", color: "#f2c94c" };
		};

		const rsiSignal = getRSISignal(indicators.rsi);

		return (
			<Card className={cls.TechnicalIndicators}>
				<div className={cls.header}>
					<Text title={t("indicators.title", "Technical Indicators")} />
					<div className={cls.indicatorsSummary}>
						<div className={cls.indicatorItem}>
							<span className={cls.label}>RSI (14):</span>
							<span className={cls.value} style={{ color: rsiSignal.color }}>
								{indicators.rsi.toFixed(2)}
							</span>
							<span className={cls.signal} style={{ color: rsiSignal.color }}>
								{rsiSignal.text}
							</span>
						</div>
						<div className={cls.indicatorItem}>
							<span className={cls.label}>MACD:</span>
							<span
								className={cls.value}
								style={{
									color:
										indicators.macdValue > indicators.signalValue
											? "#00d395"
											: "#ff4976",
								}}
							>
								{indicators.macdValue.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
				<div className={cls.chart}>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={indicators.chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.05)"
							/>
							<XAxis
								dataKey="timestamp"
								tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
								interval="preserveStartEnd"
							/>
							<YAxis
								tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
								tickFormatter={(value) => value.toFixed(0)}
							/>
							<Tooltip
								contentStyle={{
									background: "rgba(0, 0, 0, 0.9)",
									border: "1px solid rgba(255, 255, 255, 0.1)",
									borderRadius: "8px",
								}}
							/>
							<Legend wrapperStyle={{ paddingTop: "16px" }} />
							<Line
								type="monotone"
								dataKey="price"
								name="Price"
								stroke="#ffffff"
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type="monotone"
								dataKey="sma20"
								name="SMA 20"
								stroke="#00d395"
								strokeWidth={1.5}
								dot={false}
								strokeDasharray="5 5"
							/>
							<Line
								type="monotone"
								dataKey="sma50"
								name="SMA 50"
								stroke="#2F80ED"
								strokeWidth={1.5}
								dot={false}
								strokeDasharray="5 5"
							/>
							<Line
								type="monotone"
								dataKey="ema12"
								name="EMA 12"
								stroke="#BB6BD9"
								strokeWidth={1.5}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className={cls.rsiChart}>
					<Text text={t("indicators.rsi", "RSI (14)")} size={TextSize.S} />
					<ResponsiveContainer width="100%" height={100}>
						<LineChart data={indicators.chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.05)"
							/>
							<XAxis
								dataKey="timestamp"
								tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }}
								interval="preserveStartEnd"
							/>
							<YAxis
								domain={[0, 100]}
								tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }}
							/>
							<Line
								type="monotone"
								dataKey="rsi"
								name="RSI"
								stroke="#f2c94c"
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type="monotone"
								dataKey="overbought"
								name="Overbought (70)"
								stroke="#ff4976"
								strokeWidth={1}
								strokeDasharray="3 3"
								dot={false}
							/>
							<Line
								type="monotone"
								dataKey="oversold"
								name="Oversold (30)"
								stroke="#00d395"
								strokeWidth={1}
								strokeDasharray="3 3"
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</Card>
		);
	}
);
