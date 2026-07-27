"use client";

import { ColorPicker, Space, Typography } from "antd";
import type { AggregationColor } from "antd/es/color-picker/color";

import { DEFAULT_TAG_COLOR, TAG_COLOR_PRESETS, normalizeTagColor } from "@/lib/tags/constants";

interface TagColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function TagColorPicker({ value, onChange, disabled }: TagColorPickerProps) {
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <ColorPicker
        disabled={disabled}
        value={value}
        presets={[
          {
            label: "Sugestões",
            colors: [...TAG_COLOR_PRESETS],
          },
        ]}
        showText
        onChange={(color: AggregationColor) => onChange(normalizeTagColor(color.toHexString()))}
      />
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Padrão: {DEFAULT_TAG_COLOR}
      </Typography.Text>
    </Space>
  );
}
