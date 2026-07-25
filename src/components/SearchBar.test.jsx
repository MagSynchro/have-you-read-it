import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => navigateMock };
});

describe("SearchBar", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("navigates to /search with the encoded query on submit", async () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText("Search Reddit..."), "cats & dogs");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(navigateMock).toHaveBeenCalledWith(
      `/search?q=${encodeURIComponent("cats & dogs")}`,
      { replace: false }
    );
  });

  it("does not navigate when the input is empty", async () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("does not navigate when the input is only whitespace", async () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText("Search Reddit..."), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
