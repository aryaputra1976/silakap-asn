interface Props {
  logs: {
    id: string
    action: string
    actor: string
    status: string
    createdAt: string
  }[]
}

export function TimelineList({ logs }: Props) {
  return (
    <div className="timeline">
      {logs.map((log) => (
        <div key={log.id} className="timeline-item">
          <div className="timeline-line w-40px"></div>

          <div className="timeline-icon symbol symbol-circle symbol-40px">
            <div className="symbol-label bg-light-success">
              <i className="ki-duotone ki-check fs-2 text-success"></i>
            </div>
          </div>

          <div className="timeline-content mb-10 mt-n1">
            <div className="pe-3 mb-5">
              <div className="fs-5 fw-semibold mb-2">
                {log.action}
              </div>

              <div className="d-flex align-items-center mt-1 fs-6">
                <div className="text-muted me-2">
                  oleh {log.actor}
                </div>
                <div className="badge badge-light-primary">
                  {log.status}
                </div>
              </div>

              <div className="text-muted fs-7 mt-2">
                {log.createdAt}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}