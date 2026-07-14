import { describe, expect, it } from "vitest";

import {
  parseBrazilianCurrencyInput,
  formatBrazilianCurrencyInput,
} from "@/lib/format/currency-input";

describe("parseBrazilianCurrencyInput", () => {
  it("parses Brazilian formatted currency", () => {
    expect(parseBrazilianCurrencyInput("1.234,56")).toBe(1234.56);
    expect(parseBrazilianCurrencyInput("R$ 80,00")).toBe(80);
  });

  it("returns null for invalid values", () => {
    expect(parseBrazilianCurrencyInput("")).toBeNull();
    expect(parseBrazilianCurrencyInput("abc")).toBeNull();
  });
});

describe("formatBrazilianCurrencyInput", () => {
  it("formats numeric values for input display", () => {
    expect(formatBrazilianCurrencyInput(80)).toBe("80,00");
  });
});
