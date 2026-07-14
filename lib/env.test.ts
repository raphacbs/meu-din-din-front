import { describe, expect, it } from "vitest";

import { DEFAULT_API_URL, getApiUrl } from "@/lib/env";

describe("getApiUrl", () => {
  it("returns the default API URL when env is unset", () => {
    const original = process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(getApiUrl()).toBe(DEFAULT_API_URL);
    expect(DEFAULT_API_URL).toBe("http://localhost:8080");

    process.env.NEXT_PUBLIC_API_URL = original;
  });
});
