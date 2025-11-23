import { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { OrderStatus } from "entities/order";
import {
	OrderFilters,
	OrderSort,
} from "entities/order/model/types/orderFilters";
import { getOrderHistory } from "entities/order";
import { formatCurrency } from "shared/lib/format/currency";
import { Text } from "shared/ui/Text/Text";
import cls from "./OrderHistoryTable.module.scss";

interface OrderHistoryTableProps {
	filters: OrderFilters;
	sort: OrderSort;
}

export const OrderHistoryTable = memo(
	({ filters, sort }: OrderHistoryTableProps) => {
		const { t } = useTranslation("terminal");
		const history = useSelector(getOrderHistory);

		const filteredAndSorted = useMemo(() => {
			let result = [...history];

			// Фильтрация
			if (filters.statuses.length > 0) {
				result = result.filter((order) =>
					filters.statuses.includes(order.status)
				);
			}

			if (filters.types.length > 0) {
				result = result.filter((order) => filters.types.includes(order.type));
			}

			if (filters.sides.length > 0) {
				result = result.filter((order) => filters.sides.includes(order.side));
			}

			if (filters.symbol) {
				result = result.filter((order) =>
					order.symbol.toLowerCase().includes(filters.symbol!.toLowerCase())
				);
			}

			if (filters.searchQuery) {
				const query = filters.searchQuery.toLowerCase();
				result = result.filter(
					(order) =>
						order.symbol.toLowerCase().includes(query) ||
						order.id.toLowerCase().includes(query) ||
						order.comment?.toLowerCase().includes(query)
				);
			}

			// Сортировка
			result.sort((a, b) => {
				let aValue: any;
				let bValue: any;

				switch (sort.field) {
					case "createdAt":
						aValue = new Date(a.createdAt).getTime();
						bValue = new Date(b.createdAt).getTime();
						break;
					case "symbol":
						aValue = a.symbol;
						bValue = b.symbol;
						break;
					case "quantity":
						aValue = a.quantity;
						bValue = b.quantity;
						break;
					case "price":
						aValue = a.price || a.executionPrice || 0;
						bValue = b.price || b.executionPrice || 0;
						break;
					case "status":
						aValue = a.status;
						bValue = b.status;
						break;
					default:
						return 0;
				}

				if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
				if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
				return 0;
			});

			return result;
		}, [history, filters, sort]);

		const getStatusClass = (status: OrderStatus) => {
			switch (status) {
				case OrderStatus.FILLED:
					return cls.statusFilled;
				case OrderStatus.REJECTED:
					return cls.statusRejected;
				case OrderStatus.SENT:
				case OrderStatus.PENDING:
					return cls.statusPending;
				default:
					return "";
			}
		};

		const formatDate = (dateString: string) => {
			const date = new Date(dateString);
			return date.toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		};

		if (filteredAndSorted.length === 0) {
			return (
				<div className={cls.emptyState}>
					<Text text={t("orders.noOrders", "No orders found")} />
				</div>
			);
		}

		return (
			<div className={cls.OrderHistoryTable}>
				<div className={cls.table}>
					<div className={cls.header}>
						<span>{t("orders.date", "Date")}</span>
						<span>{t("orders.symbol", "Symbol")}</span>
						<span>{t("orders.side", "Side")}</span>
						<span>{t("orders.type", "Type")}</span>
						<span>{t("orders.quantity", "Qty")}</span>
						<span>{t("orders.price", "Price")}</span>
						<span>{t("orders.status", "Status")}</span>
					</div>
					<div className={cls.body}>
						{filteredAndSorted.map((order) => (
							<div key={order.id} className={cls.row}>
								<span className={cls.date}>{formatDate(order.createdAt)}</span>
								<span className={cls.symbol}>{order.symbol}</span>
								<span
									className={order.side === "buy" ? cls.sideBuy : cls.sideSell}
								>
									{order.side.toUpperCase()}
								</span>
								<span>{order.type.toUpperCase()}</span>
								<span>{order.quantity}</span>
								<span>
									{order.executionPrice
										? formatCurrency(order.executionPrice)
										: order.price
										? formatCurrency(order.price)
										: "-"}
								</span>
								<span className={getStatusClass(order.status)}>
									{order.status.toUpperCase()}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
);
