"use client";

import { InboxOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  DatePicker,
  Input,
  Modal,
  Segmented,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import { CurrencyInput } from "@/components/ui/currency-input";
import { TagSelect } from "@/components/ui/tag-select";
import { ApiError } from "@/lib/api/client";
import { transactionsImport } from "@/lib/api/transactions-import";
import { formatCurrency } from "@/lib/format/currency";
import { queryKeys } from "@/lib/query/keys";
import {
  buildImportBatchItem,
  type ImportBatchRow,
  type ImportLineMode,
} from "@/lib/transactions/import-batch";
import {
  formatInstallmentPreview,
  parseInstallmentFromDescription,
  remainingInstallmentCount,
} from "@/lib/transactions/installment-description";
import type {
  BatchTransactionItem,
  ImportBank,
  InvoiceParseItem,
} from "@/lib/types/api";

const { Text, Title } = Typography;
const { Dragger } = Upload;

const BANK_OPTIONS: Array<{ value: ImportBank; label: string }> = [
  { value: "INTER", label: "Banco Inter" },
];

type WizardStep = 0 | 1 | 2;

interface ImportRow extends ImportBatchRow {
  key: string;
  entryKind: InvoiceParseItem["entryKind"];
}

interface FailureSummary {
  description: string;
  message: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  return fallback;
}

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function mapItemsToRows(items: InvoiceParseItem[]): ImportRow[] {
  return items.map((item) => {
    const parsed = parseInstallmentFromDescription(item.description);

    return {
      key: String(item.sourceIndex),
      description: item.description,
      amount: item.amount,
      transactionDate: item.transactionDate,
      dueDate: item.dueDate,
      tags: item.tags ?? [],
      entryKind: item.entryKind,
      lineMode: parsed ? "installment" : "single",
      installmentCurrent: parsed?.current,
      installmentTotal: parsed?.total,
    };
  });
}

function modeLabel(mode: ImportLineMode): string {
  if (mode === "installment") {
    return "Parcelada";
  }
  if (mode === "recurring") {
    return "Recorrente";
  }
  return "Avulsa";
}

function modeTagColor(mode: ImportLineMode): string {
  if (mode === "installment") {
    return "blue";
  }
  if (mode === "recurring") {
    return "purple";
  }
  return "default";
}

interface InvoiceImportFlowProps {
  onClose: () => void;
  onImported: () => void;
}

function InvoiceImportFlow({ onClose, onImported }: InvoiceImportFlowProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<WizardStep>(0);
  const [file, setFile] = useState<File | null>(null);
  const [bank, setBank] = useState<ImportBank>("INTER");
  const [uploadError, setUploadError] = useState<string | undefined>();

  const [rows, setRows] = useState<ImportRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [refTransactionDate, setRefTransactionDate] = useState<dayjs.Dayjs | null>(
    null,
  );
  const [refDueDate, setRefDueDate] = useState<dayjs.Dayjs | null>(null);
  const [refTags, setRefTags] = useState<string[]>([]);
  const [failures, setFailures] = useState<FailureSummary[]>([]);
  const [saveError, setSaveError] = useState<string | undefined>();

  const parseMutation = useMutation({
    mutationFn: () => transactionsImport.parseInvoice({ file: file!, bank }),
    onSuccess: (data) => {
      const nextRows = mapItemsToRows(data.items);
      setRows(nextRows);
      setSelectedRowKeys(
        nextRows.filter((row) => row.entryKind === "DEBIT").map((row) => row.key),
      );
      setFailures([]);
      setSaveError(undefined);
      setRefTags([]);
      setStep(1);
    },
    onError: (error) => {
      setUploadError(
        getErrorMessage(error, "Não foi possível ler a fatura. Tente novamente."),
      );
    },
  });

  const batchMutation = useMutation({
    mutationFn: (items: BatchTransactionItem[]) =>
      transactionsImport.createBatch(items),
  });

  const targetRowKeys = useMemo(() => {
    if (selectedRowKeys.length > 0) {
      return new Set(selectedRowKeys.map((key) => String(key)));
    }
    return new Set(rows.map((row) => row.key));
  }, [selectedRowKeys, rows]);

  const selectedRows = useMemo(() => {
    const selectedKeys = new Set(selectedRowKeys.map((key) => String(key)));
    return rows.filter((row) => selectedKeys.has(row.key));
  }, [rows, selectedRowKeys]);

  const reviewSummary = useMemo(() => {
    let installment = 0;
    let recurring = 0;
    let single = 0;
    let totalAmount = 0;

    for (const row of selectedRows) {
      totalAmount += row.amount;
      if (row.lineMode === "installment") {
        installment += 1;
      } else if (row.lineMode === "recurring") {
        recurring += 1;
      } else {
        single += 1;
      }
    }

    return { installment, recurring, single, totalAmount, count: selectedRows.length };
  }, [selectedRows]);

  function updateRow(key: string, patch: Partial<ImportRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function handleDescriptionChange(key: string, description: string) {
    setRows((current) =>
      current.map((row) => {
        if (row.key !== key) {
          return row;
        }

        const parsed = parseInstallmentFromDescription(description);

        if (row.lineMode === "recurring") {
          return {
            ...row,
            description,
            installmentCurrent: parsed?.current,
            installmentTotal: parsed?.total,
          };
        }

        if (row.lineMode === "installment") {
          if (!parsed) {
            return {
              ...row,
              description,
              lineMode: "single",
              installmentCurrent: undefined,
              installmentTotal: undefined,
            };
          }

          return {
            ...row,
            description,
            installmentCurrent: parsed.current,
            installmentTotal: parsed.total,
          };
        }

        return {
          ...row,
          description,
          lineMode: parsed ? "installment" : "single",
          installmentCurrent: parsed?.current,
          installmentTotal: parsed?.total,
        };
      }),
    );
  }

  function setLineMode(key: string, mode: ImportLineMode) {
    setRows((current) =>
      current.map((row) => {
        if (row.key !== key) {
          return row;
        }

        if (mode === "installment") {
          const parsed =
            row.installmentCurrent !== undefined && row.installmentTotal !== undefined
              ? { current: row.installmentCurrent, total: row.installmentTotal }
              : parseInstallmentFromDescription(row.description);

          if (!parsed) {
            return row;
          }

          return {
            ...row,
            lineMode: "installment",
            installmentCurrent: parsed.current,
            installmentTotal: parsed.total,
          };
        }

        if (mode === "recurring") {
          return { ...row, lineMode: "recurring" };
        }

        return { ...row, lineMode: "single" };
      }),
    );
  }

  function handleParse() {
    if (!file) {
      setUploadError("Selecione o arquivo PDF da fatura.");
      return;
    }
    if (!bank) {
      setUploadError("Selecione o banco da fatura.");
      return;
    }
    setUploadError(undefined);
    parseMutation.mutate();
  }

  function applyTransactionDate() {
    if (!refTransactionDate) {
      return;
    }
    const value = refTransactionDate.format("YYYY-MM-DD");
    setRows((current) =>
      current.map((row) =>
        targetRowKeys.has(row.key) ? { ...row, transactionDate: value } : row,
      ),
    );
  }

  function applyDueDate() {
    if (!refDueDate) {
      return;
    }
    const value = refDueDate.format("YYYY-MM-DD");
    setRows((current) =>
      current.map((row) =>
        targetRowKeys.has(row.key) ? { ...row, dueDate: value } : row,
      ),
    );
  }

  function applyTags() {
    setRows((current) =>
      current.map((row) =>
        targetRowKeys.has(row.key) ? { ...row, tags: [...refTags] } : row,
      ),
    );
  }

  function goToReview() {
    if (selectedRowKeys.length === 0) {
      setSaveError("Selecione ao menos uma linha para continuar.");
      return;
    }

    const invalidInstallment = selectedRows.find(
      (row) =>
        row.lineMode === "installment" &&
        (!row.dueDate ||
          row.installmentCurrent === undefined ||
          row.installmentTotal === undefined ||
          remainingInstallmentCount(row.installmentCurrent, row.installmentTotal) < 2),
    );
    if (invalidInstallment) {
      setSaveError(
        "Linhas parceladas precisam de vencimento e descrição com parcela válida (ex.: 5 de 10).",
      );
      return;
    }

    const invalidRecurring = selectedRows.find(
      (row) => row.lineMode === "recurring" && !row.dueDate,
    );
    if (invalidRecurring) {
      setSaveError("Linhas recorrentes precisam de data de vencimento.");
      return;
    }

    setSaveError(undefined);
    setStep(2);
  }

  async function handleSave() {
    if (selectedRows.length === 0) {
      setSaveError("Selecione ao menos uma linha para salvar.");
      return;
    }

    setSaveError(undefined);

    const items: BatchTransactionItem[] = selectedRows.map((row) =>
      buildImportBatchItem(row),
    );

    try {
      const result = await batchMutation.mutateAsync(items);

      if (result.created.length > 0) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
          queryClient.invalidateQueries({ queryKey: queryKeys.projection }),
        ]);
      }

      if (result.failures.length === 0) {
        const installmentCreated = result.created.filter(
          (item) => item.group?.type === "PARCELAMENTO",
        ).length;
        const recurringCreated = result.created.filter(
          (item) => item.group?.type === "RECORRENCIA",
        ).length;

        const expectedInstallment = items.filter((item) => item.installment).length;
        const expectedRecurring = items.filter((item) => item.recurrence).length;

        if (
          (expectedInstallment > 0 && installmentCreated === 0) ||
          (expectedRecurring > 0 && recurringCreated === 0)
        ) {
          message.warning(
            "Transações criadas, mas a API não registrou parcelamento/recorrência. Reinicie o backend com a versão mais recente e tente novamente.",
          );
        } else {
          message.success(
            `${result.created.length} ${
              result.created.length === 1 ? "transação criada" : "transações criadas"
            }.`,
          );
        }

        setFailures([]);
        onImported();
        return;
      }

      const failedIndexes = new Set(result.failures.map((failure) => failure.index));
      const failedRows = selectedRows.filter((_, index) => failedIndexes.has(index));
      const failedKeys = new Set(failedRows.map((row) => row.key));
      const createdKeys = new Set(
        selectedRows
          .filter((_, index) => !failedIndexes.has(index))
          .map((row) => row.key),
      );

      setRows((current) => current.filter((row) => !createdKeys.has(row.key)));
      setSelectedRowKeys(Array.from(failedKeys));
      setFailures(
        result.failures.map((failure) => ({
          description: selectedRows[failure.index]?.description ?? `Linha ${failure.index + 1}`,
          message: failure.message,
        })),
      );
      setStep(1);
      message.warning(
        `${result.created.length} criada(s), ${result.failures.length} com falha. Revise e tente novamente.`,
      );
    } catch (error) {
      setSaveError(
        getErrorMessage(error, "Não foi possível salvar as transações."),
      );
    }
  }

  const configColumns: ColumnsType<ImportRow> = [
    {
      title: "Descrição",
      dataIndex: "description",
      width: 220,
      render: (_, row) => (
        <Input
          aria-label={`Descrição ${row.key}`}
          value={row.description}
          onChange={(event) => handleDescriptionChange(row.key, event.target.value)}
        />
      ),
    },
    {
      title: "Valor",
      dataIndex: "amount",
      width: 130,
      render: (_, row) => (
        <CurrencyInput
          value={row.amount}
          onChange={(value) => updateRow(row.key, { amount: value ?? 0 })}
        />
      ),
    },
    {
      title: "Data",
      dataIndex: "transactionDate",
      width: 150,
      render: (_, row) => (
        <DatePicker
          aria-label={`Data da transação ${row.key}`}
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          allowClear={false}
          value={row.transactionDate ? dayjs(row.transactionDate) : null}
          onChange={(value) =>
            updateRow(row.key, {
              transactionDate: value ? value.format("YYYY-MM-DD") : "",
            })
          }
        />
      ),
    },
    {
      title: "Vencimento",
      dataIndex: "dueDate",
      width: 150,
      render: (_, row) => (
        <DatePicker
          aria-label={`Vencimento ${row.key}`}
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          allowClear={false}
          value={row.dueDate ? dayjs(row.dueDate) : null}
          onChange={(value) =>
            updateRow(row.key, {
              dueDate: value ? value.format("YYYY-MM-DD") : "",
            })
          }
        />
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      width: 180,
      render: (_, row) => (
        <TagSelect
          value={row.tags}
          onChange={(value) => updateRow(row.key, { tags: value })}
        />
      ),
    },
    {
      title: "Tipo",
      dataIndex: "lineMode",
      width: 220,
      render: (_, row) => {
        const canInstallment =
          row.installmentCurrent !== undefined && row.installmentTotal !== undefined;
        const options: Array<{ label: string; value: ImportLineMode }> = [
          { label: "Avulsa", value: "single" },
        ];
        if (canInstallment) {
          options.push({ label: "Parcelada", value: "installment" });
        }
        options.push({ label: "Recorrente", value: "recurring" });

        return (
          <Space direction="vertical" size={4}>
            <Segmented
              size="small"
              aria-label={`Tipo ${row.key}`}
              value={row.lineMode}
              options={options}
              onChange={(value) => setLineMode(row.key, value as ImportLineMode)}
            />
            {canInstallment ? (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {formatInstallmentPreview({
                  current: row.installmentCurrent!,
                  total: row.installmentTotal!,
                })}
              </Text>
            ) : null}
          </Space>
        );
      },
    },
  ];

  const reviewColumns: ColumnsType<ImportRow> = [
    {
      title: "Descrição",
      dataIndex: "description",
      render: (value: string) => value,
    },
    {
      title: "Valor",
      dataIndex: "amount",
      width: 120,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Vencimento",
      dataIndex: "dueDate",
      width: 120,
      render: (value: string) =>
        value ? dayjs(value).format("DD/MM/YYYY") : "—",
    },
    {
      title: "Tags",
      dataIndex: "tags",
      width: 160,
      render: (tags: string[]) =>
        tags.length > 0 ? tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : "—",
    },
    {
      title: "Tipo",
      dataIndex: "lineMode",
      width: 180,
      render: (_: ImportLineMode, row) => (
        <Space direction="vertical" size={2}>
          <Tag color={modeTagColor(row.lineMode)}>{modeLabel(row.lineMode)}</Tag>
          {row.lineMode === "installment" &&
          row.installmentCurrent !== undefined &&
          row.installmentTotal !== undefined ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatInstallmentPreview({
                current: row.installmentCurrent,
                total: row.installmentTotal,
              })}
            </Text>
          ) : null}
          {row.lineMode === "recurring" ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mensal
            </Text>
          ) : null}
        </Space>
      ),
    },
  ];

  const uploadFileList: UploadFile[] = file
    ? [{ uid: "invoice", name: file.name, status: "done" }]
    : [];

  const targetLabel =
    selectedRowKeys.length > 0
      ? `${selectedRowKeys.length} selecionada(s)`
      : "todas as linhas";

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Steps
        current={step}
        items={[
          { title: "Arquivo" },
          { title: "Configurar" },
          { title: "Revisão" },
        ]}
      />

      {step === 0 ? (
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div>
            <Title level={5} style={{ marginBottom: 4 }}>
              Enviar fatura em PDF
            </Title>
            <Text type="secondary">
              Selecione o arquivo PDF e o banco para ler os lançamentos.
            </Text>
          </div>

          <div>
            <Text style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              Banco
            </Text>
            <Select<ImportBank>
              aria-label="Banco da fatura"
              style={{ width: "100%", maxWidth: 280 }}
              value={bank}
              options={BANK_OPTIONS}
              onChange={(value) => setBank(value)}
            />
          </div>

          <Dragger
            accept=".pdf,application/pdf"
            multiple={false}
            maxCount={1}
            fileList={uploadFileList}
            beforeUpload={(candidate) => {
              if (!isPdf(candidate)) {
                message.error("Envie um arquivo PDF válido.");
                return Upload.LIST_IGNORE;
              }
              setFile(candidate);
              setUploadError(undefined);
              return false;
            }}
            onRemove={() => {
              setFile(null);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined aria-hidden />
            </p>
            <p className="ant-upload-text">
              Clique ou arraste o PDF da fatura aqui
            </p>
            <p className="ant-upload-hint">Apenas arquivos PDF são aceitos.</p>
          </Dragger>

          {uploadError ? (
            <Alert type="error" showIcon message={uploadError} />
          ) : null}

          <Space style={{ justifyContent: "flex-end", width: "100%" }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              type="primary"
              loading={parseMutation.isPending}
              onClick={handleParse}
            >
              Continuar
            </Button>
          </Space>
        </Space>
      ) : null}

      {step === 1 ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Title level={5} style={{ marginBottom: 4 }}>
              Selecionar e configurar
            </Title>
            <Text type="secondary">
              Marque as linhas, ajuste tags/datas e defina se cada lançamento será
              avulso, parcelado ou recorrente.
            </Text>
          </div>

          <Space wrap align="end" size={12}>
            <div>
              <Text style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
                Data da transação (referência)
              </Text>
              <DatePicker
                aria-label="Data da transação de referência"
                format="DD/MM/YYYY"
                value={refTransactionDate}
                onChange={setRefTransactionDate}
              />
            </div>
            <Button onClick={applyTransactionDate} disabled={!refTransactionDate}>
              Aplicar data da transação
            </Button>
            <div>
              <Text style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
                Vencimento (referência)
              </Text>
              <DatePicker
                aria-label="Vencimento de referência"
                format="DD/MM/YYYY"
                value={refDueDate}
                onChange={setRefDueDate}
              />
            </div>
            <Button onClick={applyDueDate} disabled={!refDueDate}>
              Aplicar vencimento
            </Button>
            <div style={{ minWidth: 220 }}>
              <Text style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
                Tags (referência)
              </Text>
              <TagSelect value={refTags} onChange={setRefTags} />
            </div>
            <Button onClick={applyTags}>Aplicar tags</Button>
          </Space>

          <Text type="secondary" style={{ fontSize: 12 }}>
            As referências são aplicadas a {targetLabel}.
          </Text>

          <Table<ImportRow>
            rowKey="key"
            size="small"
            columns={configColumns}
            dataSource={rows}
            pagination={false}
            scroll={{ x: "max-content", y: 360 }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
          />

          {failures.length > 0 ? (
            <Alert
              type="warning"
              showIcon
              message="Algumas linhas falharam"
              description={
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {failures.map((failure, index) => (
                    <li key={`${failure.description}-${index}`}>
                      {failure.description}: {failure.message}
                    </li>
                  ))}
                </ul>
              }
            />
          ) : null}

          {saveError ? <Alert type="error" showIcon message={saveError} /> : null}

          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Button onClick={() => setStep(0)}>Voltar</Button>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0}
              onClick={goToReview}
            >
              Revisar ({selectedRowKeys.length})
            </Button>
          </Space>
        </Space>
      ) : null}

      {step === 2 ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Title level={5} style={{ marginBottom: 4 }}>
              Revisar antes de salvar
            </Title>
            <Text type="secondary">
              Confira o tipo de cada lançamento. Parceladas e recorrentes serão
              criadas com o respectivo grupo no Meu mês.
            </Text>
          </div>

          <Alert
            type="info"
            showIcon
            message={`${reviewSummary.count} lançamento(s) · ${formatCurrency(reviewSummary.totalAmount)}`}
            description={`${reviewSummary.single} avulsa(s), ${reviewSummary.installment} parcelada(s), ${reviewSummary.recurring} recorrente(s).`}
          />

          <Table<ImportRow>
            rowKey="key"
            size="small"
            columns={reviewColumns}
            dataSource={selectedRows}
            pagination={false}
            scroll={{ y: 360 }}
          />

          {saveError ? <Alert type="error" showIcon message={saveError} /> : null}

          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Button onClick={() => setStep(1)}>Voltar</Button>
            <Button
              type="primary"
              loading={batchMutation.isPending}
              onClick={handleSave}
            >
              Criar no Meu mês
            </Button>
          </Space>
        </Space>
      ) : null}
    </Space>
  );
}

interface InvoiceImportDrawerProps {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
}

export function InvoiceImportDrawer({
  open,
  onClose,
  onImported,
}: InvoiceImportDrawerProps) {
  return (
    <Modal
      title="Importar fatura"
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(1120px, 96vw)"
      destroyOnHidden
      styles={{ body: { paddingTop: 12 } }}
    >
      {open ? (
        <InvoiceImportFlow
          onClose={onClose}
          onImported={() => {
            onImported?.();
            onClose();
          }}
        />
      ) : null}
    </Modal>
  );
}
