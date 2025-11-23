import { memo, useState } from "react";
import { Card } from "shared/ui/Card/Card";
import { Text } from "shared/ui/Text/Text";
import { OrderHistoryFilters } from "./OrderHistoryFilters";
import { OrderHistoryTable } from "./OrderHistoryTable";
import {
	OrderFilters,
	OrderSort,
} from "entities/order/model/types/orderFilters";
import cls from "./OrderHistory.module.scss";

export const OrderHistory = memo(() => {
	const [filters, setFilters] = useState<OrderFilters>({
		statuses: [],
		types: [],
		sides: [],
	});

	const [sort, setSort] = useState<OrderSort>({
		field: "createdAt",
		order: "desc",
	});

	return (
		<Card className={cls.OrderHistory}>
			<div className={cls.header}>
				<Text title="Order History" />
			</div>
			<OrderHistoryFilters
				filters={filters}
				sort={sort}
				onFiltersChange={(newFilters) =>
					setFilters({ ...filters, ...newFilters })
				}
				onSortChange={setSort}
			/>
			<OrderHistoryTable filters={filters} sort={sort} />
		</Card>
	);
});
