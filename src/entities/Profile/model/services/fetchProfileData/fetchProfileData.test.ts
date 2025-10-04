import { userActions } from "entities/User";
import { TestAsyncThunk } from "shared/lib/tests/testAsyncThunk/testAsyncThunk";
import { fetchProfileData } from "./fetchProfileData";
import { Currency } from "entities/Currency";
import { Country } from "entities/Country";

const data = {
	first: "egot",
	lastname: "kobzev",
	age: 20,
	currency: Currency.RUB,
	country: Country.Russia,
	city: "",
	username: "admin",
	avatar:
		"https://pic.rutubelist.ru/user/3b/27/3b2758ad5492a76b578f7ee072e4e894.jpg",
};
describe("fetchProfileData", () => {
	test("success", async () => {
		const thunk = new TestAsyncThunk(fetchProfileData);
		thunk.api.get.mockReturnValue(Promise.resolve({ data: data }));
		const result = await thunk.callThunk("1");

		expect(thunk.api.get).toHaveBeenCalled();
		expect(result.meta.requestStatus).toBe("fulfilled");
		expect(result.payload).toEqual(data);
	});
	test("error login", async () => {
		const thunk = new TestAsyncThunk(fetchProfileData);
		thunk.api.get.mockReturnValue(Promise.resolve({ status: 403 }));
		const result = await thunk.callThunk("1");
		expect(result.meta.requestStatus).toBe("rejected");
	});
});
