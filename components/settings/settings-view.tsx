"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BulbOutlined,
  DesktopOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { Card, Segmented, Switch, Typography, message } from "antd";

import { TagsSettings } from "@/components/settings/tags-settings";
import { ApiError } from "@/lib/api/client";
import { users } from "@/lib/api/users";
import { useUserPreferencesStore } from "@/lib/preferences/user-preferences";
import { useTheme } from "@/lib/theme/theme-provider";
import type { ThemePreference } from "@/lib/theme/theme-preference";

const { Paragraph, Text, Title } = Typography;

const THEME_OPTIONS: Array<{
  label: string;
  value: ThemePreference;
  icon: ReactNode;
}> = [
  { label: "Claro", value: "light", icon: <BulbOutlined /> },
  { label: "Escuro", value: "dark", icon: <MoonOutlined /> },
  { label: "Sistema", value: "system", icon: <DesktopOutlined /> },
];

export function SettingsView() {
  const [saving, setSaving] = useState(false);
  const { preference, setPreference } = useTheme();
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
          Preferências da conta e gestão de tags sincronizadas com o servidor.
        </Paragraph>
      </div>

      <Card title="Aparência">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Text type="secondary" style={{ fontSize: 13, maxWidth: 640 }}>
            Escolha entre tema claro, escuro ou seguir a preferência do sistema e do navegador.
          </Text>
          <Segmented
            aria-label="Aparência do app"
            options={THEME_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
              icon: option.icon,
            }))}
            value={preference}
            onChange={(value) => setPreference(value as ThemePreference)}
          />
        </div>
      </Card>

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

      <Card title="Tags">
        <Paragraph type="secondary" style={{ marginBottom: 16, maxWidth: 640 }}>
          Renomeie ou exclua tags em todas as transações. Novas tags continuam sendo criadas ao
          salvar transações.
        </Paragraph>
        <TagsSettings />
      </Card>
    </div>
  );
}
