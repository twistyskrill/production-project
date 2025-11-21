import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
	PositionSortField,
	PositionStatus,
	PositionsSchema,
} from "../types/position";

const initialState: PositionsSchema = {
	filters: {
		query: "",
		statuses: [PositionStatus.OPEN],
	},
	sort: {
		field: PositionSortField.UPDATED_AT,
		order: "desc",
	},
	virtualization: {
		rowHeight: 48,
	},
};

export const positionsSlice = createSlice({
	name: "positions",
	initialState,
	reducers: {
		setQuery(state, action: PayloadAction<string>) {
			state.filters.query = action.payload;
		},
		setSymbolFilter(state, action: PayloadAction<string | undefined>) {
			state.filters.symbol = action.payload;
		},
		setStatuses(state, action: PayloadAction<PositionStatus[]>) {
			state.filters.statuses = action.payload;
		},
		setSort(state, action: PayloadAction<typeof initialState.sort>) {
			state.sort = action.payload;
		},
		toggleStatus(state, action: PayloadAction<PositionStatus>) {
			const exists = state.filters.statuses.includes(action.payload);
			state.filters.statuses = exists
				? state.filters.statuses.filter((status) => status !== action.payload)
				: [...state.filters.statuses, action.payload];
		},
		resetFilters(state) {
			state.filters = { ...initialState.filters };
			state.sort = { ...initialState.sort };
		},
		setRowHeight(state, action: PayloadAction<number>) {
			state.virtualization.rowHeight = action.payload;
		},
	},
});

export const { actions: positionsActions } = positionsSlice;
export const { reducer: positionsReducer } = positionsSlice;
