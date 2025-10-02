import { StateSchema } from "app/providers/StoreProvider";
import { Country } from "entities/Country";
import { Currency } from "entities/Currency";
import {
	getArticleDetailsData,
	getArticleDetailsError,
	getArticleDetailsIsLoading,
} from "./articleDetails";

describe("articaleDetails.test", () => {
	test("should return data", () => {
		const data = {
			id: "1",
			title: "js",
		};
		const state: DeepPartial<StateSchema> = {
			articleDetails: {
				data,
			},
		};
		expect(getArticleDetailsData(state as StateSchema)).toEqual(data);
	});
	test("should work with empty state", () => {
		const state: DeepPartial<StateSchema> = {};
		expect(getArticleDetailsData(state as StateSchema)).toEqual(undefined);
	});
	test("should return isLoading", () => {
		const state: DeepPartial<StateSchema> = {
			articleDetails: {
				isLoading: true,
			},
		};
		expect(getArticleDetailsIsLoading(state as StateSchema)).toEqual(true);
	});

	test("should return error", () => {
		const state: DeepPartial<StateSchema> = {
			articleDetails: {
				error: "123",
			},
		};
		expect(getArticleDetailsError(state as StateSchema)).toEqual("123");
	});
});
