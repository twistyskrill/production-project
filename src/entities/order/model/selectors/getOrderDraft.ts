import { StateSchema } from "app/providers/StoreProvider";

export const getOrderDraft = (state: StateSchema) => state.orders.draft;
