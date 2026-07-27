import dayjs, { type Dayjs } from "dayjs";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Desabilita datas posteriores ao dia civil atual (para DatePicker). */
export function disableFutureDates(current: Dayjs): boolean {
  return current.isAfter(dayjs(), "day");
}

export function formatDate(isoDate: string): string {
  const datePart = isoDate.split("T")[0];

  if (DATE_ONLY_PATTERN.test(datePart)) {
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatDateTime(isoDateTime: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDateTime));
}

export function formatRelativeTime(isoDateTime: string, now = new Date()): string {
  const target = new Date(isoDateTime);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "agora";
  }

  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `há ${diffHours} h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `há ${diffDays} dia${diffDays === 1 ? "" : "s"}`;
}
