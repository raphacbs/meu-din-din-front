import { describe, expect, it, vi } from "vitest";

import { buildPeriodQueryString, parsePeriodSearchParams, replacePeriodInUrl } from "@/lib/period/url";

describe("parsePeriodSearchParams", () => {
  it("returns from/to when both are valid ISO dates", () => {
    const params = new URLSearchParams("from=2024-07-01&to=2024-07-31");
    expect(parsePeriodSearchParams(params)).toEqual({
      from: "2024-07-01",
      to: "2024-07-31",
    });
  });

  it("returns null for missing or invalid params", () => {
    expect(parsePeriodSearchParams(new URLSearchParams())).toBeNull();
    expect(parsePeriodSearchParams(new URLSearchParams("from=2024-07-01"))).toBeNull();
    expect(parsePeriodSearchParams(new URLSearchParams("from=bad&to=2024-07-31"))).toBeNull();
  });
});

describe("buildPeriodQueryString", () => {
  it("builds from/to query string", () => {
    expect(buildPeriodQueryString("2024-07-01", "2024-07-31")).toBe(
      "from=2024-07-01&to=2024-07-31",
    );
  });
});

describe("replacePeriodInUrl", () => {
  it("replaces the URL with from/to query params", () => {
    const replace = vi.fn();
    replacePeriodInUrl({ replace }, "/extract", "2024-07-01", "2024-07-31");
    expect(replace).toHaveBeenCalledWith("/extract?from=2024-07-01&to=2024-07-31");
  });
});
