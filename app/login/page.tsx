"use client";

import Link from "next/link";
import { Card, Typography } from "antd";

import { GuestGuard } from "@/components/auth/session-guard";
import { LoginForm } from "@/components/auth/login-form";

const { Paragraph, Text, Title } = Typography;

export default function LoginPage() {
  return (
    <GuestGuard>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
        }}
      >
        <Card style={{ width: "100%", maxWidth: 448 }}>
          <Text type="secondary" style={{ textTransform: "uppercase", letterSpacing: "0.2em" }}>
            Meu Din Din
          </Text>
          <Title level={2} style={{ marginTop: 12, marginBottom: 0 }}>
            Entrar
          </Title>
          <Paragraph type="secondary">Acesse seu caderno de caixa com e-mail e senha.</Paragraph>
          <div style={{ marginTop: 32 }}>
            <LoginForm />
          </div>
          <Paragraph type="secondary" style={{ marginTop: 24, marginBottom: 0, textAlign: "center" }}>
            <Link href="/">Voltar ao início</Link>
          </Paragraph>
        </Card>
      </div>
    </GuestGuard>
  );
}
