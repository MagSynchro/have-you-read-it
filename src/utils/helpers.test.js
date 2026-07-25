import { describe, it, expect } from "vitest";
import { formatNumber, removeAmp } from "./helpers.js";

describe("formatNumber", () => {
  it("returns the number itself (not a string) for values under 1000", () => {
    const result = formatNumber(999);
    expect(result).toBe(999);
    expect(typeof result).toBe("number");
  });

  it("formats exactly 1000 as 1.0K", () => {
    expect(formatNumber(1000)).toBe("1.0K");
  });

  it("formats values just under 1,000,000 in K", () => {
    expect(formatNumber(999999)).toBe("1000.0K");
  });

  it("formats exactly 1,000,000 as 1.0M", () => {
    expect(formatNumber(1000000)).toBe("1.0M");
  });

  it("formats billions as B", () => {
    expect(formatNumber(2500000000)).toBe("2.5B");
  });
});

describe("removeAmp", () => {
  it("replaces &amp; with &", () => {
    expect(removeAmp("cats &amp; dogs")).toBe("cats & dogs");
  });

  it("returns an empty string for null", () => {
    expect(removeAmp(null)).toBe("");
  });

  it("returns an empty string for undefined", () => {
    expect(removeAmp(undefined)).toBe("");
  });

  it("returns an empty string for empty string input", () => {
    expect(removeAmp("")).toBe("");
  });

  it("leaves strings without &amp; unchanged", () => {
    expect(removeAmp("no entities here")).toBe("no entities here");
  });
});
