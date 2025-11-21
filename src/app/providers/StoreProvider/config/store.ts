import { configureStore, Reducer, ReducersMapObject } from "@reduxjs/toolkit";
import { userReducer } from "entities/User";
import { StateSchema, ThunkExtraArg } from "./StateSchema";
import { createReducerManager } from "./reducerManager";
import { $api } from "shared/api/api";
import { uiReducer } from "features/UI";
import { ordersReducer } from "entities/order";
import { positionsReducer } from "entities/position";
import { marketReducer } from "entities/market";
import { analyticsReducer } from "entities/analytics";
import { settingsReducer } from "entities/settings";
import { tradingApi } from "entities/trading";

export function createReduxStore(
	initialState?: StateSchema,
	asyncReducers?: ReducersMapObject<StateSchema>
) {
	const rootReducers: ReducersMapObject<StateSchema> = {
		...asyncReducers,
		user: userReducer,
		ui: uiReducer,
		orders: ordersReducer,
		positions: positionsReducer,
		market: marketReducer,
		analytics: analyticsReducer,
		settings: settingsReducer,
		[tradingApi.reducerPath]: tradingApi.reducer,
	};

	const reducerManager = createReducerManager(rootReducers);

	const extraArg: ThunkExtraArg = {
		api: $api,
	};

	const store = configureStore({
		reducer: reducerManager.reduce as Reducer<StateSchema>,
		devTools: __IS_DEV__,
		preloadedState: initialState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				thunk: {
					extraArgument: extraArg,
				},
			}).concat(tradingApi.middleware),
	});
	//@ts-ignore
	store.reducerManager = reducerManager;
	return store;
}

export type AppDispatch = ReturnType<typeof createReduxStore>["dispatch"];
