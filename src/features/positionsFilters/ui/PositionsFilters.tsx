import { memo } from "react";
import { useSelector } from "react-redux";
import { Input } from "shared/ui/Input/Input";
import { Select } from "shared/ui/Select/Select";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import {
	PositionSortField,
	PositionStatus,
	getPositionsFilters,
	getPositionsSort,
	positionsActions,
} from "entities/position";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import cls from "./PositionsFilters.module.scss";

const sortOptions = [
	{ value: PositionSortField.UPDATED_AT, content: "Updated" },
	{ value: PositionSortField.SYMBOL, content: "Symbol" },
	{ value: PositionSortField.PNL, content: "P&L" },
	{ value: PositionSortField.SIZE, content: "Size" },
];

export const PositionsFilters = memo(() => {
	const filters = useSelector(getPositionsFilters);
	const sort = useSelector(getPositionsSort);
	const dispatch = useAppDispatch();

	return (
		<div className={cls?.PositionsFilters || ""}>
			<Input
				placeholder="Search or filter symbol"
				value={filters.query}
				onChange={(value) => dispatch(positionsActions.setQuery(value))}
			/>
			<div className={cls?.statusGroup || ""}>
				<Select
					label="Sort"
					options={sortOptions}
					value={sort.field}
					onChange={(value) =>
						dispatch(
							positionsActions.setSort({
								field: value as PositionSortField,
								order: sort.order,
							})
						)
					}
				/>
				<Button
					theme={ButtonTheme.CLEAR}
					onClick={() =>
						dispatch(
							positionsActions.setSort({
								field: sort.field,
								order: sort.order === "asc" ? "desc" : "asc",
							})
						)
					}
				>
					{sort.order.toUpperCase()}
				</Button>
			</div>
			<div className={cls?.statusGroup || ""}>
				{Object.values(PositionStatus).map((status) => (
					<Button
						key={status}
						theme={
							filters.statuses.includes(status)
								? ButtonTheme.BACKGROUND
								: ButtonTheme.OUTLINE
						}
						onClick={() => dispatch(positionsActions.toggleStatus(status))}
					>
						{status}
					</Button>
				))}
				<Button
					theme={ButtonTheme.CLEAR}
					onClick={() => dispatch(positionsActions.resetFilters())}
				>
					Reset
				</Button>
			</div>
		</div>
	);
});
