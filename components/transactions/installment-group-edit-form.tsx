"use client";

import {
  Alert,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  List,
  Row,
  Typography,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { CurrencyInput } from "@/components/ui/currency-input";
import { TagSelect } from "@/components/ui/tag-select";
import {
  CurrencyCell,
  TransactionStatusBadge,
} from "@/components/ui/transaction-data";
import { formatDate } from "@/lib/format/date";
import {
  buildInstallmentGroupImpact,
  type InstallmentGroupDraft,
} from "@/lib/transactions/installment-group-impact";
import type { InstallmentGroupUpdateRequest, TransactionResponse } from "@/lib/types/api";

const { Text } = Typography;

interface InstallmentGroupFormValues {
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: Dayjs;
  description: string;
  tags?: string[];
}

interface InstallmentGroupEditFormProps {
  installments: TransactionResponse[];
  submitLabel: string;
  submittingLabel: string;
  formError?: string;
  onSubmit: (payload: InstallmentGroupUpdateRequest) => Promise<void>;
  onConfirmStructuralImpact: (messages: string[]) => Promise<boolean>;
}

export function buildBaselineFromInstallments(
  installments: TransactionResponse[],
): InstallmentGroupDraft {
  const ordered = [...installments].sort(
    (a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0),
  );
  const first = ordered[0];

  return {
    installmentCount: first?.installmentCount ?? ordered.length,
    installmentAmount: first?.amount ?? 0,
    firstDueDate: first?.dueDate ?? first?.transactionDate ?? "",
    description: first?.description ?? "",
    tags: first?.tags,
  };
}

export function InstallmentGroupEditForm({
  installments,
  submitLabel,
  submittingLabel,
  formError,
  onSubmit,
  onConfirmStructuralImpact,
}: InstallmentGroupEditFormProps) {
  const [form] = Form.useForm<InstallmentGroupFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const baseline = useMemo(() => buildBaselineFromInstallments(installments), [installments]);
  const watchedValues = Form.useWatch([], form);

  const draft: InstallmentGroupDraft | null = watchedValues?.firstDueDate
    ? {
        installmentCount: Number(watchedValues.installmentCount),
        installmentAmount: Number(watchedValues.installmentAmount),
        firstDueDate: dayjs(watchedValues.firstDueDate).format("YYYY-MM-DD"),
        description: watchedValues.description ?? "",
        tags: watchedValues.tags,
      }
    : null;

  const impact = draft ? buildInstallmentGroupImpact(baseline, draft) : null;

  useEffect(() => {
    form.setFieldsValue({
      installmentCount: baseline.installmentCount,
      installmentAmount: baseline.installmentAmount,
      firstDueDate: baseline.firstDueDate ? dayjs(baseline.firstDueDate) : undefined,
      description: baseline.description,
      tags: baseline.tags ?? [],
    });
  }, [baseline, form]);

  const orderedInstallments = useMemo(
    () =>
      [...installments].sort(
        (a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0),
      ),
    [installments],
  );

  async function handleFinish(values: InstallmentGroupFormValues) {
    const nextDraft: InstallmentGroupDraft = {
      installmentCount: Number(values.installmentCount),
      installmentAmount: Number(values.installmentAmount),
      firstDueDate: values.firstDueDate.format("YYYY-MM-DD"),
      description: values.description.trim(),
      tags: values.tags,
    };
    const nextImpact = buildInstallmentGroupImpact(baseline, nextDraft);

    if (nextImpact.hasStructuralImpact) {
      const confirmed = await onConfirmStructuralImpact(nextImpact.messages);
      if (!confirmed) {
        return;
      }
    }

    const payload: InstallmentGroupUpdateRequest = {
      installmentCount: nextDraft.installmentCount,
      installmentAmount: nextDraft.installmentAmount,
      firstDueDate: nextDraft.firstDueDate,
      description: nextDraft.description,
      tags: nextDraft.tags,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
      <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
        Parcelas do grupo
      </Text>
      <List
        size="small"
        bordered
        style={{ marginBottom: 16, maxHeight: 220, overflow: "auto" }}
        dataSource={orderedInstallments}
        renderItem={(item) => (
          <List.Item
            style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
          >
            <span>
              #{item.installmentNumber ?? "—"} · {item.dueDate ? formatDate(item.dueDate) : "—"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <CurrencyCell amount={item.amount} type={item.type} />
              <TransactionStatusBadge status={item.status} />
            </span>
          </List.Item>
        )}
      />

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="installmentCount"
            label="Parcelas"
            rules={[{ required: true, message: "Informe ao menos 2 parcelas." }]}
          >
            <InputNumber min={2} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="installmentAmount"
            label="Valor da parcela"
            rules={[{ required: true, message: "Informe o valor da parcela." }]}
          >
            <CurrencyInput />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="firstDueDate"
            label="Primeiro vencimento"
            rules={[{ required: true, message: "Informe a data da primeira parcela." }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Descrição"
        rules={[{ required: true, message: "Informe uma descrição." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="tags" label="Tags">
        <TagSelect />
      </Form.Item>

      {impact && impact.messages.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Impacto no parcelamento"
          description={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {impact.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          }
        />
      ) : null}

      {formError ? (
        <Alert type="error" message={formError} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      <Button type="primary" htmlType="submit" loading={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </Form>
  );
}
