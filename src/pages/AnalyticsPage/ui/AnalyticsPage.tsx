import { memo } from "react";
import { Page } from "widgets/Page/Page";
import { AnalyticsFilters } from "features/analyticsFilters";
import { AnalyticsDashboard } from "widgets/AnalyticsDashboard";
import { PortfolioBreakdown } from "widgets/PortfolioBreakdown";
import { TradeHistory } from "widgets/TradeHistory";
import { SymbolStats } from "widgets/SymbolStats";
import { TradingCalendar } from "widgets/TradingCalendar";
import { TechnicalIndicators } from "widgets/TechnicalIndicators";
import cls from "./AnalyticsPage.module.scss";

const AnalyticsPageComponent = () => (
	<Page>
		<AnalyticsFilters />
		<div className={cls?.AnalyticsPage || ""}>
			<div className={cls?.fullWidth || ""}>
				<AnalyticsDashboard />
			</div>
			<PortfolioBreakdown />
			<TradeHistory />
			<SymbolStats />
			<TradingCalendar />
			<div className={cls?.fullWidth || ""}>
				<TechnicalIndicators
					prices={[
						{ timestamp: "2024-01-01", value: 150 },
						{ timestamp: "2024-01-02", value: 152 },
						{ timestamp: "2024-01-03", value: 151 },
						{ timestamp: "2024-01-04", value: 153 },
						{ timestamp: "2024-01-05", value: 155 },
					]}
				/>
			</div>
		</div>
	</Page>
);

export const AnalyticsPage = memo(AnalyticsPageComponent);
