import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs.jsx";

const path = [
  { name: "Home", url: "/" },
  { name: "r/gaming", url: "/r/gaming" },
  { name: "Post Title", url: "/r/gaming/gam1" },
];

describe("Breadcrumbs", () => {
  it("renders a link for each crumb", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs path={path} />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "r/gaming" })).toHaveAttribute("href", "/r/gaming");
    expect(screen.getByRole("link", { name: "Post Title" })).toHaveAttribute("href", "/r/gaming/gam1");
  });

  it("renders a separator between crumbs but not after the last one", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs path={path} />
      </MemoryRouter>
    );

    const nav = screen.getByRole("navigation");
    const separators = nav.textContent.match(/>/g) || [];
    expect(separators).toHaveLength(path.length - 1);
  });
});
