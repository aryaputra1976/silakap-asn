interface Props {
  status: string
}

export function StatusBadge({ status }: Props) {
  const map: Record<string, string> = {
    DRAFT: "badge badge-light-secondary",
    SUBMITTED: "badge badge-light-warning",
    VERIFIED: "badge badge-light-info",
    RETURNED: "badge badge-light-danger",
    APPROVED: "badge badge-light-success",
    REJECTED: "badge badge-light-dark",
  }

  const labelMap: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Diajukan",
    VERIFIED: "Terverifikasi",
    RETURNED: "Dikembalikan",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
  }

  return (
    <span className={map[status] ?? "badge badge-light"}>
      {labelMap[status] ?? status}
    </span>
  )
}