import { Currency } from "entities/Currency";
import { Country } from "entities/Country";
import { validateProfileData } from "./validateProfileData";
import { ValidateProfileError } from "../../types/profile";

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
describe("validateProfileData", () => {
  test("success", async () => {
    const result = validateProfileData(data);
    expect(result).toEqual([]);
  });
  test("without first and last name", async () => {
    const result = validateProfileData({ ...data, first: "", lastname: "" });
    expect(result).toEqual([ValidateProfileError.INCORRECT_USER_DATA]);
  });
  test("incorrect age", async () => {
    const result = validateProfileData({ ...data, age: undefined });
    expect(result).toEqual([ValidateProfileError.INCORRECT_AGE]);
  });
  test("incorrect country", async () => {
    const result = validateProfileData({ ...data, country: undefined });
    expect(result).toEqual([ValidateProfileError.INCORRECT_COUNTRY]);
  });
  test("incorrect all", async () => {
    const result = validateProfileData({});
    expect(result).toEqual([
      ValidateProfileError.INCORRECT_USER_DATA,
      ValidateProfileError.INCORRECT_AGE,
      ValidateProfileError.INCORRECT_COUNTRY,
    ]);
  });
});
