import { memo } from "react";
import { Page } from "widgets/Page/Page";
import { OrderPlacementForm } from "features/orderPlacement";
import { PositionsPanel } from "widgets/PositionsPanel";
import { MarketWatchBoard } from "features/marketWatch";
import { QuickStats } from "widgets/QuickStats";
import cls from "./TerminalPage.module.scss";

const TerminalPageComponent = () => (
	<Page className={cls?.TerminalPage || ""}>
		<div className={cls?.leftColumn || ""}>
			<OrderPlacementForm />
			<QuickStats />
		</div>
		<div className={cls?.rightColumn || ""}>
			<PositionsPanel />
			<MarketWatchBoard />
		</div>
	</Page>
);

export const TerminalPage = memo(TerminalPageComponent);
