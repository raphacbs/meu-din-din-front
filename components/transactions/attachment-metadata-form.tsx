"use client";

import { UploadOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, InputNumber, Upload, message } from "antd";
import type { FormInstance } from "antd/es/form";
import type { UploadProps } from "antd/es/upload";

export interface AttachmentFormValues {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

interface AttachmentMetadataFormProps {
  form: FormInstance<AttachmentFormValues>;
  onFinish: (values: AttachmentFormValues) => void;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  enableUpload?: boolean;
}

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Não foi possível ler o arquivo."));
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export function AttachmentMetadataForm({
  form,
  onFinish,
  loading = false,
  error = null,
  submitLabel = "Adicionar anexo",
  enableUpload = false,
}: AttachmentMetadataFormProps) {
  const handleBeforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      message.error("O arquivo deve ter no máximo 2 MB.");
      return Upload.LIST_IGNORE;
    }

    try {
      const fileUrl = await readFileAsDataUrl(file);
      form.setFieldsValue({
        fileName: file.name,
        fileUrl,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
      message.success(`Arquivo "${file.name}" pronto para anexar.`);
    } catch {
      message.error("Não foi possível carregar o arquivo.");
    }

    return Upload.LIST_IGNORE;
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {enableUpload ? (
        <Form.Item label="Arquivo">
          <Upload
            accept="image/*,.pdf,.png,.jpg,.jpeg,.webp"
            maxCount={1}
            beforeUpload={handleBeforeUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Selecionar arquivo</Button>
          </Upload>
          <div style={{ marginTop: 8, color: "rgba(23, 33, 27, 0.65)", fontSize: 12 }}>
            Envie um comprovante (até 2 MB). Nome, tipo e tamanho são preenchidos automaticamente.
          </div>
        </Form.Item>
      ) : null}

      <Form.Item
        name="fileName"
        label="Nome do arquivo"
        rules={[{ required: true, message: "Informe o nome do arquivo." }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="fileUrl"
        label="URL"
        rules={[{ required: true, message: "Informe a URL ou faça upload do arquivo." }]}
        hidden={enableUpload}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="mimeType"
        label="MIME type"
        rules={[{ required: true, message: "Informe o MIME type." }]}
        hidden={enableUpload}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="fileSize"
        label="Tamanho (bytes)"
        rules={[{ required: true, message: "Informe o tamanho do arquivo." }]}
        hidden={enableUpload}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}

      <Button type="primary" htmlType="submit" loading={loading}>
        {submitLabel}
      </Button>
    </Form>
  );
}
