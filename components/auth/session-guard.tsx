"use client";

import { Spin } from "antd";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/lib/auth/session-context";

function LoadingShell({ label }: { label: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}
    >
      <Spin tip={label} />
    </div>
  );
}

export function SessionGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingShell label="Verificando sessão..." />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return children;
}

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingShell label="Carregando..." />;
  }

  if (status === "authenticated") {
    return null;
  }

  return children;
}
