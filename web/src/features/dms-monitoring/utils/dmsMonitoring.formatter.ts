import type { DmsImportStatus } from "../types"

export function formatDmsDateTime(
  value?: string | null,
  locale = "id-ID",
): string {
  if (!value) {
    return "-"
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

export function formatDmsDate(
  value?: string | null,
  locale = "id-ID",
): string {
  if (!value) {
    return "-"
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(parsed)
}

export function formatDmsNumber(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-"
  }

  return new Intl.NumberFormat("id-ID").format(value)
}

export function formatDmsDecimal(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-"
  }

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getDmsStatusLabel(status: DmsImportStatus): string {
  switch (status) {
    case "DRAFT":
      return "Draft"
    case "IMPORTED":
      return "Imported"
    case "PARTIAL":
      return "Partial"
    case "FAILED":
      return "Failed"
    default:
      return status
  }
}

export function getDmsStatusVariant(
  status: DmsImportStatus,
): "secondary" | "success" | "warning" | "danger" {
  switch (status) {
    case "DRAFT":
      return "secondary"
    case "IMPORTED":
      return "success"
    case "PARTIAL":
      return "warning"
    case "FAILED":
      return "danger"
    default:
      return "secondary"
  }
}

export function formatDmsPercent(
  numerator: number,
  denominator: number,
): string {
  if (denominator <= 0) {
    return "0%"
  }

  const percent = (numerator / denominator) * 100
  return `${percent.toFixed(percent % 1 === 0 ? 0 : 1)}%`
}