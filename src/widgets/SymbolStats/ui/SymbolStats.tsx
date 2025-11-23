import { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card } from "shared/ui/Card/Card";
import { Text } from "shared/ui/Text/Text";
import { getOrderHistory } from "entities/order";
import { useGetPositionsQuery } from "entities/trading/api/tradingApi";
import { PositionSortField } from "entities/position";
import { formatCurrency } from "shared/lib/format/currency";
import cls from "./SymbolStats.module.scss";

interface SymbolStat {
	symbol: string;
	totalOrders: number;
	filledOrders: number;
	rejectedOrders: number;
	winRate: number;
	totalPnl: number;
	avgPrice: number;
}

export const SymbolStats = memo(() => {
	const { t } = useTranslation("analytics");
	const history = useSelector(getOrderHistory);
	const { data: positionsData } = useGetPositionsQuery({
		query: "",
		statuses: [],
		sort: { field: PositionSortField.UPDATED_AT, order: "desc" },
	});

	const stats = useMemo(() => {
		const symbolMap = new Map<string, SymbolStat>();

		// Анализируем ордера
		history.forEach((order) => {
			if (!symbolMap.has(order.symbol)) {
				symbolMap.set(order.symbol, {
					symbol: order.symbol,
					totalOrders: 0,
					filledOrders: 0,
					rejectedOrders: 0,
					winRate: 0,
					totalPnl: 0,
					avgPrice: 0,
				});
			}

			const stat = symbolMap.get(order.symbol)!;
			stat.totalOrders++;

			if (order.status === "filled") {
				stat.filledOrders++;
			} else if (order.status === "rejected") {
				stat.rejectedOrders++;
			}
		});

		// Анализируем позиции для P&L
		const positions = positionsData?.items || [];
		positions.forEach((position) => {
			if (!symbolMap.has(position.symbol)) {
				symbolMap.set(position.symbol, {
					symbol: position.symbol,
					totalOrders: 0,
					filledOrders: 0,
					rejectedOrders: 0,
					winRate: 0,
					totalPnl: 0,
					avgPrice: 0,
				});
			}

			const stat = symbolMap.get(position.symbol)!;
			stat.totalPnl += position.pnl;
		});

		// Вычисляем win rate и среднюю цену
		symbolMap.forEach((stat) => {
			if (stat.filledOrders > 0) {
				stat.winRate = (stat.filledOrders / stat.totalOrders) * 100;
			}

			const symbolOrders = history.filter(
				(o) => o.symbol === stat.symbol && o.executionPrice
			);
			if (symbolOrders.length > 0) {
				stat.avgPrice =
					symbolOrders.reduce((sum, o) => sum + (o.executionPrice || 0), 0) /
					symbolOrders.length;
			}
		});

		return Array.from(symbolMap.values())
			.sort((a, b) => b.totalPnl - a.totalPnl)
			.slice(0, 10);
	}, [history, positionsData]);

	const bestSymbol = stats[0];
	const worstSymbol = stats[stats.length - 1];

	return (
		<Card className={cls.SymbolStats}>
			<Text title={t("symbolStats.title", "Symbol Statistics")} />
			<div className={cls.content}>
				{bestSymbol && (
					<div className={cls.highlight}>
						<div className={cls.best}>
							<span className={cls.label}>
								{t("symbolStats.best", "Best Performer")}
							</span>
							<span className={cls.symbol}>{bestSymbol.symbol}</span>
							<span className={cls.value}>
								{formatCurrency(bestSymbol.totalPnl)}
							</span>
							<span className={cls.meta}>
								Win Rate: {bestSymbol.winRate.toFixed(1)}%
							</span>
						</div>
					</div>
				)}

				<div className={cls.table}>
					<div className={cls.header}>
						<span>{t("symbolStats.symbol", "Symbol")}</span>
						<span>{t("symbolStats.orders", "Orders")}</span>
						<span>{t("symbolStats.filled", "Filled")}</span>
						<span>{t("symbolStats.winRate", "Win Rate")}</span>
						<span>{t("symbolStats.pnl", "P&L")}</span>
					</div>
					<div className={cls.body}>
						{stats.map((stat) => (
							<div key={stat.symbol} className={cls.row}>
								<span className={cls.symbol}>{stat.symbol}</span>
								<span>{stat.totalOrders}</span>
								<span>{stat.filledOrders}</span>
								<span
									className={
										stat.winRate >= 50 ? cls.winRateGood : cls.winRateBad
									}
								>
									{stat.winRate.toFixed(1)}%
								</span>
								<span
									className={
										stat.totalPnl >= 0 ? cls.pnlPositive : cls.pnlNegative
									}
								>
									{formatCurrency(stat.totalPnl)}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Card>
	);
});
