"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button, Layout, Typography } from "antd";

import { AppNav } from "@/components/app/app-nav";
import { useSession } from "@/lib/auth/session-context";
import { useTheme } from "@/lib/theme/theme-provider";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { logout, user } = useSession();
  const { resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const siderTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <Layout style={{ minHeight: "100%" }}>
      <a
        href="#main-content"
        style={{
          position: "absolute",
          left: -9999,
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
        onFocus={(event) => {
          event.currentTarget.style.position = "fixed";
          event.currentTarget.style.left = "16px";
          event.currentTarget.style.top = "16px";
          event.currentTarget.style.zIndex = "1000";
          event.currentTarget.style.width = "auto";
          event.currentTarget.style.height = "auto";
          event.currentTarget.style.padding = "8px 16px";
          event.currentTarget.style.background = "var(--color-surface)";
          event.currentTarget.style.borderRadius = "8px";
        }}
        onBlur={(event) => {
          event.currentTarget.style.position = "absolute";
          event.currentTarget.style.left = "-9999px";
          event.currentTarget.style.width = "1px";
          event.currentTarget.style.height = "1px";
          event.currentTarget.style.padding = "0";
        }}
      >
        Ir para o conteúdo
      </a>

      <Sider
        theme={siderTheme}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 64,
            padding: collapsed ? "0 16px" : "0 24px",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              color: "var(--color-cash-green)",
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: collapsed ? 18 : 20,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              textDecoration: "none",
            }}
          >
            {collapsed ? "MD" : "Meu Din Din"}
          </Link>
        </div>

        <AppNav />

        <div
          style={{
            position: "absolute",
            bottom: 48,
            width: "100%",
            padding: collapsed ? "12px 8px" : "16px 24px",
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          {user && !collapsed ? (
            <Text type="secondary" style={{ display: "block", marginBottom: 8, fontSize: 12 }}>
              {user.email}
            </Text>
          ) : null}
          <Button block onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 24px",
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            height: 64,
          }}
        />

        <Content
          id="main-content"
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: 1152,
            padding: "32px 24px",
            flex: 1,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
