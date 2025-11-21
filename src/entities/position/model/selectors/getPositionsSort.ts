import { StateSchema } from "app/providers/StoreProvider";

export const getPositionsSort = (state: StateSchema) => state.positions.sort;
