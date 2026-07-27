import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_THEME_PREFERENCE,
  readThemePreference,
  resolveTheme,
  THEME_PREFERENCE_STORAGE_KEY,
  writeThemePreference,
} from "@/lib/theme/theme-preference";

describe("theme preference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("defaults to system when storage is empty", () => {
    expect(readThemePreference()).toBe(DEFAULT_THEME_PREFERENCE);
  });

  it("persists valid preferences", () => {
    writeThemePreference("dark");
    expect(localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)).toBe("dark");
    expect(readThemePreference()).toBe("dark");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, "neon");
    expect(readThemePreference()).toBe(DEFAULT_THEME_PREFERENCE);
  });

  it("resolves light and dark directly", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("resolves system from prefers-color-scheme", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});
