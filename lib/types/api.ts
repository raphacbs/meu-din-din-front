export interface EnvelopeResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  links: Record<string, unknown>;
}

export interface ApiErrorBody {
  message?: string;
}

// --- Auth ---
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SessionResponse {
  userId: string;
  email: string;
}

// --- Tags ---
export interface TagSummary {
  name: string;
  usageCount: number;
  color: string;
}

export interface TagUpsertRequest {
  name: string;
  color: string;
}

export interface TagRenameRequest {
  from: string;
  to: string;
}

export interface TagRenameResponse {
  renamedCount: number;
  mergedCount: number;
}

// --- Enums ---
export type TransactionType = "DESPESA" | "RECEITA";

export type TransactionStatus =
  | "A_VENCER"
  | "VENCE_HOJE"
  | "ATRASADA"
  | "PAGO"
  | "PAGO_COM_ATRASO"
  | "CANCELADA";

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type TransactionGroupType = "PARCELAMENTO" | "RECORRENCIA";

export type RecurrenceSeriesStatus = "ATIVA" | "INATIVA";

// --- Transactions ---
export interface RecurrenceRequest {
  frequency: RecurrenceFrequency;
  intervalCount: number;
  nextOccurrenceDate: string;
  endDate?: string;
}

export interface InstallmentRequest {
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  startingInstallmentNumber?: number;
  originalInstallmentCount?: number;
}

export interface InstallmentGroupUpdateRequest {
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  description: string;
  tags?: string[];
}

export interface TransactionUpsertRequest {
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
  dueDate?: string;
  paymentDate?: string;
  tags?: string[];
  recurrence?: RecurrenceRequest;
  installment?: InstallmentRequest;
  status?: TransactionStatus;
}

export interface TransactionGroupResponse {
  id: string;
  type: TransactionGroupType;
  seriesStatus: RecurrenceSeriesStatus;
}

export interface TransactionResponse {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
  dueDate?: string;
  status: TransactionStatus;
  paymentDate?: string;
  canceledAt?: string;
  tags?: string[];
  group?: TransactionGroupResponse;
  installmentNumber?: number;
  installmentCount?: number;
}

export type TransactionBatchDeleteScope =
  | "SINGLE"
  | "RECURRENCE_FROM_HERE"
  | "INSTALLMENT_GROUP";

export interface TransactionBatchDeleteItemRequest {
  id: string;
  scope: TransactionBatchDeleteScope;
}

export interface TransactionBatchSettleRequest {
  ids: string[];
  paymentDate?: string | null;
}

export interface TransactionBatchDeleteRequest {
  items: TransactionBatchDeleteItemRequest[];
}

export interface TransactionBatchFailureResponse {
  id: string;
  message: string;
}

export interface TransactionBatchSettleResponse {
  succeeded: string[];
  failures: TransactionBatchFailureResponse[];
}

export interface TransactionBatchDeleteResponse {
  succeeded: string[];
  failures: TransactionBatchFailureResponse[];
}

// --- Invoice import ---
export type ImportBank = "INTER";

export type InvoiceEntryKind = "DEBIT" | "CREDIT";

export interface InvoiceParseItem {
  sourceIndex: number;
  description: string;
  amount: number;
  transactionDate: string;
  dueDate: string;
  type: "DESPESA";
  entryKind: InvoiceEntryKind;
  tags: string[];
}

export interface InvoiceParseResponse {
  dueDate: string;
  items: InvoiceParseItem[];
}

export interface BatchTransactionItem {
  description: string;
  amount: number;
  transactionDate: string;
  dueDate: string;
  type: "DESPESA";
  tags?: string[];
  installment?: InstallmentRequest;
  recurrence?: RecurrenceRequest;
}

export interface BatchCreateRequest {
  items: BatchTransactionItem[];
}

export interface BatchCreateFailure {
  index: number;
  message: string;
}

export interface BatchCreateResponse {
  created: TransactionResponse[];
  failures: BatchCreateFailure[];
}

export interface AttachmentRequest {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

export interface AttachmentUpdateRequest {
  fileName: string;
}

export interface AttachmentResponse {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

// --- User preferences ---
export interface UserPreferencesResponse {
  blockPastMonthMutations: boolean;
}

// --- Projections ---
export interface ProjectionResponse {
  projectedBalance: number;
  generatedAt: string;
}

// --- Analytics ---
export interface MonthlyTotals {
  month: number;
  expenseTotal: number;
  incomeTotal: number;
}

export interface TagAmount {
  tag: string;
  amount: number;
}

export interface TagRadarMonthly {
  month: number;
  tags: TagAmount[];
}

export interface TagRadar {
  yearTotals: TagAmount[];
  monthly: TagRadarMonthly[];
}

export interface ExpenseParetoItem {
  tag: string;
  amount: number;
  percent: number;
  cumulativePercent: number;
}

export interface DashboardAnalyticsResponse {
  year: number;
  availableYears: number[];
  monthlyTotals: MonthlyTotals[];
  tagRadar: TagRadar;
  expensePareto: ExpenseParetoItem[];
}
