import { memo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { Select } from "shared/ui/Select/Select";
import {
	analyticsActions,
	getAnalyticsBenchmark,
	getAnalyticsLive,
	getAnalyticsPeriod,
} from "entities/analytics";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import cls from "./AnalyticsFilters.module.scss";

const periodOptions = ["1D", "1W", "1M", "3M", "1Y"] as const;

export const AnalyticsFilters = memo(() => {
	const { t } = useTranslation("analytics");
	const period = useSelector(getAnalyticsPeriod);
	const benchmark = useSelector(getAnalyticsBenchmark);
	const live = useSelector(getAnalyticsLive);
	const dispatch = useAppDispatch();

	const benchmarkOptions = [
		{ value: "SPX", content: t("filters.benchmark.spx", "S&P 500") },
		{ value: "NDX", content: t("filters.benchmark.ndx", "NASDAQ 100") },
		{ value: "BTC", content: t("filters.benchmark.btc", "BTC") },
	];

	return (
		<div className={cls?.AnalyticsFilters || ""}>
			<div className={cls?.periodGroup || ""}>
				{periodOptions.map((option) => (
					<Button
						key={option}
						theme={
							option === period ? ButtonTheme.BACKGROUND : ButtonTheme.OUTLINE
						}
						onClick={() => dispatch(analyticsActions.setPeriod(option))}
					>
						{option}
					</Button>
				))}
			</div>
			<Select
				label={t("filters.benchmark.label", "Benchmark")}
				options={benchmarkOptions}
				value={benchmark}
				onChange={(value) => dispatch(analyticsActions.setBenchmark(value))}
			/>
			<Button
				theme={live ? ButtonTheme.BACKGROUND : ButtonTheme.OUTLINE}
				onClick={() => dispatch(analyticsActions.toggleLive())}
			>
				{live ? t("filters.live", "Live") : t("filters.paused", "Paused")}
			</Button>
		</div>
	);
});
