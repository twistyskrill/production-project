import { memo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { Text } from "shared/ui/Text/Text";
import { Loader } from "shared/ui/Loader/Loader";
import { Button, ButtonSize } from "shared/ui/Button/Button";
import {
	getPositionsFilters,
	getPositionsRowHeight,
	getPositionsSort,
	PositionStatus,
} from "entities/position";
import {
	useClosePositionMutation,
	useGetPositionsQuery,
} from "entities/trading/api/tradingApi";
import { formatSignedNumber } from "shared/lib/format/currency";
import { PositionsFilters } from "features/positionsFilters";
import cls from "../PositionsPanel.module.scss";

export const PositionsPanel = memo(() => {
	const { t } = useTranslation("terminal");
	const filters = useSelector(getPositionsFilters);
	const sort = useSelector(getPositionsSort);
	const rowHeight = useSelector(getPositionsRowHeight);
	const { data, isFetching } = useGetPositionsQuery({
		query: filters.query,
		statuses: filters.statuses,
		sort,
	});
	const [closePosition] = useClosePositionMutation();

	const positions = data?.items ?? [];

	const rowRenderer = useCallback(
		({ index, key, style }: ListRowProps) => {
			const position = positions[index];
			const pnlClass =
				position.pnl >= 0 ? cls?.pnlPositive || "" : cls?.pnlNegative || "";
			return (
				<div key={key} style={style} className={cls?.row || ""}>
					<span>{position.symbol}</span>
					<span>{position.size.toFixed(0)}</span>
					<span>{position.entryPrice.toFixed(2)}</span>
					<span>{position.markPrice.toFixed(2)}</span>
					<span className={pnlClass}>
						{formatSignedNumber(position.pnl)} /{" "}
						{formatSignedNumber(position.pnlPercent, 2)}%
					</span>
					<Button
						size={ButtonSize.M}
						disabled={position.status !== PositionStatus.OPEN}
						onClick={() => closePosition(position.id)}
					>
						{t("positions.close", "Close")}
					</Button>
				</div>
			);
		},
		[closePosition, positions]
	);

	return (
		<section className={cls?.PositionsPanel || ""}>
			<div className={cls?.header || ""}>
				<Text
					title={t("positions.title", "Open positions")}
					text={t(
						"positions.summary",
						"{{count}} results · refreshed {{time}}",
						{
							count: data?.total ?? 0,
							time: data?.updatedAt ?? "",
						}
					)}
				/>
				{isFetching && <Loader />}
			</div>
			<PositionsFilters />
			<div className={cls?.table || ""}>
				<AutoSizer>
					{({ height, width }) => (
						<List
							height={height}
							rowHeight={rowHeight}
							rowCount={positions.length}
							rowRenderer={rowRenderer}
							width={width}
						/>
					)}
				</AutoSizer>
			</div>
		</section>
	);
});
