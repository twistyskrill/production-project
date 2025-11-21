import { memo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card } from "shared/ui/Card/Card";
import { Text, TextSize } from "shared/ui/Text/Text";
import { formatCurrency } from "shared/lib/format/currency";
import { getMarketConnection } from "entities/market";
import { useGetPositionsQuery } from "entities/trading/api/tradingApi";
import { PositionStatus, PositionSortField } from "entities/position";
import cls from "./QuickStats.module.scss";

export const QuickStats = memo(() => {
	const { t } = useTranslation("terminal");
	const connection = useSelector(getMarketConnection);
	const { data: positionsData } = useGetPositionsQuery({
		query: "",
		statuses: [],
		sort: { field: PositionSortField.UPDATED_AT, order: "desc" },
	});

	const positions = positionsData?.items ?? [];
	const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);
	const openPositions = positions.filter(
		(pos) => pos.status === PositionStatus.OPEN
	).length;
	const totalValue = positions.reduce(
		(sum, pos) => sum + pos.size * pos.markPrice,
		0
	);

	const stats = [
		{
			label: t("stats.totalPnl", "Total P&L"),
			value: formatCurrency(totalPnl),
			trend: totalPnl >= 0 ? "up" : "down",
		},
		{
			label: t("stats.openPositions", "Open Positions"),
			value: openPositions.toString(),
			trend: "neutral",
		},
		{
			label: t("stats.portfolioValue", "Portfolio Value"),
			value: formatCurrency(totalValue),
			trend: "neutral",
		},
		{
			label: t("stats.connection", "Connection"),
			value: connection.isConnected
				? t("stats.live", "Live")
				: t("stats.offline", "Offline"),
			trend: connection.isConnected ? "up" : "down",
		},
	];

	return (
		<Card className={cls.QuickStats}>
			<Text title={t("stats.title", "Quick Stats")} size={TextSize.S} />
			<div className={cls.statsGrid}>
				{stats.map((stat, index) => (
					<div key={index} className={cls.statItem}>
						<span className={cls.label}>{stat.label}</span>
						<span
							className={`${cls.value} ${
								stat.trend === "up"
									? cls.trendUp
									: stat.trend === "down"
									? cls.trendDown
									: ""
							}`}
						>
							{stat.value}
						</span>
					</div>
				))}
			</div>
		</Card>
	);
});
