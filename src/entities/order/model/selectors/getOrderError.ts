import { StateSchema } from "app/providers/StoreProvider";

export const getOrderError = (state: StateSchema) => state.orders.error;
