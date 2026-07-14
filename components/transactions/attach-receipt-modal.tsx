"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Modal, Typography, message } from "antd";
import { useState } from "react";

import {
  AttachmentMetadataForm,
  type AttachmentFormValues,
} from "@/components/transactions/attachment-metadata-form";
import { AttachmentsTable } from "@/components/transactions/attachments-table";
import { attachments } from "@/lib/api/attachments";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

const { Paragraph } = Typography;

interface AttachReceiptModalProps {
  open: boolean;
  transactionId: string | null;
  onClose: () => void;
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

function AttachReceiptModalBody({ transactionId }: { transactionId: string }) {
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
      message.success("Comprovante anexado.");
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
    <>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        Anexos já vinculados a esta transação. Você pode renomear ou excluir.
      </Paragraph>
      <AttachmentsTable
        attachments={attachmentsQuery.data ?? []}
        loading={attachmentsQuery.isLoading}
        updatingId={updatingId}
        deletingId={deletingId}
        onRename={handleRename}
        onDelete={confirmDelete}
      />

      <div style={{ marginTop: 24 }}>
        <Paragraph strong style={{ marginBottom: 8 }}>
          Adicionar comprovante
        </Paragraph>
        <AttachmentMetadataForm
          form={form}
          loading={addMutation.isPending}
          error={formError}
          submitLabel="Salvar comprovante"
          enableUpload
          onFinish={(values) => {
            setFormError(null);
            addMutation.mutate(values);
          }}
        />
      </div>
    </>
  );
}

export function AttachReceiptModal({ open, transactionId, onClose }: AttachReceiptModalProps) {
  return (
    <Modal
      title="Comprovantes"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={720}
    >
      {open && transactionId ? <AttachReceiptModalBody transactionId={transactionId} /> : null}
    </Modal>
  );
}
