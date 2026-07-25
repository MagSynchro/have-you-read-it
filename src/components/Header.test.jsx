import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import subredditsReducer from "../features/subreddits/subredditsSlice.js";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderHeader(visited, initialPath = "/r/gaming") {
  const store = configureStore({
    reducer: { subreddits: subredditsReducer },
    preloadedState: { subreddits: { visited } },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/r/:subredditName"
            element={
              <>
                <Header />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("Header", () => {
  it("shows the current subreddit plus visited history minus the current one", () => {
    renderHeader(["popular", "gaming", "movies"]);
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["r/gaming", "r/popular", "r/movies"]);
  });

  it("navigates to the selected subreddit when the dropdown changes", async () => {
    renderHeader(["popular", "gaming", "movies"]);
    await userEvent.selectOptions(screen.getByRole("combobox"), "popular");
    expect(screen.getByTestId("location")).toHaveTextContent("/r/popular");
  });
});
