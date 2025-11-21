import { StateSchema } from "app/providers/StoreProvider";

export const getOrderHistory = (state: StateSchema) => state.orders.history;
