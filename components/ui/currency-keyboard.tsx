"use client";

import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";

const { Text } = Typography;

interface CurrencyKeyboardProps {
  value?: number;
  onChange?: (value: number | undefined) => void;
  onConfirm?: () => void;
}

function formatCents(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CurrencyKeyboard({ value, onChange, onConfirm }: CurrencyKeyboardProps) {
  const [centavos, setCentavos] = useState(() =>
    value !== undefined ? Math.round(value * 100) : 0,
  );

  useEffect(() => {
    setCentavos(value !== undefined ? Math.round(value * 100) : 0);
  }, [value]);

  const pushDigit = useCallback(
    (digit: number) => {
      setCentavos((current) => {
        const next = current * 10 + digit;
        onChange?.(next / 100);
        return next;
      });
    },
    [onChange],
  );

  const backspace = useCallback(() => {
    setCentavos((current) => {
      const next = Math.floor(current / 10);
      onChange?.(next > 0 ? next / 100 : undefined);
      return next;
    });
  }, [onChange]);

  const keys: Array<{ label: string; action: () => void }> = [
    { label: "7", action: () => pushDigit(7) },
    { label: "8", action: () => pushDigit(8) },
    { label: "9", action: () => pushDigit(9) },
    { label: "4", action: () => pushDigit(4) },
    { label: "5", action: () => pushDigit(5) },
    { label: "6", action: () => pushDigit(6) },
    { label: "1", action: () => pushDigit(1) },
    { label: "2", action: () => pushDigit(2) },
    { label: "3", action: () => pushDigit(3) },
    { label: ",", action: () => undefined },
    { label: "0", action: () => pushDigit(0) },
    { label: "⌫", action: backspace },
  ];

  return (
    <div style={{ width: 240 }}>
      <Text
        className="tabular-nums"
        style={{ display: "block", textAlign: "right", fontSize: 24, marginBottom: 12 }}
      >
        R$ {formatCents(centavos)}
      </Text>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {keys.map((key) => (
          <Button key={key.label} onClick={key.action} disabled={key.label === ","}>
            {key.label}
          </Button>
        ))}
      </div>

      <Button type="primary" block onClick={onConfirm}>
        Confirmar
      </Button>
    </div>
  );
}
