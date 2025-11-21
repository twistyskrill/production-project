import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { safeLocalStorage } from "shared/lib/storage/safeLocalStorage";
import { ORDER_DRAFT_LOCALSTORAGE_KEY } from "shared/const/localstorage";
import {
	Order,
	OrderDraft,
	OrderSide,
	OrderStatus,
	OrderTimeInForce,
	OrderType,
	OrdersSchema,
} from "../types/order";

const DEFAULT_DRAFT: OrderDraft = {
	symbol: "AAPL",
	side: OrderSide.BUY,
	type: OrderType.MARKET,
	quantity: 1,
	timeInForce: OrderTimeInForce.GTC,
	reduceOnly: false,
	algo: "none",
};

const loadDraft = (): OrderDraft => {
	const persisted = safeLocalStorage.get<OrderDraft | null>(
		ORDER_DRAFT_LOCALSTORAGE_KEY,
		null
	);
	return { ...DEFAULT_DRAFT, ...(persisted ?? {}) };
};

const initialState: OrdersSchema = {
	draft: loadDraft(),
	submitting: false,
	history: [],
};

const persistDraft = (draft: OrderDraft) => {
	safeLocalStorage.set(ORDER_DRAFT_LOCALSTORAGE_KEY, draft);
};

export const ordersSlice = createSlice({
	name: "orders",
	initialState,
	reducers: {
		updateDraft(state, action: PayloadAction<Partial<OrderDraft>>) {
			state.draft = { ...state.draft, ...action.payload };
			persistDraft(state.draft);
		},
		resetDraft(state) {
			state.draft = { ...DEFAULT_DRAFT };
			persistDraft(state.draft);
		},
		openConfirmation(state) {
			state.confirmation = { ...state.draft };
			state.error = undefined;
		},
		closeConfirmation(state) {
			state.confirmation = undefined;
		},
		setSubmitting(state, action: PayloadAction<boolean>) {
			state.submitting = action.payload;
			if (action.payload) {
				state.error = undefined;
			}
		},
		pushOrder(state, action: PayloadAction<Order>) {
			state.history = [action.payload, ...state.history].slice(0, 25);
			state.lastOrder = action.payload;
			state.draft = { ...DEFAULT_DRAFT, symbol: action.payload.symbol };
			persistDraft(state.draft);
			state.submitting = false;
			state.confirmation = undefined;
		},
		setOrderError(state, action: PayloadAction<string | undefined>) {
			state.error = action.payload;
			state.submitting = false;
		},
		markOrderStatus(
			state,
			action: PayloadAction<{ id: string; status: OrderStatus }>
		) {
			state.history = state.history.map((order) =>
				order.id === action.payload.id
					? { ...order, status: action.payload.status }
					: order
			);
			if (state.lastOrder?.id === action.payload.id) {
				state.lastOrder = { ...state.lastOrder, status: action.payload.status };
			}
		},
	},
});

export const { actions: ordersActions } = ordersSlice;
export const { reducer: ordersReducer } = ordersSlice;
