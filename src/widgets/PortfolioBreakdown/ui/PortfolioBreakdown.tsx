import { memo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { Text } from "shared/ui/Text/Text";
import { getAnalyticsPeriod } from "entities/analytics";
import { useGetAnalyticsQuery } from "entities/trading/api/tradingApi";
import { formatCurrency } from "shared/lib/format/currency";
import cls from "../PortfolioBreakdown.module.scss";

const COLORS = ["#00d395", "#2F80ED", "#BB6BD9", "#F2C94C", "#FF6F61"];

const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload || !payload.length) return null;
	const data = payload[0].payload;
	return (
		<div className={cls?.tooltip || ""}>
			<p style={{ fontWeight: "bold" }}>{data.label}</p>
			<p>{`${(data.weight * 100).toFixed(1)}%`}</p>
			<p>{formatCurrency(data.value)}</p>
		</div>
	);
};

const renderLegend = (props: any) => {
	const { payload } = props;
	return (
		<div className={cls?.legend || ""}>
			{payload.map((entry: any, index: number) => (
				<div key={entry.value} className={cls?.legendItem || ""}>
					<span
						className={cls?.legendColor || ""}
						style={{ backgroundColor: entry.color }}
					/>
					<span className={cls?.legendLabel || ""}>{entry.value}</span>
					<span className={cls?.legendPercent || ""}>
						{`${((entry.payload?.weight ?? 0) * 100).toFixed(1)}%`}
					</span>
				</div>
			))}
		</div>
	);
};

export const PortfolioBreakdown = memo(() => {
	const { t } = useTranslation("analytics");
	const period = useSelector(getAnalyticsPeriod);
	const { data } = useGetAnalyticsQuery({ period });
	const distribution = data?.distribution ?? [];

	return (
		<section className={cls?.PortfolioBreakdown || ""}>
			<Text title={t("portfolio.title", "Portfolio mix")} />
			<div className={cls?.chart || ""}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={distribution}
							dataKey="weight"
							nameKey="label"
							innerRadius={60}
							outerRadius={110}
							paddingAngle={2}
						>
							{distribution.map((entry, index) => (
								<Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
						<Legend content={renderLegend} />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
});
