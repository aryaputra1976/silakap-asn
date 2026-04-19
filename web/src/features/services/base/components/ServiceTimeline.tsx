import React from "react"
import type { ServiceTimeline as ServiceTimelineType } from "../types/service.types"

interface Props {
  timeline: ServiceTimelineType[]
}

function formatTanggal(date: string) {
  return new Date(date).toLocaleString("id-ID")
}

export default function ServiceTimeline({ timeline = [] }: Props) {

  if (timeline.length === 0) {
    return (
      <div className="text-muted">
        Belum ada proses
      </div>
    )
  }

  return (

    <ul className="timeline">

      {timeline.map((item, i) => (

        <li key={i} className="mb-4">

          <div className="fw-bold">
            {item.status}
          </div>

          <div className="text-muted fs-7">
            {formatTanggal(item.tanggal)}
          </div>

          {item.user && (
            <div className="mt-1">
              oleh {item.user}
            </div>
          )}

          {item.keterangan && (
            <div className="text-muted">
              {item.keterangan}
            </div>
          )}

        </li>

      ))}

    </ul>

  )
}