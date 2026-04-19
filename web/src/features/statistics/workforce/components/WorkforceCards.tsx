import type { WorkforceDashboard } from "../types"

interface Props {
  data?: WorkforceDashboard
}

export default function WorkforceCards({ data }: Props) {

  if (!data) return null

  const s = data.summary

  return (

    <div className="row g-5 mb-5">

      <div className="col-xl-3">

        <div className="card shadow-sm">

          <div className="card-body">

            <div className="text-gray-500">
              Total ASN
            </div>

            <div className="fs-2 fw-bold text-primary">
              {s.totalAsn.toLocaleString()}
            </div>

          </div>

        </div>

      </div>

      <div className="col-xl-3">

        <div className="card shadow-sm">

          <div className="card-body">

            <div className="text-gray-500">
              Kebutuhan ASN
            </div>

            <div className="fs-2 fw-bold text-purple-600">
              {s.totalKebutuhan.toLocaleString()}
            </div>

          </div>

        </div>

      </div>

      <div className="col-xl-3">

        <div className="card shadow-sm">

          <div className="card-body">

            <div className="text-gray-500">
              Gap ASN
            </div>

            <div className="fs-2 fw-bold text-danger">
              {s.totalGap.toLocaleString()}
            </div>

          </div>

        </div>

      </div>

      <div className="col-xl-3">

        <div className="card shadow-sm">

          <div className="card-body">

            <div className="text-gray-500">
              Pensiun 5 Tahun
            </div>

            <div className="fs-2 fw-bold text-warning">
              {s.pensiun5Tahun.toLocaleString()}
            </div>

          </div>

        </div>

      </div>

    </div>

  )

}