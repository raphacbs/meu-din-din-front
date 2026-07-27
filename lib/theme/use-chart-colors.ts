"use client";

import { useMemo, useSyncExternalStore } from "react";

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function subscribeToThemeChange(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);

  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => {
    media.removeEventListener("change", callback);
    observer.disconnect();
  };
}

function getThemeSnapshot() {
  return document.documentElement.getAttribute("data-theme") ?? "light";
}

function getServerThemeSnapshot() {
  return "light";
}

export interface ChartColors {
  expense: string;
  income: string;
  accent: string;
  grid: string;
  axis: string;
  muted: string;
}

export function useChartColors(): ChartColors {
  const theme = useSyncExternalStore(
    subscribeToThemeChange,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  return useMemo(
    () => ({
      expense: readCssVar("--color-expense", "#b84232"),
      income: readCssVar("--color-cash-green", "#2f7d4c"),
      accent: readCssVar("--chart-accent", "#1d6fbf"),
      grid: readCssVar("--chart-grid", "rgba(23, 33, 27, 0.12)"),
      axis: readCssVar("--chart-axis", "rgba(23, 33, 27, 0.65)"),
      muted: readCssVar("--color-muted-foreground", "rgba(23, 33, 27, 0.7)"),
    }),
    [theme],
  );
}
