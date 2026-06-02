import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders the boilerplate heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: /mpa-apparatus/i })).toBeInTheDocument();
  });

  it("renders the increment button", () => {
    render(<HomePage />);
    expect(screen.getByRole("button", { name: /increment/i })).toBeInTheDocument();
  });

  it("increments counter when button is clicked", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    const button = screen.getByRole("button", { name: /increment/i });
    await user.click(button);
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });
});
