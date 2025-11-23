import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "shared/ui/Input/Input";
import { Select } from "shared/ui/Select/Select";
import {
	OrderFilters,
	OrderSort,
} from "entities/order/model/types/orderFilters";
import { OrderStatus, OrderType, OrderSide } from "entities/order";
import cls from "./OrderHistoryFilters.module.scss";

interface OrderHistoryFiltersProps {
	filters: OrderFilters;
	sort: OrderSort;
	onFiltersChange: (filters: Partial<OrderFilters>) => void;
	onSortChange: (sort: OrderSort) => void;
}

export const OrderHistoryFilters = memo(
	({
		filters,
		sort,
		onFiltersChange,
		onSortChange,
	}: OrderHistoryFiltersProps) => {
		const { t } = useTranslation("terminal");

		const statusOptions = [
			{ value: OrderStatus.FILLED, content: "Filled" },
			{ value: OrderStatus.REJECTED, content: "Rejected" },
			{ value: OrderStatus.SENT, content: "Sent" },
			{ value: OrderStatus.PENDING, content: "Pending" },
		];

		const typeOptions = [
			{ value: OrderType.MARKET, content: "Market" },
			{ value: OrderType.LIMIT, content: "Limit" },
			{ value: OrderType.STOP, content: "Stop" },
		];

		const sideOptions = [
			{ value: OrderSide.BUY, content: "Buy" },
			{ value: OrderSide.SELL, content: "Sell" },
		];

		const sortFieldOptions = [
			{ value: "createdAt", content: "Date" },
			{ value: "symbol", content: "Symbol" },
			{ value: "quantity", content: "Quantity" },
			{ value: "price", content: "Price" },
			{ value: "status", content: "Status" },
		];

		const sortOrderOptions = [
			{ value: "desc", content: "Descending" },
			{ value: "asc", content: "Ascending" },
		];

		return (
			<div className={cls.OrderHistoryFilters}>
				<div className={cls.row}>
					<Input
						placeholder={t("orders.search", "Search orders...")}
						value={filters.searchQuery || ""}
						onChange={(value) =>
							onFiltersChange({ searchQuery: value || undefined })
						}
					/>
					<Input
						placeholder={t("orders.symbolFilter", "Symbol")}
						value={filters.symbol || ""}
						onChange={(value) =>
							onFiltersChange({ symbol: value || undefined })
						}
					/>
				</div>
				<div className={cls.row}>
					<Select
						label={t("orders.status", "Status")}
						options={statusOptions}
						value={
							filters.statuses.length === 1 ? filters.statuses[0] : undefined
						}
						onChange={(value) =>
							onFiltersChange({
								statuses: value ? [value as OrderStatus] : [],
							})
						}
					/>
					<Select
						label={t("orders.type", "Type")}
						options={typeOptions}
						value={filters.types.length === 1 ? filters.types[0] : undefined}
						onChange={(value) =>
							onFiltersChange({
								types: value ? [value as OrderType] : [],
							})
						}
					/>
					<Select
						label={t("orders.side", "Side")}
						options={sideOptions}
						value={filters.sides.length === 1 ? filters.sides[0] : undefined}
						onChange={(value) =>
							onFiltersChange({
								sides: value ? [value as OrderSide] : [],
							})
						}
					/>
				</div>
				<div className={cls.row}>
					<Select
						label={t("orders.sortBy", "Sort by")}
						options={sortFieldOptions}
						value={sort.field}
						onChange={(value) =>
							onSortChange({ ...sort, field: value as OrderSort["field"] })
						}
					/>
					<Select
						label={t("orders.sortOrder", "Order")}
						options={sortOrderOptions}
						value={sort.order}
						onChange={(value) =>
							onSortChange({ ...sort, order: value as OrderSort["order"] })
						}
					/>
				</div>
			</div>
		);
	}
);
