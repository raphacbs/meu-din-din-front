"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarOutlined,
  DashboardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import type { MenuProps } from "antd";

import { useTheme } from "@/lib/theme/theme-provider";

const NAV_ICONS = {
  "/dashboard": <DashboardOutlined />,
  "/meu-mes": <CalendarOutlined />,
  "/settings": <SettingOutlined />,
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meu-mes", label: "Meu mês" },
  { href: "/settings", label: "Configurações" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getSelectedKey(pathname: string): string {
  const activeItem = NAV_ITEMS.find((item) => isActivePath(pathname, item.href));
  return activeItem?.href ?? pathname;
}

export function AppNav() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const selectedKey = getSelectedKey(pathname);
  const menuTheme = resolvedTheme === "dark" ? "dark" : "light";

  const items: MenuProps["items"] = NAV_ITEMS.map((item) => {
    const isActive = isActivePath(pathname, item.href);

    return {
      key: item.href,
      icon: NAV_ICONS[item.href],
      label: (
        <Link href={item.href} aria-current={isActive ? "page" : undefined}>
          {item.label}
        </Link>
      ),
    };
  });

  return (
    <nav aria-label="Principal">
      <Menu
        mode="inline"
        theme={menuTheme}
        selectedKeys={[selectedKey]}
        items={items}
        style={{ borderInlineEnd: "none", background: "transparent" }}
      />
    </nav>
  );
}
