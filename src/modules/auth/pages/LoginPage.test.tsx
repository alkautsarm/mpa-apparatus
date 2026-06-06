import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Router } from "wouter";
import { describe, expect, it } from "vitest";
import { LoginPage } from "./LoginPage";

function renderWithRouter(ui: React.ReactElement) {
  return render(<Router>{ui}</Router>);
}

describe("LoginPage", () => {
  it("renders the login form", () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors when submitted with empty fields", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      expect(screen.getByText(/string must contain at least 8/i)).toBeInTheDocument();
    });
  });

  it("shows an error for invalid email format", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });
});
