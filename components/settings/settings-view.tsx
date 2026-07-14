"use client";

import { useEffect, useState } from "react";
import { Card, Switch, Typography, message } from "antd";

import { ApiError } from "@/lib/api/client";
import { users } from "@/lib/api/users";
import { useUserPreferencesStore } from "@/lib/preferences/user-preferences";

const { Paragraph, Text, Title } = Typography;

export function SettingsView() {
  const [saving, setSaving] = useState(false);
  const hydrated = useUserPreferencesStore((state) => state.hydrated);
  const blockPastMonthMutations = useUserPreferencesStore(
    (state) => state.blockPastMonthMutations,
  );
  const hydrate = useUserPreferencesStore((state) => state.hydrate);
  const setBlockPastMonthMutations = useUserPreferencesStore(
    (state) => state.setBlockPastMonthMutations,
  );

  useEffect(() => {
    void hydrate().catch((error) => {
      const detail =
        error instanceof ApiError ? error.message : "Não foi possível carregar as preferências.";
      message.error(detail);
    });
  }, [hydrate]);

  async function handleToggle(checked: boolean) {
    setSaving(true);
    try {
      const prefs = await users.updatePreferences({ blockPastMonthMutations: checked });
      setBlockPastMonthMutations(prefs.blockPastMonthMutations);
    } catch (error) {
      const detail =
        error instanceof ApiError ? error.message : "Não foi possível salvar a preferência.";
      message.error(detail);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Title level={2} style={{ marginBottom: 8 }}>
          Configurações
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640 }}>
          Preferências da conta sincronizadas com o servidor.
        </Paragraph>
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              Bloquear edição e exclusão de meses passados
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Com esta opção ativa, o mês atual e os futuros continuam liberados. Meses anteriores
              ficam protegidos contra edição e exclusão.
            </Text>
          </div>
          <Switch
            checked={blockPastMonthMutations}
            disabled={!hydrated || saving}
            loading={saving}
            aria-label="Bloquear edição e exclusão de meses passados"
            onChange={(checked) => void handleToggle(checked)}
          />
        </div>
      </Card>
    </div>
  );
}
