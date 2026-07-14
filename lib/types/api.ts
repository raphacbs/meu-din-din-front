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
