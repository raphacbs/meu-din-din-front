import { theme as antdAlgorithms, type ThemeConfig } from "antd";

import type { ResolvedTheme } from "@/lib/theme/theme-preference";

const sharedToken = {
  colorError: "#b84232",
  colorWarning: "#c77a19",
  colorSuccess: "#2f7d4c",
  fontFamily: "var(--font-source-sans-3), system-ui, sans-serif",
  borderRadius: 8,
} as const;

export const antdLightTheme: ThemeConfig = {
  algorithm: antdAlgorithms.defaultAlgorithm,
  token: {
    ...sharedToken,
    colorPrimary: "#2f7d4c",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#eef6ef",
    colorBorderSecondary: "#d7ded8",
    colorText: "#17211b",
    colorTextSecondary: "rgba(23, 33, 27, 0.7)",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#ffffff",
      lightSiderBg: "#ffffff",
      triggerBg: "#f3f7f4",
      lightTriggerBg: "#f3f7f4",
      triggerColor: "#17211b",
      lightTriggerColor: "#17211b",
      bodyBg: "#eef6ef",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#eef6ef",
      itemSelectedColor: "#2f7d4c",
      itemHoverBg: "#f3f7f4",
      itemHoverColor: "#2f7d4c",
      itemActiveBg: "#eef6ef",
      itemColor: "#17211b",
      iconSize: 16,
    },
  },
};

export const antdDarkTheme: ThemeConfig = {
  algorithm: antdAlgorithms.darkAlgorithm,
  token: {
    ...sharedToken,
    colorPrimary: "#4caf73",
    colorBgContainer: "#1a231e",
    colorBgLayout: "#121814",
    colorBorderSecondary: "#2a3530",
    colorText: "#e8efe9",
    colorTextSecondary: "rgba(232, 239, 233, 0.7)",
  },
  components: {
    Layout: {
      headerBg: "#1a231e",
      siderBg: "#1a231e",
      lightSiderBg: "#1a231e",
      triggerBg: "#232d28",
      lightTriggerBg: "#232d28",
      triggerColor: "#e8efe9",
      lightTriggerColor: "#e8efe9",
      bodyBg: "#121814",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#232d28",
      itemSelectedColor: "#4caf73",
      itemHoverBg: "#232d28",
      itemHoverColor: "#4caf73",
      itemActiveBg: "#232d28",
      itemColor: "#e8efe9",
      iconSize: 16,
    },
  },
};

export function getAntdTheme(resolved: ResolvedTheme): ThemeConfig {
  return resolved === "dark" ? antdDarkTheme : antdLightTheme;
}

/** @deprecated Use getAntdTheme(resolvedTheme) */
export const antdTheme = antdLightTheme;
