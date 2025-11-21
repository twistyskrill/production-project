import { memo } from "react";
import { Page } from "widgets/Page/Page";
import { AnalyticsFilters } from "features/analyticsFilters";
import { AnalyticsDashboard } from "widgets/AnalyticsDashboard";
import { PortfolioBreakdown } from "widgets/PortfolioBreakdown";
import { TradeHistory } from "widgets/TradeHistory";
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
		</div>
	</Page>
);

export const AnalyticsPage = memo(AnalyticsPageComponent);
