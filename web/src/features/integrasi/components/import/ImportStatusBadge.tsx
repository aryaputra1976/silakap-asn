const STATUS_CLASS: Record<string, string> = {
  DRAFT: "badge-light-dark",
  VALIDATING: "badge-light-warning",
  VALIDATED: "badge-light-primary",
  VALIDATED_WITH_ERROR: "badge-light-warning",
  COMMITTING: "badge-light-info",
  IMPORTED: "badge-light-success",
  FAILED: "badge-light-danger",
  CANCELLED: "badge-light-dark",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  VALIDATING: "Validasi Berjalan",
  VALIDATED: "Tervalidasi",
  VALIDATED_WITH_ERROR: "Validasi Error",
  COMMITTING: "Commit Berjalan",
  IMPORTED: "Sudah Diimport",
  FAILED: "Gagal",
  CANCELLED: "Dibatalkan",
}

export function ImportStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase()
  const badgeClass = STATUS_CLASS[normalizedStatus] ?? "badge-light-dark"
  const label = STATUS_LABEL[normalizedStatus] ?? normalizedStatus.replace(/_/g, " ")

  return <span className={`badge ${badgeClass}`}>{label}</span>
}