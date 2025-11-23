import { memo } from "react";
import { Page } from "widgets/Page/Page";
import { OrderPlacementForm } from "features/orderPlacement";
import { PositionsPanel } from "widgets/PositionsPanel";
import { MarketWatchBoard } from "features/marketWatch";
import { QuickStats } from "widgets/QuickStats";
import { OrderBook } from "widgets/OrderBook";
import cls from "./TerminalPage.module.scss";

const TerminalPageComponent = () => (
	<Page className={cls?.TerminalPage || ""}>
		{/* Левая колонка: Стакан заявок - помогает при размещении ордеров */}
		<div className={cls?.orderBookColumn || ""}>
			<OrderBook symbol="AAPL" />
		</div>

		{/* Центральная колонка: Размещение ордеров и статистика */}
		<div className={cls?.centerColumn || ""}>
			<OrderPlacementForm />
			<QuickStats />
		</div>

		{/* Правая колонка: Позиции и рыночные данные */}
		<div className={cls?.rightColumn || ""}>
			<PositionsPanel />
			<MarketWatchBoard />
		</div>
	</Page>
);

export const TerminalPage = memo(TerminalPageComponent);
