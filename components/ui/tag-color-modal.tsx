"use client";

import { Form, Input, Modal } from "antd";

import { TagColorPicker } from "@/components/ui/tag-color-picker";
import { DEFAULT_TAG_COLOR } from "@/lib/tags/constants";

interface TagColorModalProps {
  open: boolean;
  title: string;
  tagName: string;
  color: string;
  confirmLoading?: boolean;
  nameEditable?: boolean;
  onTagNameChange?: (name: string) => void;
  onColorChange: (color: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TagColorModal({
  open,
  title,
  tagName,
  color,
  confirmLoading,
  nameEditable = false,
  onTagNameChange,
  onColorChange,
  onCancel,
  onConfirm,
}: TagColorModalProps) {
  return (
    <Modal
      title={title}
      open={open}
      okText="Salvar"
      cancelText="Cancelar"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <Form layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="Nome da tag" required={nameEditable}>
          {nameEditable ? (
            <Input
              value={tagName}
              maxLength={128}
              placeholder="Nome da tag"
              onChange={(event) => onTagNameChange?.(event.target.value)}
            />
          ) : (
            <span>{tagName}</span>
          )}
        </Form.Item>
        <Form.Item label="Cor">
          <TagColorPicker value={color || DEFAULT_TAG_COLOR} onChange={onColorChange} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
