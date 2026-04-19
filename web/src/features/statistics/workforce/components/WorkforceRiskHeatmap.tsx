import type { WorkforceOpd } from "../types"

interface Props {
  data?: WorkforceOpd[]
}

export default function WorkforceRiskHeatmap({ data = [] }: Props) {

  if (!data.length) return null

  const top = [...data]
    .map(opd => {

      const gap =
        Number(opd.gapAsn ?? 0)

      const pensiun =
        Number(opd.pensiun5Tahun ?? 0)

      const risiko =
        gap + pensiun

      return {
        ...opd,
        gap,
        pensiun,
        risiko
      }

    })
    .sort((a, b) => b.risiko - a.risiko)
    .slice(0, 12)

  return (

    <div className="card">

      <div className="card-header">

        <h3 className="card-title">
          Peta Risiko Kekurangan ASN per OPD
        </h3>

      </div>

      <div className="card-body">

        <div className="row g-4">

          {top.map(opd => {

            let color = "success"

            if (opd.risiko >= 15)
              color = "danger"
            else if (opd.risiko >= 5)
              color = "warning"

            return (

              <div
                key={opd.unorId}
                className="col-xl-3 col-md-4"
              >

                <div className={`card border-${color}`}>

                  <div className="card-body">

                    <div className="fw-bold fs-7 mb-2">
                      {opd.namaUnor}
                    </div>

                    <div className="text-muted fs-7">
                      Gap ASN : {opd.gap}
                    </div>

                    <div className="text-muted fs-7">
                      Pensiun 5 Tahun : {opd.pensiun}
                    </div>

                    <div className={`fw-bold text-${color} fs-4 mt-1`}>
                      Risiko : {opd.risiko}
                    </div>

                  </div>

                </div>

              </div>

            )

          })}

        </div>

      </div>

    </div>

  )

}