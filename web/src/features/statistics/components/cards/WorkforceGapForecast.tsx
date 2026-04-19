type RetirementRow = {
  tahun: string
  jumlah: number
}

interface Props {
  totalAsn: number
  prediction: RetirementRow[]
}

export default function WorkforceGapForecast({
  totalAsn,
  prediction
}: Props) {

  if (!prediction || prediction.length === 0) return null

  const totalRetirement =
    prediction.reduce((a, b) => a + b.jumlah, 0)

  const remaining =
    totalAsn - totalRetirement

  const gap =
    totalRetirement

  return (

    <div className="row g-5">

      {/* ASN SEKARANG */}

      <div className="col-md-3">

        <div className="card p-5">

          <div className="text-gray-500 fs-7">
            ASN Saat Ini
          </div>

          <div className="fs-2hx fw-bold text-primary">
            {totalAsn.toLocaleString("id-ID")}
          </div>

        </div>

      </div>

      {/* PENSIUN */}

      <div className="col-md-3">

        <div className="card p-5">

          <div className="text-gray-500 fs-7">
            ASN Pensiun 5 Tahun
          </div>

          <div className="fs-2hx fw-bold text-danger">
            {totalRetirement.toLocaleString("id-ID")}
          </div>

        </div>

      </div>

      {/* ASN TERSISA */}

      <div className="col-md-3">

        <div className="card p-5">

          <div className="text-gray-500 fs-7">
            ASN Tersisa
          </div>

          <div className="fs-2hx fw-bold text-success">
            {remaining.toLocaleString("id-ID")}
          </div>

        </div>

      </div>

      {/* GAP ASN */}

      <div className="col-md-3">

        <div className="card p-5">

          <div className="text-gray-500 fs-7">
            Kebutuhan Formasi
          </div>

          <div className="fs-2hx fw-bold text-warning">
            {gap.toLocaleString("id-ID")}
          </div>

        </div>

      </div>

    </div>
  )
}