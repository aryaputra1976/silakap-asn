import type { WorkflowMonitoringItem } from "../types"

interface Props {
  item: WorkflowMonitoringItem
}

export function WorkflowMonitoringCard({ item }: Props) {

  return (

    <div className="card">

      <div className="card-body">

        <h5 className="mb-3">
          {item.service}
        </h5>

        <div className="d-flex justify-content-between">

          <span>Total</span>
          <span>{item.total}</span>

        </div>

        <div className="d-flex justify-content-between">

          <span>Submitted</span>
          <span>{item.submitted}</span>

        </div>

        <div className="d-flex justify-content-between">

          <span>Verified</span>
          <span>{item.verified}</span>

        </div>

        <div className="d-flex justify-content-between">

          <span>Approved</span>
          <span>{item.approved}</span>

        </div>

      </div>

    </div>

  )

}