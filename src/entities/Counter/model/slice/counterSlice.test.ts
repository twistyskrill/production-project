import { counterActions, counterReducer } from "./CounterSlice";
import { CounterSchema } from "../types/counterSchema";

describe("CounterSliceTest", () => {
  test("decrement test", () => {
    const state: CounterSchema = { value: 10 };
    expect(counterReducer(state, counterActions.decrement())).toEqual({
      value: 9,
    });
  });
  test("increment test", () => {
    const state: CounterSchema = { value: 10 };
    expect(counterReducer(state, counterActions.increment())).toEqual({
      value: 11,
    });
  });
  test("should work with empty state", () => {
    const state: CounterSchema = undefined;
    expect(counterReducer(state, counterActions.increment())).toEqual({
      value: 1,
    });
  });
});
