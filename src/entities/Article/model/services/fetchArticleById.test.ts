import { userActions } from "entities/User";
import { TestAsyncThunk } from "shared/lib/tests/testAsyncThunk/testAsyncThunk";
import { Article } from "../types/article";
import { fetchArticleById } from "./fetchArticleById/fetchArticleById";

const data: Article = {
	id: "1",
	title: "js",
	views: 1765,
	subtitle: "",
	img: "",
	user: {
		id: "2",
		username: "9mm",
	},
	createdAt: "",
	type: [],
	blocks: [],
};
describe("fetchArticleById", () => {
	test("success", async () => {
		const thunk = new TestAsyncThunk(fetchArticleById);
		thunk.api.get.mockReturnValue(Promise.resolve({ data: data }));
		const result = await thunk.callThunk("1");

		expect(thunk.api.get).toHaveBeenCalled();
		expect(result.meta.requestStatus).toBe("fulfilled");
		expect(result.payload).toEqual(data);
	});
	test("error login", async () => {
		const thunk = new TestAsyncThunk(fetchArticleById);
		thunk.api.get.mockReturnValue(Promise.resolve({ status: 403 }));
		const result = await thunk.callThunk("1");
		expect(result.meta.requestStatus).toBe("rejected");
	});
});
