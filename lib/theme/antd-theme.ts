import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#2f7d4c",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#eef6ef",
    colorBorderSecondary: "#d7ded8",
    colorText: "#17211b",
    colorTextSecondary: "rgba(23, 33, 27, 0.7)",
    colorError: "#b84232",
    colorWarning: "#c77a19",
    colorSuccess: "#2f7d4c",
    fontFamily: "var(--font-source-sans-3), system-ui, sans-serif",
    borderRadius: 8,
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
