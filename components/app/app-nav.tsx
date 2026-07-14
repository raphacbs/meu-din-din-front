"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardOutlined,
  FileTextOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import type { MenuProps } from "antd";

const NAV_ICONS = {
  "/dashboard": <DashboardOutlined />,
  "/transactions": <SwapOutlined />,
  "/extract": <FileTextOutlined />,
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transações" },
  { href: "/extract", label: "Extrato" },
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
  const selectedKey = getSelectedKey(pathname);

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
        theme="light"
        selectedKeys={[selectedKey]}
        items={items}
        style={{ borderInlineEnd: "none", background: "transparent" }}
      />
    </nav>
  );
}
