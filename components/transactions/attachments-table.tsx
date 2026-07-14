"use client";

import { DeleteOutlined, DownloadOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { downloadAttachmentFile } from "@/lib/attachments/download";
import { formatFileSize } from "@/lib/format/file-size";
import type { AttachmentResponse } from "@/lib/types/api";

const { Text } = Typography;

interface AttachmentsTableProps {
  attachments: AttachmentResponse[];
  loading?: boolean;
  updatingId?: string | null;
  deletingId?: string | null;
  onRename: (attachmentId: string, fileName: string) => Promise<void> | void;
  onDelete: (attachmentId: string) => void;
}

export function AttachmentsTable({
  attachments: items,
  loading = false,
  updatingId = null,
  deletingId = null,
  onRename,
  onDelete,
}: AttachmentsTableProps) {
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  function draftName(attachment: AttachmentResponse): string {
    return draftNames[attachment.id] ?? attachment.fileName;
  }

  function isDirty(attachment: AttachmentResponse): boolean {
    return draftName(attachment).trim() !== attachment.fileName;
  }

  async function handleSave(attachment: AttachmentResponse) {
    const nextName = draftName(attachment).trim();
    if (!nextName) {
      message.error("Informe o nome do arquivo.");
      return;
    }
    await onRename(attachment.id, nextName);
    setDraftNames((current) => {
      const next = { ...current };
      delete next[attachment.id];
      return next;
    });
  }

  async function handleDownload(attachment: AttachmentResponse) {
    setDownloadingId(attachment.id);
    try {
      await downloadAttachmentFile(attachment.fileUrl, attachment.fileName);
    } catch {
      message.error("Não foi possível baixar o arquivo.");
    } finally {
      setDownloadingId(null);
    }
  }

  const columns: ColumnsType<AttachmentResponse> = [
    {
      title: "Nome",
      key: "fileName",
      render: (_, attachment) => (
        <Input
          value={draftName(attachment)}
          aria-label={`Nome do anexo ${attachment.fileName}`}
          onChange={(event) =>
            setDraftNames((current) => ({
              ...current,
              [attachment.id]: event.target.value,
            }))
          }
        />
      ),
    },
    {
      title: "Tipo",
      dataIndex: "mimeType",
      key: "mimeType",
      width: 140,
      render: (mimeType: string) => <Text type="secondary">{mimeType}</Text>,
    },
    {
      title: "Tamanho",
      key: "fileSize",
      width: 100,
      render: (_, attachment) => formatFileSize(attachment.fileSize),
    },
    {
      title: "Arquivo",
      key: "fileUrl",
      width: 110,
      render: (_, attachment) => (
        <Button
          type="link"
          size="small"
          icon={<DownloadOutlined />}
          loading={downloadingId === attachment.id}
          onClick={() => void handleDownload(attachment)}
          aria-label={`Baixar ${attachment.fileName}`}
          style={{ paddingInline: 0 }}
        >
          Baixar
        </Button>
      ),
    },
    {
      title: "Ações",
      key: "actions",
      width: 160,
      render: (_, attachment) => (
        <Space size={4}>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<SaveOutlined />}
            disabled={!isDirty(attachment)}
            loading={updatingId === attachment.id}
            onClick={() => void handleSave(attachment)}
            aria-label={`Salvar nome de ${attachment.fileName}`}
          >
            Salvar
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={deletingId === attachment.id}
            onClick={() => onDelete(attachment.id)}
            aria-label={`Excluir ${attachment.fileName}`}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      size="small"
      loading={loading}
      pagination={false}
      dataSource={items}
      columns={columns}
      locale={{ emptyText: "Nenhum anexo cadastrado." }}
      scroll={{ x: true }}
    />
  );
}
