"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Form, Modal, Spin, Typography, message } from "antd";
import { useState } from "react";

import { AttachmentMetadataForm, type AttachmentFormValues } from "@/components/transactions/attachment-metadata-form";
import { AttachmentsTable } from "@/components/transactions/attachments-table";
import { attachments } from "@/lib/api/attachments";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

const { Paragraph, Title } = Typography;

interface TransactionAttachmentsProps {
  transactionId: string;
}

function buildAttachmentsKey(transactionId: string) {
  return [...queryKeys.transaction(transactionId), "attachments"] as const;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return fallback;
}

export function TransactionAttachments({ transactionId }: TransactionAttachmentsProps) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<AttachmentFormValues>();
  const [formError, setFormError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const attachmentsQuery = useQuery({
    queryKey: buildAttachmentsKey(transactionId),
    queryFn: () => attachments.list(transactionId),
  });

  async function invalidateAttachments() {
    await queryClient.invalidateQueries({ queryKey: buildAttachmentsKey(transactionId) });
  }

  const addMutation = useMutation({
    mutationFn: (values: AttachmentFormValues) =>
      attachments.add(transactionId, {
        fileName: values.fileName.trim(),
        fileUrl: values.fileUrl.trim(),
        mimeType: values.mimeType.trim(),
        fileSize: values.fileSize,
      }),
    onSuccess: async () => {
      form.resetFields();
      setFormError(null);
      await invalidateAttachments();
      message.success("Anexo adicionado.");
    },
    onError: (error) =>
      setFormError(getErrorMessage(error, "Não foi possível adicionar o anexo.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => attachments.delete(transactionId, attachmentId),
    onSuccess: async () => {
      setDeletingId(null);
      await invalidateAttachments();
      message.success("Anexo excluído.");
    },
    onError: (error) => {
      setDeletingId(null);
      message.error(getErrorMessage(error, "Não foi possível remover o anexo."));
    },
  });

  async function handleRename(attachmentId: string, fileName: string) {
    setUpdatingId(attachmentId);
    try {
      await attachments.update(transactionId, attachmentId, { fileName });
      await invalidateAttachments();
      message.success("Nome atualizado.");
    } catch (error) {
      message.error(getErrorMessage(error, "Não foi possível renomear o anexo."));
      throw error;
    } finally {
      setUpdatingId(null);
    }
  }

  function confirmDelete(attachmentId: string) {
    Modal.confirm({
      title: "Excluir anexo",
      content: "O anexo será removido permanentemente.",
      okText: "Confirmar",
      okType: "danger",
      cancelText: "Voltar",
      onOk: () => {
        setDeletingId(attachmentId);
        return deleteMutation.mutateAsync(attachmentId);
      },
    });
  }

  return (
    <Card>
      <Title level={4}>Anexos</Title>
      <Paragraph type="secondary">
        Selecione um arquivo do computador para anexar o comprovante à transação.
      </Paragraph>

      {attachmentsQuery.isLoading ? (
        <Spin tip="Carregando anexos..." style={{ marginTop: 16 }}>
          <div style={{ minHeight: 48 }} />
        </Spin>
      ) : (
        <div style={{ marginTop: 16 }}>
          <AttachmentsTable
            attachments={attachmentsQuery.data ?? []}
            updatingId={updatingId}
            deletingId={deletingId}
            onRename={handleRename}
            onDelete={confirmDelete}
          />
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <AttachmentMetadataForm
          form={form}
          loading={addMutation.isPending}
          error={formError}
          enableUpload
          onFinish={(values) => addMutation.mutate(values)}
        />
      </div>
    </Card>
  );
}
