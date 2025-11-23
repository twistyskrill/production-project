import { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card } from "shared/ui/Card/Card";
import { Text } from "shared/ui/Text/Text";
import { getOrderHistory } from "entities/order";
import { formatCurrency } from "shared/lib/format/currency";
import cls from "./TradingCalendar.module.scss";

interface DayStat {
	date: string;
	dayName: string;
	orders: number;
	pnl: number;
	isProfit: boolean;
}

export const TradingCalendar = memo(() => {
	const { t } = useTranslation("analytics");
	const history = useSelector(getOrderHistory);

	const dayStats = useMemo(() => {
		const statsMap = new Map<string, DayStat>();

		// Группируем по дням
		history.forEach((order) => {
			const date = new Date(order.createdAt);
			const dateKey = date.toISOString().split("T")[0];
			const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

			if (!statsMap.has(dateKey)) {
				statsMap.set(dateKey, {
					date: dateKey,
					dayName,
					orders: 0,
					pnl: 0,
					isProfit: true,
				});
			}

			const stat = statsMap.get(dateKey)!;
			stat.orders++;

			// Для демо используем случайный P&L
			// В реальном приложении это будет из позиций
			if (order.status === "filled" && order.executionPrice) {
				stat.pnl += (Math.random() - 0.5) * 1000;
			}
		});

		const stats = Array.from(statsMap.values())
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 30); // Последние 30 дней

		stats.forEach((stat) => {
			stat.isProfit = stat.pnl >= 0;
		});

		return stats;
	}, [history]);

	const maxPnl = useMemo(() => {
		return Math.max(...dayStats.map((s) => Math.abs(s.pnl)), 1);
	}, [dayStats]);

	return (
		<Card className={cls.TradingCalendar}>
			<Text title={t("calendar.title", "Trading Calendar")} />
			<div className={cls.content}>
				<div className={cls.calendar}>
					{dayStats.map((day) => {
						const intensity = Math.min((Math.abs(day.pnl) / maxPnl) * 100, 100);
						return (
							<div
								key={day.date}
								className={`${cls.day} ${day.isProfit ? cls.profit : cls.loss}`}
								style={{
									opacity: Math.max(intensity / 100, 0.3),
									background: day.isProfit
										? `rgba(0, 211, 149, ${intensity / 200})`
										: `rgba(255, 73, 118, ${intensity / 200})`,
								}}
								title={`${day.date}: ${day.orders} orders, ${formatCurrency(
									day.pnl
								)}`}
							>
								<span className={cls.dayNumber}>
									{new Date(day.date).getDate()}
								</span>
								<span className={cls.dayName}>{day.dayName}</span>
								{day.orders > 0 && (
									<span className={cls.ordersBadge}>{day.orders}</span>
								)}
							</div>
						);
					})}
				</div>
				<div className={cls.legend}>
					<div className={cls.legendItem}>
						<span className={`${cls.legendColor} ${cls.profit}`}></span>
						<span>{t("calendar.profitable", "Profitable")}</span>
					</div>
					<div className={cls.legendItem}>
						<span className={`${cls.legendColor} ${cls.loss}`}></span>
						<span>{t("calendar.loss", "Loss")}</span>
					</div>
				</div>
			</div>
		</Card>
	);
});
