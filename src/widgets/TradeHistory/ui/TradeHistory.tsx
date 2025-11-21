import { memo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { Text } from "shared/ui/Text/Text";
import { getAnalyticsPeriod } from "entities/analytics";
import { useGetAnalyticsQuery } from "entities/trading/api/tradingApi";
import { ExportTradesButton } from "features/exportCsv";
import { formatCurrency } from "shared/lib/format/currency";
import cls from "../TradeHistory.module.scss";

const formatDateTime = (timestamp: string) => {
	const date = new Date(timestamp);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const TradeHistory = memo(() => {
	const { t } = useTranslation("analytics");
	const period = useSelector(getAnalyticsPeriod);
	const { data } = useGetAnalyticsQuery({ period });
	const trades = data?.trades ?? [];

	const rowRenderer = useCallback(
		({ index, key, style }: ListRowProps) => {
			const trade = trades[index];
			const pnlClass =
				trade.pnl >= 0 ? cls?.pnlPositive || "" : cls?.pnlNegative || "";
			return (
				<div key={key} style={style} className={cls?.row || ""}>
					<span className={cls?.cell || ""}>
						{formatDateTime(trade.timestamp)}
					</span>
					<span className={cls?.cell || ""}>{trade.symbol}</span>
					<span
						className={`${cls?.cell || ""} ${
							trade.side === "buy" ? cls?.sideBuy || "" : cls?.sideSell || ""
						}`}
					>
						{trade.side.toUpperCase()}
					</span>
					<span className={cls?.cell || ""}>{trade.quantity.toFixed(0)}</span>
					<span className={cls?.cell || ""}>{formatCurrency(trade.price)}</span>
					<span className={`${cls?.cell || ""} ${pnlClass}`}>
						{formatCurrency(trade.pnl)}
					</span>
				</div>
			);
		},
		[trades]
	);

	return (
		<section className={cls?.TradeHistory || ""}>
			<div className={cls?.header || ""}>
				<Text
					title={t("history.title", "Trade history")}
					text={t("history.rows", `${trades.length} rows`, {
						count: trades.length,
					})}
				/>
				<ExportTradesButton />
			</div>
			<div className={cls?.tableHeader || ""}>
				<span className={cls?.cell || ""}>{t("history.date", "Date")}</span>
				<span className={cls?.cell || ""}>{t("history.symbol", "Symbol")}</span>
				<span className={cls?.cell || ""}>{t("history.side", "Side")}</span>
				<span className={cls?.cell || ""}>{t("history.quantity", "Qty")}</span>
				<span className={cls?.cell || ""}>{t("history.price", "Price")}</span>
				<span className={cls?.cell || ""}>{t("history.pnl", "P&L")}</span>
			</div>
			<div className={cls?.table || ""}>
				<AutoSizer>
					{({ height, width }) => (
						<List
							height={height}
							width={width}
							rowCount={trades.length}
							rowHeight={44}
							rowRenderer={rowRenderer}
						/>
					)}
				</AutoSizer>
			</div>
		</section>
	);
});
