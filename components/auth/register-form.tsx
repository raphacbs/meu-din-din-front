"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Form, Input } from "antd";
import { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/api/auth";
import { mapAuthError } from "@/lib/auth/session-storage";
import { useSession } from "@/lib/auth/session-context";

interface RegisterFormValues {
  email: string;
  password: string;
}

export function RegisterForm() {
  const router = useRouter();
  const { login } = useSession();
  const [form] = Form.useForm<RegisterFormValues>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFinish(values: RegisterFormValues) {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const session = await auth.register({
        email: values.email.trim(),
        password: values.password,
      });
      login(session);
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(mapAuthError(error.status, error.message));
      } else {
        setFormError("Não foi possível criar a conta. Tente novamente.");
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
        rules={[
          { required: true, message: "Informe sua senha." },
          { min: 8, message: "A senha deve ter pelo menos 8 caracteres." },
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>

      {formError ? <Alert type="error" message={formError} showIcon style={{ marginBottom: 16 }} /> : null}

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={isSubmitting}>
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </Form.Item>

      <p style={{ textAlign: "center", margin: 0 }}>
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </Form>
  );
}
