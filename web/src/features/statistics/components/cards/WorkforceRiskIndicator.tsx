type RetirementRow = {
  tahun: string
  jumlah: number
}

type OpdRow = {
  opd: string
  total: number
}

interface Props {
  prediction: RetirementRow[]
  byOpd: OpdRow[]
  totalAsn: number
}

export default function WorkforceRiskIndicator({
  prediction,
  byOpd,
  totalAsn
}: Props) {

  if (!prediction || prediction.length === 0) return null

  const totalRetirement =
    prediction.reduce((a, b) => a + b.jumlah, 0)

  const percent =
    ((totalRetirement / totalAsn) * 100).toFixed(1)

  const topOpd =
    [...byOpd].sort((a, b) => b.total - a.total)[0]

  const maxYear =
    prediction.reduce((a, b) =>
      b.jumlah > a.jumlah ? b : a
    )

  return (

    <div className="row g-5">

      {/* RISIKO ASN */}

      <div className="col-md-4">

        <div className="card p-5">

          <div className="text-gray-500 fs-7">
            Risiko Kekurangan ASN
          </div>

          <div className="fs-2hx fw-bold text-danger">
            {percent}%
          </div>

          <div className="text-gray-600 fs-7">
            ASN pensiun dalam 5 tahun
          </div>

        </div>

      </div>

      {/* OPD TERTINGGI */}

      <div className="col-md-4">

        <div className="card p-5">

          <div className="text-gray-500 fs-7">
            OPD Pensiun Tertinggi
          </div>

          <div className="fs-4 fw-bold">
            {topOpd?.opd}
          </div>

          <div className="text-danger fw-bold">
            {topOpd?.total} ASN
          </div>

        </div>

      </div>

      {/* TAHUN RISIKO */}

      <div className="col-md-4">

        <div className="card p-5">

          <div className="text-gray-500 fs-7">
            Tahun Puncak Pensiun
          </div>

          <div className="fs-2hx fw-bold text-warning">
            {maxYear.tahun}
          </div>

          <div className="text-gray-600 fs-7">
            {maxYear.jumlah} ASN
          </div>

        </div>

      </div>

    </div>
  )
}