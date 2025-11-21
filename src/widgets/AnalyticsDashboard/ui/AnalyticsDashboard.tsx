import { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	CartesianGrid,
} from "recharts";
import { Text } from "shared/ui/Text/Text";
import { Loader } from "shared/ui/Loader/Loader";
import { getAnalyticsPeriod } from "entities/analytics";
import { useGetAnalyticsQuery } from "entities/trading/api/tradingApi";
import { formatCurrency } from "shared/lib/format/currency";
import cls from "../AnalyticsDashboard.module.scss";

const formatDate = (timestamp: string) => {
	const date = new Date(timestamp);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload || !payload.length) return null;
	const data = payload[0].payload;
	return (
		<div className={cls?.tooltip || ""}>
			<p>{formatDate(data.timestamp)}</p>
			{payload.map((entry: any, index: number) => (
				<p key={index} style={{ color: entry.color }}>
					{entry.name}: {formatCurrency(entry.value)}
				</p>
			))}
		</div>
	);
};

export const AnalyticsDashboard = memo(() => {
	const { t } = useTranslation("analytics");
	const period = useSelector(getAnalyticsPeriod);
	const { data, isFetching } = useGetAnalyticsQuery({ period });
	const series = data?.pnl ?? [];

	const chartData = useMemo(() => {
		return series.map((point) => ({
			...point,
			date: formatDate(point.timestamp),
		}));
	}, [series]);

	return (
		<section className={cls?.AnalyticsDashboard || ""}>
			<Text
				title={t("performance.title", "Performance")}
				text={t("performance.period", `Period ${period}`, { period })}
			/>
			{isFetching && <Loader />}
			<div className={cls?.chart || ""}>
				<ResponsiveContainer>
					<AreaChart data={chartData}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="rgba(255,255,255,0.05)"
						/>
						<XAxis
							dataKey="date"
							tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
							interval="preserveStartEnd"
						/>
						<YAxis
							tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
							tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend wrapperStyle={{ paddingTop: "16px" }} iconType="line" />
						<Area
							type="monotone"
							dataKey="value"
							name={t("performance.quantflow", "Quantflow")}
							stroke="#00d395"
							fill="rgba(0,211,149,0.2)"
							strokeWidth={2}
						/>
						<Area
							type="monotone"
							dataKey="benchmark"
							name={t("performance.benchmark", "Benchmark")}
							stroke="#ff4976"
							fill="rgba(255,73,118,0.15)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
});
