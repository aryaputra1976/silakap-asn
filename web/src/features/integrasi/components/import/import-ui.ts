export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function normalizeStatus(status: string): string {
  return String(status).toUpperCase()
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    VALIDATED: "Tervalidasi",
    VALIDATED_WITH_ERROR: "Validasi Error",
    IMPORTED: "Sudah Diimport",
    FAILED: "Gagal",
    CANCELLED: "Dibatalkan",
  }

  return map[normalizeStatus(status)] ?? status
}