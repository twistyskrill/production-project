import { classNames } from "./classNames";

describe("classNames", () => {
  test("test", () => {
    expect(classNames("someClass")).toBe("someClass");
  });
  test("width additional class", () => {
    const expected = "someClass class1 class2";
    expect(classNames("someClass", {}, ["class1", "class2"])).toBe(expected);
  });
  test("width mods", () => {
    const expected = "someClass class1 class2 hovered";
    expect(
      classNames("someClass", { hovered: true }, ["class1", "class2"])
    ).toBe(expected);
  });
  test("width mods false", () => {
    const expected = "someClass class1 class2";
    expect(
      classNames("someClass", { hovered: false }, ["class1", "class2"])
    ).toBe(expected);
  });
  test("width mods undefined", () => {
    const expected = "someClass class1 class2";
    expect(
      classNames("someClass", { hovered: undefined }, ["class1", "class2"])
    ).toBe(expected);
  });
});
