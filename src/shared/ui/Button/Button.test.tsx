import { render, screen } from "@testing-library/react";
import { Button, ThemeButton } from "./Button";

describe("button", () => {
  test("test render button", () => {
    render(<Button>TEST</Button>);
    expect(screen.getByText("TEST")).toBeInTheDocument();
  });
  test("test clear theme button", () => {
    render(<Button theme={ThemeButton.CLEAR}>TEST</Button>);
    expect(screen.getByText("TEST")).toHaveClass("clear");
    screen.debug();
  });
});
