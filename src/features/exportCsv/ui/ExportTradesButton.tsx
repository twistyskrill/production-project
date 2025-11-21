import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { useLazyExportTradesQuery } from "entities/trading/api/tradingApi";
import { downloadCsv } from "shared/lib/csv/downloadCsv";

interface ExportTradesButtonProps {
	symbol?: string;
}

const formatDateForCsv = (value: string | number) => {
	if (typeof value === "string") {
		return new Date(value).toISOString();
	}
	return String(value);
};

export const ExportTradesButton = memo((props: ExportTradesButtonProps) => {
	const { t } = useTranslation("analytics");
	const { symbol } = props;
	const [trigger, { isFetching }] = useLazyExportTradesQuery();

	const handleExport = useCallback(async () => {
		try {
			const result = await trigger({ symbol }).unwrap();
			downloadCsv(`quantflow-trades-${symbol ?? "all"}.csv`, result, [
				{ key: "timestamp", label: "Timestamp", format: formatDateForCsv },
				{ key: "symbol", label: "Symbol" },
				{ key: "side", label: "Side" },
				{ key: "quantity", label: "Quantity" },
				{ key: "price", label: "Price" },
				{ key: "pnl", label: "P&L" },
			]);
		} catch (error) {
			console.error("Export failed:", error);
		}
	}, [symbol, trigger]);

	return (
		<Button
			theme={ButtonTheme.OUTLINE}
			onClick={handleExport}
			disabled={isFetching}
		>
			{isFetching
				? t("export.preparing", "Preparing…")
				: t("export.button", "Export CSV")}
		</Button>
	);
});
