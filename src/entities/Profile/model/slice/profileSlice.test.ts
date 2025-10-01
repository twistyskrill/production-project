import { Currency } from "entities/Currency";
import { ProfileSchema, ValidateProfileError } from "../types/profile";
import { profileActions, profileReducer } from "./profileSlice";
import { Country } from "entities/Country";
import { updateProfileData } from "../services/updateProfileData/updateProfileData";

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
describe("profileSlice", () => {
	test("test set readonly", () => {
		const state: DeepPartial<ProfileSchema> = { readonly: false };
		expect(
			profileReducer(state as ProfileSchema, profileActions.setReadonly(true))
		).toEqual({ readonly: true });
	});
	test("test cancel edit", () => {
		const state: DeepPartial<ProfileSchema> = { data, form: { username: "" } };
		expect(
			profileReducer(state as ProfileSchema, profileActions.cancelEdit())
		).toEqual({ readonly: true, validateErrors: undefined, data, form: data });
	});
	test("test update profile", () => {
		const state: DeepPartial<ProfileSchema> = { form: { username: "1" } };

		expect(
			profileReducer(
				state as ProfileSchema,
				profileActions.updateProfile({ username: "123" })
			)
		).toEqual({ form: { username: "123" } });
	});

	test("test update service pending", () => {
		const state: DeepPartial<ProfileSchema> = {
			isLoading: false,
			validateErrors: [ValidateProfileError.SERVER_ERROR],
		};
		expect(
			profileReducer(state as ProfileSchema, updateProfileData.pending)
		).toEqual({ isLoading: true, validateErrors: undefined });
	});
	test("test update service fullfilled", () => {
		const state: DeepPartial<ProfileSchema> = {
			isLoading: true,
		};

		expect(
			profileReducer(
				state as ProfileSchema,
				updateProfileData.fulfilled(data, "")
			)
		).toEqual({
			isLoading: false,
			validateErrors: undefined,
			readonly: true,
			validateError: undefined,
			form: data,
			data,
		});
	});
});
