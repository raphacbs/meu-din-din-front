"use client";

import { Select } from "antd";

import { useTagOptions } from "@/lib/transactions/use-tag-options";

interface TagSelectProps {
  id?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

export function TagSelect({ id, value, onChange, disabled }: TagSelectProps) {
  const options = useTagOptions();

  return (
    <Select
      id={id}
      mode="tags"
      style={{ width: "100%" }}
      placeholder="mercado, fixo, trabalho"
      value={value}
      disabled={disabled}
      options={options.map((tag) => ({ value: tag, label: tag }))}
      onChange={(nextValue) => onChange?.(nextValue)}
    />
  );
}
