import React from "react"
import { ServiceStatus } from "../types/service.types"

interface Props {
  status: ServiceStatus
}

export default function ServiceStatusBadge({ status }: Props) {

  const map: Record<ServiceStatus, string> = {

    DRAFT: "badge badge-light",

    SUBMITTED: "badge badge-primary",

    VERIFIED: "badge badge-info",

    RETURNED: "badge badge-warning",

    APPROVED: "badge badge-success",

    REJECTED: "badge badge-danger",

    SYNCED_SIASN: "badge badge-success",

    FAILED_SIASN: "badge badge-danger",

    COMPLETED: "badge badge-success",

  }

  const label: Record<ServiceStatus, string> = {

    DRAFT: "Draft",

    SUBMITTED: "Diajukan",

    VERIFIED: "Diverifikasi",

    RETURNED: "Dikembalikan",

    APPROVED: "Disetujui",

    REJECTED: "Ditolak",

    SYNCED_SIASN: "Tersinkron SIASN",

    FAILED_SIASN: "Gagal Sync SIASN",

    COMPLETED: "Selesai",

  }

  return (
    <span className={map[status]}>
      {label[status]}
    </span>
  )
}
