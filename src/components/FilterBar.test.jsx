import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterBar from "./FilterBar.jsx";

describe("FilterBar", () => {
  it("renders all four sort options", () => {
    render(<FilterBar currentSort="hot" onSortChange={() => {}} />);
    for (const label of ["Hot", "New", "Top", "Best"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the current sort as active", () => {
    render(<FilterBar currentSort="top" onSortChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Top" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "Hot" })).not.toHaveClass("active");
  });

  it("calls onSortChange with the clicked option", async () => {
    const onSortChange = vi.fn();
    render(<FilterBar currentSort="hot" onSortChange={onSortChange} />);
    await userEvent.click(screen.getByRole("button", { name: "New" }));
    expect(onSortChange).toHaveBeenCalledWith("new");
  });
});
