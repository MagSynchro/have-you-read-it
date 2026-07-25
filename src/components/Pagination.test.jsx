import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination.jsx";

describe("Pagination", () => {
  it("renders a Next button", () => {
    render(<Pagination after="4" onNext={() => {}} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("calls onNext when clicked", async () => {
    const onNext = vi.fn();
    render(<Pagination after="4" onNext={onNext} />);
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
