import type { WorkforceDashboard } from "../types"

interface Props {
  data?: WorkforceDashboard
}

export default function WorkforceRecommendationPanel({ data }: Props) {

  if (!data) return null

  const s = data.summary

  const kebutuhan =
    s.rekomendasiFormasi

  const perTahun =
    Math.ceil(kebutuhan / 5)

  return (

    <div className="card shadow-sm">

      <div className="card-header">

        <h3 className="card-title">
          Rekomendasi Rekrutmen ASN
        </h3>

      </div>

      <div className="card-body">

        <div className="row g-4">

          <div className="col-md-4">

            <div className="text-muted fs-7">
              Total Kebutuhan ASN
            </div>

            <div className="fw-bold fs-2 text-primary">
              {kebutuhan.toLocaleString()}
            </div>

          </div>

          <div className="col-md-4">

            <div className="text-muted fs-7">
              Rekomendasi Rekrutmen
            </div>

            <div className="fw-bold fs-2 text-success">
              {perTahun} / tahun
            </div>

          </div>

          <div className="col-md-4">

            <div className="text-muted fs-7">
              Periode Proyeksi
            </div>

            <div className="fw-bold fs-2">
              5 Tahun
            </div>

          </div>

        </div>

      </div>

    </div>

  )

}