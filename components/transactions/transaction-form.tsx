"use client";

import {
  Alert,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { CurrencyInput } from "@/components/ui/currency-input";
import { disableFutureDates } from "@/lib/format/date";
import { TagSelect } from "@/components/ui/tag-select";
import {
  buildTransactionPayload,
  defaultTransactionFormState,
  hasTransactionFormErrors,
  mapAntdFormValuesToState,
  validateTransactionForm,
  type TransactionAntdFormValues,
  type TransactionFormState,
  type TransactionMode,
} from "@/lib/transactions/form";
import type { RecurrenceFrequency, TransactionType } from "@/lib/types/api";

interface TransactionFormProps {
  initialValues?: Partial<TransactionAntdFormValues>;
  submitLabel: string;
  submittingLabel: string;
  formError?: string;
  disableModeSwitch?: boolean;
  onSubmit: (payload: ReturnType<typeof buildTransactionPayload>) => Promise<void>;
}

const MODE_OPTIONS = [
  { value: "single" as const, label: "Avulsa" },
  { value: "installment" as const, label: "Parcelada" },
  { value: "recurring" as const, label: "Recorrente" },
];

const FREQUENCY_OPTIONS: Array<{ value: RecurrenceFrequency; label: string }> = [
  { value: "DAILY", label: "Diária" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
];

function getDefaultAntdValues(): TransactionAntdFormValues {
  const state = defaultTransactionFormState;

  return {
    mode: state.mode,
    type: state.type,
    description: state.description,
    transactionDate: dayjs(),
    frequency: state.frequency,
    intervalCount: Number(state.intervalCount),
    tags: [],
  };
}

export function TransactionForm({
  initialValues,
  submitLabel,
  submittingLabel,
  formError,
  disableModeSwitch = false,
  onSubmit,
}: TransactionFormProps) {
  const [form] = Form.useForm<TransactionAntdFormValues>();
  const [validationError, setValidationError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mergedInitialValues = useMemo(
    () => ({ ...getDefaultAntdValues(), ...initialValues }),
    [initialValues],
  );
  const watchedMode = Form.useWatch("mode", form);
  const mode = watchedMode ?? mergedInitialValues.mode ?? "single";

  useEffect(() => {
    form.setFieldsValue(mergedInitialValues);
  }, [form, mergedInitialValues]);

  async function handleFinish(values: TransactionAntdFormValues) {
    const state: TransactionFormState = mapAntdFormValuesToState(values);
    const errors = validateTransactionForm(state);

    if (hasTransactionFormErrors(errors)) {
      const errorMessages = Object.values(errors).filter(Boolean);
      setValidationError(errorMessages.join(" "));
      return;
    }

    const payload = buildTransactionPayload(state);
    if (!payload) {
      setValidationError("Revise os valores informados antes de enviar.");
      return;
    }

    setValidationError(undefined);
    setIsSubmitting(true);

    try {
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={mergedInitialValues}
      onFinish={handleFinish}
      requiredMark={false}
    >
      {disableModeSwitch ? (
        <Form.Item name="mode" hidden>
          <Input />
        </Form.Item>
      ) : (
        <Form.Item name="mode" label="Modo da transação">
          <Segmented
            options={MODE_OPTIONS}
            onChange={(nextMode) => form.setFieldValue("mode", nextMode as TransactionMode)}
          />
        </Form.Item>
      )}

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "DESPESA", label: "Despesa" },
                { value: "RECEITA", label: "Receita" },
              ]}
            />
          </Form.Item>
        </Col>

        {mode === "single" || mode === "recurring" ? (
          <Col xs={24} md={12}>
            <Form.Item
              name="amount"
              label="Valor"
              rules={[{ required: true, message: "Informe o valor da transação." }]}
            >
              <CurrencyInput />
            </Form.Item>
          </Col>
        ) : null}
      </Row>

      <Form.Item
        name="description"
        label="Descrição"
        rules={[{ required: true, message: "Informe uma descrição." }]}
      >
        <Input />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="transactionDate"
            label="Data da transação"
            rules={[{ required: true, message: "Informe a data da transação." }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              disabledDate={mode === "single" ? disableFutureDates : undefined}
            />
          </Form.Item>
        </Col>

        {mode === "single" || mode === "recurring" ? (
          <Col xs={24} md={8}>
            <Form.Item
              name="dueDate"
              label="Vencimento"
              rules={[
                {
                  required: true,
                  message:
                    mode === "recurring"
                      ? "Informe o vencimento da recorrência."
                      : "Informe a data de vencimento.",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        ) : null}

        {mode === "single" ? (
          <Col xs={24} md={8}>
            <Form.Item name="paymentDate" label="Pagamento">
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabledDate={disableFutureDates}
              />
            </Form.Item>
          </Col>
        ) : null}
      </Row>

      {mode === "installment" ? (
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
      ) : null}

      {mode === "recurring" ? (
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Form.Item name="frequency" label="Frequência" rules={[{ required: true }]}>
              <Select options={FREQUENCY_OPTIONS} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="intervalCount"
              label="Intervalo"
              rules={[{ required: true, message: "Informe um intervalo válido." }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="nextOccurrenceDate"
              label="Próxima ocorrência"
              rules={[{ required: true, message: "Informe a próxima ocorrência." }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="endDate" label="Fim (opcional)">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
      ) : null}

      <Form.Item name="tags" label="Tags">
        <TagSelect />
      </Form.Item>

      {formError || validationError ? (
        <Alert type="error" message={formError ?? validationError} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      <Button type="primary" htmlType="submit" loading={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </Form>
  );
}
