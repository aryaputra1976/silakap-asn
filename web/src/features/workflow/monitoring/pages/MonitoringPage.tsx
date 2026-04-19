import { useState } from "react"
import { WorkflowMonitoringCard } from "../components/WorkflowMonitoringCard"

export default function MonitoringPage() {

  const [items] = useState([])

  return (

    <div className="row g-5">

      {items.length === 0 && (
        <div className="text-muted">
          Belum ada data monitoring
        </div>
      )}

      {items.map((item: any, i: number) => (

        <div className="col-md-4" key={i}>

          <WorkflowMonitoringCard item={item} />

        </div>

      ))}

    </div>

  )

}