import { StateSchema } from "app/providers/StoreProvider";

export const getOrderConfirmation = (state: StateSchema) =>
	state.orders.confirmation;
