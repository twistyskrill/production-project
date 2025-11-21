import { StateSchema } from "app/providers/StoreProvider";

export const getPositionsFilters = (state: StateSchema) =>
	state.positions.filters;
