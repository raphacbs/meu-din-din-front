"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Form, Input } from "antd";
import { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/api/auth";
import { mapAuthError } from "@/lib/auth/session-storage";
import { useSession } from "@/lib/auth/session-context";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useSession();
  const [form] = Form.useForm<LoginFormValues>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFinish(values: LoginFormValues) {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const session = await auth.login({
        email: values.email.trim(),
        password: values.password,
      });
      login(session);
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(mapAuthError(error.status, error.message));
      } else {
        setFormError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
      <Form.Item
        name="email"
        label="E-mail"
        rules={[
          { required: true, message: "Informe seu e-mail." },
          { type: "email", message: "Informe um e-mail válido." },
        ]}
      >
        <Input type="email" autoComplete="email" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Senha"
        rules={[{ required: true, message: "Informe sua senha." }]}
      >
        <Input.Password autoComplete="current-password" />
      </Form.Item>

      {formError ? <Alert type="error" message={formError} showIcon style={{ marginBottom: 16 }} /> : null}

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </Form.Item>

      <p style={{ textAlign: "center", margin: 0 }}>
        Ainda não tem conta? <Link href="/register">Criar conta</Link>
      </p>
    </Form>
  );
}
