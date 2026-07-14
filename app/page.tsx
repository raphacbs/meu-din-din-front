"use client";

import Link from "next/link";
import { Button, Card, Space, Typography } from "antd";

const { Paragraph, Text, Title } = Typography;

export default function Home() {
  return (
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
      <Card style={{ width: "100%", maxWidth: 512 }}>
        <Text type="secondary" style={{ textTransform: "uppercase", letterSpacing: "0.2em" }}>
          Caderno de caixa vivo
        </Text>
        <Title level={1} style={{ marginTop: 12, marginBottom: 0 }}>
          Meu Din Din
        </Title>
        <Paragraph style={{ marginTop: 16 }}>
          Controle financeiro pessoal com projeção de saldo, transações e extrato.
        </Paragraph>
        <Space wrap style={{ marginTop: 32 }}>
          <Link href="/login">
            <Button type="primary">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Criar conta</Button>
          </Link>
        </Space>
        <Paragraph type="secondary" className="tabular-nums" style={{ marginTop: 32, marginBottom: 0 }}>
          API: {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}
        </Paragraph>
      </Card>
    </div>
  );
}
