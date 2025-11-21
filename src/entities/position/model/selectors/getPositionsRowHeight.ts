import { StateSchema } from "app/providers/StoreProvider";

export const getPositionsRowHeight = (state: StateSchema) =>
	state.positions.virtualization.rowHeight;
