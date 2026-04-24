import ServiceStatusBadge from "@/features/services/base/components/ServiceStatusBadge"

import type { WorkflowMonitoringBottleneckItem } from "../types"

interface Props {
  item: WorkflowMonitoringBottleneckItem
}

export function WorkflowMonitoringCard({ item }: Props) {
  return (
    <div className="rounded-4 border border-gray-200 bg-white px-5 py-5 h-100 shadow-sm">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
            Status Aktif
          </div>
          <ServiceStatusBadge status={item.status} />
        </div>
        <div className="text-end">
          <div className="fw-bolder fs-1 text-gray-900">{item.total}</div>
          <div className="text-muted fs-8">usulan</div>
        </div>
      </div>

      <div className="text-muted fs-7 lh-lg">
        Jumlah usulan aktif yang saat ini berkumpul pada status ini. Gunakan untuk melihat
        titik antrean yang paling padat.
      </div>
    </div>
  )
}
