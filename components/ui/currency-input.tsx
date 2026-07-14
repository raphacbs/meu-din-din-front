"use client";

import { InputNumber, Popover } from "antd";
import { useState } from "react";

import { CurrencyKeyboard } from "@/components/ui/currency-keyboard";
import { formatBrazilianCurrencyInput } from "@/lib/format/currency-input";

interface CurrencyInputProps {
  id?: string;
  value?: number;
  onChange?: (value: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  placeholder = "0,00",
  disabled,
}: CurrencyInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      trigger="click"
      placement="bottomLeft"
      onOpenChange={setOpen}
      content={
        <CurrencyKeyboard
          value={value}
          onChange={onChange}
          onConfirm={() => setOpen(false)}
        />
      }
    >
      <InputNumber
        id={id}
        style={{ width: "100%" }}
        value={value}
        disabled={disabled}
        readOnly={open}
        placeholder={placeholder}
        prefix="R$"
        decimalSeparator=","
        formatter={(nextValue) =>
          nextValue !== undefined && nextValue !== null
            ? formatBrazilianCurrencyInput(Number(nextValue))
            : ""
        }
        parser={(displayValue) => {
          if (!displayValue) {
            return 0;
          }

          const normalized = displayValue.replace(/\./g, "").replace(",", ".");
          const parsed = Number(normalized);
          return Number.isFinite(parsed) ? parsed : 0;
        }}
        onChange={(nextValue) => {
          onChange?.(nextValue ?? undefined);
        }}
      />
    </Popover>
  );
}
