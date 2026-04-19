import type { WorkforceRisk } from "../types"

interface Props {
  risk?: WorkforceRisk
}

export default function WorkforceRiskCards({ risk }: Props) {

  if (!risk) return null

  const ratio =
    risk.risikoKekurangan ?? 0

  const kategori =
    risk.kategori ?? "AMAN"

  let color = "success"

  if (kategori === "KRITIS")
    color = "danger"
  else if (kategori === "WASPADA")
    color = "warning"

  return (

    <div className="card shadow-sm">

      <div className="card-header">
        <h3 className="card-title">
          Workforce Risk
        </h3>
      </div>

      <div className="card-body text-center">

        <div className={`fw-bold fs-1 text-${color}`}>
          {ratio.toFixed(1)}%
        </div>

        <div className={`badge badge-light-${color} fs-7`}>
          {kategori}
        </div>

        <div className="mt-4 text-muted fs-7">
          Tahun Risiko Puncak
        </div>

        <div className="fw-bold fs-4">
          {risk.tahunRisikoPuncak ?? "-"}
        </div>

      </div>

    </div>

  )

}