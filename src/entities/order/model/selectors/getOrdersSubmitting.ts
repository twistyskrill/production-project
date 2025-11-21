import { StateSchema } from "app/providers/StoreProvider";

export const getOrdersSubmitting = (state: StateSchema) =>
	state.orders.submitting;
