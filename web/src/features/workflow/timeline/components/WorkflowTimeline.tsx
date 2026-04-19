import type { WorkflowTimelineItem } from "../types"

interface Props {
  timeline: WorkflowTimelineItem[]
}

export function WorkflowTimeline({ timeline }: Props) {

  if (!timeline || timeline.length === 0) {
    return <div className="text-muted">Belum ada timeline</div>
  }

  return (

    <ul className="timeline">

      {timeline.map((item) => (

        <li key={item.id} className="mb-4">

          <div className="fw-bold">
            {item.status}
          </div>

          <div className="text-muted fs-7">
            {new Date(item.tanggal).toLocaleString("id-ID")}
          </div>

          {item.user && (
            <div>oleh {item.user}</div>
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