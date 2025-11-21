import { EnhancedStore, Reducer, ReducersMapObject } from "@reduxjs/toolkit";
import { Store } from "@reduxjs/toolkit";
import { AxiosInstance } from "axios";
import { UserSchema } from "entities/User";
import { UISchema } from "features/UI";
import { OrdersSchema } from "entities/order";
import { PositionsSchema } from "entities/position";
import { MarketSchema } from "entities/market";
import { AnalyticsSchema } from "entities/analytics";
import { SettingsSchema } from "entities/settings";
import { tradingApi } from "entities/trading";

export interface StateSchema {
	user: UserSchema;
	ui: UISchema;
	orders: OrdersSchema;
	positions: PositionsSchema;
	market: MarketSchema;
	analytics: AnalyticsSchema;
	settings: SettingsSchema;
	[tradingApi.reducerPath]: ReturnType<typeof tradingApi.reducer>;
}

export type StateSchemaKey = keyof StateSchema;
export type MountedReducers = OptionalRecord<StateSchemaKey, boolean>;

export interface ReducerManager {
	getReducerMap: () => ReducersMapObject<StateSchema>;
	reduce: (state: StateSchema | undefined, action: any) => StateSchema;
	add: (key: StateSchemaKey, reducer: Reducer) => void;
	remove: (key: StateSchemaKey) => void;
	getMountedReducers: () => MountedReducers;
}

export interface ReduxStoreWithManager extends Store<StateSchema> {
	reducerManager: ReducerManager;
}

export interface ThunkExtraArg {
	api: AxiosInstance;
}

export interface ThunkConfig<T> {
	rejectValue: T;
	extra: ThunkExtraArg;
	state: StateSchema;
}
