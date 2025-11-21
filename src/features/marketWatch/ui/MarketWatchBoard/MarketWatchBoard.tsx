import { memo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { getMarketConnection, getMarketQuotesArray } from "entities/market";
import { classNames } from "shared/lib/classNames/classNames";
import { formatSignedPercent } from "shared/lib/format/currency";
import { useMarketStream } from "../../model/hooks/useMarketStream";
import cls from "./MarketWatchBoard.module.scss";

export const MarketWatchBoard = memo(() => {
	const { t } = useTranslation("terminal");
	useMarketStream();
	const quotes = useSelector(getMarketQuotesArray);
	const connection = useSelector(getMarketConnection);

	const rowRenderer = useCallback(
		({ index, key, style }: ListRowProps) => {
			const quote = quotes[index];
			return (
				<div
					key={key}
					style={style}
					className={cls?.row || ""}
					data-symbol={quote.symbol}
				>
					<div className={cls?.symbol || ""}>{quote.symbol}</div>
					<div className={cls?.price || ""}>
						{quote.bid.toFixed(2)} / {quote.ask.toFixed(2)}
					</div>
					<div
						className={classNames(cls?.price || "", {}, [
							quote.trend === "up" ? cls?.trendUp || "" : "",
							quote.trend === "down" ? cls?.trendDown || "" : "",
						])}
					>
						{quote.last.toFixed(2)}
					</div>
					<div
						className={classNames(cls?.price || "", {}, [
							quote.trend === "up" ? cls?.trendUp || "" : "",
							quote.trend === "down" ? cls?.trendDown || "" : "",
						])}
					>
						{formatSignedPercent(quote.changePercent, 2)}
					</div>
				</div>
			);
		},
		[quotes]
	);

	return (
		<div className={cls?.MarketWatchBoard || ""}>
			<div className={cls?.boardHeader || ""}>
				<div className={cls?.metric || ""}>
					<span>{t("market.stream", "Stream")}</span>
					<span className={cls?.metricValue || ""}>
						{connection.isConnected
							? t("market.live", "Live")
							: t("market.offline", "Offline")}
					</span>
				</div>
				<div className={cls?.metric || ""}>
					<span>{t("market.latency", "Latency")}</span>
					<span className={cls?.metricValue || ""}>
						{connection.latencyMs.toFixed(0)} ms
					</span>
				</div>
				<div className={cls?.metric || ""}>
					<span>{t("market.throughput", "Throughput")}</span>
					<span className={cls?.metricValue || ""}>
						{connection.updatesPerSecond} {t("market.updatesPerSec", "upd/s")}
					</span>
				</div>
			</div>
			<div className={cls?.list || ""}>
				<AutoSizer>
					{({ height, width }) => (
						<List
							height={height}
							rowHeight={44}
							width={width}
							rowCount={quotes.length}
							rowRenderer={rowRenderer}
						/>
					)}
				</AutoSizer>
			</div>
		</div>
	);
});
