import { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Text } from "shared/ui/Text/Text";
import { Card } from "shared/ui/Card/Card";
import { formatCurrency } from "shared/lib/format/currency";
import { OrderBook as OrderBookType } from "entities/market/model/types/orderBook";
import cls from "./OrderBook.module.scss";

interface OrderBookProps {
	symbol?: string;
	className?: string;
}

// Моковые данные для демонстрации
const generateMockOrderBook = (symbol: string): OrderBookType => {
	const basePrice = 150;
	const spread = 0.1;
	const midPrice = basePrice + spread / 2;

	const bids: OrderBookType["bids"] = [];
	const asks: OrderBookType["asks"] = [];

	// Генерируем биды (от высокой к низкой)
	for (let i = 0; i < 10; i++) {
		const price = midPrice - spread / 2 - i * 0.1;
		const quantity = Math.random() * 1000 + 100;
		bids.push({ price, quantity });
	}

	// Генерируем аски (от низкой к высокой)
	for (let i = 0; i < 10; i++) {
		const price = midPrice + spread / 2 + i * 0.1;
		const quantity = Math.random() * 1000 + 100;
		asks.push({ price, quantity });
	}

	// Вычисляем накопительные суммы
	let bidTotal = 0;
	bids.forEach((bid) => {
		bidTotal += bid.quantity;
		bid.total = bidTotal;
	});

	let askTotal = 0;
	asks.forEach((ask) => {
		askTotal += ask.quantity;
		ask.total = askTotal;
	});

	const maxTotal = Math.max(bidTotal, askTotal);

	return {
		symbol,
		bids,
		asks,
		spread: spread,
		spreadPercent: (spread / midPrice) * 100,
		lastUpdate: Date.now(),
	};
};

export const OrderBook = memo(
	({ symbol = "AAPL", className }: OrderBookProps) => {
		const { t } = useTranslation("terminal");

		// В реальном приложении здесь будет подписка на данные
		const orderBook = useMemo(() => generateMockOrderBook(symbol), [symbol]);

		const maxTotal = useMemo(() => {
			const bidMax = Math.max(...orderBook.bids.map((b) => b.total || 0));
			const askMax = Math.max(...orderBook.asks.map((a) => a.total || 0));
			return Math.max(bidMax, askMax);
		}, [orderBook]);

		return (
			<Card className={`${cls.OrderBook} ${className || ""}`}>
				<div className={cls.header}>
					<Text title={t("orderBook.title", "Order Book")} />
					<div className={cls.spread}>
						<span className={cls.spreadLabel}>
							{t("orderBook.spread", "Spread")}:
						</span>
						<span className={cls.spreadValue}>
							{formatCurrency(orderBook.spread)} (
							{orderBook.spreadPercent.toFixed(3)}%)
						</span>
					</div>
				</div>

				<div className={cls.container}>
					{/* Asks (продажи) - сверху */}
					<div className={cls.asks}>
						<div className={cls.headerRow}>
							<span>{t("orderBook.price", "Price")}</span>
							<span>{t("orderBook.quantity", "Qty")}</span>
							<span>{t("orderBook.total", "Total")}</span>
						</div>
						{orderBook.asks
							.slice()
							.reverse()
							.map((ask, index) => {
								const widthPercent = ((ask.total || 0) / maxTotal) * 100;
								return (
									<div
										key={`ask-${index}`}
										className={cls.row}
										style={{
											background: `linear-gradient(to left, rgba(255, 73, 118, 0.1) ${widthPercent}%, transparent ${widthPercent}%)`,
										}}
									>
										<span className={cls.priceAsk}>
											{formatCurrency(ask.price)}
										</span>
										<span className={cls.quantity}>
											{ask.quantity.toFixed(2)}
										</span>
										<span className={cls.total}>
											{(ask.total || 0).toFixed(2)}
										</span>
									</div>
								);
							})}
					</div>

					{/* Spread indicator */}
					<div className={cls.midPrice}>
						<span className={cls.midPriceValue}>
							{formatCurrency(
								(orderBook.bids[0]?.price + orderBook.asks[0]?.price) / 2
							)}
						</span>
					</div>

					{/* Bids (покупки) - снизу */}
					<div className={cls.bids}>
						{orderBook.bids.map((bid, index) => {
							const widthPercent = ((bid.total || 0) / maxTotal) * 100;
							return (
								<div
									key={`bid-${index}`}
									className={cls.row}
									style={{
										background: `linear-gradient(to left, rgba(0, 211, 149, 0.1) ${widthPercent}%, transparent ${widthPercent}%)`,
									}}
								>
									<span className={cls.priceBid}>
										{formatCurrency(bid.price)}
									</span>
									<span className={cls.quantity}>
										{bid.quantity.toFixed(2)}
									</span>
									<span className={cls.total}>
										{(bid.total || 0).toFixed(2)}
									</span>
								</div>
							);
						})}
						<div className={cls.headerRow}>
							<span>{t("orderBook.price", "Price")}</span>
							<span>{t("orderBook.quantity", "Qty")}</span>
							<span>{t("orderBook.total", "Total")}</span>
						</div>
					</div>
				</div>
			</Card>
		);
	}
);
